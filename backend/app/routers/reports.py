# backend/app/routers/reports.py
from fastapi import APIRouter, Depends, HTTPException
from supabase import Client
from gotrue.types import User

from app.api.deps import get_current_user
from app.db.client import get_supabase
from app.models.report import DailyReportDraft, DailyReportPolished
from app.services.ai_service import AIService

router = APIRouter()


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
        supabase.table("profiles")
        .select("tenant_id")
        .eq("id", current_user.id)
        .single()
        .execute()
    )

    if not profile_res.data:
        raise HTTPException(
            status_code=400, detail="User profile not found. Please contact admin."
        )

    tenant_id = profile_res.data["tenant_id"]  # type: ignore

    # 2. AI変換の実行
    ai_service = AIService()
    polished_result = await ai_service.polish_report(draft.raw_content)

    # 3. DBへ保存
    # DBのカラム名に合わせてデータを整形
    report_data = {
        "user_id": current_user.id,
        "tenant_id": tenant_id,
        "content_raw": draft.raw_content,
        "content_polished": polished_result.content_polished,
        "subject": polished_result.subject,
        "politeness_level": polished_result.politeness_level,
        # created_at はDB側でデフォルト値が入る設定なら不要
    }

    insert_res = supabase.table("daily_reports").insert(report_data).execute()

    if not insert_res.data:
        raise HTTPException(status_code=500, detail="Failed to save report to database")

    return polished_result
