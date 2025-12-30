# backend/app/routers/reports.py
from fastapi import APIRouter, Depends, HTTPException
from supabase import Client
from gotrue.types import User
from typing import List
from uuid import UUID

from app.api.deps import get_current_user
from app.db.client import get_supabase
from app.models.report import DailyReportDraft, DailyReportPolished, DailyReportResponse
from app.services.ai_service import AIService
from app.core.constants import (
    TABLE_PROFILES,
    TABLE_DAILY_REPORTS,
    COL_ID,
    COL_USER_ID,
    COL_TENANT_ID,
    COL_CREATED_AT,
)

router = APIRouter()


# --- 作成API ---
@router.post("/reports", response_model=DailyReportPolished)
async def create_report(
    draft: DailyReportDraft,
    current_user: User = Depends(get_current_user),
    supabase: Client = Depends(get_supabase),
):
    """
    日報を作成し、AI変換を行ってDBに保存する
    """

    # 1. ユーザーの所属テナントを取得 (Profilesテーブル参照)
    profile_res = (
        supabase.table(TABLE_PROFILES)
        .select(COL_TENANT_ID)
        .eq(COL_ID, current_user.id)
        .single()
        .execute()
    )

    if not profile_res.data:
        raise HTTPException(
            status_code=400, detail="User profile not found. Please contact admin."
        )

    tenant_id = profile_res.data[COL_TENANT_ID]  # type: ignore

    # 2. AI変換の実行
    ai_service = AIService()
    polished_result = await ai_service.polish_report(draft.raw_content)

    # 3. DBへ保存
    # DBのカラム名に合わせてデータを整形
    report_data = {
        COL_USER_ID: current_user.id,
        COL_TENANT_ID: tenant_id,
        "content_raw": draft.raw_content,
        "content_polished": polished_result.content_polished,
        "subject": polished_result.subject,
        "politeness_level": polished_result.politeness_level,
        # created_at はDB側でデフォルト値が入る設定なら不要
    }

    insert_res = supabase.table(TABLE_DAILY_REPORTS).insert(report_data).execute()

    if not insert_res.data:
        raise HTTPException(status_code=500, detail="Failed to save report to database")

    return polished_result


# --- 一覧取得API ---
@router.get("/reports", response_model=List[DailyReportResponse])
async def get_reports(
    current_user: User = Depends(get_current_user),
    supabase: Client = Depends(get_supabase),
):
    """
    ログインユーザーの日報一覧を取得する
    """
    # 自分のIDでフィルタリングし、作成日の新しい順に取得
    res = (
        supabase.table(TABLE_DAILY_REPORTS)
        .select("*")
        .eq(COL_USER_ID, current_user.id)
        .order(COL_CREATED_AT, desc=True)
        .execute()
    )

    return res.data


# --- 詳細取得API ---
@router.get("/reports/{report_id}", response_model=DailyReportResponse)
async def get_report_detail(
    report_id: UUID,
    current_user: User = Depends(get_current_user),
    supabase: Client = Depends(get_supabase),
):
    """
    指定されたIDの日報詳細を取得する
    （他人の日報は見れないようにガード）
    """
    # ID指定かつ、自分のuser_idにマッチするものだけを取得
    res = (
        supabase.table(TABLE_DAILY_REPORTS)
        .select("*")
        .eq(COL_ID, str(report_id))
        .eq(COL_USER_ID, current_user.id)
        .single()
        .execute()
    )

    # データが見つからない（または他人のデータ）場合はエラー
    if not res.data:
        raise HTTPException(status_code=404, detail="Report not found")

    return res.data
