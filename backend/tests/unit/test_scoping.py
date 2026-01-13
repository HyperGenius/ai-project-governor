# backend/tests/unit/test_scoping.py
import unittest
from unittest.mock import AsyncMock, MagicMock, patch

from app.models.scoping import ChatMessage, ScopingChatResponse
from app.services.ai_service import AIService


class TestInteractiveScoping(unittest.IsolatedAsyncioTestCase):
    """対話型スコーピング機能の単体テスト"""

    @patch("app.services.ai_service.genai.Client")
    async def test_interactive_scoping_continue_questioning(self, MockClient):
        """正常系: AIが質問を続ける場合"""

        # モックの準備
        mock_client_instance = MockClient.return_value
        mock_response = MagicMock()

        # AIが質問を返すレスポンス
        expected_response = ScopingChatResponse(
            message="ターゲットユーザー層はどなたですか？個人向けですか、企業向けですか？",
            is_complete=False,
            wbs_data=None,
        )

        mock_response.parsed = expected_response
        mock_client_instance.aio.models.generate_content = AsyncMock(
            return_value=mock_response
        )

        # テスト実行
        service = AIService()
        messages = [
            ChatMessage(role="user", content="ECサイトを作りたい"),
        ]

        result = await service.interactive_scoping(messages)

        # 検証
        self.assertEqual(result.is_complete, False)
        self.assertIsNone(result.wbs_data)
        self.assertIn("ターゲット", result.message)

        # APIが呼ばれたことを確認
        mock_client_instance.aio.models.generate_content.assert_called_once()

    @patch("app.services.ai_service.genai.Client")
    async def test_interactive_scoping_complete_with_wbs(self, MockClient):
        """正常系: ヒアリング完了してWBS生成する場合"""

        # モックの準備
        mock_client_instance = MockClient.return_value
        mock_response = MagicMock()

        # ヒアリング完了時のレスポンス
        expected_response = ScopingChatResponse(
            message="要件が明確になりました。WBSを生成します。",
            is_complete=True,
            wbs_data={
                "name": "ECサイト開発プロジェクト",
                "description": "個人向けのECサイトを開発する",
                "start_date": "2026-02-01",
                "end_date": "2026-05-31",
                "milestones": "要件定義→設計→実装→テスト",
                "tasks": [
                    {
                        "title": "要件定義",
                        "description": "クライアントへのヒアリング",
                        "estimated_hours": 10,
                        "suggested_role": "PM",
                    }
                ],
            },
        )

        mock_response.parsed = expected_response
        mock_client_instance.aio.models.generate_content = AsyncMock(
            return_value=mock_response
        )

        # テスト実行
        service = AIService()
        messages = [
            ChatMessage(role="user", content="ECサイトを作りたい"),
            ChatMessage(
                role="assistant", content="ターゲットユーザー層はどなたですか？"
            ),
            ChatMessage(role="user", content="個人向けです"),
        ]

        result = await service.interactive_scoping(messages)

        # 検証
        self.assertEqual(result.is_complete, True)
        self.assertIsNotNone(result.wbs_data)
        self.assertEqual(result.wbs_data["name"], "ECサイト開発プロジェクト")
        self.assertEqual(len(result.wbs_data["tasks"]), 1)

    @patch("app.services.ai_service.genai.Client")
    async def test_interactive_scoping_error_handling(self, MockClient):
        """異常系: API呼び出しでエラーが発生した場合"""

        # モックの準備
        mock_client_instance = MockClient.return_value
        mock_client_instance.aio.models.generate_content = AsyncMock(
            side_effect=Exception("API Error")
        )

        # テスト実行
        service = AIService()
        messages = [
            ChatMessage(role="user", content="ECサイトを作りたい"),
        ]

        result = await service.interactive_scoping(messages)

        # 検証: エラー時は安全なレスポンスを返す
        self.assertEqual(result.is_complete, False)
        self.assertIsNone(result.wbs_data)
        self.assertIn("エラー", result.message)


if __name__ == "__main__":
    unittest.main()
