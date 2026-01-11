# backend/app/routers/profiles.py

from typing import Literal

from fastapi import APIRouter, Depends, HTTPException
from gotrue.types import User
from pydantic import BaseModel
from supabase import Client

from app.api.deps import get_current_user
from app.core.constants import COL_ID, TABLE_PROFILES
from app.db.client import get_supabase

router = APIRouter()

# トーン設定の型定義
ToneType = Literal["professional", "concise", "english", "enthusiastic"]
LanguageType = Literal["ja", "en"]


class AISettings(BaseModel):
    """AI設定のスキーマ"""

    tone: ToneType = "professional"
    language: LanguageType = "ja"
    custom_instructions: str = ""


class AISettingsResponse(BaseModel):
    """AI設定のレスポンス"""

    ai_settings: AISettings


@router.get("/profiles/ai-settings", response_model=AISettingsResponse)
async def get_ai_settings(
    current_user: User = Depends(get_current_user),
    supabase: Client = Depends(get_supabase),
):
    """
    現在のユーザーのAI設定を取得する
    """
    profile_res = (
        supabase.table(TABLE_PROFILES)
        .select("ai_settings")
        .eq(COL_ID, current_user.id)
        .single()
        .execute()
    )

    if not profile_res.data:
        raise HTTPException(status_code=404, detail="Profile not found")

    ai_settings_data = profile_res.data.get("ai_settings") or {
        "tone": "professional",
        "language": "ja",
        "custom_instructions": "",
    }

    return AISettingsResponse(ai_settings=AISettings(**ai_settings_data))


@router.put("/profiles/ai-settings", response_model=AISettingsResponse)
async def update_ai_settings(
    settings: AISettings,
    current_user: User = Depends(get_current_user),
    supabase: Client = Depends(get_supabase),
):
    """
    現在のユーザーのAI設定を更新する
    """
    # 設定をJSONBとして保存
    update_data = {"ai_settings": settings.model_dump()}

    res = (
        supabase.table(TABLE_PROFILES)
        .update(update_data)
        .eq(COL_ID, current_user.id)
        .execute()
    )

    if not res.data:
        raise HTTPException(
            status_code=404, detail="Profile not found or update failed"
        )

    return AISettingsResponse(ai_settings=settings)
