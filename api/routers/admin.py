"""
Admin routes — platform-wide management. Full implementation in Phase 6.
"""

from fastapi import APIRouter, Depends
from api.middleware.auth import require_admin
from api.models import UserContext
from api.config import get_settings
from api.mock_smartlead import MockSmartleadClient

router = APIRouter(prefix="/admin", tags=["admin"])


@router.get("/overview")
async def get_overview(user: UserContext = Depends(require_admin)):
    """Aggregated platform stats for the admin dashboard."""
    settings = get_settings()

    if settings.use_mock:
        return {
            "total_active_clients": 23,
            "mrr_cents": 451100,
            "total_active_campaigns": 67,
            "emails_sent_today": 14280,
            "emails_sent_this_week": 87430,
            "emails_sent_this_month": 312000,
            "ai_requests_this_month": 841,
            "new_signups_last_30_days": 8,
            "churn_rate": 2.1,
        }

    raise NotImplementedError("Real admin overview requires Phase 6")


@router.get("/clients")
async def list_clients(user: UserContext = Depends(require_admin)):
    """List all platform clients with summary stats."""
    settings = get_settings()

    if settings.use_mock:
        return [
            {
                "id": f"user-{i}",
                "email": f"client{i}@example.com",
                "full_name": f"Client {i}",
                "company_name": f"Company {i}",
                "subscription_tier": ["starter", "pro", "enterprise"][i % 3],
                "subscription_status": "active",
                "smartlead_client_id": 40 + i,
                "campaigns_count": i * 2 + 1,
                "email_accounts_count": i * 3 + 2,
                "signup_date": f"2025-0{(i % 9) + 1}-01",
                "last_active": f"2026-03-0{(i % 4) + 1}",
            }
            for i in range(1, 12)
        ]

    raise NotImplementedError("Real client list requires Phase 6")


@router.get("/logs")
async def get_audit_logs(
    offset: int = 0,
    limit: int = 50,
    user: UserContext = Depends(require_admin),
):
    """Paginated audit logs across all users."""
    settings = get_settings()

    if settings.use_mock:
        actions = ["campaign.create", "inbox.reply", "email_account.create", "campaign.status_change", "ai.generate_sequence"]
        return {
            "data": [
                {
                    "id": f"log-{i}",
                    "user_id": f"user-{(i % 5) + 1}",
                    "action": actions[i % len(actions)],
                    "resource_type": actions[i % len(actions)].split(".")[0],
                    "resource_id": str(i * 10),
                    "details": {},
                    "ip_address": f"192.168.1.{(i % 254) + 1}",
                    "created_at": f"2026-03-04T{(i % 24):02d}:00:00Z",
                }
                for i in range(1, 21)
            ],
            "total": 842,
            "offset": offset,
            "limit": limit,
        }

    raise NotImplementedError("Real audit logs require Phase 6")
