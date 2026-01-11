# backend/app/models/project.py
from datetime import date, datetime
from uuid import UUID

from pydantic import BaseModel, Field


# --- AI生成用スキーマ ---
class WBSRequest(BaseModel):
    """AIにWBS生成を依頼する際のリクエスト"""

    name: str
    description: str
    start_date: str
    end_date: str
    milestones: str | None = None


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

    tasks: list[WBSTask]


# --- DB保存・API用スキーマ ---


class TaskCreate(WBSTask):
    """タスク作成用（AI生成結果 + ユーザー調整）"""

    assigned_to: UUID | None = None  # ユーザーがアサインする場合
    start_date: date | None = None
    end_date: date | None = None


class ProjectCreate(BaseModel):
    """プロジェクト作成用（全体保存）"""

    name: str
    description: str | None = None
    start_date: date | None = None
    end_date: date | None = None
    milestones: str | None = None
    # 作成時にタスクも一括で保存する
    tasks: list[TaskCreate]


class TaskResponse(TaskCreate):
    """タスクレスポンス"""

    id: UUID
    project_id: UUID
    status: str
    created_at: datetime
    # start_date, end_dateはTaskCreateから継承


class ProjectResponse(BaseModel):
    """プロジェクトレスポンス"""

    id: UUID
    tenant_id: UUID
    name: str
    description: str | None
    status: str
    start_date: date | None
    end_date: date | None
    milestones: str | None
    created_at: datetime
    # リスト表示などでタスクを含める場合
    tasks: list[TaskResponse] | None = []


class TaskUpdate(BaseModel):
    """タスク更新用スキーマ"""

    title: str | None = None
    description: str | None = None
    status: str | None = None  # 'todo', 'in_progress', 'done'
    assigned_to: UUID | None = None  # 担当者変更用
    start_date: date | None = None
    end_date: date | None = None
