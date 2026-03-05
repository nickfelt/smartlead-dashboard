"""
Auth routes — signup, current user, Stripe Customer Portal.
"""

import uuid
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, Request
from pydantic import BaseModel

from api.middleware.auth import get_current_user, log_action
from api.models import UserContext, UserProfile, SubscriptionTier, SubscriptionStatus
from api.config import get_settings
from api.mock_smartlead import MockSmartleadClient

router = APIRouter(prefix="/auth", tags=["auth"])


# ─── Request / Response models ────────────────────────────────────────────────

class SignupRequest(BaseModel):
    email: str
    password: str
    full_name: str
    company_name: str
    tier: str = "pro"  # starter | pro | enterprise


TIER_PRICES = {
    "starter":    "price_starter_placeholder",
    "pro":        "price_pro_placeholder",
    "enterprise": "price_enterprise_placeholder",
}

TIER_AMOUNTS = {"starter": 14900, "pro": 24900, "enterprise": 49700}


# ─── Routes ──────────────────────────────────────────────────────────────────

@router.post("/signup")
async def signup(body: SignupRequest, request: Request):
    """
    Create account → Stripe Checkout → return checkout_url.
    Mock mode: immediately returns a usable session (no real Stripe call).
    """
    settings = get_settings()
    tier = body.tier.lower() if body.tier.lower() in TIER_AMOUNTS else "pro"

    if settings.use_mock:
        user_id = f"mock-{uuid.uuid4().hex[:8]}"
        mock_user = {
            "id": user_id,
            "email": body.email,
            "full_name": body.full_name,
            "company_name": body.company_name,
            "smartlead_client_id": 100 + hash(body.email) % 900,
            "stripe_customer_id": f"cus_mock_{uuid.uuid4().hex[:8]}",
            "subscription_tier": tier,
            "subscription_status": "active",
            "is_admin": False,
            "has_anthropic_key": False,
            "has_openai_key": False,
            "created_at": datetime.utcnow().isoformat(),
            "updated_at": datetime.utcnow().isoformat(),
        }
        mock_session = {
            "access_token": f"mock-token-{uuid.uuid4().hex}",
            "refresh_token": f"mock-refresh-{uuid.uuid4().hex}",
            "expires_at": int(datetime.utcnow().timestamp() * 1000) + 3600 * 1000,
            "user": mock_user,
        }
        return {"mock": True, "session": mock_session}

    # ── Real flow ──────────────────────────────────────────────────────────────
    try:
        import stripe
        from api.supabase_client import get_supabase

        stripe.api_key = settings.stripe_secret_key
        sb = get_supabase()

        # 1. Create Supabase Auth user
        auth_resp = sb.auth.admin.create_user({
            "email": body.email,
            "password": body.password,
            "email_confirm": True,
        })
        if not auth_resp.user:
            raise HTTPException(status_code=400, detail="Failed to create user account")
        user_id = auth_resp.user.id

        # 2. Insert user profile row
        sb.table("users").insert({
            "id": user_id,
            "email": body.email,
            "full_name": body.full_name,
            "company_name": body.company_name,
            "subscription_tier": "free",
            "subscription_status": "trialing",
        }).execute()

        # 3. Create Stripe customer
        customer = stripe.Customer.create(
            email=body.email,
            name=body.full_name,
            metadata={"supabase_user_id": user_id, "company": body.company_name},
        )

        # 4. Update user with Stripe customer ID
        sb.table("users").update({"stripe_customer_id": customer.id}).eq("id", user_id).execute()

        # 5. Create Stripe Checkout session
        checkout = stripe.checkout.Session.create(
            customer=customer.id,
            mode="subscription",
            line_items=[{"price": TIER_PRICES[tier], "quantity": 1}],
            success_url=f"{request.base_url}dashboard?checkout=success",
            cancel_url=f"{request.base_url}signup",
            metadata={"supabase_user_id": user_id, "tier": tier},
        )

        return {"checkout_url": checkout.url}

    except stripe.StripeError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Signup failed: {str(e)}")


@router.get("/me")
async def get_me(user: UserContext = Depends(get_current_user)):
    """Return the current user's profile."""
    settings = get_settings()

    if settings.use_mock:
        return UserProfile(
            id=user.user_id,
            email=user.email,
            full_name="Nick Felt" if user.is_admin else "Demo User",
            company_name="Bookd" if user.is_admin else "Acme Corp",
            smartlead_client_id=user.client_id,
            stripe_customer_id="cus_mock123",
            subscription_tier=user.subscription_tier,
            subscription_status=user.subscription_status,
            is_admin=user.is_admin,
            has_anthropic_key=True,
            has_openai_key=False,
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow(),
        )

    try:
        from api.supabase_client import get_supabase
        sb = get_supabase()
        resp = sb.table("users").select("*").eq("id", user.user_id).single().execute()
        p = resp.data
        return UserProfile(
            id=p["id"],
            email=p["email"],
            full_name=p["full_name"],
            company_name=p["company_name"],
            smartlead_client_id=p.get("smartlead_client_id"),
            stripe_customer_id=p.get("stripe_customer_id"),
            subscription_tier=SubscriptionTier(p["subscription_tier"]),
            subscription_status=SubscriptionStatus(p["subscription_status"]),
            is_admin=p.get("is_admin", False),
            has_anthropic_key=bool(p.get("anthropic_api_key")),
            has_openai_key=bool(p.get("openai_api_key")),
            created_at=p["created_at"],
            updated_at=p["updated_at"],
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/create-portal-session")
async def create_portal_session(
    request: Request,
    user: UserContext = Depends(get_current_user),
):
    """Return a Stripe Customer Portal URL."""
    settings = get_settings()

    if settings.use_mock:
        return {"portal_url": "https://billing.stripe.com/p/login/test_mock"}

    try:
        import stripe
        from api.supabase_client import get_supabase

        stripe.api_key = settings.stripe_secret_key
        sb = get_supabase()

        resp = sb.table("users").select("stripe_customer_id").eq("id", user.user_id).single().execute()
        customer_id = resp.data.get("stripe_customer_id")
        if not customer_id:
            raise HTTPException(status_code=400, detail="No Stripe customer found for this account")

        portal = stripe.billing_portal.Session.create(
            customer=customer_id,
            return_url=f"{request.base_url}dashboard/settings",
        )
        return {"portal_url": portal.url}
    except stripe.StripeError as e:
        raise HTTPException(status_code=400, detail=str(e))
