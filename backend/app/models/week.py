# backend/app/models/week.py
from datetime import date, datetime
from uuid import UUID

from pydantic import BaseModel


class WeekGenerateRequest(BaseModel):
    """週報生成のリクエスト"""

    start_date: date
    end_date: date


class WeekGenerateResponse(BaseModel):
    """AI生成結果（プレビュー用）"""

    content_generated: str


class WeeklyReportCreate(BaseModel):
    """DB保存用"""

    content: str
    week_start_date: date
    week_end_date: date


class WeeklyReportResponse(BaseModel):
    """レスポンス用"""

    id: UUID
    tenant_id: UUID
    user_id: UUID | None
    content: str
    week_start_date: date
    week_end_date: date
    created_at: datetime
