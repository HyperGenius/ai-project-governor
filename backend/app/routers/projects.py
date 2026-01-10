# backend/app/routers/projects.py
from fastapi import APIRouter, Depends, HTTPException
from supabase import Client
from gotrue.types import User
from typing import List

from app.api.deps import get_current_user
from app.db.client import get_supabase
from app.services.ai_service import AIService
from app.models.project import (
    ProjectCreate,
    ProjectResponse,
    WBSRequest,
    WBSResponse,
)
from app.core.constants import (
    TABLE_PROFILES,
    TABLE_PROJECTS,
    TABLE_TASKS,
    COL_ID,
    COL_TENANT_ID,
)

router = APIRouter()


# --- AIによるWBS生成API (保存はしない) ---
@router.post("/projects/generate-wbs", response_model=WBSResponse)
async def generate_wbs(request: WBSRequest):
    """
    プロジェクト概要を受け取り、AIがタスクリストを提案する
    """
    ai_service = AIService()
    result = await ai_service.generate_wbs(request)
    return result


# --- プロジェクト作成API (確定・保存) ---
@router.post("/projects", response_model=ProjectResponse)
async def create_project(
    project_in: ProjectCreate,
    current_user: User = Depends(get_current_user),
    supabase: Client = Depends(get_supabase),
):
    """
    プロジェクトとタスクを一括でDBに保存する
    """
    # 1. ユーザーのテナントIDを取得
    profile_res = (
        supabase.table(TABLE_PROFILES)
        .select(COL_TENANT_ID)
        .eq(COL_ID, current_user.id)
        .single()
        .execute()
    )
    if not profile_res.data:
        raise HTTPException(status_code=400, detail="User profile not found.")

    tenant_id = profile_res.data[COL_TENANT_ID]  # type: ignore

    # 2. プロジェクト本体の作成
    project_data = {
        "tenant_id": tenant_id,
        "name": project_in.name,
        "description": project_in.description,
        "start_date": (
            project_in.start_date.isoformat() if project_in.start_date else None
        ),
        "end_date": project_in.end_date.isoformat() if project_in.end_date else None,
        "milestones": project_in.milestones,
        "status": "planning",
    }

    proj_res = supabase.table(TABLE_PROJECTS).insert(project_data).execute()
    if not proj_res.data:
        raise HTTPException(status_code=500, detail="Failed to create project.")

    new_project = proj_res.data[0]
    project_id = new_project["id"]  # type: ignore

    # 3. タスクの一括作成
    if project_in.tasks:
        tasks_data = []
        for task in project_in.tasks:
            t_data = task.model_dump()
            t_data["project_id"] = project_id
            t_data["tenant_id"] = tenant_id  # RLS用
            t_data["assigned_to"] = str(task.assigned_to) if task.assigned_to else None
            tasks_data.append(t_data)

        # Bulk Insert
        tasks_res = supabase.table(TABLE_TASKS).insert(tasks_data).execute()
        if not tasks_res.data:
            print("Warning: Failed to save tasks.")

    # 4. レスポンス用に整形（作成されたタスクを含める）
    # 今回は簡略化のため、作成直後のデータを返す形にする
    # 本来は再度JOINして取得するのが確実だが、Supabaseのレスポンスを利用
    new_project["tasks"] = tasks_res.data if project_in.tasks else []  # type: ignore

    return new_project


# --- プロジェクト一覧取得API ---
@router.get("/projects", response_model=List[ProjectResponse])
async def get_projects(
    current_user: User = Depends(get_current_user),
    supabase: Client = Depends(get_supabase),
):
    """
    テナント内のプロジェクト一覧を取得する
    """
    # RLSが効いているので、select("*") だけで自テナントのものだけが返る
    res = (
        supabase.table(TABLE_PROJECTS)
        .select("*, tasks(*)")  # タスクも結合して取得
        .order("created_at", desc=True)
        .execute()
    )
    return res.data
