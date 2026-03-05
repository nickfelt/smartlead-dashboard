"""
Auth routes — signup, login proxy, current user, Stripe portal.
Real implementation in Phase 2. Stubs return mock data.
"""

from fastapi import APIRouter, Depends, Request
from api.middleware.auth import get_current_user, log_action
from api.models import UserContext, UserProfile, SubscriptionTier, SubscriptionStatus
from api.config import get_settings
from datetime import datetime

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/signup")
async def signup(request: Request):
    """
    Phase 2: Create Supabase user → Stripe customer → return Checkout URL.
    Phase 1 stub: returns a mock checkout URL.
    """
    body = await request.json()
    settings = get_settings()

    if settings.use_mock:
        return {
            "checkout_url": "https://checkout.stripe.com/mock",
            "message": "Mock signup — in production this redirects to Stripe Checkout",
        }

    # Phase 2 implementation goes here
    raise NotImplementedError("Real signup requires Phase 2")


@router.get("/me", response_model=UserProfile)
async def get_me(user: UserContext = Depends(get_current_user)):
    """Return the current authenticated user's profile."""
    settings = get_settings()

    if settings.use_mock:
        return UserProfile(
            id=user.user_id,
            email=user.email,
            full_name="Demo User" if not user.is_admin else "Nick Felt",
            company_name="Acme Corp" if not user.is_admin else "Felt Marketing",
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

    # Phase 2: query Supabase for real profile
    raise NotImplementedError("Real /me requires Phase 2")


@router.post("/create-portal-session")
async def create_portal_session(
    request: Request,
    user: UserContext = Depends(get_current_user),
):
    """Return a Stripe Customer Portal URL for managing subscription."""
    settings = get_settings()

    if settings.use_mock:
        return {"portal_url": "https://billing.stripe.com/mock-portal"}

    # Phase 2: create real Stripe portal session
    raise NotImplementedError("Real portal session requires Phase 2")
