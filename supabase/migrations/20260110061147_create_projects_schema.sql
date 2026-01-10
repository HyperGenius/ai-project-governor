-- 20260110061147_create_projects_schema.sql

-- =============================================
-- 1. Projects Table (プロジェクト管理)
-- =============================================
create table public.projects (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid references public.tenants(id) not null,
  
  name text not null,             -- プロジェクト名
  description text,               -- プロジェクトの目的・Mission
  status text default 'planning' not null, -- planning, active, completed, on_hold
  
  start_date date,                -- 開始日
  end_date date,                  -- 終了日
  milestones text,                -- マイルストーン（フリーテキスト）
  
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- =============================================
-- 2. Tasks Table (タスク・WBS)
-- =============================================
create table public.tasks (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references public.projects(id) on delete cascade not null,
  tenant_id uuid references public.tenants(id) not null, -- RLS高速化のための非正規化
  
  title text not null,            -- タスク名
  description text,               -- 詳細内容
  status text default 'todo' not null, -- todo, in_progress, done
  
  estimated_hours integer,        -- 想定工数(h)
  suggested_role text,            -- AIが提案した役割 (例: "Frontend Engineer")
  
  assigned_to uuid references public.profiles(id), -- 担当者（人間が設定、NULL可）
  
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- =============================================
-- 3. Enable RLS (Row Level Security)
-- =============================================
alter table public.projects enable row level security;
alter table public.tasks enable row level security;

-- =============================================
-- 4. RLS Policies
-- =============================================

-- --- Projects Policies ---

-- 【参照】 同じテナントのプロジェクトは閲覧可能
create policy "Users can view team projects"
  on public.projects for select
  using ( tenant_id = public.get_my_tenant_id() );

-- 【作成】 自テナント内であれば作成可能
create policy "Users can create team projects"
  on public.projects for insert
  with check ( tenant_id = public.get_my_tenant_id() );

-- 【更新】 自テナントのプロジェクトは更新可能
create policy "Users can update team projects"
  on public.projects for update
  using ( tenant_id = public.get_my_tenant_id() );

-- 【削除】 自テナントのプロジェクトは削除可能
create policy "Users can delete team projects"
  on public.projects for delete
  using ( tenant_id = public.get_my_tenant_id() );


-- --- Tasks Policies ---

-- 【参照】 同じテナントのタスクは閲覧可能
create policy "Users can view team tasks"
  on public.tasks for select
  using ( tenant_id = public.get_my_tenant_id() );

-- 【作成】 自テナント内であれば作成可能
create policy "Users can create team tasks"
  on public.tasks for insert
  with check ( tenant_id = public.get_my_tenant_id() );

-- 【更新】 自テナントのタスクは更新可能
create policy "Users can update team tasks"
  on public.tasks for update
  using ( tenant_id = public.get_my_tenant_id() );

-- 【削除】 自テナントのタスクは削除可能
create policy "Users can delete team tasks"
  on public.tasks for delete
  using ( tenant_id = public.get_my_tenant_id() );