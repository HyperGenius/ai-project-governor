from fastapi.testclient import TestClient
from unittest.mock import MagicMock
from app.main import app  # type: ignore
from app.db.client import get_supabase  # type: ignore

client = TestClient(app)


def test_root():
    """
    ルートパス ("/") へのGETリクエストをテストします。
    """
    response = client.get("/")
    assert response.status_code == 200
    assert response.json() == {"message": "Hello from Cloud Run!"}


def test_db_health_check_success():
    """
    DB接続確認 ("/health/db") の成功パターンをテストします。
    """
    # Supabaseクライアントのモック作成
    mock_supabase = MagicMock()

    # レスポンスのモック作成
    # main.py の実装: response.data.count にアクセスしているため、それに合わせる
    mock_response = MagicMock()
    mock_response.data.count = 42

    # チェーンメソッドのモック: table().select().execute() が mock_response を返すように設定
    mock_supabase.table.return_value.select.return_value.execute.return_value = (
        mock_response
    )

    # 依存関係のオーバーライド
    app.dependency_overrides[get_supabase] = lambda: mock_supabase

    response = client.get("/health/db")

    # 検証
    assert response.status_code == 200
    expected_response = {
        "status": "ok",
        "db_response": "connected",
        "count": 42,
    }
    assert response.json() == expected_response

    # クリーンアップ
    app.dependency_overrides = {}


def test_db_health_check_failure():
    """
    DB接続確認 ("/health/db") の失敗（例外発生）パターンをテストします。
    """
    # Supabaseクライアントのモック作成 (例外を発生させる)
    mock_supabase = MagicMock()
    mock_supabase.table.side_effect = Exception("Connection refused")

    # 依存関係のオーバーライド
    app.dependency_overrides[get_supabase] = lambda: mock_supabase

    response = client.get("/health/db")

    # 検証
    assert response.status_code == 500
    assert "DB Connection Error" in response.json()["detail"]
    assert "Connection refused" in response.json()["detail"]

    # クリーンアップ
    app.dependency_overrides = {}
