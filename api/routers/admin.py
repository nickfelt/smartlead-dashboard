"""
Admin routes — platform-wide management, client oversight, revenue, audit logs.
"""

import random
from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, HTTPException, Request
from pydantic import BaseModel
from typing import Optional
from api.middleware.auth import require_admin, log_action
from api.models import UserContext, SubscriptionTier
from api.config import get_settings
from api.supabase_client import get_supabase

router = APIRouter(prefix="/admin", tags=["admin"])


def _random_date(days_back: int = 30) -> str:
    d = datetime.utcnow() - timedelta(days=random.randint(0, days_back))
    return d.isoformat()


# ─── Request models ───────────────────────────────────────────────────────────

class TierOverrideRequest(BaseModel):
    subscription_tier: SubscriptionTier
    reason: Optional[str] = None


class SuspendRequest(BaseModel):
    reason: Optional[str] = None


# ─── Overview ─────────────────────────────────────────────────────────────────

@router.get("/overview")
async def get_overview(user: UserContext = Depends(require_admin)):
    settings = get_settings()

    if settings.use_mock:
        return {
            "total_clients": 34,
            "active_clients": 23,
            "mrr_cents": 451100,
            "mrr_change_pct": 9.6,
            "total_active_campaigns": 67,
            "emails_sent_today": 14280,
            "emails_sent_this_week": 87430,
            "emails_sent_this_month": 312000,
            "ai_requests_this_month": 841,
            "new_signups_last_30_days": 8,
            "churn_rate": 2.1,
            "tier_breakdown": {
                "free": 5,
                "starter": 14,
                "pro": 10,
                "enterprise": 5,
            },
            "mrr_history": [
                {"month": (datetime.utcnow() - timedelta(days=30 * i)).strftime("%b %Y"),
                 "mrr_cents": max(0, 451100 - i * random.randint(15000, 30000))}
                for i in range(11, -1, -1)
            ],
            "recent_signups": [
                {
                    "email": f"newclient{i}@example.com",
                    "company": f"Company {i}",
                    "tier": ["starter", "pro"][i % 2],
                    "joined": _random_date(30),
                }
                for i in range(1, 6)
            ],
        }

    # Real path: query Supabase for aggregated stats
    supabase = get_supabase()
    users = supabase.table("users").select("subscription_tier, subscription_status, created_at").execute()
    rows = users.data or []
    active = [r for r in rows if r["subscription_status"] == "active"]
    tiers: dict = {}
    for r in rows:
        tiers[r["subscription_tier"]] = tiers.get(r["subscription_tier"], 0) + 1
    return {
        "total_clients": len(rows),
        "active_clients": len(active),
        "tier_breakdown": tiers,
        "mrr_cents": 0,  # requires Stripe API
        "mrr_change_pct": 0,
        "total_active_campaigns": 0,
        "emails_sent_today": 0,
        "emails_sent_this_week": 0,
        "emails_sent_this_month": 0,
        "ai_requests_this_month": 0,
        "new_signups_last_30_days": 0,
        "churn_rate": 0,
        "mrr_history": [],
        "recent_signups": [],
    }


# ─── Client Management ────────────────────────────────────────────────────────

@router.get("/clients")
async def list_clients(
    search: Optional[str] = None,
    tier: Optional[str] = None,
    status: Optional[str] = None,
    offset: int = 0,
    limit: int = 50,
    user: UserContext = Depends(require_admin),
):
    settings = get_settings()

    if settings.use_mock:
        tiers = ["free", "starter", "starter", "pro", "pro", "enterprise"]
        statuses = ["active", "active", "active", "past_due", "active", "canceled"]
        clients = [
            {
                "id": f"user-{i}",
                "email": f"client{i}@{'acmecorp' if i % 3 == 0 else 'example'}.com",
                "full_name": f"{'Alice' if i % 2 == 0 else 'Bob'} {'Smith' if i % 3 == 0 else 'Johnson'} {i}",
                "company_name": ["Acme Corp", "TechStart", "Growth Co", "ScaleUp", "BuildFast", "Innovate Inc"][i % 6],
                "subscription_tier": tiers[i % len(tiers)],
                "subscription_status": statuses[i % len(statuses)],
                "smartlead_client_id": 40 + i,
                "campaigns_count": (i * 2 + 1) % 12,
                "email_accounts_count": (i * 3 + 2) % 15,
                "emails_sent_30d": random.randint(500, 50000),
                "signup_date": _random_date(180),
                "last_active": _random_date(10),
                "is_suspended": i == 4,
            }
            for i in range(1, 25)
        ]
        if search:
            q = search.lower()
            clients = [c for c in clients if q in c["email"].lower() or q in c["full_name"].lower() or q in c["company_name"].lower()]
        if tier:
            clients = [c for c in clients if c["subscription_tier"] == tier]
        if status:
            clients = [c for c in clients if c["subscription_status"] == status]
        total = len(clients)
        return {"data": clients[offset:offset + limit], "total": total, "offset": offset, "limit": limit}

    supabase = get_supabase()
    query = supabase.table("users").select("*")
    if search:
        query = query.or_(f"email.ilike.%{search}%,full_name.ilike.%{search}%,company_name.ilike.%{search}%")
    if tier:
        query = query.eq("subscription_tier", tier)
    if status:
        query = query.eq("subscription_status", status)
    result = query.range(offset, offset + limit - 1).execute()
    count = supabase.table("users").select("id", count="exact").execute()
    return {"data": result.data or [], "total": count.count or 0, "offset": offset, "limit": limit}


@router.get("/clients/{client_id}")
async def get_client(client_id: str, user: UserContext = Depends(require_admin)):
    settings = get_settings()

    if settings.use_mock:
        i = int(client_id.replace("user-", "") or 1)
        tiers = ["free", "starter", "pro", "enterprise"]
        return {
            "id": client_id,
            "email": f"client{i}@example.com",
            "full_name": f"Client {i}",
            "company_name": f"Company {i}",
            "subscription_tier": tiers[i % len(tiers)],
            "subscription_status": "active",
            "smartlead_client_id": 40 + i,
            "campaigns_count": i * 2 + 1,
            "email_accounts_count": i * 3 + 2,
            "emails_sent_30d": random.randint(1000, 50000),
            "signup_date": _random_date(180),
            "last_active": _random_date(5),
            "is_suspended": False,
            "stripe_customer_id": f"cus_mock{i:06d}",
            "has_anthropic_key": i % 3 == 0,
            "has_openai_key": i % 2 == 0,
        }

    supabase = get_supabase()
    result = supabase.table("users").select("*").eq("id", client_id).single().execute()
    if not result.data:
        raise HTTPException(status_code=404, detail="Client not found")
    return result.data


@router.patch("/clients/{client_id}/tier")
async def override_tier(
    client_id: str,
    body: TierOverrideRequest,
    request: Request,
    user: UserContext = Depends(require_admin),
):
    settings = get_settings()
    if settings.use_mock:
        await log_action(request, user, "admin.tier_override", "user", client_id,
                         {"new_tier": body.subscription_tier.value, "reason": body.reason})
        return {"ok": True, "client_id": client_id, "subscription_tier": body.subscription_tier.value}

    supabase = get_supabase()
    result = supabase.table("users").update({"subscription_tier": body.subscription_tier.value}).eq("id", client_id).execute()
    if not result.data:
        raise HTTPException(status_code=404, detail="Client not found")
    await log_action(request, user, "admin.tier_override", "user", client_id,
                     {"new_tier": body.subscription_tier.value, "reason": body.reason})
    return result.data[0]


@router.post("/clients/{client_id}/suspend")
async def suspend_client(
    client_id: str,
    body: SuspendRequest,
    request: Request,
    user: UserContext = Depends(require_admin),
):
    settings = get_settings()
    if settings.use_mock:
        await log_action(request, user, "admin.client_suspend", "user", client_id, {"reason": body.reason})
        return {"ok": True, "client_id": client_id, "is_suspended": True}

    supabase = get_supabase()
    supabase.table("users").update({"subscription_status": "canceled"}).eq("id", client_id).execute()
    await log_action(request, user, "admin.client_suspend", "user", client_id, {"reason": body.reason})
    return {"ok": True, "client_id": client_id}


@router.post("/clients/{client_id}/reactivate")
async def reactivate_client(
    client_id: str,
    request: Request,
    user: UserContext = Depends(require_admin),
):
    settings = get_settings()
    if settings.use_mock:
        await log_action(request, user, "admin.client_reactivate", "user", client_id)
        return {"ok": True, "client_id": client_id, "is_suspended": False}

    supabase = get_supabase()
    supabase.table("users").update({"subscription_status": "active"}).eq("id", client_id).execute()
    await log_action(request, user, "admin.client_reactivate", "user", client_id)
    return {"ok": True, "client_id": client_id}


# ─── Revenue ──────────────────────────────────────────────────────────────────

@router.get("/revenue")
async def get_revenue(user: UserContext = Depends(require_admin)):
    settings = get_settings()

    if settings.use_mock:
        tier_prices = {"free": 0, "starter": 4900, "pro": 9900, "enterprise": 29900}
        tier_counts = {"free": 5, "starter": 14, "pro": 10, "enterprise": 5}
        mrr = sum(tier_prices[t] * c for t, c in tier_counts.items())
        mrr_history = []
        base = mrr
        for i in range(11, -1, -1):
            base = max(0, base - random.randint(-5000, 20000))
            mrr_history.append({
                "month": (datetime.utcnow() - timedelta(days=30 * i)).strftime("%b %Y"),
                "mrr_cents": base,
                "new_mrr_cents": random.randint(5000, 40000),
                "churned_mrr_cents": random.randint(0, 15000),
            })
        mrr_history[-1]["mrr_cents"] = mrr

        return {
            "mrr_cents": mrr,
            "arr_cents": mrr * 12,
            "mrr_change_pct": 9.6,
            "total_subscribers": sum(tier_counts.values()),
            "paying_subscribers": sum(c for t, c in tier_counts.items() if t != "free"),
            "churn_rate": 2.1,
            "avg_revenue_per_user_cents": mrr // max(1, sum(c for t, c in tier_counts.items() if t != "free")),
            "tier_breakdown": [
                {"tier": t, "count": c, "mrr_cents": tier_prices[t] * c}
                for t, c in tier_counts.items()
            ],
            "mrr_history": mrr_history,
        }

    raise NotImplementedError("Real revenue requires Stripe API integration")


# ─── Audit Logs ───────────────────────────────────────────────────────────────

@router.get("/logs")
async def get_audit_logs(
    offset: int = 0,
    limit: int = 50,
    search: Optional[str] = None,
    action_filter: Optional[str] = None,
    user: UserContext = Depends(require_admin),
):
    settings = get_settings()

    if settings.use_mock:
        actions = [
            "campaign.create", "campaign.status_change", "campaign.delete",
            "inbox.reply", "inbox.archive", "inbox.mark_important",
            "email_account.create", "email_account.warmup_update", "email_account.delete",
            "ai.generate_sequence", "ai.rewrite", "ai.generate_subjects",
            "admin.tier_override", "admin.client_suspend",
            "settings.ai_key_save",
        ]
        users = [f"user-{i}" for i in range(1, 6)]
        emails = [f"client{i}@example.com" for i in range(1, 6)]
        all_logs = [
            {
                "id": f"log-{i}",
                "user_id": users[i % len(users)],
                "user_email": emails[i % len(emails)],
                "action": actions[i % len(actions)],
                "resource_type": actions[i % len(actions)].split(".")[0],
                "resource_id": str(i * 7),
                "details": {"mock": True},
                "ip_address": f"203.0.113.{(i % 254) + 1}",
                "created_at": (datetime.utcnow() - timedelta(minutes=i * 17)).isoformat(),
            }
            for i in range(1, 201)
        ]
        if search:
            q = search.lower()
            all_logs = [l for l in all_logs if q in l["action"] or q in l["user_email"] or q in l["resource_id"]]
        if action_filter:
            all_logs = [l for l in all_logs if l["action"].startswith(action_filter)]
        total = len(all_logs)
        return {"data": all_logs[offset:offset + limit], "total": total, "offset": offset, "limit": limit}

    supabase = get_supabase()
    query = supabase.table("audit_logs").select("*").order("created_at", desc=True)
    if search:
        query = query.or_(f"action.ilike.%{search}%,resource_id.ilike.%{search}%")
    if action_filter:
        query = query.ilike("action", f"{action_filter}%")
    result = query.range(offset, offset + limit - 1).execute()
    count_q = supabase.table("audit_logs").select("id", count="exact")
    if action_filter:
        count_q = count_q.ilike("action", f"{action_filter}%")
    count = count_q.execute()
    return {"data": result.data or [], "total": count.count or 0, "offset": offset, "limit": limit}
