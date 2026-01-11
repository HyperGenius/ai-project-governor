# backend/scripts/seed_data.py
import os
from supabase import create_client, Client  # type: ignore
from supabase_auth.errors import AuthApiError
from dotenv import load_dotenv

load_dotenv()

SUPABASE_URL = os.environ["SUPABASE_URL"]
SUPABASE_KEY = os.environ["SUPABASE_KEY"]

# クライアントの初期化
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)


def seed():
    """Supabaseにシードデータを投入する"""

    TEST_EMAIL = os.getenv("TEST_EMAIL", "test@example.com")
    TEST_PASSWD = os.getenv("TEST_PASSWD", "TestP@ssword1234!")
    TEST_TENANT_NAME = os.getenv("TEST_TENANT_NAME", "Demo Corp")

    print("🌱 シードデータの投入を開始します...")

    print("   1. Userを作成中...")
    user_id = _create_user(TEST_EMAIL, TEST_PASSWD)

    print("   2. Tenantを作成中...")
    tenant_id = _create_tenant(TEST_TENANT_NAME)

    print("   3. Profileを更新して紐付け中...")
    _update_profile(user_id, tenant_id)


def _create_user(email, password, user_id=None) -> str:
    """ユーザーを作成する

    Args:
        email (str): メールアドレス
        password (str): パスワード
        user_id (str, optional): 既存のユーザーID. Defaults to None.

    Returns:
        str: 作成したユーザーID
    """

    try:
        # admin.create_user を使うとメール確認なしで即有効化
        user_response = supabase.auth.admin.create_user(
            {"email": email, "password": password, "email_confirm": True}
        )
        user_id = user_response.user.id
        print(f"   ✅ User作成成功: {user_id}")
        return user_id

    except AuthApiError as e:
        if "already been registered" in str(e).lower():
            print("   ⚠️ ユーザーは既に存在します。既存のIDを取得します。")
            # 既存ユーザーのIDを取得するロジック（今回は簡易的にリストから検索）
            # ※本来はlist_usersでページング等を考慮しますが、ローカル開発用として簡易化
            users = supabase.auth.admin.list_users()
            for u in users:
                if u.email == email:
                    return u.id

        else:
            print(f"   ❌ エラーが発生しました: {e}")
            raise Exception(f"   ❌ エラーが発生しました: {e}")

    raise Exception("User IDが取得できませんでした。中断します。")


def _create_tenant(tenant_name: str) -> str:
    """テナントを作成する

    Args:
        tenant_name (str): テナント名

    Returns:
        str: 作成したテナントID
    """
    # 1. 既に同じ名前のテナントがあるか検索
    existing = supabase.table("tenants").select("id").eq("name", tenant_name).execute()
    # 2. 存在すれば、そのIDを返して終了（重複作成しない）
    if existing.data and len(existing.data) > 0:
        tenant_id = str(existing.data[0]["id"])  # type: ignore
        print(
            f"   ℹ️ Tenant '{tenant_name}' は既に存在します。IDを再利用します: {tenant_id}"
        )
        return tenant_id

    # 3. 存在しなければ、新規作成
    print(f"   🆕 Tenant '{tenant_name}' を新規作成します...")
    tenant_res = supabase.table("tenants").insert({"name": tenant_name}).execute()

    if not tenant_res.data or len(tenant_res.data) == 0:
        print("   ❌ テナント作成に失敗しました。")
        raise Exception("   ❌ テナント作成に失敗しました。")

    tenant_id = str(tenant_res.data[0]["id"])  # type: ignore
    print(f"   ✅ Tenant作成成功: {tenant_id}")

    return tenant_id


def _update_profile(user_id, tenant_id):
    """ユーザーとテナントの紐付けを更新する"""
    print(f"      Target User: {user_id}")
    print(f"      Target Tenant: {tenant_id}")

    profile_res = (
        supabase.table("profiles")
        .upsert({"id": user_id, "tenant_id": tenant_id, "role": "admin"})
        .execute()
    )

    if profile_res.data:
        print(f"   ✅ 紐付け完了: User({user_id}) belongs to Tenant({tenant_id})")
    else:
        # dataが空の場合は、対象レコードが見つからないか、RLS/型エラーの可能性
        print("   ❌ プロフィールの更新に失敗しました。")
        print(f"      Response: {profile_res}")

    print("\n🎉 シードデータの投入が完了しました！")


if __name__ == "__main__":
    seed()
