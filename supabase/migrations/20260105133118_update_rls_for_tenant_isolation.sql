-- 20260105133118_update_rls_for_tenant_isolation.sql
-- 既存のポリシーを削除して再定義（重複エラー防止のため）
drop policy if exists "Users can view own daily reports" on public.daily_reports;
drop policy if exists "Users can create own daily reports" on public.daily_reports;
drop policy if exists "Users can update own daily reports" on public.daily_reports;
drop policy if exists "Users can delete own daily reports" on public.daily_reports;

-- =============================================
-- Daily Reports (日報) のポリシー更新
-- =============================================

-- 【参照】 同じテナントのメンバーの日報は閲覧可能にする（チーム機能のため）
create policy "Users can view team daily reports"
  on public.daily_reports for select
  using (
    tenant_id = public.get_my_tenant_id()
  );

-- 【作成】 自分のテナントに対してのみ作成可能
create policy "Users can create team daily reports"
  on public.daily_reports for insert
  with check (
    auth.uid() = user_id
    and tenant_id = public.get_my_tenant_id()
  );

-- 【更新】 自分の書いた日報のみ修正可能（テナント一致も条件に含める）
create policy "Users can update own daily reports"
  on public.daily_reports for update
  using (
    auth.uid() = user_id
    and tenant_id = public.get_my_tenant_id()
  );

-- 【削除】 自分の書いた日報のみ削除可能
create policy "Users can delete own daily reports"
  on public.daily_reports for delete
  using (
    auth.uid() = user_id
    and tenant_id = public.get_my_tenant_id()
  );