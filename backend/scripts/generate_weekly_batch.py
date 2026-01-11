# backend/scripts/generate_weekly_batch.py
import asyncio
import os
import sys
from datetime import date, timedelta
from dotenv import load_dotenv

# パスを通す（backendディレクトリをルートとしてappモジュールをインポートするため）
sys.path.append(os.path.join(os.path.dirname(__file__), ".."))

from supabase import create_client, Client
from app.services.ai_service import AIService  # type: ignore
from app.core.config import settings  # type: ignore

# ローカル実行用（.env読み込み）
load_dotenv()


async def main():
    print("🚀 Starting Weekly Report Batch...")

    # バッチ用権限設定
    supabase_url = settings.SUPABASE_URL
    supabase_key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY", settings.SUPABASE_KEY)
    supabase = create_client(supabase_url, supabase_key)

    service = WeeklyBatchService(supabase)

    # 実行
    results = await service.run_weekly_batch()

    print(f"🎉 Batch completed. {results}")


if __name__ == "__main__":
    asyncio.run(main())
