-- Supabase schema for InsureCompare Admin System

create table if not exists public.admins (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  role text not null check (role in ('admin', 'super_admin')),
  created_at timestamptz not null default now()
);

create table if not exists public.comparison_sessions (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  date text not null,
  type text not null,
  client_profile jsonb not null default '{}'::jsonb,
  providers jsonb not null default '[]'::jsonb,
  categories jsonb not null default '[]'::jsonb,
  report_title_override text,
  created_by uuid references public.admins(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references public.admins(id),
  action text not null,
  target_type text not null,
  target_id uuid,
  meta jsonb,
  created_at timestamptz not null default now()
);

alter table public.comparison_sessions enable row level security;
alter table public.admins enable row level security;
alter table public.audit_logs enable row level security;

create policy "admins can read admin list" on public.admins
  for select using (auth.uid() = id or exists (select 1 from public.admins a where a.id = auth.uid()));

create policy "super admins can insert admins" on public.admins
  for insert with check (exists (select 1 from public.admins a where a.id = auth.uid() and a.role = 'super_admin'));

create policy "super admins can delete admins" on public.admins
  for delete using (exists (select 1 from public.admins a where a.id = auth.uid() and a.role = 'super_admin'));

create policy "admins can read comparisons" on public.comparison_sessions
  for select using (exists (select 1 from public.admins a where a.id = auth.uid()));

create policy "admins can insert comparisons" on public.comparison_sessions
  for insert with check (exists (select 1 from public.admins a where a.id = auth.uid()));

create policy "admins can update comparisons" on public.comparison_sessions
  for update using (exists (select 1 from public.admins a where a.id = auth.uid()));

create policy "admins can delete comparisons" on public.comparison_sessions
  for delete using (exists (select 1 from public.admins a where a.id = auth.uid()));

create policy "admins can read audit logs" on public.audit_logs
  for select using (exists (select 1 from public.admins a where a.id = auth.uid()));

create or replace function public.set_comparison_created_by()
returns trigger as $$
begin
  if new.created_by is null then
    new.created_by := auth.uid();
  end if;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists set_comparison_created_by on public.comparison_sessions;
create trigger set_comparison_created_by
  before insert on public.comparison_sessions
  for each row execute function public.set_comparison_created_by();

create or replace function public.log_comparison_change()
returns trigger as $$
declare
  actor uuid;
begin
  actor := current_setting('request.jwt.claim.sub', true)::uuid;
  insert into public.audit_logs (actor_id, action, target_type, target_id, meta)
  values (
    actor,
    case tg_op
      when 'INSERT' then 'CREATE_COMPARISON'
      when 'UPDATE' then 'UPDATE_COMPARISON'
      when 'DELETE' then 'DELETE_COMPARISON'
    end,
    'comparison_session',
    coalesce(new.id, old.id),
    jsonb_build_object('name', coalesce(new.name, old.name))
  );
  return coalesce(new, old);
end;
$$ language plpgsql security definer;

drop trigger if exists log_comparison_change on public.comparison_sessions;
create trigger log_comparison_change
  after insert or update or delete on public.comparison_sessions
  for each row execute function public.log_comparison_change();

create or replace function public.log_admin_change()
returns trigger as $$
declare
  actor uuid;
begin
  actor := current_setting('request.jwt.claim.sub', true)::uuid;
  insert into public.audit_logs (actor_id, action, target_type, target_id, meta)
  values (
    actor,
    case tg_op
      when 'INSERT' then 'ADD_ADMIN'
      when 'DELETE' then 'REMOVE_ADMIN'
    end,
    'admin',
    coalesce(new.id, old.id),
    jsonb_build_object('email', coalesce(new.email, old.email))
  );
  return coalesce(new, old);
end;
$$ language plpgsql security definer;

drop trigger if exists log_admin_change on public.admins;
create trigger log_admin_change
  after insert or delete on public.admins
  for each row execute function public.log_admin_change();
