# backend/app/db/client.py
from supabase import Client, create_client

from app.core.config import settings

# 再接続のオーバーヘッドを防ぐためグローバル変数として保持
_supabase_client: Client | None = None


def get_supabase() -> Client:
    """Supabaseクライアントを取得する依存関数"""
    global _supabase_client

    if _supabase_client is None:
        _supabase_client = create_client(settings.SUPABASE_URL, settings.SUPABASE_KEY)

    return _supabase_client
