"""
Supabase admin client — uses service role key for server-side operations.
Always call get_supabase() inside a request handler (not at module load time)
so the Settings object is always fully initialized.
"""

from functools import lru_cache
from supabase import create_client, Client
from api.config import get_settings


def get_supabase() -> Client:
    settings = get_settings()
    return create_client(settings.supabase_url, settings.supabase_service_key)
