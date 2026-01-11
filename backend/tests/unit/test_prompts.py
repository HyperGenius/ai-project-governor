# backend/tests/unit/test_prompts.py
import unittest
from app.core.prompts import build_custom_prompt, TONE_PROMPTS


class TestPromptCustomization(unittest.TestCase):
    """プロンプトカスタマイズ機能の単体テスト"""

    def test_build_custom_prompt_professional(self):
        """正常系: professionalトーンでプロンプトが構築される"""
        base_prompt = "基本プロンプト"
        tone = "professional"
        custom_instructions = ""

        result = build_custom_prompt(base_prompt, tone, custom_instructions)

        # 基本プロンプトとトーンプロンプトが含まれていること
        self.assertIn("基本プロンプト", result)
        self.assertIn("プロフェッショナル", result)

    def test_build_custom_prompt_concise(self):
        """正常系: conciseトーンでプロンプトが構築される"""
        base_prompt = "基本プロンプト"
        tone = "concise"
        custom_instructions = ""

        result = build_custom_prompt(base_prompt, tone, custom_instructions)

        # conciseトーンの特徴（箇条書き、だ・である調）が含まれていること
        self.assertIn("箇条書き", result)
        self.assertIn("だ・である", result)

    def test_build_custom_prompt_english(self):
        """正常系: englishトーンでプロンプトが構築される"""
        base_prompt = "基本プロンプト"
        tone = "english"
        custom_instructions = ""

        result = build_custom_prompt(base_prompt, tone, custom_instructions)

        # 英語プロンプトが含まれていること
        self.assertIn("English", result)
        self.assertIn("Professional", result)

    def test_build_custom_prompt_enthusiastic(self):
        """正常系: enthusiasticトーンでプロンプトが構築される"""
        base_prompt = "基本プロンプト"
        tone = "enthusiastic"
        custom_instructions = ""

        result = build_custom_prompt(base_prompt, tone, custom_instructions)

        # 熱血トーンの特徴が含まれていること
        self.assertIn("熱血", result)
        self.assertIn("前向き", result)

    def test_build_custom_prompt_with_custom_instructions(self):
        """正常系: カスタム指示が追加される"""
        base_prompt = "基本プロンプト"
        tone = "professional"
        custom_instructions = "専門用語を使ってください"

        result = build_custom_prompt(base_prompt, tone, custom_instructions)

        # カスタム指示が含まれていること
        self.assertIn("専門用語を使ってください", result)
        self.assertIn("ユーザーからの追加指示", result)

    def test_build_custom_prompt_with_empty_custom_instructions(self):
        """正常系: 空のカスタム指示は追加されない"""
        base_prompt = "基本プロンプト"
        tone = "professional"
        custom_instructions = ""

        result = build_custom_prompt(base_prompt, tone, custom_instructions)

        # カスタム指示セクションが含まれていないこと
        self.assertNotIn("ユーザーからの追加指示", result)

    def test_build_custom_prompt_invalid_tone_uses_default(self):
        """異常系: 無効なトーン指定時はデフォルト（professional）が使われる"""
        base_prompt = "基本プロンプト"
        tone = "invalid_tone"
        custom_instructions = ""

        result = build_custom_prompt(base_prompt, tone, custom_instructions)

        # デフォルト（professional）のトーンが使われること
        self.assertIn("プロフェッショナル", result)

    def test_tone_prompts_exist(self):
        """正常系: すべてのトーンに対応するプロンプトが定義されている"""
        expected_tones = ["professional", "concise", "english", "enthusiastic"]

        for tone in expected_tones:
            self.assertIn(tone, TONE_PROMPTS)
            self.assertIsInstance(TONE_PROMPTS[tone], str)
            self.assertTrue(len(TONE_PROMPTS[tone]) > 0)


if __name__ == "__main__":
    unittest.main()
