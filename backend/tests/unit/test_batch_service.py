# backend/tests/unit/test_batch_service.py
import unittest
from unittest.mock import MagicMock, AsyncMock, patch
from datetime import date
from app.services.batch_service import WeeklyBatchService


class TestWeeklyBatchService(unittest.IsolatedAsyncioTestCase):
    """週報生成バッチの単体テスト"""

    def setUp(self):
        # Supabaseクライアントのモック
        self.mock_supabase = MagicMock()
        self.service = WeeklyBatchService(self.mock_supabase)

        # AIサービスのモック (内部でインスタンス化されるため patch が必要だが、
        # 簡易的にメソッドを差し替える手法をとるか、あるいは @patch でクラスごと置き換える)
        self.service.ai_service = MagicMock()
        self.service.ai_service.generate_weekly_summary = AsyncMock(
            return_value="AI Generated Summary"
        )

    def test_run_weekly_batch_success(self):
        """正常系: ユーザーがいて日報もある場合"""

        # 1. ユーザー一覧のモック
        mock_profiles = [{"id": "user1", "tenant_id": "tenant1"}]
        self.mock_supabase.table.return_value.select.return_value.execute.return_value.data = (
            mock_profiles
        )

        # 2. 日報取得のモック (chainメソッドのモック)
        # table().select().eq().gte().lte().order().execute() のチェーン
        mock_reports_query = (
            self.mock_supabase.table.return_value.select.return_value.eq.return_value.gte.return_value.lte.return_value.order.return_value
        )

        mock_reports_query.execute.return_value.data = [
            {"id": "report1", "content_raw": "work"}
        ]

        # 3. 保存(insert)のモック
        mock_insert = self.mock_supabase.table.return_value.insert.return_value

        # --- 実行 ---
        # 2024/01/10 (水) を指定 -> 月曜は 1/8, 金曜は 1/12 になるはず
        target_date = date(2024, 1, 10)

        # 非同期実行のために run_until_complete は使わず await で呼ぶ (IsolatedAsyncioTestCase内)
        import asyncio

        loop = asyncio.get_event_loop()
        results = loop.run_until_complete(self.service.run_weekly_batch(target_date))

        # --- 検証 ---
        self.assertEqual(results["success"], 1)
        self.assertEqual(results["skip"], 0)

        # 日報取得時の日付範囲チェック
        # gte("report_date", "2024-01-08") が呼ばれたか
        args, _ = (
            self.mock_supabase.table.return_value.select.return_value.eq.return_value.gte.call_args
        )
        self.assertEqual(args[1], "2024-01-08")

        # AIサービスが呼ばれたか
        self.service.ai_service.generate_weekly_summary.assert_called_once()

        # DB保存が呼ばれたか
        mock_insert.execute.assert_called_once()

    def test_run_weekly_batch_skip_no_reports(self):
        """正常系: 日報がないユーザーはスキップされるか"""

        # ユーザーあり
        self.mock_supabase.table.return_value.select.return_value.execute.return_value.data = [
            {"id": "user2", "tenant_id": "tenant1"}
        ]

        # 日報なし (空リスト)
        mock_reports_query = (
            self.mock_supabase.table.return_value.select.return_value.eq.return_value.gte.return_value.lte.return_value.order.return_value
        )
        mock_reports_query.execute.return_value.data = []

        # --- 実行 ---
        import asyncio

        loop = asyncio.get_event_loop()
        results = loop.run_until_complete(self.service.run_weekly_batch())

        # --- 検証 ---
        self.assertEqual(results["success"], 0)
        self.assertEqual(results["skip"], 1)

        # AIは呼ばれないはず
        self.service.ai_service.generate_weekly_summary.assert_not_called()
