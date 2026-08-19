export const SCHEMA_VERSION = "2026-08-19.1";

export const SCHEMA_SQL = `
create extension if not exists pgcrypto;

create table if not exists public.headroom_schema_migrations (
  version text primary key,
  applied_at timestamptz not null default now()
);

create table if not exists public.organisations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  organisation_id uuid not null references public.organisations(id) on delete cascade,
  full_name text not null,
  email text not null,
  role text not null default 'Installer' check (role in ('Administrator','Technical Supervisor','Installer','Auditor','Office')),
  status text not null default 'Active' check (status in ('Active','Invited','Suspended')),
  invited_by uuid references auth.users(id) on delete set null,
  last_active_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists profiles_organisation_email_key
  on public.profiles (organisation_id, lower(email));

create table if not exists public.workspaces (
  organisation_id uuid primary key references public.organisations(id) on delete cascade,
  state jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users(id) on delete set null
);

create table if not exists public.audit_events (
  id uuid primary key default gen_random_uuid(),
  organisation_id uuid not null references public.organisations(id) on delete cascade,
  actor_id uuid references auth.users(id) on delete set null,
  actor_name text not null,
  category text not null,
  action text not null,
  detail text not null default '',
  created_at timestamptz not null default now()
);

create index if not exists audit_events_organisation_created_idx
  on public.audit_events (organisation_id, created_at desc);

create or replace function public.current_headroom_organisation_id()
returns uuid
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select organisation_id from public.profiles
  where id = auth.uid() and status = 'Active'
$$;

create or replace function public.current_headroom_role()
returns text
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select role from public.profiles
  where id = auth.uid() and status = 'Active'
$$;

grant execute on function public.current_headroom_organisation_id() to authenticated;
grant execute on function public.current_headroom_role() to authenticated;

alter table public.organisations enable row level security;
alter table public.profiles enable row level security;
alter table public.workspaces enable row level security;
alter table public.audit_events enable row level security;

drop policy if exists organisations_read_own on public.organisations;
create policy organisations_read_own on public.organisations for select to authenticated
  using (id = public.current_headroom_organisation_id());

drop policy if exists organisations_admin_update on public.organisations;
create policy organisations_admin_update on public.organisations for update to authenticated
  using (id = public.current_headroom_organisation_id() and public.current_headroom_role() = 'Administrator')
  with check (id = public.current_headroom_organisation_id() and public.current_headroom_role() = 'Administrator');

drop policy if exists profiles_read_organisation on public.profiles;
create policy profiles_read_organisation on public.profiles for select to authenticated
  using (organisation_id = public.current_headroom_organisation_id());

drop policy if exists profiles_admin_update on public.profiles;
create policy profiles_admin_update on public.profiles for update to authenticated
  using (organisation_id = public.current_headroom_organisation_id() and public.current_headroom_role() = 'Administrator')
  with check (organisation_id = public.current_headroom_organisation_id() and public.current_headroom_role() = 'Administrator');

drop policy if exists workspaces_read_organisation on public.workspaces;
create policy workspaces_read_organisation on public.workspaces for select to authenticated
  using (organisation_id = public.current_headroom_organisation_id());

drop policy if exists workspaces_write_organisation on public.workspaces;
create policy workspaces_write_organisation on public.workspaces for all to authenticated
  using (organisation_id = public.current_headroom_organisation_id() and public.current_headroom_role() <> 'Auditor')
  with check (organisation_id = public.current_headroom_organisation_id() and public.current_headroom_role() <> 'Auditor');

drop policy if exists audit_events_read_organisation on public.audit_events;
create policy audit_events_read_organisation on public.audit_events for select to authenticated
  using (organisation_id = public.current_headroom_organisation_id());

drop policy if exists audit_events_insert_organisation on public.audit_events;
create policy audit_events_insert_organisation on public.audit_events for insert to authenticated
  with check (organisation_id = public.current_headroom_organisation_id());

insert into storage.buckets (id, name, public, file_size_limit)
values ('installer-documents', 'installer-documents', false, 10485760)
on conflict (id) do update set public = false, file_size_limit = excluded.file_size_limit;

drop policy if exists headroom_documents_read on storage.objects;
create policy headroom_documents_read on storage.objects for select to authenticated
  using (
    bucket_id = 'installer-documents'
    and split_part(name, '/', 1) = public.current_headroom_organisation_id()::text
  );

drop policy if exists headroom_documents_write on storage.objects;
create policy headroom_documents_write on storage.objects for insert to authenticated
  with check (
    bucket_id = 'installer-documents'
    and split_part(name, '/', 1) = public.current_headroom_organisation_id()::text
    and public.current_headroom_role() <> 'Auditor'
  );

drop policy if exists headroom_documents_update on storage.objects;
create policy headroom_documents_update on storage.objects for update to authenticated
  using (
    bucket_id = 'installer-documents'
    and split_part(name, '/', 1) = public.current_headroom_organisation_id()::text
    and public.current_headroom_role() <> 'Auditor'
  );

drop policy if exists headroom_documents_delete on storage.objects;
create policy headroom_documents_delete on storage.objects for delete to authenticated
  using (
    bucket_id = 'installer-documents'
    and split_part(name, '/', 1) = public.current_headroom_organisation_id()::text
    and public.current_headroom_role() <> 'Auditor'
  );

insert into public.headroom_schema_migrations (version)
values ('${SCHEMA_VERSION}')
on conflict (version) do nothing;
`;

