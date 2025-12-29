from google import genai
from google.genai import types
import json
from app.core.config import settings
from app.core.prompts import JTC_DAILY_REPORT_SYSTEM_PROMPT
from app.models.report import DailyReportPolished


class AIService:
    def __init__(self):
        # 新しいクライアントの初期化
        self.client = genai.Client(api_key=settings.GEMINI_API_KEY)

    async def polish_report(self, raw_text: str) -> DailyReportPolished:
        """
        粗いテキストをJTC構文の日報に変換する
        """

        prompt = JTC_DAILY_REPORT_SYSTEM_PROMPT.format(input_text=raw_text)

        try:
            # 非同期でAIの応答を取得
            response = await self.client.aio.models.generate_content(
                model=settings.GEMINI_MODEL,
                contents=prompt,
                config=types.GenerateContentConfig(
                    response_mime_type="application/json",
                    response_schema=DailyReportPolished,
                ),
            )

            # AIの応答をパースして返す
            if response.parsed:
                return response.parsed

            # JSON文字列が返ってきた場合はパースして返す
            result_json = json.loads(response.text)
            return DailyReportPolished(**result_json)

        except Exception as e:
            # エラーが発生した場合は、失敗した日報を返す
            print(f"AI Conversion Error: {e}")
            return DailyReportPolished(
                subject="【報告】業務日報（AI変換失敗）",
                polished_content=f"AI変換中にエラーが発生しました。\n原文: {raw_text}",
                politeness_level=1,
            )
