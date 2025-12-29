# backend/app/models/report.py
from pydantic import BaseModel, Field


class DailyReportDraft(BaseModel):
    """ユーザーが入力する下書き"""

    raw_content: str = Field(
        ...,
        description="箇条書きなどの粗いテキスト",
        example="サーバー落ちた。復旧作業中。",
    )  # type: ignore


class DailyReportPolished(BaseModel):
    """AIが変換した後の完成形"""

    subject: str = Field(..., description="メールや日報の件名")
    polished_content: str = Field(..., description="JTC構文に変換された本文")
    politeness_level: int = Field(..., description="丁寧さレベル(1-5)", ge=1, le=5)
