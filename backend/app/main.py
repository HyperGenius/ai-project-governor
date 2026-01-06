# backend/apps/main.py
import os
from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from supabase import Client
from app.db.client import get_supabase
from app.models.report import DailyReportDraft, DailyReportPolished
from app.services.ai_service import AIService
from app.routers import reports

app = FastAPI(title="AI Project Governor API")


# 環境変数から許可オリジンを取得（カンマ区切りで複数指定可能に）
# デフォルトでlocalhostを含める
origins = os.getenv("ALLOWED_ORIGINS", "http://localhost:3000").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# レポート関連のルーターを追加
app.include_router(reports.router, prefix="/api/v1", tags=["reports"])


@app.get("/health")
def health_check():
    return {"status": "ok", "service": "ai-project-governor-backend"}


@app.get("/health/db")
def db_health_check(supabase: Client = Depends(get_supabase)):
    """
    DB接続確認
    実際にSupabaseへクエリを投げて応答があるか確認します
    """
    try:
        response = supabase.table("tenants").select("count", count="exact").execute()  # type: ignore

        return {
            "status": "ok",
            "db_response": "connected",
            "count": response.count,
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"DB Connection Error: {str(e)}")


@app.post("/api/preview", response_model=DailyReportPolished)
async def preview_report(draft: DailyReportDraft):
    """
    【AI変換テスト用】
    粗いテキストを受け取り、JTC構文に変換して返します。
    DBへの保存は行いません。
    """
    service = AIService()
    result = await service.polish_report(draft.raw_content)
    return result
