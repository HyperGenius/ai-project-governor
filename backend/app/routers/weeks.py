# backend/app/routers/weeks.py
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from gotrue.types import User
from supabase import Client

from app.api.deps import get_current_user
from app.core.constants import (
    COL_CREATED_AT,
    COL_ID,
    COL_TENANT_ID,
    COL_USER_ID,
    TABLE_DAILY_REPORTS,
    TABLE_PROFILES,
    TABLE_WEEKLY_SUMMARIES,
)
from app.db.client import get_supabase
from app.models.week import (
    WeekGenerateRequest,
    WeekGenerateResponse,
    WeeklyReportCreate,
    WeeklyReportResponse,
)
from app.services.ai_service import AIService

router = APIRouter()


@router.post("/weeks/generate", response_model=WeekGenerateResponse)
async def generate_weekly_report_preview(
    request: WeekGenerateRequest,
    current_user: User = Depends(get_current_user),
    supabase: Client = Depends(get_supabase),
):
    """
    指定期間の日報を集計し、AIで週報を生成する（保存はしない）
    """
    # 1. 指定期間の日報を取得（工数ログも結合）
    res = (
        supabase.table(TABLE_DAILY_REPORTS)
        .select("*, task_work_logs(*, tasks(title))")
        .eq(COL_USER_ID, current_user.id)
        .gte("report_date", request.start_date.isoformat())
        .lte("report_date", request.end_date.isoformat())
        .order("report_date", desc=False)  # 日付順
        .execute()
    )

    daily_reports = res.data

    # 2. AI生成
    ai_service = AIService()
    generated_text = await ai_service.generate_weekly_summary(daily_reports)

    return WeekGenerateResponse(content_generated=generated_text)


@router.post("/weeks", response_model=WeeklyReportResponse)
async def create_weekly_report(
    report_in: WeeklyReportCreate,
    current_user: User = Depends(get_current_user),
    supabase: Client = Depends(get_supabase),
):
    """
    生成された週報を確定して保存する
    """
    # テナントID取得
    profile = (
        supabase.table(TABLE_PROFILES)
        .select(COL_TENANT_ID)
        .eq(COL_ID, current_user.id)
        .single()
        .execute()
    )
    tenant_id = profile.data[COL_TENANT_ID]  # type: ignore

    data = {
        "tenant_id": tenant_id,
        "user_id": current_user.id,
        "content": report_in.content,
        "week_start_date": report_in.week_start_date.isoformat(),
        "week_end_date": report_in.week_end_date.isoformat(),
    }

    res = supabase.table(TABLE_WEEKLY_SUMMARIES).insert(data).execute()

    if not res.data:
        raise HTTPException(status_code=500, detail="Failed to save weekly report")

    return res.data[0]


@router.get("/weeks", response_model=list[WeeklyReportResponse])
async def get_weekly_reports(
    current_user: User = Depends(get_current_user),
    supabase: Client = Depends(get_supabase),
):
    """
    自分の週報一覧を取得
    """
    res = (
        supabase.table(TABLE_WEEKLY_SUMMARIES)
        .select("*")
        .eq(COL_USER_ID, current_user.id)
        .order(COL_CREATED_AT, desc=True)
        .execute()
    )
    return res.data


@router.get("/weeks/{report_id}", response_model=WeeklyReportResponse)
async def get_weekly_report_detail(
    report_id: UUID,
    current_user: User = Depends(get_current_user),
    supabase: Client = Depends(get_supabase),
):
    """
    週報詳細を取得
    """
    res = (
        supabase.table(TABLE_WEEKLY_SUMMARIES)
        .select("*")
        .eq("id", str(report_id))
        .single()
        .execute()
    )

    if not res.data:
        raise HTTPException(status_code=404, detail="Report not found")

    return res.data
