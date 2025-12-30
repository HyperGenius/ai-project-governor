# backend/app/api/deps.py
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from supabase import Client
from supabase_auth.types import User

from app.db.client import get_supabase

# Bearerトークン（"Bearer eyJ..."）をヘッダーから取得するクラス
security = HTTPBearer()


def get_current_user(
    auth: HTTPAuthorizationCredentials = Depends(security),
    supabase: Client = Depends(get_supabase),
) -> User:
    """
    リクエストヘッダーのJWTトークンを検証し、Supabase上のユーザー情報を返す。
    無効なトークンの場合は401エラーを発生させる。
    """
    token = auth.credentials

    try:
        # Supabaseに問い合わせてトークンを検証 & ユーザー取得
        user_response = supabase.auth.get_user(token)

        if not user_response or not user_response.user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid authentication credentials",
                headers={"WWW-Authenticate": "Bearer"},
            )

        return user_response.user

    except Exception as e:
        # トークン期限切れや不正な形式の場合など
        print(f"Auth Error: {e}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
