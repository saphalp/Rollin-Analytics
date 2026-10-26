-- DRAFT — move into the Rollin repo's supabase/migrations/ when the report feature ships.
-- The dashboard's Reports page and user detail page read from this table.
begin;

create table if not exists public.user_reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid not null references public.profiles(id) on delete cascade,
  reported_user_id uuid not null references public.profiles(id) on delete cascade,
  reason text not null check (reason in (
    'harassment', 'spam', 'inappropriate_content', 'impersonation', 'unsafe_behavior', 'other'
  )),
  details text,
  status text not null default 'open' check (status in ('open', 'reviewing', 'resolved', 'dismissed')),
  admin_notes text,
  created_at timestamptz not null default now(),
  resolved_at timestamptz,
  check (reporter_id <> reported_user_id)
);

create index if not exists user_reports_reported_user_idx on public.user_reports (reported_user_id);
create index if not exists user_reports_status_idx on public.user_reports (status, created_at desc);

alter table public.user_reports enable row level security;
grant all on public.user_reports to service_role;

-- App users can file reports as themselves, but can't read or edit them afterwards.
create policy "users can file reports"
  on public.user_reports for insert to authenticated
  with check (reporter_id = auth.uid());

commit;
