# backend/app/models/report.py
from pydantic import BaseModel, Field
from uuid import UUID
from datetime import datetime, date
from typing import List, Optional


class WorkLogExtraction(BaseModel):
    """AIが推論したタスク別工数"""

    task_id: UUID = Field(..., description="該当するタスクのID")
    hours: float = Field(..., description="推論された作業時間(h)")


class WorkLogResponse(BaseModel):
    """DBから取得した工数ログデータ"""

    id: UUID
    task_id: UUID
    hours: float
    tasks: Optional[dict] = None  # join先のタスク情報を受け取るため


class DailyReportDraft(BaseModel):
    """ユーザーが入力する下書き"""

    raw_content: str = Field(
        ...,
        description="箇条書きなどの粗いテキスト",
        json_schema_extra={"example": "サーバー落ちた。復旧作業中。"},
    )
    politeness_level: int = Field(..., description="丁寧さレベル(1-5)", ge=1, le=5)


class DailyReportPolished(BaseModel):
    """AIが変換した後の完成形"""

    subject: str = Field(
        ...,
        description="メールや日報の件名",
        json_schema_extra={"example": "サーバー落ちた。復旧作業中。"},
    )
    content_polished: str = Field(
        ...,
        description="JTC構文に変換された本文",
        json_schema_extra={"example": "サーバー落ちた。復旧作業中。"},
    )
    politeness_level: int = Field(..., description="丁寧さレベル(1-5)", ge=1, le=5)
    work_logs: List[WorkLogExtraction] = Field(
        default=[], description="タスクごとの工数配分"
    )


class DailyReportResponse(BaseModel):
    """DBから取得した日報データ"""

    id: UUID
    user_id: UUID
    # tenant_id はフロントエンドで表示する必要がなければ省略可

    content_raw: str
    content_polished: Optional[str] = None
    subject: Optional[str] = None
    politeness_level: Optional[int] = 5

    report_date: date
    created_at: datetime

    task_work_logs: List[WorkLogResponse] = []  # 工数ログのリスト


class DailyReportUpdate(BaseModel):
    """更新用のスキーマ"""

    subject: Optional[str] = None
    content_polished: Optional[str] = None
    # 必要なら politeness_level も更新できるようにするが、今回はテキスト修正を主とする
