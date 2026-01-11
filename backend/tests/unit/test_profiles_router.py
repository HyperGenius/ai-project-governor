# backend/tests/unit/test_profiles_router.py
import unittest
from unittest.mock import MagicMock, patch
from uuid import uuid4
from fastapi import HTTPException

from app.routers.profiles import AISettings


class TestProfilesRouter(unittest.IsolatedAsyncioTestCase):
    """profiles routerの単体テスト"""

    def setUp(self):
        """テスト前の準備"""
        self.test_user_id = str(uuid4())
        self.mock_user = MagicMock()
        self.mock_user.id = self.test_user_id

    @patch("app.routers.profiles.get_supabase")
    async def test_get_ai_settings_success(self, mock_get_supabase):
        """正常系: AI設定の取得が成功する"""
        from app.routers.profiles import get_ai_settings

        # モックの設定
        mock_supabase = MagicMock()
        mock_get_supabase.return_value = mock_supabase

        # プロフィールデータのモック
        mock_response = MagicMock()
        mock_response.data = {
            "ai_settings": {
                "tone": "concise",
                "language": "ja",
                "custom_instructions": "技術用語を使う",
            }
        }

        # Supabaseクエリのモック
        mock_table = MagicMock()
        mock_table.select.return_value.eq.return_value.single.return_value.execute.return_value = (
            mock_response
        )
        mock_supabase.table.return_value = mock_table

        # テスト実行
        result = await get_ai_settings(self.mock_user, mock_supabase)

        # 検証
        self.assertEqual(result.ai_settings.tone, "concise")
        self.assertEqual(result.ai_settings.language, "ja")
        self.assertEqual(result.ai_settings.custom_instructions, "技術用語を使う")

    @patch("app.routers.profiles.get_supabase")
    async def test_get_ai_settings_default_values(self, mock_get_supabase):
        """正常系: ai_settingsが未設定の場合はデフォルト値が返る"""
        from app.routers.profiles import get_ai_settings

        # モックの設定
        mock_supabase = MagicMock()
        mock_get_supabase.return_value = mock_supabase

        # ai_settingsがNullのプロフィールデータ
        mock_response = MagicMock()
        mock_response.data = {"ai_settings": None}

        mock_table = MagicMock()
        mock_table.select.return_value.eq.return_value.single.return_value.execute.return_value = (
            mock_response
        )
        mock_supabase.table.return_value = mock_table

        # テスト実行
        result = await get_ai_settings(self.mock_user, mock_supabase)

        # デフォルト値の検証
        self.assertEqual(result.ai_settings.tone, "professional")
        self.assertEqual(result.ai_settings.language, "ja")
        self.assertEqual(result.ai_settings.custom_instructions, "")

    @patch("app.routers.profiles.get_supabase")
    async def test_update_ai_settings_success(self, mock_get_supabase):
        """正常系: AI設定の更新が成功する"""
        from app.routers.profiles import update_ai_settings

        # モックの設定
        mock_supabase = MagicMock()
        mock_get_supabase.return_value = mock_supabase

        # 更新するAI設定
        new_settings = AISettings(
            tone="english", language="en", custom_instructions="Use technical terms"
        )

        # 更新後のレスポンスモック
        mock_response = MagicMock()
        mock_response.data = [
            {
                "id": self.test_user_id,
                "ai_settings": new_settings.model_dump(),
            }
        ]

        mock_table = MagicMock()
        mock_table.update.return_value.eq.return_value.execute.return_value = (
            mock_response
        )
        mock_supabase.table.return_value = mock_table

        # テスト実行
        result = await update_ai_settings(new_settings, self.mock_user, mock_supabase)

        # 検証
        self.assertEqual(result.ai_settings.tone, "english")
        self.assertEqual(result.ai_settings.language, "en")
        self.assertEqual(result.ai_settings.custom_instructions, "Use technical terms")


if __name__ == "__main__":
    unittest.main()
