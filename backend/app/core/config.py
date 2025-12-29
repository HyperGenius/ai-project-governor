# backend/app/core/config.py
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """環境変数を設定するためのクラス"""

    # 環境変数 SUPABASE_URL が自動でここにマッピング
    SUPABASE_URL: str
    SUPABASE_KEY: str

    # .env ファイルを読み込む設定
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")


settings = Settings()  # type: ignore
