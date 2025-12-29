-- 1. テナント（組織・チーム）テーブル
-- 将来的に課金管理などもここに紐づきます
create table public.tenants (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. ユーザープロフィールテーブル
-- auth.users (Supabase管理) とビジネスロジックを繋ぐテーブルです
-- ここに tenant_id を持たせることで「誰がどの組織か」を判別します
create table public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  tenant_id uuid references public.tenants(id),
  full_name text,
  role text default 'member', -- 'admin', 'manager', 'member'
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. 日報 (Daily Reports)
-- "content_raw" (箇条書き) と "content_polished" (AI清書) を分けます
create table public.daily_reports (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) not null,
  tenant_id uuid references public.tenants(id) not null, -- RLS高速化のために非正規化して保持
  
  content_raw text not null,      -- 入力：事実の箇条書き
  content_polished text,          -- 出力：AIが生成したJTC構文
  
  report_date date default current_date not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. 週報 (Weekly Summaries)
-- 個人単位のまとめと、チーム単位のまとめの両方に対応できる構造
create table public.weekly_summaries (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid references public.tenants(id) not null,
  user_id uuid references public.profiles(id), -- NULLの場合は「チーム全体の週報」とする
  
  content text not null,          -- AIが要約した週報本文
  week_start_date date not null,
  week_end_date date not null,
  
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 5. RLS (Row Level Security) の有効化
-- これを忘れると全データが公開されてしまうので必須です
alter table public.tenants enable row level security;
alter table public.profiles enable row level security;
alter table public.daily_reports enable row level security;
alter table public.weekly_summaries enable row level security;

-- 6. 自動化トリガー: 新規登録時にプロフィールを作成
-- auth.users にユーザーが追加されたら、自動で public.profiles に行を作る関数
create or replace function public.handle_new_user() 
returns trigger as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
