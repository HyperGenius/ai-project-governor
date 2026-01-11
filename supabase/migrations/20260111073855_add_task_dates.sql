-- 20260111073855_add_task_dates.sql

-- =============================================
-- Add Date Columns to Tasks Table
-- =============================================
-- ガントチャート表示のために、タスク個別の期間を管理できるようにします

alter table public.tasks
add column start_date date,
add column end_date date;

comment on column public.tasks.start_date is 'タスク開始日';
comment on column public.tasks.end_date is 'タスク終了日';
