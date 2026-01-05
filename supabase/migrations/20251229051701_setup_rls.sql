-- 20251229051701_setup_rls.sql
-- ヘルパー関数: 現在のユーザーの tenant_id を取得する
-- RLSの中で毎回サブクエリを書かなくて済むようにします
-- SECURITY DEFINER: この関数は「特権」で実行されるため、RLSの無限ループを防げます
create or replace function public.get_my_tenant_id()
returns uuid as $$
  select tenant_id from public.profiles
  where id = auth.uid()
  limit 1;
$$ language sql security definer stable;

-- =============================================
-- 1. Profiles (ユーザー情報) のポリシー
-- =============================================

-- 自分のプロフィールは参照・更新できる
create policy "Users can view own profile"
  on public.profiles for select
  using ( id = auth.uid() );

create policy "Users can update own profile"
  on public.profiles for update
  using ( id = auth.uid() );

-- (将来用) 同じテナントのメンバーのプロフィールも見れるようにする場合
-- create policy "Users can view team members"
--   on public.profiles for select
--   using ( tenant_id = public.get_my_tenant_id() );


-- =============================================
-- 2. Tenants (組織情報) のポリシー
-- =============================================

-- 自分が所属しているテナントの情報だけ見れる
create policy "Users can view own tenant"
  on public.tenants for select
  using ( id = public.get_my_tenant_id() );


-- =============================================
-- 3. Daily Reports (日報) のポリシー
-- =============================================

-- 【参照】 自分の書いた日報だけ見れる
-- ※将来「チームの日報を見る」機能を作る際はここを拡張します
create policy "Users can view own daily reports"
  on public.daily_reports for select
  using ( user_id = auth.uid() );

-- 【作成】 自分のIDかつ自分のテナントIDでなら作成可能
-- 「他人のふり」や「別の組織への書き込み」を防ぎます
create policy "Users can create own daily reports"
  on public.daily_reports for insert
  with check (
    user_id = auth.uid() 
    and tenant_id = public.get_my_tenant_id()
  );

-- 【更新】 自分の日報だけ修正可能
create policy "Users can update own daily reports"
  on public.daily_reports for update
  using ( user_id = auth.uid() );

-- 【削除】 自分の日報だけ削除可能
create policy "Users can delete own daily reports"
  on public.daily_reports for delete
  using ( user_id = auth.uid() );


-- =============================================
-- 4. Weekly Summaries (週報) のポリシー
-- =============================================

-- 週報は「同じテナントのメンバー」なら見れるようにする（共有目的）
create policy "Users can view team weekly summaries"
  on public.weekly_summaries for select
  using ( tenant_id = public.get_my_tenant_id() );
