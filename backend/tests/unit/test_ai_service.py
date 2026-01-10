# backend/tests/unit/test_ai_service.py
import unittest
from unittest.mock import MagicMock, AsyncMock, patch
from app.services.ai_service import AIService
from app.models.project import WBSRequest, WBSResponse, WBSTask


class TestAIService(unittest.IsolatedAsyncioTestCase):
    """AIServiceの単体テスト
    Google Gemini APIをモック化し、課金や通信なしでロジックを検証する
    """

    @patch("app.services.ai_service.genai.Client")
    async def test_generate_wbs_success(self, MockClient):
        """正常系: AIが正しいレスポンスを返した場合"""

        # --- 1. モックの準備 ---
        mock_client_instance = MockClient.return_value
        mock_response = MagicMock()

        # AIが生成すると想定されるデータ
        expected_tasks = [
            WBSTask(
                title="要件定義",
                description="クライアントへのヒアリング",
                estimated_hours=5,
                suggested_role="PM",
            ),
            WBSTask(
                title="DB設計",
                description="スキーマの作成",
                estimated_hours=3,
                suggested_role="Backend",
            ),
        ]
        expected_response_obj = WBSResponse(tasks=expected_tasks)

        # レスポンスの parsed プロパティに成功結果をセット
        mock_response.parsed = expected_response_obj

        # generate_content メソッドを非同期モックに置き換え
        mock_client_instance.aio.models.generate_content = AsyncMock(
            return_value=mock_response
        )

        # --- 2. テスト実行 ---
        # サービスを初期化（ここでモックされたClientが使われる）
        service = AIService()

        request = WBSRequest(
            name="テストプロジェクト",
            description="これはテストです",
            start_date="2024-04-01",
            end_date="2024-04-30",
            milestones="要件定義完了",
        )

        result = await service.generate_wbs(request)

        # --- 3. 検証 ---
        # 返り値がWBSResponse型であること
        self.assertIsInstance(result, WBSResponse)
        # タスクが2つ含まれていること
        self.assertEqual(len(result.tasks), 2)
        # 内容が一致していること
        self.assertEqual(result.tasks[0].title, "要件定義")
        self.assertEqual(result.tasks[1].suggested_role, "Backend")

        # APIが1回だけ呼ばれたことを確認
        mock_client_instance.aio.models.generate_content.assert_called_once()

    @patch("app.services.ai_service.genai.Client")
    async def test_generate_wbs_failure(self, MockClient):
        """異常系: AI APIがエラーを返した場合（安全なフォールバックの確認）"""

        # --- 1. モックの準備 ---
        mock_client_instance = MockClient.return_value
        # 呼び出し時に例外を発生させる
        mock_client_instance.aio.models.generate_content = AsyncMock(
            side_effect=Exception("API connection failed")
        )

        # --- 2. テスト実行 ---
        service = AIService()
        request = WBSRequest(
            name="エラープロジェクト",
            description="エラー発生テスト",
            start_date="2024-04-01",
            end_date="2024-04-30",
        )

        # 例外が発生せず、空のリストが返ってくることを期待
        result = await service.generate_wbs(request)

        # --- 3. 検証 ---
        self.assertIsInstance(result, WBSResponse)
        # タスクが空リストであること（クラッシュしていないこと）
        self.assertEqual(result.tasks, [])
