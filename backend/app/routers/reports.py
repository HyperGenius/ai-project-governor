# backend/app/routers/reports.py
from fastapi import APIRouter, Depends, HTTPException
from supabase import Client
from gotrue.types import User
from typing import List
from uuid import UUID

from app.api.deps import get_current_user
from app.db.client import get_supabase
from app.models.report import (
    DailyReportDraft,
    DailyReportPolished,
    DailyReportResponse,
    DailyReportUpdate,
)
from app.services.ai_service import AIService
from app.core.constants import (
    TABLE_PROFILES,
    TABLE_DAILY_REPORTS,
    TABLE_TASKS,
    TABLE_TASK_WORK_LOGS,
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
    日報を作成し、AI変換を行ってDBに保存する。
    さらに、AIが推論した工数ログも保存する。
    """

    # 1. ユーザーの所属テナントを取得
    profile_res = (
        supabase.table(TABLE_PROFILES)
        .select(COL_TENANT_ID)
        .eq(COL_ID, current_user.id)
        .single()
        .execute()
    )
    if not profile_res.data:
        raise HTTPException(status_code=400, detail="Profile not found")

    tenant_id = profile_res.data[COL_TENANT_ID]  # type: ignore

    # 2. ユーザーのアクティブタスクを取得 (AIへのコンテキスト用)
    # ※ tasks.py で作ったAPIロジックと同等だが、内部呼び出し用に直接クエリする
    tasks_res = (
        supabase.table(TABLE_TASKS)
        .select("id, title")
        .eq("assigned_to", current_user.id)
        .neq("status", "done")
        .execute()
    )
    active_tasks = tasks_res.data or []

    # 3. AI変換の実行 (タスクリストを渡す)
    ai_service = AIService()
    polished_result = await ai_service.generate_report_with_logs(
        draft.raw_content, draft.politeness_level, active_tasks
    )

    # 4. 日報本体のDB保存
    report_data = {
        COL_USER_ID: current_user.id,
        COL_TENANT_ID: tenant_id,
        "content_raw": draft.raw_content,
        "content_polished": polished_result.content_polished,
        "subject": polished_result.subject,
        "politeness_level": draft.politeness_level,
    }
    insert_res = supabase.table(TABLE_DAILY_REPORTS).insert(report_data).execute()

    if not insert_res.data:
        raise HTTPException(status_code=500, detail="Failed to save report")

    new_report_id = insert_res.data[0]["id"]  # type: ignore

    # 5. 工数ログの一括保存
    if polished_result.work_logs:
        logs_data = []
        for log in polished_result.work_logs:
            # AIがハルシネーションで存在しないIDを返す可能性を考慮して
            # active_tasks に含まれるIDかチェックしても良いが、
            # 外部キー制約があるのでDB側でエラーになる。ここではそのままトライする。
            logs_data.append(
                {
                    "tenant_id": tenant_id,
                    "daily_report_id": new_report_id,
                    "task_id": str(log.task_id),
                    "hours": log.hours,
                }
            )

        if logs_data:
            try:
                supabase.table(TABLE_TASK_WORK_LOGS).insert(logs_data).execute()
            except Exception as e:
                print(f"Warning: Failed to save work logs: {e}")
                # ログ保存失敗で日報自体をロールバックするかは要件次第だが、
                # 今回は日報保存を優先し、ログ失敗は無視（または警告）とする

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


# --- 削除API ---
@router.delete("/reports/{report_id}", status_code=204)
async def delete_report(
    report_id: UUID,
    current_user: User = Depends(get_current_user),
    supabase: Client = Depends(get_supabase),
):
    """
    指定されたIDの日報を削除する
    """
    # 1. まず存在確認 & 権限確認
    existing = (
        supabase.table(TABLE_DAILY_REPORTS)
        .select(COL_ID)
        .eq(COL_ID, str(report_id))
        .eq(COL_USER_ID, current_user.id)
        .single()
        .execute()
    )

    if not existing.data:
        # データが見つからない（または他人のデータ）場合はエラー
        raise HTTPException(
            status_code=404, detail="Report not found or permission denied"
        )

    # 2. 削除実行
    supabase.table(TABLE_DAILY_REPORTS).delete().eq(COL_ID, str(report_id)).execute()

    return  # 204 No Content なので中身は返さない


# --- 更新API ---
@router.put("/reports/{report_id}", response_model=DailyReportResponse)
async def update_report(
    report_id: UUID,
    report_update: DailyReportUpdate,
    current_user: User = Depends(get_current_user),
    supabase: Client = Depends(get_supabase),
):
    """
    指定されたIDの日報を更新する
    """
    # 1. 更新するデータを辞書にする（Noneの項目は除外）
    update_data = report_update.model_dump(exclude_unset=True)

    if not update_data:
        raise HTTPException(status_code=400, detail="No fields to update")

    # 2. 自分のデータかつ指定IDのものを更新
    # update() して select() することで更新後のデータを取得して返す
    res = (
        supabase.table(TABLE_DAILY_REPORTS)
        .update(update_data)
        .eq(COL_ID, str(report_id))
        .eq(COL_USER_ID, current_user.id)
        .execute()
    )

    if not res.data:
        raise HTTPException(
            status_code=404, detail="Report not found or permission denied"
        )

    return res.data[0]  # report_idはユニークなのでバリデーション不要
