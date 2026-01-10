# backend/app/routers/tasks.py
from fastapi import APIRouter, Depends, HTTPException
from supabase import Client
from gotrue.types import User
from uuid import UUID

from app.api.deps import get_current_user
from app.db.client import get_supabase
from app.models.project import TaskUpdate, TaskResponse
from app.core.constants import TABLE_TASKS, COL_ID

router = APIRouter()


@router.patch("/tasks/{task_id}", response_model=TaskResponse)
async def update_task(
    task_id: UUID,
    task_update: TaskUpdate,
    current_user: User = Depends(get_current_user),
    supabase: Client = Depends(get_supabase),
):
    """
    タスクのステータスや担当者を更新する
    """
    # 更新データを辞書化（Noneは除外）
    update_data = task_update.model_dump(exclude_unset=True)

    if not update_data:
        raise HTTPException(status_code=400, detail="No fields to update")

    # UUIDを文字列に変換（Supabase用）
    if "assigned_to" in update_data and update_data["assigned_to"]:
        update_data["assigned_to"] = str(update_data["assigned_to"])

    # 更新実行, RLSにより自テナントのタスクしか更新できない
    res = (
        supabase.table(TABLE_TASKS)
        .update(update_data)
        .eq(COL_ID, str(task_id))
        .execute()
    )

    if not res.data:
        raise HTTPException(
            status_code=404, detail="Task not found or permission denied"
        )

    return res.data[0]
