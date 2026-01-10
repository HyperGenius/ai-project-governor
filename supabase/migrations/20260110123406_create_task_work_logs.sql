-- 20260110123406_create_task_work_logs.sql

-- =============================================
-- Task Work Logs Table (工数実績ログ)
-- =============================================
-- 日報(daily_reports) と タスク(tasks) の中間テーブルです。
-- AIが抽出した「このタスクに2時間」といった実績データを記録します。

create table public.task_work_logs (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid references public.tenants(id) not null, -- RLS用
  
  daily_report_id uuid references public.daily_reports(id) on delete cascade not null,
  task_id uuid references public.tasks(id) on delete cascade not null,
  
  hours numeric(4, 2) not null, -- 作業時間 (例: 1.5, 0.25)
  
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- コメント付与
comment on table public.task_work_logs is '日報ごとのタスク別作業時間ログ';
comment on column public.task_work_logs.hours is '作業時間(h)';

-- =============================================
-- Enable RLS
-- =============================================
alter table public.task_work_logs enable row level security;

-- =============================================
-- RLS Policies
-- =============================================

-- 【参照】 同じテナントのログは閲覧可能（集計などで他人のデータも必要になるため）
create policy "Users can view team work logs"
  on public.task_work_logs for select
  using ( tenant_id = public.get_my_tenant_id() );

-- 【作成】 自テナント内であれば作成可能
create policy "Users can create team work logs"
  on public.task_work_logs for insert
  with check ( tenant_id = public.get_my_tenant_id() );

-- 【更新】 自テナントのログは更新可能
create policy "Users can update team work logs"
  on public.task_work_logs for update
  using ( tenant_id = public.get_my_tenant_id() );

-- 【削除】 自テナントのログは削除可能
create policy "Users can delete team work logs"
  on public.task_work_logs for delete
  using ( tenant_id = public.get_my_tenant_id() );