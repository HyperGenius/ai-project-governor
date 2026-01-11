# backend/app/models/week.py
from pydantic import BaseModel, Field
from uuid import UUID
from datetime import date, datetime
from typing import Optional


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
    user_id: Optional[UUID]
    content: str
    week_start_date: date
    week_end_date: date
    created_at: datetime
