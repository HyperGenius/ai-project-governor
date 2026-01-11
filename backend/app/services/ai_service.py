from google import genai
from google.genai import types
import json
from app.core.config import settings
from app.core.prompts import (
    JTC_DAILY_REPORT_SYSTEM_PROMPT,
    PROMPTS_WITH_LEVEL_DESCRIPTION,
    WBS_GENERATION_SYSTEM_PROMPT,
    DAILY_REPORT_WITH_LOGS_PROMPT,
)
from app.models.report import DailyReportPolished
from app.models.project import WBSRequest, WBSResponse


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
            # TODO: printをloggerに変更する
            print(f"AI Conversion Error: {e}")
            return DailyReportPolished(
                subject="【報告】業務日報（AI変換失敗）",
                content_polished=f"AI変換中にエラーが発生しました。\n原文: {raw_text}",
                politeness_level=1,
            )

    async def generate_polished_report(
        self, content_raw: str, level: int = 3
    ) -> DailyReportPolished:
        """
        Gemini APIを使用して、箇条書きメモから丁寧な日報を生成する
        Args:
            content_raw (str): 粗いテキスト
            level (int, optional): 丁寧度レベル (1-5). Defaults to 3.
        Returns:
            DailyReportPolished: 生成された日報オブジェクト
        """

        # 指定されたレベルのプロンプトを取得（存在しない場合はLv3をデフォルトに）
        prompt = PROMPTS_WITH_LEVEL_DESCRIPTION.get(
            level, PROMPTS_WITH_LEVEL_DESCRIPTION[3]
        )

        # 入力テキストとプロンプトを組み合わせる
        content = prompt + "\n\n### 入力テキスト\n" + content_raw

        try:
            # 非同期でAIの応答を取得
            response = await self.client.aio.models.generate_content(
                model=settings.GEMINI_MODEL,
                contents=content,
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
            # politeness_level を明示的に設定する
            result_json["politeness_level"] = level

            return DailyReportPolished(**result_json)

        except Exception as e:
            # エラーが発生した場合は、失敗した日報を返す
            print(f"AI Conversion Error: {e}")
            return DailyReportPolished(
                subject="【報告】業務日報（AI変換失敗）",
                content_polished=f"AI変換中にエラーが発生しました。\n原文: {content_raw}",
                politeness_level=1,
            )

    async def generate_wbs(self, request: WBSRequest) -> WBSResponse:
        """
        プロジェクト情報を元にWBS（タスクリスト）を生成する
        """
        # 入力テキストの整形
        input_text = f"""
        プロジェクト名: {request.name}
        概要: {request.description}
        期間: {request.start_date} 〜 {request.end_date}
        マイルストーン: {request.milestones or '特になし'}
        """

        prompt = WBS_GENERATION_SYSTEM_PROMPT.format(input_text=input_text)

        try:
            response = await self.client.aio.models.generate_content(
                model=settings.GEMINI_MODEL,
                contents=prompt,
                config=types.GenerateContentConfig(
                    response_mime_type="application/json",
                    response_schema=WBSResponse,
                ),
            )

            if response.parsed:
                return response.parsed

            result_json = json.loads(response.text)
            return WBSResponse(**result_json)

        except Exception as e:
            # TODO: printをloggerに変更する
            print(f"AI WBS Generation Error: {e}")
            # エラー時は空のリストを返すなど、安全側に倒す
            return WBSResponse(tasks=[])

    async def generate_report_with_logs(
        self, content_raw: str, politeness_level: int, active_tasks: list
    ) -> DailyReportPolished:
        """
        日報の清書と同時に、タスク実績の抽出を行う
        """
        # タスクリストをテキスト形式に整形
        if not active_tasks:
            task_list_text = "（現在アクティブな担当タスクはありません）"
        else:
            task_list_text = "\n".join(
                [f"- ID: {t['id']} | タスク名: {t['title']}" for t in active_tasks]
            )

        # プロンプトの構築
        prompt = PROMPTS_WITH_LEVEL_DESCRIPTION.get(politeness_level, "")

        # 工数抽出機能付きのシステムプロンプトを追加
        prompt += DAILY_REPORT_WITH_LOGS_PROMPT.format(
            input_text=content_raw, task_list=task_list_text
        )

        try:
            response = await self.client.aio.models.generate_content(
                model=settings.GEMINI_MODEL,
                contents=prompt,
                config=types.GenerateContentConfig(
                    response_mime_type="application/json",
                    response_schema=DailyReportPolished,
                ),
            )

            if response.parsed:
                return response.parsed

            result_json = json.loads(response.text)
            return DailyReportPolished(**result_json)

        except Exception as e:
            print(f"AI Conversion Error: {e}")
            # エラー時は空のログを返す
            return DailyReportPolished(
                subject="【報告】業務日報（AI変換失敗）",
                content_polished=f"エラーが発生しました。\n{content_raw}",
                politeness_level=1,
                work_logs=[],
            )
