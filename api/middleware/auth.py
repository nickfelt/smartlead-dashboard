"""
Auth middleware — validates Supabase JWT tokens on protected routes.
In mock mode, accepts a special "mock-token-*" header for dev.
"""

import os
import sys
from typing import Optional
from fastapi import Request, HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

# Ensure project root is on path for shared imports
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

from api.config import get_settings
from api.models import UserContext, SubscriptionTier, SubscriptionStatus

security = HTTPBearer(auto_error=False)


def _mock_user_context(token: str) -> UserContext:
    """Return a mock UserContext based on the token payload for dev mode."""
    is_admin = "admin" in token.lower()
    return UserContext(
        user_id="mock-admin-001" if is_admin else "mock-user-001",
        email="admin@feltmarketing.com" if is_admin else "demo@example.com",
        client_id=None if is_admin else 42,
        smartlead_api_key="mock-client-api-key",
        subscription_tier=SubscriptionTier.pro,
        subscription_status=SubscriptionStatus.active,
        is_admin=is_admin,
    )


async def get_current_user(
    request: Request,
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security),
) -> UserContext:
    """
    FastAPI dependency that validates the JWT and returns a UserContext.
    Attach to any protected route: `user: UserContext = Depends(get_current_user)`
    """
    settings = get_settings()

    if not credentials:
        raise HTTPException(status_code=401, detail="Not authenticated")

    token = credentials.credentials

    if settings.use_mock:
        # In mock mode, accept any token starting with "mock-"
        if token.startswith("mock-"):
            return _mock_user_context(token)
        raise HTTPException(status_code=401, detail="Invalid mock token (must start with 'mock-')")

    # Real Supabase JWT validation (Phase 2)
    try:
        from supabase import create_client
        supabase = create_client(settings.supabase_url, settings.supabase_service_key)
        user_response = supabase.auth.get_user(token)
        if not user_response.user:
            raise HTTPException(status_code=401, detail="Invalid or expired token")

        # Look up user profile from our users table
        profile_response = (
            supabase.table("users")
            .select("*")
            .eq("id", user_response.user.id)
            .single()
            .execute()
        )
        profile = profile_response.data
        if not profile:
            raise HTTPException(status_code=401, detail="User profile not found")

        # Decrypt smartlead_api_key if present
        smartlead_api_key = None
        if profile.get("smartlead_api_key"):
            from api.encryption import decrypt_value
            smartlead_api_key = decrypt_value(profile["smartlead_api_key"])

        return UserContext(
            user_id=user_response.user.id,
            email=user_response.user.email or "",
            client_id=profile.get("smartlead_client_id"),
            smartlead_api_key=smartlead_api_key,
            subscription_tier=SubscriptionTier(profile.get("subscription_tier", "free")),
            subscription_status=SubscriptionStatus(profile.get("subscription_status", "active")),
            is_admin=profile.get("is_admin", False),
        )

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=401, detail=f"Authentication failed: {str(e)}")


def require_admin(user: UserContext = Depends(get_current_user)) -> UserContext:
    """Dependency that additionally requires is_admin=True."""
    if not user.is_admin:
        raise HTTPException(status_code=403, detail="Admin access required")
    return user


def require_active_subscription(user: UserContext = Depends(get_current_user)) -> UserContext:
    """Dependency that requires an active (non-canceled) subscription."""
    if user.subscription_status == SubscriptionStatus.canceled:
        raise HTTPException(
            status_code=403,
            detail="Your subscription has been canceled. Please reactivate to continue.",
        )
    return user


async def log_action(
    request: Request,
    user: UserContext,
    action: str,
    resource_type: str,
    resource_id: str,
    details: Optional[dict] = None,
) -> None:
    """
    Write an audit log entry to Supabase.
    In mock mode, prints to stdout instead.
    """
    settings = get_settings()
    entry = {
        "user_id": user.user_id,
        "action": action,
        "resource_type": resource_type,
        "resource_id": resource_id,
        "details": details or {},
        "ip_address": request.client.host if request.client else "unknown",
    }

    if settings.use_mock:
        print(f"[AUDIT] {entry}")
        return

    try:
        from supabase import create_client
        supabase = create_client(settings.supabase_url, settings.supabase_service_key)
        supabase.table("audit_logs").insert(entry).execute()
    except Exception as e:
        # Never fail a request due to audit logging errors
        print(f"[AUDIT ERROR] Failed to log action: {e}")
