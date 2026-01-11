# backend/app/services/batch_service.py
from datetime import date, timedelta

from supabase import Client

from app.core.constants import (
    COL_ID,
    COL_TENANT_ID,
    COL_USER_ID,
    TABLE_DAILY_REPORTS,
    TABLE_PROFILES,
    TABLE_WEEKLY_SUMMARIES,
)
from app.services.ai_service import AIService


class WeeklyBatchService:
    def __init__(self, supabase: Client):
        self.supabase = supabase
        self.ai_service = AIService()

    async def run_weekly_batch(self, target_date: date | None = None):
        """
        指定された日付を含む週（月〜金）の週報を全ユーザー分生成する
        """
        if target_date is None:
            target_date = date.today()

        # 1. 期間計算 (月曜〜金曜)
        start_of_week = target_date - timedelta(days=target_date.weekday())
        end_of_week = start_of_week + timedelta(days=4)

        print(f"📅 Target Week: {start_of_week} ~ {end_of_week}")

        # 2. ユーザー一覧取得
        profiles_res = (
            self.supabase.table(TABLE_PROFILES)
            .select(f"{COL_ID}, {COL_TENANT_ID}")
            .execute()
        )
        profiles = profiles_res.data or []

        results = {"success": 0, "skip": 0, "error": 0}

        for user in profiles:
            user_id = user[COL_ID]  # type: ignore
            tenant_id = user[COL_TENANT_ID]  # type: ignore

            try:
                # 3. 日報取得
                reports_res = (
                    self.supabase.table(TABLE_DAILY_REPORTS)
                    .select("*, task_work_logs(*, tasks(title))")
                    .eq(COL_USER_ID, user_id)
                    .gte("report_date", start_of_week.isoformat())
                    .lte("report_date", end_of_week.isoformat())
                    .order("report_date", desc=False)
                    .execute()
                )
                daily_reports = reports_res.data

                if not daily_reports:
                    results["skip"] += 1
                    continue

                # 4. AI生成
                generated_text = await self.ai_service.generate_weekly_summary(
                    daily_reports
                )

                # 5. DB保存 (重複チェックは省略し、Insert)
                data = {
                    COL_TENANT_ID: tenant_id,
                    COL_USER_ID: user_id,
                    "content": generated_text,
                    "week_start_date": start_of_week.isoformat(),
                    "week_end_date": end_of_week.isoformat(),
                }
                self.supabase.table(TABLE_WEEKLY_SUMMARIES).insert(data).execute()
                results["success"] += 1

            except Exception as e:
                print(f"Error processing user {user_id}: {e}")
                results["error"] += 1

        return results
