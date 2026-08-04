-- Mylife — initial schema
-- Mirrors src/data/types.ts 1:1 (snake_case here, camelCase there).
-- Every table is user-scoped via RLS (user_id = auth.uid()); nothing here
-- is deployed yet (Phase 0 ships mock data only) — this is the target
-- schema for Phase 1 (see ARCHITECTURE.md).

create extension if not exists "pgcrypto";

create type area_key as enum ('ausbildung', 'psyche', 'geld', 'fuehrerschein');
create type goal_status as enum ('active', 'done', 'paused');
create type priority_level as enum ('low', 'medium', 'high');
create type application_status as enum ('entwurf', 'gesendet', 'gespraech', 'zusage', 'absage');
create type chat_role as enum ('user', 'assistant');

-- Shared trigger to keep updated_at current on every mutation.
create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- ---------------------------------------------------------------------------
-- profiles
-- ---------------------------------------------------------------------------
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  first_name text not null,
  onboarding_completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table profiles enable row level security;

create policy "profiles: owner read" on profiles for select using (id = auth.uid());
create policy "profiles: owner update" on profiles for update using (id = auth.uid());
create policy "profiles: owner insert" on profiles for insert with check (id = auth.uid());

create trigger profiles_set_updated_at before update on profiles
  for each row execute function set_updated_at();

-- ---------------------------------------------------------------------------
-- goals
-- ---------------------------------------------------------------------------
create table goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  area_key area_key not null,
  parent_goal_id uuid references goals(id) on delete cascade,
  title text not null,
  description text,
  status goal_status not null default 'active',
  priority priority_level not null default 'medium',
  progress smallint not null default 0 check (progress between 0 and 100),
  deadline date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index goals_user_id_idx on goals(user_id);
create index goals_area_key_idx on goals(user_id, area_key);
create index goals_parent_goal_id_idx on goals(parent_goal_id);

alter table goals enable row level security;

create policy "goals: owner all" on goals for all
  using (user_id = auth.uid()) with check (user_id = auth.uid());

create trigger goals_set_updated_at before update on goals
  for each row execute function set_updated_at();

-- ---------------------------------------------------------------------------
-- tasks
-- ---------------------------------------------------------------------------
create table tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  goal_id uuid references goals(id) on delete set null,
  area_key area_key not null,
  title text not null,
  done boolean not null default false,
  due_date date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index tasks_user_id_idx on tasks(user_id);
create index tasks_due_date_idx on tasks(user_id, due_date);
create index tasks_goal_id_idx on tasks(goal_id);

alter table tasks enable row level security;

create policy "tasks: owner all" on tasks for all
  using (user_id = auth.uid()) with check (user_id = auth.uid());

create trigger tasks_set_updated_at before update on tasks
  for each row execute function set_updated_at();

-- ---------------------------------------------------------------------------
-- appointments
-- ---------------------------------------------------------------------------
create table appointments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  area_key area_key,
  title text not null,
  starts_at timestamptz not null,
  created_at timestamptz not null default now()
);

create index appointments_user_id_idx on appointments(user_id, starts_at);

alter table appointments enable row level security;

create policy "appointments: owner all" on appointments for all
  using (user_id = auth.uid()) with check (user_id = auth.uid());

-- ---------------------------------------------------------------------------
-- applications (Ausbildung)
-- ---------------------------------------------------------------------------
create table applications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  company text not null,
  role text not null,
  status application_status not null default 'entwurf',
  applied_at date,
  next_step text,
  next_step_date date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index applications_user_id_idx on applications(user_id);

alter table applications enable row level security;

create policy "applications: owner all" on applications for all
  using (user_id = auth.uid()) with check (user_id = auth.uid());

create trigger applications_set_updated_at before update on applications
  for each row execute function set_updated_at();

-- ---------------------------------------------------------------------------
-- mood_logs (Psyche) — one row per user per day
-- ---------------------------------------------------------------------------
create table mood_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  log_date date not null default current_date,
  mood smallint not null check (mood between 1 and 5),
  energy smallint not null check (energy between 1 and 5),
  motivation smallint not null check (motivation between 1 and 5),
  stress smallint not null check (stress between 1 and 5),
  sleep_hours numeric(3,1) not null check (sleep_hours >= 0 and sleep_hours <= 24),
  created_at timestamptz not null default now(),
  unique (user_id, log_date)
);

create index mood_logs_user_id_idx on mood_logs(user_id, log_date desc);

alter table mood_logs enable row level security;

create policy "mood_logs: owner all" on mood_logs for all
  using (user_id = auth.uid()) with check (user_id = auth.uid());

-- ---------------------------------------------------------------------------
-- finance_accounts / finance_transactions / budgets (Geld)
-- ---------------------------------------------------------------------------
create table finance_accounts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  institution text not null,
  name text not null,
  account_type text not null check (account_type in ('girokonto', 'sparkonto', 'depot')),
  balance numeric(12,2) not null default 0,
  currency text not null default 'EUR',
  -- Open Banking link metadata (populated once Phase 3 is wired up).
  provider text,
  provider_account_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index finance_accounts_user_id_idx on finance_accounts(user_id);

alter table finance_accounts enable row level security;

create policy "finance_accounts: owner all" on finance_accounts for all
  using (user_id = auth.uid()) with check (user_id = auth.uid());

create trigger finance_accounts_set_updated_at before update on finance_accounts
  for each row execute function set_updated_at();

create table finance_transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  account_id uuid not null references finance_accounts(id) on delete cascade,
  occurred_on date not null,
  amount numeric(12,2) not null, -- negative = expense
  category text not null,
  merchant text not null,
  created_at timestamptz not null default now()
);

create index finance_transactions_user_id_idx on finance_transactions(user_id, occurred_on desc);
create index finance_transactions_account_id_idx on finance_transactions(account_id);

alter table finance_transactions enable row level security;

create policy "finance_transactions: owner all" on finance_transactions for all
  using (user_id = auth.uid()) with check (user_id = auth.uid());

create table budgets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  category text not null,
  monthly_limit numeric(12,2) not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, category)
);

alter table budgets enable row level security;

create policy "budgets: owner all" on budgets for all
  using (user_id = auth.uid()) with check (user_id = auth.uid());

create trigger budgets_set_updated_at before update on budgets
  for each row execute function set_updated_at();

-- ---------------------------------------------------------------------------
-- driving_license_progress (Führerschein) — one row per user
-- ---------------------------------------------------------------------------
create table driving_license_progress (
  user_id uuid primary key references auth.users(id) on delete cascade,
  theory_progress_pct smallint not null default 0 check (theory_progress_pct between 0 and 100),
  theory_mock_exam_avg_pct smallint not null default 0 check (theory_mock_exam_avg_pct between 0 and 100),
  lessons_completed smallint not null default 0,
  lessons_planned smallint not null default 0,
  exam_date date,
  costs_spent numeric(10,2) not null default 0,
  budget_total numeric(10,2) not null default 0,
  updated_at timestamptz not null default now()
);

alter table driving_license_progress enable row level security;

create policy "driving_license_progress: owner all" on driving_license_progress for all
  using (user_id = auth.uid()) with check (user_id = auth.uid());

create trigger driving_license_progress_set_updated_at before update on driving_license_progress
  for each row execute function set_updated_at();

-- ---------------------------------------------------------------------------
-- ai_messages — chat history, tool_calls kept for auditability
-- ---------------------------------------------------------------------------
create table ai_messages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role chat_role not null,
  content text not null,
  tool_calls jsonb, -- [{ kind, label, payload }], set on assistant messages that acted
  created_at timestamptz not null default now()
);

create index ai_messages_user_id_idx on ai_messages(user_id, created_at);

alter table ai_messages enable row level security;

create policy "ai_messages: owner all" on ai_messages for all
  using (user_id = auth.uid()) with check (user_id = auth.uid());

-- ---------------------------------------------------------------------------
-- life_scores — daily snapshot per area, computed by src/lib/lifeScore.ts
-- (mirrored server-side once Phase 2 lands) so Statistiken can show real trends.
-- ---------------------------------------------------------------------------
create table life_scores (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  score_date date not null default current_date,
  ausbildung smallint not null check (ausbildung between 0 and 100),
  psyche smallint not null check (psyche between 0 and 100),
  geld smallint not null check (geld between 0 and 100),
  fuehrerschein smallint not null check (fuehrerschein between 0 and 100),
  overall smallint not null check (overall between 0 and 100),
  created_at timestamptz not null default now(),
  unique (user_id, score_date)
);

create index life_scores_user_id_idx on life_scores(user_id, score_date desc);

alter table life_scores enable row level security;

create policy "life_scores: owner all" on life_scores for all
  using (user_id = auth.uid()) with check (user_id = auth.uid());
