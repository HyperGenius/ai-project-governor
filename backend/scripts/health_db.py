# backend/scripts/health_db.py
import os
from supabase import create_client, Client  # type: ignore
from supabase_auth.errors import AuthApiError
from dotenv import load_dotenv

load_dotenv()

SUPABASE_URL = os.environ["SUPABASE_URL"]
SUPABASE_KEY = os.environ["SUPABASE_KEY"]

# クライアントの初期化
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)


def health_db():
    """
    DB接続確認
    実際にSupabaseへクエリを投げて応答があるか確認します
    """
    try:
        response = supabase.table("tenants").select("count", count="exact").execute()  # type: ignore

        print(f"DEBUG TYPE: {type(response)}")
        print(f"DEBUG DATA: {response}")

        return {
            "status": "ok",
            "db_response": "connected",
            "tenant_count": len(response.data),
            "sample_data": response.data[0] if response.data else None,
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"DB Connection Error: {str(e)}")


if __name__ == "__main__":
    print(health_db())
