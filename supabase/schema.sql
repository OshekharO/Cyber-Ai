create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text,
  full_name text,
  role text not null default 'user' check (role in ('user', 'admin')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name'),
    'user'
  )
  on conflict (id) do update
    set email = excluded.email,
        full_name = coalesce(excluded.full_name, public.profiles.full_name),
        updated_at = now();
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and role = 'admin'
  );
$$;

drop policy if exists "Users can read their profile" on public.profiles;
create policy "Users can read their profile"
on public.profiles
for select
using (auth.uid() = id or public.is_admin());

drop policy if exists "Users can update their profile" on public.profiles;
create policy "Users can update their profile"
on public.profiles
for update
using (auth.uid() = id)
with check (auth.uid() = id);

drop policy if exists "Admins can update any profile" on public.profiles;
create policy "Admins can update any profile"
on public.profiles
for update
using (public.is_admin())
with check (public.is_admin());

create or replace function public.prevent_unauthorized_role_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if TG_OP = 'INSERT' then
    if new.role = 'admin' and not public.is_admin() then
      raise exception 'Only admins can create admin profiles';
    end if;
    return new;
  end if;

  if TG_OP = 'UPDATE' then
    if old.role is distinct from new.role and not public.is_admin() then
      raise exception 'Only admins can change user roles';
    end if;
    return new;
  end if;

  return new;
end;
$$;

drop trigger if exists prevent_unauthorized_role_change on public.profiles;
create trigger prevent_unauthorized_role_change
before insert or update on public.profiles
for each row execute function public.prevent_unauthorized_role_change();

drop policy if exists "Users can insert their profile" on public.profiles;
create policy "Users can insert their profile"
on public.profiles
for insert
with check (auth.uid() = id or public.is_admin());

-- ═══════════════════════════════════════════════════════════════════════════
-- User queries — records what users asked the assistant so admins can see
-- what people are searching for. `source` distinguishes the primary API from
-- the Brave fallback, `status` records whether the request succeeded.
-- ═══════════════════════════════════════════════════════════════════════════

create table if not exists public.user_queries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles (id) on delete set null,
  query text not null,
  source text not null default 'primary' check (source in ('primary', 'brave')),
  status text not null default 'success' check (status in ('success', 'error', 'cancelled')),
  session_id text,
  created_at timestamptz not null default now()
);

create index if not exists user_queries_user_id_idx on public.user_queries (user_id);
create index if not exists user_queries_created_at_idx on public.user_queries (created_at desc);

alter table public.user_queries enable row level security;

-- Authenticated users may record only their own queries.
drop policy if exists "Users can insert their own queries" on public.user_queries;
create policy "Users can insert their own queries"
on public.user_queries
for insert
with check (auth.uid() = user_id);

-- Only admins may read recorded queries.
drop policy if exists "Admins can read queries" on public.user_queries;
create policy "Admins can read queries"
on public.user_queries
for select
using (public.is_admin());

-- ═══════════════════════════════════════════════════════════════════════════
-- Admin audit log — records admin actions (role changes, user deletions)
-- so admins can review who changed what and when.
-- ═══════════════════════════════════════════════════════════════════════════

create table if not exists public.admin_audit_log (
  id uuid primary key default gen_random_uuid(),
  admin_id uuid not null references auth.users (id) on delete set null,
  action text not null,
  target_user_id uuid not null references auth.users (id) on delete set null,
  details jsonb,
  created_at timestamptz not null default now()
);

create index if not exists admin_audit_log_admin_id_idx on public.admin_audit_log (admin_id);
create index if not exists admin_audit_log_target_user_id_idx on public.admin_audit_log (target_user_id);
create index if not exists admin_audit_log_created_at_idx on public.admin_audit_log (created_at desc);

alter table public.admin_audit_log enable row level security;

-- Only admins may read the audit log.
drop policy if exists "Admins can read audit log" on public.admin_audit_log;
create policy "Admins can read audit log"
on public.admin_audit_log
for select
using (public.is_admin());