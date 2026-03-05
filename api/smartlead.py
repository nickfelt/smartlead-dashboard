"""
Smartlead.ai REST API client wrapper.
All methods accept an optional client_api_key to use instead of the master key.
"""

import httpx
from typing import Any, Optional


SMARTLEAD_BASE_URL = "https://server.smartlead.ai/api/v1"


class SmartleadClient:
    def __init__(self, api_key: str):
        self.api_key = api_key
        self._client = httpx.AsyncClient(
            base_url=SMARTLEAD_BASE_URL,
            timeout=30.0,
        )

    def _params(self, extra: Optional[dict] = None) -> dict:
        p = {"api_key": self.api_key}
        if extra:
            p.update(extra)
        return p

    def _with_key(self, client_api_key: Optional[str]) -> "SmartleadClient":
        """Return a client using client_api_key instead of master key, if provided."""
        if client_api_key:
            return SmartleadClient(client_api_key)
        return self

    # ─── Campaigns ───────────────────────────────────────────────────────────

    async def create_campaign(self, name: str, client_id: Optional[int] = None, client_api_key: Optional[str] = None) -> dict[str, Any]:
        c = self._with_key(client_api_key)
        payload: dict[str, Any] = {"name": name}
        if client_id:
            payload["client_id"] = client_id
        resp = await c._client.post("/campaigns/create", params=c._params(), json=payload)
        resp.raise_for_status()
        return resp.json()

    async def list_campaigns(self, client_id: Optional[int] = None, client_api_key: Optional[str] = None) -> list[dict[str, Any]]:
        c = self._with_key(client_api_key)
        params = c._params({"client_id": client_id} if client_id else None)
        resp = await c._client.get("/campaigns", params=params)
        resp.raise_for_status()
        return resp.json()

    async def get_campaign_by_id(self, campaign_id: int, client_api_key: Optional[str] = None) -> dict[str, Any]:
        c = self._with_key(client_api_key)
        resp = await c._client.get(f"/campaigns/{campaign_id}", params=c._params())
        resp.raise_for_status()
        return resp.json()

    async def update_campaign_schedule(self, campaign_id: int, schedule: dict[str, Any], client_api_key: Optional[str] = None) -> dict[str, Any]:
        c = self._with_key(client_api_key)
        resp = await c._client.post(f"/campaigns/{campaign_id}/schedule", params=c._params(), json=schedule)
        resp.raise_for_status()
        return resp.json()

    async def update_campaign_settings(self, campaign_id: int, settings: dict[str, Any], client_api_key: Optional[str] = None) -> dict[str, Any]:
        c = self._with_key(client_api_key)
        resp = await c._client.post(f"/campaigns/{campaign_id}/settings", params=c._params(), json=settings)
        resp.raise_for_status()
        return resp.json()

    async def save_campaign_sequence(self, campaign_id: int, sequences: list[dict[str, Any]], client_api_key: Optional[str] = None) -> dict[str, Any]:
        c = self._with_key(client_api_key)
        resp = await c._client.post(f"/campaigns/{campaign_id}/sequences/save", params=c._params(), json={"sequences": sequences})
        resp.raise_for_status()
        return resp.json()

    async def patch_campaign_status(self, campaign_id: int, status: str, client_api_key: Optional[str] = None) -> dict[str, Any]:
        c = self._with_key(client_api_key)
        resp = await c._client.post(f"/campaigns/{campaign_id}/status", params=c._params(), json={"status": status})
        resp.raise_for_status()
        return resp.json()

    async def delete_campaign(self, campaign_id: int, client_api_key: Optional[str] = None) -> dict[str, Any]:
        c = self._with_key(client_api_key)
        resp = await c._client.delete(f"/campaigns/{campaign_id}", params=c._params())
        resp.raise_for_status()
        return resp.json()

    async def get_campaign_analytics(self, campaign_id: int, client_api_key: Optional[str] = None) -> dict[str, Any]:
        c = self._with_key(client_api_key)
        resp = await c._client.get(f"/campaigns/{campaign_id}/analytics", params=c._params())
        resp.raise_for_status()
        return resp.json()

    # ─── Leads ───────────────────────────────────────────────────────────────

    async def add_leads_to_campaign(self, campaign_id: int, leads: list[dict[str, Any]], client_api_key: Optional[str] = None) -> dict[str, Any]:
        c = self._with_key(client_api_key)
        resp = await c._client.post(f"/campaigns/{campaign_id}/leads", params=c._params(), json={"lead_list": leads})
        resp.raise_for_status()
        return resp.json()

    async def list_leads_by_campaign(self, campaign_id: int, offset: int = 0, limit: int = 100, client_api_key: Optional[str] = None) -> dict[str, Any]:
        c = self._with_key(client_api_key)
        resp = await c._client.get(f"/campaigns/{campaign_id}/leads", params=c._params({"offset": offset, "limit": limit}))
        resp.raise_for_status()
        return resp.json()

    async def fetch_lead_by_email(self, email: str, client_api_key: Optional[str] = None) -> dict[str, Any]:
        c = self._with_key(client_api_key)
        resp = await c._client.get("/leads", params=c._params({"email": email}))
        resp.raise_for_status()
        return resp.json()

    async def update_lead_category(self, lead_id: int, campaign_id: int, category: str, client_api_key: Optional[str] = None) -> dict[str, Any]:
        c = self._with_key(client_api_key)
        resp = await c._client.post(f"/leads/{lead_id}/category", params=c._params(), json={"campaign_id": campaign_id, "category": category})
        resp.raise_for_status()
        return resp.json()

    async def get_lead_message_history(self, campaign_id: int, lead_id: int, client_api_key: Optional[str] = None) -> dict[str, Any]:
        c = self._with_key(client_api_key)
        resp = await c._client.get(f"/campaigns/{campaign_id}/leads/{lead_id}/message-history", params=c._params())
        resp.raise_for_status()
        return resp.json()

    # ─── Email Accounts ───────────────────────────────────────────────────────

    async def create_email_account(self, account: dict[str, Any], client_api_key: Optional[str] = None) -> dict[str, Any]:
        c = self._with_key(client_api_key)
        resp = await c._client.post("/email-accounts/save", params=c._params(), json=account)
        resp.raise_for_status()
        return resp.json()

    async def list_all_email_accounts(self, client_api_key: Optional[str] = None) -> list[dict[str, Any]]:
        c = self._with_key(client_api_key)
        resp = await c._client.get("/email-accounts", params=c._params())
        resp.raise_for_status()
        return resp.json()

    async def list_email_accounts_by_campaign(self, campaign_id: int, client_api_key: Optional[str] = None) -> list[dict[str, Any]]:
        c = self._with_key(client_api_key)
        resp = await c._client.get(f"/campaigns/{campaign_id}/email-accounts", params=c._params())
        resp.raise_for_status()
        return resp.json()

    async def add_email_account_to_campaign(self, campaign_id: int, email_account_id: int, client_api_key: Optional[str] = None) -> dict[str, Any]:
        c = self._with_key(client_api_key)
        resp = await c._client.post(f"/campaigns/{campaign_id}/email-accounts", params=c._params(), json={"email_account_id": email_account_id})
        resp.raise_for_status()
        return resp.json()

    async def remove_email_account_from_campaign(self, campaign_id: int, email_account_id: int, client_api_key: Optional[str] = None) -> dict[str, Any]:
        c = self._with_key(client_api_key)
        resp = await c._client.delete(f"/campaigns/{campaign_id}/email-accounts/{email_account_id}", params=c._params())
        resp.raise_for_status()
        return resp.json()

    async def update_email_account_warmup(self, email_account_id: int, warmup_settings: dict[str, Any], client_api_key: Optional[str] = None) -> dict[str, Any]:
        c = self._with_key(client_api_key)
        resp = await c._client.post(f"/email-accounts/{email_account_id}/warmup", params=c._params(), json=warmup_settings)
        resp.raise_for_status()
        return resp.json()

    async def get_email_account_warmup_stats(self, email_account_id: int, client_api_key: Optional[str] = None) -> dict[str, Any]:
        c = self._with_key(client_api_key)
        resp = await c._client.get(f"/email-accounts/{email_account_id}/warmup-stats", params=c._params())
        resp.raise_for_status()
        return resp.json()

    # ─── Master Inbox ─────────────────────────────────────────────────────────

    async def fetch_inbox_replies(self, offset: int = 0, limit: int = 50, client_id: Optional[int] = None, client_api_key: Optional[str] = None) -> dict[str, Any]:
        c = self._with_key(client_api_key)
        params = c._params({"offset": offset, "limit": limit})
        if client_id:
            params["client_id"] = client_id
        resp = await c._client.post("/master-inbox/fetch-emails", params=params)
        resp.raise_for_status()
        return resp.json()

    async def fetch_unread_replies(self, offset: int = 0, limit: int = 50, client_id: Optional[int] = None, client_api_key: Optional[str] = None) -> dict[str, Any]:
        c = self._with_key(client_api_key)
        params = c._params({"offset": offset, "limit": limit})
        if client_id:
            params["client_id"] = client_id
        resp = await c._client.post("/master-inbox/fetch-unread-emails", params=params)
        resp.raise_for_status()
        return resp.json()

    async def reply_to_lead(self, lead_id: int, campaign_id: int, email_body: str, email_account_id: int, client_api_key: Optional[str] = None) -> dict[str, Any]:
        c = self._with_key(client_api_key)
        payload = {
            "lead_id": lead_id,
            "campaign_id": campaign_id,
            "email_body": email_body,
            "email_account_id": email_account_id,
        }
        resp = await c._client.post("/master-inbox/reply", params=c._params(), json=payload)
        resp.raise_for_status()
        return resp.json()

    async def mark_read(self, email_id: int, is_read: bool, client_api_key: Optional[str] = None) -> dict[str, Any]:
        c = self._with_key(client_api_key)
        resp = await c._client.post("/master-inbox/read-status", params=c._params(), json={"email_id": email_id, "is_read": is_read})
        resp.raise_for_status()
        return resp.json()

    async def fetch_master_inbox_lead_by_id(self, lead_id: int, client_api_key: Optional[str] = None) -> dict[str, Any]:
        c = self._with_key(client_api_key)
        resp = await c._client.get(f"/master-inbox/leads/{lead_id}", params=c._params())
        resp.raise_for_status()
        return resp.json()

    # ─── Client Management ───────────────────────────────────────────────────

    async def add_client(self, name: str, email: str) -> dict[str, Any]:
        resp = await self._client.post("/client/save", params=self._params(), json={"name": name, "email": email})
        resp.raise_for_status()
        return resp.json()

    async def fetch_all_clients(self) -> list[dict[str, Any]]:
        resp = await self._client.get("/client/list", params=self._params())
        resp.raise_for_status()
        return resp.json()

    async def create_client_api_key(self, client_id: int) -> dict[str, Any]:
        resp = await self._client.post(f"/client/{client_id}/api-key/create", params=self._params())
        resp.raise_for_status()
        return resp.json()

    # ─── Smart Senders ───────────────────────────────────────────────────────

    async def search_domain(self, domain: str) -> dict[str, Any]:
        resp = await self._client.get("/smart-senders/domain-search", params=self._params({"domain": domain}))
        resp.raise_for_status()
        return resp.json()

    async def get_vendors(self) -> list[dict[str, Any]]:
        resp = await self._client.get("/smart-senders/vendors", params=self._params())
        resp.raise_for_status()
        return resp.json()

    async def place_order(self, order: dict[str, Any]) -> dict[str, Any]:
        resp = await self._client.post("/smart-senders/place-order", params=self._params(), json=order)
        resp.raise_for_status()
        return resp.json()

    async def get_domain_list(self) -> list[dict[str, Any]]:
        resp = await self._client.get("/smart-senders/domains", params=self._params())
        resp.raise_for_status()
        return resp.json()

    async def get_order_details(self, order_id: str) -> dict[str, Any]:
        resp = await self._client.get(f"/smart-senders/orders/{order_id}", params=self._params())
        resp.raise_for_status()
        return resp.json()

    async def auto_generate_mailboxes(self, domain: str, count: int, pattern: str) -> dict[str, Any]:
        resp = await self._client.post("/smart-senders/auto-generate", params=self._params(), json={"domain": domain, "count": count, "pattern": pattern})
        resp.raise_for_status()
        return resp.json()

    async def aclose(self) -> None:
        await self._client.aclose()
