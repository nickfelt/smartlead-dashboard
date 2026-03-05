"""
Webhook handlers — Stripe and Smartlead. Full Stripe integration in Phase 2.
"""

import json
from fastapi import APIRouter, Request, HTTPException
from api.config import get_settings

router = APIRouter(prefix="/webhooks", tags=["webhooks"])


@router.post("/stripe")
async def stripe_webhook(request: Request):
    """
    Handle Stripe webhook events.
    Phase 2 will implement:
    - checkout.session.completed → create Smartlead client, store IDs
    - customer.subscription.updated → update tier/status
    - customer.subscription.deleted → revoke access
    """
    settings = get_settings()
    payload = await request.body()
    sig_header = request.headers.get("stripe-signature", "")

    if settings.use_mock:
        # Accept all events in mock mode
        try:
            event = json.loads(payload)
        except Exception:
            raise HTTPException(status_code=400, detail="Invalid payload")
        return {"received": True, "type": event.get("type"), "mock": True}

    # Real Stripe signature verification (Phase 2)
    try:
        import stripe
        stripe.api_key = settings.stripe_secret_key
        event = stripe.Webhook.construct_event(payload, sig_header, settings.stripe_webhook_secret)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

    # Phase 2: handle events
    return {"received": True, "type": event["type"]}


@router.post("/smartlead")
async def smartlead_webhook(request: Request):
    """
    Handle Smartlead webhook events (new email replies).
    Phase 3 will implement real-time inbox updates via Supabase Realtime.
    """
    payload = await request.json()
    event_type = payload.get("event_type", "unknown")
    print(f"[Smartlead Webhook] Received: {event_type}")
    return {"received": True, "event_type": event_type}
