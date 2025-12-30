# backend/scripts/get_token.py
import os
import sys
from dotenv import load_dotenv
from supabase import create_client, Client

# スクリプトディレクトリの .env を読み込む
load_dotenv()

SUPABASE_URL = os.environ.get("SUPABASE_URL")
SUPABASE_KEY = os.environ.get("SUPABASE_KEY")


def get_auth_token(email: str, password: str) -> str | None:
    """テストユーザーでログインしてアクセストークンを取得する"""

    if not SUPABASE_URL or not SUPABASE_KEY:
        print("❌ Error: .env file not found or SUPABASE_URL/KEY is missing.")
        sys.exit(1)

    print(f"🔑 Logging in as {email} ...")

    supa_client = create_client(SUPABASE_URL, SUPABASE_KEY)

    try:
        # メール/パスワードでサインイン
        response = supa_client.auth.sign_in_with_password(
            {"email": email, "password": password}
        )

        if not response.session:
            raise Exception("Failed to get session")

        token = response.session.access_token

        print("\n✅ Authentication Successful!")
        print("-" * 60)
        print("Authorization Header Value (Copy this for Swagger UI):")
        print(f"Bearer {token}")
        print("-" * 60)

        return token

    except Exception as e:
        print(f"\n❌ Login Failed: {e}")
        print("ヒント: seed_data.py は実行済みですか？")
        return None


if __name__ == "__main__":
    test_email = os.environ["TEST_EMAIL"]
    test_password = os.environ["TEST_PASSWD"]
    get_auth_token(test_email, test_password)
