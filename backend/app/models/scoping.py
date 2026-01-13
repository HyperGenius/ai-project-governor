# backend/app/models/scoping.py
from pydantic import BaseModel, Field


class ChatMessage(BaseModel):
    """チャットメッセージ"""

    role: str = Field(..., description="メッセージの送信者 (user or assistant)")
    content: str = Field(..., description="メッセージ内容")


class ScopingChatRequest(BaseModel):
    """対話型スコーピングのリクエスト"""

    messages: list[ChatMessage] = Field(
        ..., description="これまでの会話履歴（ユーザーとAIのやり取り）"
    )


class ScopingChatResponse(BaseModel):
    """対話型スコーピングのレスポンス"""

    message: str = Field(..., description="AIからの応答メッセージ")
    is_complete: bool = Field(
        ..., description="ヒアリングが完了し、WBS生成可能かどうか"
    )
    wbs_data: dict | None = Field(
        None,
        description="ヒアリング完了時に生成されたWBSデータ（タスクリストを含む）",
    )
