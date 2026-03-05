"""
Webhook handlers — Stripe and Smartlead.
"""

import json
from fastapi import APIRouter, Request, HTTPException
from api.config import get_settings

router = APIRouter(prefix="/webhooks", tags=["webhooks"])


async def _handle_checkout_completed(session: dict, sb, sl_master) -> None:
    """
    After successful Stripe payment:
    1. Update user subscription_tier + status in Supabase
    2. Create Smartlead client
    3. Generate Smartlead client API key
    4. Store encrypted API key in users table
    """
    from api.encryption import encrypt_value
    from api.smartlead import SmartleadClient

    user_id = session["metadata"].get("supabase_user_id")
    tier    = session["metadata"].get("tier", "starter")
    if not user_id:
        print(f"[Stripe Webhook] No user_id in checkout session metadata: {session['id']}")
        return

    # Fetch user profile
    resp = sb.table("users").select("email, company_name, full_name").eq("id", user_id).single().execute()
    profile = resp.data

    # Update subscription
    sb.table("users").update({
        "subscription_tier": tier,
        "subscription_status": "active",
        "stripe_customer_id": session.get("customer"),
    }).eq("id", user_id).execute()

    # Create Smartlead client
    sl_result = await sl_master.add_client(
        name=profile.get("company_name", profile.get("full_name", "")),
        email=profile["email"],
    )
    client_id = sl_result.get("id")
    if not client_id:
        print(f"[Stripe Webhook] Smartlead client creation returned no ID for user {user_id}")
        return

    # Create scoped API key for this client
    key_result = await sl_master.create_client_api_key(client_id)
    client_api_key = key_result.get("api_key", "")

    # Store in users table (encrypted)
    sb.table("users").update({
        "smartlead_client_id": client_id,
        "smartlead_api_key": encrypt_value(client_api_key) if client_api_key else None,
    }).eq("id", user_id).execute()

    print(f"[Stripe Webhook] Provisioned user {user_id}: Smartlead client {client_id}")


async def _handle_subscription_updated(subscription: dict, sb) -> None:
    customer_id = subscription.get("customer")
    status = subscription.get("status", "active")
    tier_item = subscription.get("items", {}).get("data", [{}])[0]
    price_id = tier_item.get("price", {}).get("id", "")

    # Map price_id → tier (fill in real price IDs when going live)
    PRICE_TO_TIER = {
        "price_starter_placeholder": "starter",
        "price_pro_placeholder": "pro",
        "price_enterprise_placeholder": "enterprise",
    }
    tier = PRICE_TO_TIER.get(price_id, "starter")

    sb.table("users").update({
        "subscription_status": status,
        "subscription_tier": tier,
    }).eq("stripe_customer_id", customer_id).execute()


async def _handle_subscription_deleted(subscription: dict, sb) -> None:
    customer_id = subscription.get("customer")
    sb.table("users").update({
        "subscription_status": "canceled",
    }).eq("stripe_customer_id", customer_id).execute()


@router.post("/stripe")
async def stripe_webhook(request: Request):
    settings = get_settings()
    payload = await request.body()
    sig_header = request.headers.get("stripe-signature", "")

    if settings.use_mock:
        try:
            event = json.loads(payload)
        except Exception:
            raise HTTPException(status_code=400, detail="Invalid JSON payload")
        event_type = event.get("type", "unknown")
        print(f"[Stripe Webhook Mock] Received: {event_type}")
        return {"received": True, "type": event_type, "mock": True}

    # ── Real Stripe webhook ────────────────────────────────────────────────────
    try:
        import stripe
        from api.supabase_client import get_supabase
        from api.smartlead import SmartleadClient

        stripe.api_key = settings.stripe_secret_key
        event = stripe.Webhook.construct_event(payload, sig_header, settings.stripe_webhook_secret)
    except stripe.SignatureVerificationError:
        raise HTTPException(status_code=400, detail="Invalid Stripe signature")
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

    sb = get_supabase()
    sl = SmartleadClient(settings.smartlead_api_key)

    try:
        if event["type"] == "checkout.session.completed":
            await _handle_checkout_completed(event["data"]["object"], sb, sl)

        elif event["type"] == "customer.subscription.updated":
            await _handle_subscription_updated(event["data"]["object"], sb)

        elif event["type"] == "customer.subscription.deleted":
            await _handle_subscription_deleted(event["data"]["object"], sb)

    except Exception as e:
        # Log but don't fail — Stripe will retry
        print(f"[Stripe Webhook] Handler error for {event['type']}: {e}")
    finally:
        await sl.aclose()

    return {"received": True, "type": event["type"]}


@router.post("/smartlead")
async def smartlead_webhook(request: Request):
    """
    Smartlead webhook — receives email reply events.
    Phase 3 will push real-time updates to clients via Supabase Realtime.
    """
    payload = await request.json()
    event_type = payload.get("event_type", "unknown")
    print(f"[Smartlead Webhook] Received: {event_type}")

    # Phase 3: match to client_id, push via Supabase Realtime
    return {"received": True, "event_type": event_type}
