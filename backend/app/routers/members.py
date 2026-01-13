# backend/app/routers/members.py
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from gotrue.types import User
from pydantic import BaseModel
from supabase import Client

from app.api.deps import get_current_user
from app.core.constants import COL_ID, COL_TENANT_ID, TABLE_PROFILES
from app.db.client import get_supabase

router = APIRouter()


class MemberResponse(BaseModel):
    id: UUID
    full_name: str | None
    role: str | None


@router.get("/members", response_model=list[MemberResponse])
async def get_tenant_members(
    current_user: User = Depends(get_current_user),
    supabase: Client = Depends(get_supabase),
):
    """
    同じテナントのメンバー一覧を取得する（タスクのアサイン用）
    """
    # 1. 自分のテナントIDを取得
    my_profile = (
        supabase.table(TABLE_PROFILES)
        .select(COL_TENANT_ID)
        .eq(COL_ID, current_user.id)
        .single()
        .execute()
    )

    if not my_profile.data:
        raise HTTPException(status_code=400, detail="Profile not found")

    tenant_id = my_profile.data[COL_TENANT_ID]  # type: ignore

    # 2. 同じテナントIDを持つプロフィールを取得
    # ※ 本来は 'auth.users' と結合したいところですが、MVPなので profiles テーブルのみで完結させます
    members_res = (
        supabase.table(TABLE_PROFILES)
        .select("id, full_name, role")
        .eq(COL_TENANT_ID, tenant_id)
        .execute()
    )

    return members_res.data
