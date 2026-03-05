"""
Mock Smartlead client — returns realistic fake data matching the exact same shape
as SmartleadClient. Toggle with USE_MOCK=true in .env.
"""

import random
from datetime import datetime, timedelta
from typing import Any, Optional
from copy import deepcopy


def _random_date(days_back: int = 30) -> str:
    d = datetime.utcnow() - timedelta(days=random.randint(0, days_back))
    return d.isoformat()


def _mock_campaign(campaign_id: int, client_id: int = 42) -> dict[str, Any]:
    statuses = ["DRAFT", "ACTIVE", "PAUSED", "COMPLETED"]
    names = [
        "Q1 SaaS Outreach",
        "Agency Cold Email",
        "Enterprise Prospecting",
        "Mid-Market SaaS",
        "SMB Intro Sequence",
        "Product-Led Growth",
        "Founder Outreach",
    ]
    sent = random.randint(200, 5000)
    opened = int(sent * random.uniform(0.15, 0.45))
    replied = int(sent * random.uniform(0.02, 0.08))
    return {
        "id": campaign_id,
        "name": names[campaign_id % len(names)],
        "status": statuses[campaign_id % len(statuses)],
        "client_id": client_id,
        "leads_count": random.randint(50, 3000),
        "created_at": _random_date(60),
        "updated_at": _random_date(5),
        "stats": {
            "total_sent": sent,
            "total_opened": opened,
            "total_replied": replied,
            "total_bounced": int(sent * random.uniform(0.01, 0.03)),
            "total_unsubscribed": int(sent * random.uniform(0.001, 0.01)),
            "open_rate": round(opened / sent * 100, 1),
            "reply_rate": round(replied / sent * 100, 1),
            "bounce_rate": round(random.uniform(1.0, 3.0), 1),
        },
    }


def _mock_lead(lead_id: int) -> dict[str, Any]:
    first_names = ["Sarah", "Mike", "Lisa", "David", "Emma", "James", "Olivia", "Noah"]
    last_names = ["Johnson", "Chen", "Park", "Smith", "Williams", "Brown", "Davis"]
    companies = ["Acme Corp", "TechStart", "Growth Co", "Innovate Inc", "ScaleUp", "BuildFast"]
    titles = ["CEO", "VP of Sales", "Head of Marketing", "Founder", "CTO", "Director"]
    categories = ["Interested", "Not Interested", "Meeting Booked", "Out of Office", "Uncategorized"]
    fn = first_names[lead_id % len(first_names)]
    ln = last_names[lead_id % len(last_names)]
    company = companies[lead_id % len(companies)]
    return {
        "id": lead_id,
        "email": f"{fn.lower()}.{ln.lower()}@{company.lower().replace(' ', '')}.com",
        "first_name": fn,
        "last_name": ln,
        "company_name": company,
        "title": titles[lead_id % len(titles)],
        "phone": f"+1 555-{random.randint(100, 999)}-{random.randint(1000, 9999)}",
        "city": random.choice(["New York", "San Francisco", "Austin", "Chicago", "Seattle"]),
        "state": random.choice(["NY", "CA", "TX", "IL", "WA"]),
        "country": "US",
        "website": f"https://www.{company.lower().replace(' ', '')}.com",
        "status": random.choice(["NOT_CONTACTED", "IN_PROGRESS", "COMPLETED"]),
        "category": categories[lead_id % len(categories)],
        "last_activity": _random_date(7),
        "created_at": _random_date(30),
    }


def _mock_email_account(account_id: int) -> dict[str, Any]:
    domains = ["acmecorp.com", "techstart.io", "growthco.com", "innovate.co"]
    names = ["John Smith", "Jane Doe", "Alex Brown", "Sam Wilson"]
    providers = ["Gmail", "Outlook", "SMTP"]
    statuses = ["active", "warmup", "active", "active"]  # weighted toward active
    warmup_enabled = account_id % 4 != 3
    return {
        "id": account_id,
        "email": f"{names[account_id % len(names)].split()[0].lower()}@{domains[account_id % len(domains)]}",
        "from_name": names[account_id % len(names)],
        "provider": providers[account_id % len(providers)],
        "status": statuses[account_id % len(statuses)],
        "messages_per_day": random.choice([30, 40, 50, 75, 100]),
        "warmup": {
            "warmup_enabled": warmup_enabled,
            "warmup_limit": 30,
            "inbox_rate": round(random.uniform(0.75, 0.98), 2),
            "spam_rate": round(random.uniform(0.01, 0.08), 2),
            "sent_today": random.randint(0, 30),
        },
        "tags": random.sample(["primary", "warmup", "q1", "enterprise"], k=random.randint(0, 2)),
        "campaigns_attached": random.randint(0, 4),
        "created_at": _random_date(90),
    }


def _mock_inbox_message(msg_id: int, is_unread: bool = False) -> dict[str, Any]:
    leads = [
        ("Sarah Johnson", "sarah@acmecorp.com", "Acme Corp"),
        ("Mike Chen", "mike@techstart.io", "TechStart"),
        ("Lisa Park", "lisa@growthco.com", "Growth Co"),
        ("David Smith", "david@innovate.co", "Innovate Inc"),
    ]
    campaigns = [(1, "Q1 SaaS Outreach"), (2, "Agency Cold Email"), (3, "Enterprise Prospecting")]
    lead = leads[msg_id % len(leads)]
    camp = campaigns[msg_id % len(campaigns)]
    subjects = [
        "Re: Quick question about your outreach",
        "Re: Thought this might be relevant",
        "Re: Introduction",
        "Re: Follow up",
        "Re: Checking in",
    ]
    bodies = [
        "Thanks for reaching out! I'd be happy to chat. Can we schedule 15 minutes next week?",
        "This looks interesting. Can you send me more info?",
        "Not the right fit for us right now, but keep us in mind.",
        "Hi, I'm actually out of the office until Monday. I'll get back to you then.",
        "Could you clarify what you mean? I'm a bit confused by the email.",
    ]
    return {
        "id": msg_id,
        "lead_id": msg_id * 10,
        "lead_email": lead[1],
        "lead_name": lead[0],
        "lead_company": lead[2],
        "campaign_id": camp[0],
        "campaign_name": camp[1],
        "subject": subjects[msg_id % len(subjects)],
        "body": bodies[msg_id % len(bodies)],
        "is_read": not is_unread,
        "is_important": msg_id % 7 == 0,
        "is_snoozed": False,
        "is_archived": False,
        "category": "Interested" if msg_id % 3 == 0 else "Uncategorized",
        "timestamp": _random_date(3),
        "message_type": "received",
    }


class MockSmartleadClient:
    """Drop-in replacement for SmartleadClient returning fake but realistic data."""

    def __init__(self, api_key: str = "mock"):
        self.api_key = api_key

    # ─── Campaigns ───────────────────────────────────────────────────────────

    async def create_campaign(self, name: str, client_id: Optional[int] = None, client_api_key: Optional[str] = None) -> dict[str, Any]:
        return {"ok": True, "id": random.randint(100, 999), "name": name}

    async def list_campaigns(self, client_id: Optional[int] = None, client_api_key: Optional[str] = None) -> list[dict[str, Any]]:
        return [_mock_campaign(i, client_id or 42) for i in range(1, 8)]

    async def get_campaign_by_id(self, campaign_id: int, client_api_key: Optional[str] = None) -> dict[str, Any]:
        return _mock_campaign(campaign_id)

    async def update_campaign_schedule(self, campaign_id: int, schedule: dict[str, Any], client_api_key: Optional[str] = None) -> dict[str, Any]:
        return {"ok": True, "id": campaign_id}

    async def update_campaign_settings(self, campaign_id: int, settings: dict[str, Any], client_api_key: Optional[str] = None) -> dict[str, Any]:
        return {"ok": True, "id": campaign_id}

    async def save_campaign_sequence(self, campaign_id: int, sequences: list[dict[str, Any]], client_api_key: Optional[str] = None) -> dict[str, Any]:
        return {"ok": True, "id": campaign_id, "sequences_saved": len(sequences)}

    async def patch_campaign_status(self, campaign_id: int, status: str, client_api_key: Optional[str] = None) -> dict[str, Any]:
        return {"ok": True, "id": campaign_id, "status": status}

    async def delete_campaign(self, campaign_id: int, client_api_key: Optional[str] = None) -> dict[str, Any]:
        return {"ok": True, "deleted": True}

    async def get_campaign_sequences(self, campaign_id: int, client_api_key: Optional[str] = None) -> list[dict[str, Any]]:
        return [
            {
                "seq_number": 1,
                "seq_delay_details": {"delay_in_days": 0},
                "variants": [
                    {
                        "subject": "Quick question about {{company_name}}",
                        "body": "Hi {{first_name}},\n\nI noticed {{company_name}} is growing fast — congrats!\n\nWe help companies like yours book more meetings through cold email. Would a quick 15-minute call make sense this week?\n\nBest,\n{{sender_name}}",
                    }
                ],
            },
            {
                "seq_number": 2,
                "seq_delay_details": {"delay_in_days": 3},
                "variants": [
                    {
                        "subject": "Re: Quick question about {{company_name}}",
                        "body": "Hey {{first_name}},\n\nJust bumping this up — we recently helped a company in {{city}} go from 2% to 8% reply rates in 60 days.\n\nWorth a quick chat?\n\n{{sender_name}}",
                    },
                    {
                        "subject": "Different angle, {{first_name}}",
                        "body": "Hi {{first_name}},\n\nMost {{title}}s I talk to are struggling with the same thing: getting replies from cold email.\n\nHappy to share what's working right now. 15 minutes?\n\n{{sender_name}}",
                    },
                ],
            },
            {
                "seq_number": 3,
                "seq_delay_details": {"delay_in_days": 7},
                "variants": [
                    {
                        "subject": "Last try — {{first_name}}",
                        "body": "{{first_name}},\n\nI'll keep this short — if cold email isn't a priority for {{company_name}} right now, no worries at all.\n\nIf it ever becomes one, feel free to reach back out.\n\n{{sender_name}}",
                    }
                ],
            },
        ]

    async def update_campaign_schedule(self, campaign_id: int, schedule: dict[str, Any], client_api_key: Optional[str] = None) -> dict[str, Any]:
        return {"ok": True, "id": campaign_id}

    async def update_campaign_settings_full(self, campaign_id: int, settings: dict[str, Any], client_api_key: Optional[str] = None) -> dict[str, Any]:
        return {"ok": True, "id": campaign_id}

    async def bulk_action_leads(self, campaign_id: int, lead_ids: list[int], action: str, client_api_key: Optional[str] = None) -> dict[str, Any]:
        return {"ok": True, "affected": len(lead_ids), "action": action}

    async def get_campaign_analytics(self, campaign_id: int, client_api_key: Optional[str] = None) -> dict[str, Any]:
        c = _mock_campaign(campaign_id)
        daily = [
            {"date": (datetime.utcnow() - timedelta(days=i)).strftime("%Y-%m-%d"), "sent": random.randint(50, 200)}
            for i in range(14, 0, -1)
        ]
        return {**c["stats"], "daily_sends": daily}

    # ─── Leads ───────────────────────────────────────────────────────────────

    async def add_leads_to_campaign(self, campaign_id: int, leads: list[dict[str, Any]], client_api_key: Optional[str] = None) -> dict[str, Any]:
        return {"ok": True, "total_leads_added": len(leads), "duplicate_leads": 0, "invalid_emails": 0}

    async def list_leads_by_campaign(self, campaign_id: int, offset: int = 0, limit: int = 100, client_api_key: Optional[str] = None) -> dict[str, Any]:
        leads = [_mock_lead(i) for i in range(offset + 1, offset + min(limit, 20) + 1)]
        return {"data": leads, "total": 847, "offset": offset, "limit": limit}

    async def fetch_lead_by_email(self, email: str, client_api_key: Optional[str] = None) -> dict[str, Any]:
        return _mock_lead(1)

    async def update_lead_category(self, lead_id: int, campaign_id: int, category: str, client_api_key: Optional[str] = None) -> dict[str, Any]:
        return {"ok": True, "lead_id": lead_id, "category": category}

    async def get_lead_message_history(self, campaign_id: int, lead_id: int, client_api_key: Optional[str] = None) -> dict[str, Any]:
        messages = [_mock_inbox_message(i) for i in range(1, 5)]
        return {"lead_id": lead_id, "messages": messages}

    # ─── Email Accounts ───────────────────────────────────────────────────────

    async def create_email_account(self, account: dict[str, Any], client_api_key: Optional[str] = None) -> dict[str, Any]:
        return {"ok": True, "id": random.randint(100, 999)}

    async def list_all_email_accounts(self, client_api_key: Optional[str] = None) -> list[dict[str, Any]]:
        return [_mock_email_account(i) for i in range(1, 15)]

    async def list_email_accounts_by_campaign(self, campaign_id: int, client_api_key: Optional[str] = None) -> list[dict[str, Any]]:
        return [_mock_email_account(i) for i in range(1, 4)]

    async def add_email_account_to_campaign(self, campaign_id: int, email_account_id: int, client_api_key: Optional[str] = None) -> dict[str, Any]:
        return {"ok": True}

    async def remove_email_account_from_campaign(self, campaign_id: int, email_account_id: int, client_api_key: Optional[str] = None) -> dict[str, Any]:
        return {"ok": True}

    async def get_email_account_by_id(self, email_account_id: int, client_api_key: Optional[str] = None) -> dict[str, Any]:
        return _mock_email_account(email_account_id)

    async def update_email_account(self, email_account_id: int, updates: dict[str, Any], client_api_key: Optional[str] = None) -> dict[str, Any]:
        return {"ok": True, "id": email_account_id, **updates}

    async def delete_email_account(self, email_account_id: int, client_api_key: Optional[str] = None) -> dict[str, Any]:
        return {"ok": True, "deleted": True, "id": email_account_id}

    async def update_email_account_warmup(self, email_account_id: int, warmup_settings: dict[str, Any], client_api_key: Optional[str] = None) -> dict[str, Any]:
        return {"ok": True, "id": email_account_id}

    async def get_email_account_warmup_stats(self, email_account_id: int, client_api_key: Optional[str] = None) -> dict[str, Any]:
        return {
            "warmup_enabled": True,
            "days": [
                {"date": (datetime.utcnow() - timedelta(days=i)).strftime("%Y-%m-%d"), "sent": random.randint(10, 30), "inbox": random.randint(8, 29), "spam": random.randint(0, 2)}
                for i in range(7, 0, -1)
            ],
        }

    # ─── Master Inbox ─────────────────────────────────────────────────────────

    async def fetch_inbox_replies(self, offset: int = 0, limit: int = 50, client_id: Optional[int] = None, client_api_key: Optional[str] = None) -> dict[str, Any]:
        msgs = [_mock_inbox_message(i) for i in range(offset + 1, offset + min(limit, 12) + 1)]
        return {"data": msgs, "total": 47, "offset": offset, "limit": limit}

    async def fetch_unread_replies(self, offset: int = 0, limit: int = 50, client_id: Optional[int] = None, client_api_key: Optional[str] = None) -> dict[str, Any]:
        msgs = [_mock_inbox_message(i, is_unread=True) for i in range(1, 6)]
        return {"data": msgs, "total": 5, "offset": offset, "limit": limit}

    async def reply_to_lead(self, lead_id: int, campaign_id: int, email_body: str, email_account_id: int, client_api_key: Optional[str] = None) -> dict[str, Any]:
        return {"ok": True, "message_id": random.randint(10000, 99999)}

    async def mark_read(self, email_id: int, is_read: bool, client_api_key: Optional[str] = None) -> dict[str, Any]:
        return {"ok": True, "email_id": email_id, "is_read": is_read}

    async def fetch_master_inbox_lead_by_id(self, lead_id: int, client_api_key: Optional[str] = None) -> dict[str, Any]:
        return _mock_lead(lead_id)

    async def fetch_snoozed_messages(self, offset: int = 0, limit: int = 50, client_id: Optional[int] = None, client_api_key: Optional[str] = None) -> dict[str, Any]:
        msgs = [dict(_mock_inbox_message(i), is_snoozed=True) for i in range(1, 4)]
        return {"data": msgs, "total": 3, "offset": offset, "limit": limit}

    async def fetch_important_marked_messages(self, offset: int = 0, limit: int = 50, client_id: Optional[int] = None, client_api_key: Optional[str] = None) -> dict[str, Any]:
        msgs = [dict(_mock_inbox_message(i), is_important=True) for i in range(1, 5)]
        return {"data": msgs, "total": 4, "offset": offset, "limit": limit}

    async def fetch_archived_messages(self, offset: int = 0, limit: int = 50, client_id: Optional[int] = None, client_api_key: Optional[str] = None) -> dict[str, Any]:
        msgs = [dict(_mock_inbox_message(i), is_archived=True) for i in range(1, 3)]
        return {"data": msgs, "total": 2, "offset": offset, "limit": limit}

    async def get_lead_thread(self, lead_id: int, campaign_id: int, client_api_key: Optional[str] = None) -> dict[str, Any]:
        """Full conversation thread: sent emails + received replies."""
        sent_bodies = [
            "Hi {{first_name}},\n\nI noticed your work at {{company_name}} and wanted to reach out...",
            "Hey, just following up on my last email. Would love to connect!",
        ]
        sent = [
            dict(
                _mock_inbox_message(i * 100 + lead_id),
                id=i * 100 + lead_id,
                lead_id=lead_id,
                campaign_id=campaign_id,
                body=sent_bodies[i % len(sent_bodies)],
                message_type="sent",
                is_read=True,
                timestamp=(datetime.utcnow() - timedelta(days=3 - i)).isoformat(),
            )
            for i in range(2)
        ]
        received = [_mock_inbox_message(lead_id)]
        received[0]["timestamp"] = (datetime.utcnow() - timedelta(hours=2)).isoformat()
        combined = sorted(sent + received, key=lambda m: m["timestamp"])
        return {"lead_id": lead_id, "messages": combined}

    async def mark_important(self, email_id: int, is_important: bool, client_api_key: Optional[str] = None) -> dict[str, Any]:
        return {"ok": True, "email_id": email_id, "is_important": is_important}

    async def mark_archived(self, email_id: int, is_archived: bool, client_api_key: Optional[str] = None) -> dict[str, Any]:
        return {"ok": True, "email_id": email_id, "is_archived": is_archived}

    async def set_reminder(self, lead_id: int, remind_at: str, client_api_key: Optional[str] = None) -> dict[str, Any]:
        return {"ok": True, "lead_id": lead_id, "remind_at": remind_at}

    async def create_lead_note(self, lead_id: int, note: str, client_api_key: Optional[str] = None) -> dict[str, Any]:
        return {"ok": True, "lead_id": lead_id, "note_id": random.randint(1000, 9999)}

    async def create_lead_task(self, lead_id: int, task: str, due_date: Optional[str] = None, client_api_key: Optional[str] = None) -> dict[str, Any]:
        return {"ok": True, "lead_id": lead_id, "task_id": random.randint(1000, 9999)}

    async def block_domains(self, domains: list[str], client_api_key: Optional[str] = None) -> dict[str, Any]:
        return {"ok": True, "blocked": domains}

    async def forward_reply(self, email_id: int, forward_to: str, client_api_key: Optional[str] = None) -> dict[str, Any]:
        return {"ok": True, "email_id": email_id, "forwarded_to": forward_to}

    # ─── Client Management ───────────────────────────────────────────────────

    async def add_client(self, name: str, email: str) -> dict[str, Any]:
        return {"ok": True, "id": random.randint(100, 999), "name": name, "email": email}

    async def fetch_all_clients(self) -> list[dict[str, Any]]:
        return [
            {"id": i, "name": f"Client {i}", "email": f"client{i}@example.com", "created_at": _random_date(60)}
            for i in range(1, 6)
        ]

    async def create_client_api_key(self, client_id: int) -> dict[str, Any]:
        return {"ok": True, "client_id": client_id, "api_key": f"mock-client-key-{client_id}-{'x' * 20}"}

    # ─── Smart Senders ───────────────────────────────────────────────────────

    async def search_domain(self, domain: str) -> dict[str, Any]:
        return {
            "domain": domain,
            "available": True,
            "price": {"monthly": 1200, "annual": 12000},
            "alternatives": [f"get{domain}", f"try{domain}", f"use{domain}"],
        }

    async def get_vendors(self) -> list[dict[str, Any]]:
        return [
            {"id": 1, "name": "Google Workspace", "price_per_mailbox": 600},
            {"id": 2, "name": "Microsoft 365", "price_per_mailbox": 500},
            {"id": 3, "name": "Zoho Mail", "price_per_mailbox": 100},
        ]

    async def place_order(self, order: dict[str, Any]) -> dict[str, Any]:
        return {"ok": True, "order_id": f"ord_{random.randint(10000, 99999)}", "status": "pending"}

    async def get_domain_list(self) -> list[dict[str, Any]]:
        return [{"domain": "mockdomain.com", "mailboxes": 5, "status": "active", "created_at": _random_date(20)}]

    async def get_order_details(self, order_id: str) -> dict[str, Any]:
        return {"order_id": order_id, "status": "provisioned", "mailboxes": 5, "domain": "mockdomain.com"}

    async def auto_generate_mailboxes(self, domain: str, count: int, pattern: str) -> dict[str, Any]:
        return {
            "ok": True,
            "domain": domain,
            "mailboxes": [f"{pattern.split('.')[0]}{i}@{domain}" for i in range(1, count + 1)],
        }

    async def aclose(self) -> None:
        pass
