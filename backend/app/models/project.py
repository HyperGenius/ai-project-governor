# backend/app/models/project.py
from pydantic import BaseModel, Field
from typing import List, Optional
from uuid import UUID
from datetime import date, datetime


# --- AI生成用スキーマ ---
class WBSRequest(BaseModel):
    """AIにWBS生成を依頼する際のリクエスト"""

    name: str
    description: str
    start_date: str
    end_date: str
    milestones: Optional[str] = None


class WBSTask(BaseModel):
    """AIが生成するタスク単体の構造"""

    title: str = Field(..., description="タスク名")
    description: str = Field(..., description="タスクの詳細内容")
    estimated_hours: int = Field(..., description="想定工数(時間)")
    suggested_role: str = Field(
        ..., description="推奨される役割 (例: Frontend, Backend)"
    )


class WBSResponse(BaseModel):
    """AIからの応答構造"""

    tasks: List[WBSTask]


# --- DB保存・API用スキーマ ---


class TaskCreate(WBSTask):
    """タスク作成用（AI生成結果 + ユーザー調整）"""

    assigned_to: Optional[UUID] = None  # ユーザーがアサインする場合


class ProjectCreate(BaseModel):
    """プロジェクト作成用（全体保存）"""

    name: str
    description: Optional[str] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    milestones: Optional[str] = None
    # 作成時にタスクも一括で保存する
    tasks: List[TaskCreate]


class TaskResponse(TaskCreate):
    """タスクレスポンス"""

    id: UUID
    project_id: UUID
    status: str
    created_at: datetime


class ProjectResponse(BaseModel):
    """プロジェクトレスポンス"""

    id: UUID
    tenant_id: UUID
    name: str
    description: Optional[str]
    status: str
    start_date: Optional[date]
    end_date: Optional[date]
    milestones: Optional[str]
    created_at: datetime
    # リスト表示などでタスクを含める場合
    tasks: Optional[List[TaskResponse]] = []


class TaskUpdate(BaseModel):
    """タスク更新用スキーマ"""

    title: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = None  # 'todo', 'in_progress', 'done'
    assigned_to: Optional[UUID] = None  # 担当者変更用
