# backend/app/models/scoping.py
from pydantic import BaseModel, Field

from app.models.project import WBSTask


class ChatMessage(BaseModel):
    """チャットメッセージ"""

    role: str = Field(..., description="メッセージの送信者 (user or assistant)")
    content: str = Field(..., description="メッセージ内容")


class ScopingChatRequest(BaseModel):
    """対話型スコーピングのリクエスト"""

    messages: list[ChatMessage] = Field(
        ..., description="これまでの会話履歴（ユーザーとAIのやり取り）"
    )


class WBSData(BaseModel):
    """対話完了時に生成されるWBSデータ"""

    name: str = Field(..., description="プロジェクト名")
    description: str = Field(..., description="プロジェクト概要")
    start_date: str = Field(..., description="開始日 (YYYY-MM-DD)")
    end_date: str = Field(..., description="終了日 (YYYY-MM-DD)")
    milestones: str = Field(..., description="主要マイルストーン")
    tasks: list[WBSTask] = Field(..., description="タスクリスト")


class ScopingChatResponse(BaseModel):
    """対話型スコーピングのレスポンス"""

    message: str = Field(..., description="AIからの応答メッセージ")
    is_complete: bool = Field(
        ..., description="ヒアリングが完了し、WBS生成可能かどうか"
    )
    wbs_data: WBSData | None = Field(
        None,
        description="ヒアリング完了時に生成されたWBSデータ（タスクリストを含む）",
    )
