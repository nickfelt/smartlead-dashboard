"""
Dashboard overview — aggregates campaigns, email accounts, and inbox stats
into a single response so the client makes one request instead of three.
"""

from fastapi import APIRouter, Depends
from api.middleware.auth import require_active_subscription
from api.models import UserContext
from api.config import get_settings
from api.smartlead import SmartleadClient
from api.mock_smartlead import MockSmartleadClient

router = APIRouter(prefix="/dashboard", tags=["dashboard"])


def get_sl(user: UserContext) -> SmartleadClient | MockSmartleadClient:
    settings = get_settings()
    if settings.use_mock:
        return MockSmartleadClient()
    return SmartleadClient(user.smartlead_api_key or settings.smartlead_api_key)


@router.get("/overview")
async def get_overview(user: UserContext = Depends(require_active_subscription)):
    sl = get_sl(user)

    # Fetch in parallel
    import asyncio
    campaigns_task      = sl.list_campaigns(client_id=user.client_id)
    accounts_task       = sl.list_all_email_accounts()
    inbox_task          = sl.fetch_inbox_replies(offset=0, limit=5, client_id=user.client_id)
    unread_task         = sl.fetch_unread_replies(offset=0, limit=1, client_id=user.client_id)

    campaigns, accounts, inbox_data, unread_data = await asyncio.gather(
        campaigns_task, accounts_task, inbox_task, unread_task,
        return_exceptions=True,
    )

    # Handle partial failures gracefully
    campaigns  = campaigns  if isinstance(campaigns, list)  else []
    accounts   = accounts   if isinstance(accounts, list)   else []
    inbox_msgs = inbox_data.get("data", [])  if isinstance(inbox_data, dict) else []
    unread_total = unread_data.get("total", 0) if isinstance(unread_data, dict) else 0

    # Aggregate campaign stats
    active_campaigns    = sum(1 for c in campaigns if c.get("status") == "ACTIVE")
    total_leads         = sum(c.get("leads_count", 0) for c in campaigns)
    total_sent          = sum(c.get("stats", {}).get("total_sent", 0) for c in campaigns)
    avg_open_rate       = (
        round(sum(c.get("stats", {}).get("open_rate", 0) for c in campaigns) / len(campaigns), 1)
        if campaigns else 0.0
    )
    avg_reply_rate      = (
        round(sum(c.get("stats", {}).get("reply_rate", 0) for c in campaigns) / len(campaigns), 1)
        if campaigns else 0.0
    )

    # Top 3 campaigns by reply rate
    top_campaigns = sorted(
        campaigns,
        key=lambda c: c.get("stats", {}).get("reply_rate", 0),
        reverse=True,
    )[:3]

    # Email account health
    active_accounts     = sum(1 for a in accounts if a.get("status") == "active")
    warmup_accounts     = sum(1 for a in accounts if a.get("status") == "warmup")
    failed_accounts     = sum(1 for a in accounts if a.get("status") in ("failed", "disconnected"))

    return {
        "stats": {
            "active_campaigns":  active_campaigns,
            "total_campaigns":   len(campaigns),
            "total_leads":       total_leads,
            "total_sent":        total_sent,
            "avg_open_rate":     avg_open_rate,
            "avg_reply_rate":    avg_reply_rate,
            "unread_replies":    unread_total,
            "total_accounts":    len(accounts),
            "active_accounts":   active_accounts,
            "warmup_accounts":   warmup_accounts,
            "failed_accounts":   failed_accounts,
        },
        "top_campaigns": [
            {
                "id":         c["id"],
                "name":       c["name"],
                "status":     c["status"],
                "reply_rate": c.get("stats", {}).get("reply_rate", 0),
                "open_rate":  c.get("stats", {}).get("open_rate", 0),
                "leads":      c.get("leads_count", 0),
            }
            for c in top_campaigns
        ],
        "recent_replies": inbox_msgs[:5],
    }
