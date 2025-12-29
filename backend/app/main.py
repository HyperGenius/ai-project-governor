# backend/apps/main.py
from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from supabase import Client
from app.db.client import get_supabase
import logging

app = FastAPI(title="AI Project Governor API")

# フロントエンド(React)からのアクセスを許可する設定
# MVP段階では全許可 ("*") 、本番ではフロントのドメインのみに限定
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


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


@app.get("/")
def root():
    return {"message": "Hello from Cloud Run!"}
