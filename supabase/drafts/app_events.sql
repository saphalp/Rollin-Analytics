-- DRAFT — move into the Rollin repo's supabase/migrations/ when you add client analytics.
-- The dashboard's Frontend / UX page reads from this table.
begin;

create table if not exists public.app_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete set null,
  event_type text not null, -- 'screen_view' | 'session_start' | 'session_end' | 'error' | ...
  screen text,
  platform text,            -- 'ios' | 'android' | 'web'
  app_version text,
  metadata jsonb,
  created_at timestamptz not null default now()
);

create index if not exists app_events_created_idx on public.app_events (created_at desc);
create index if not exists app_events_type_idx on public.app_events (event_type, created_at desc);

alter table public.app_events enable row level security;
grant all on public.app_events to service_role;

-- Write-only from the app; reads happen through the dashboard's service-role client.
create policy "users can log their own events"
  on public.app_events for insert to authenticated
  with check (user_id is null or user_id = auth.uid());

commit;
