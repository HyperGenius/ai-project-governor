# backend/scripts/create_project.py
import requests  # type: ignore
import os
import sys
from datetime import date, timedelta

# 親ディレクトリのパスを追加してモジュールをインポート可能にする
sys.path.append(os.path.join(os.path.dirname(__file__), ".."))

# 既存のトークン取得スクリプトを利用
from scripts.get_token import get_auth_token  # type: ignore

BACKEND_URL = os.environ.get("BACKEND_URL", "http://localhost:8000")


def test_api(email: str, password: str):
    # 1. ログインしてトークン取得
    print(f"🔑 ログイン中: {email} ...")
    token = get_auth_token(email, password)

    if not token:
        print("❌ ログイン失敗。テストを中止します。")
        return

    # 2. プロジェクト作成リクエストの準備
    url = f"{BACKEND_URL}/api/v1/projects"
    headers = {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}

    payload = {
        "name": "MVP開発プロジェクト",
        "description": "AI Project GovernorのMVPを爆速で開発する",
        "start_date": str(date.today()),
        "end_date": str(date.today() + timedelta(days=30)),
        "milestones": "要件定義 -> 実装 -> テスト -> リリース",
        "tasks": [
            {
                "title": "DB設計",
                "description": "Supabaseのスキーマ定義",
                "estimated_hours": 3,
                "suggested_role": "Backend",
                "assigned_to": None,
            },
            {
                "title": "API実装",
                "description": "FastAPIのエンドポイント作成",
                "estimated_hours": 5,
                "suggested_role": "Backend",
                "assigned_to": None,
            },
        ],
    }

    # 3. API実行
    print("\n🚀 プロジェクト作成APIをコール中...")
    try:
        response = requests.post(url, headers=headers, json=payload)

        if response.status_code == 200:
            data = response.json()
            print("\n✅ 成功！プロジェクトが作成されました。")
            print("-" * 40)
            print(f"Project ID: {data['id']}")
            print(f"Name: {data['name']}")
            print(f"Tasks Count: {len(data['tasks'])}")
            print("-" * 40)
        else:
            print(f"\n❌ 失敗: Status {response.status_code}")
            print(response.text)

    except Exception as e:
        print(f"\n❌ エラー: {e}")


if __name__ == "__main__":
    test_email = os.environ["TEST_EMAIL"]
    test_password = os.environ["TEST_PASSWD"]
    test_api(test_email, test_password)
