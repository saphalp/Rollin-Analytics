-- DRAFT — move into the Rollin repo's supabase/migrations/ (or run it in the SQL editor).
-- Read-only Postgres diagnostics for the Rollin Analytics Database and Overview pages.
--
-- Each function is SECURITY DEFINER so it runs as its owner (postgres), which can read the
-- pg_stat_* views, and is executable only by service_role. App users (anon/authenticated)
-- can never call them.
begin;

create extension if not exists pg_stat_statements with schema extensions;

-- One-row snapshot: size, cache efficiency, connections, locks, transaction counters.
create or replace function public.admin_db_health()
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
  select jsonb_build_object(
    'db_size_bytes', pg_database_size(current_database()),
    'pg_version', current_setting('server_version'),
    'started_at', pg_postmaster_start_time(),
    'uptime_seconds', extract(epoch from now() - pg_postmaster_start_time()),
    'max_connections', current_setting('max_connections')::int,
    'connections', (
      select coalesce(jsonb_object_agg(state, n), '{}'::jsonb)
      from (
        select coalesce(state, 'unknown') as state, count(*) as n
        from pg_stat_activity
        where datname = current_database() and backend_type = 'client backend'
        group by 1
      ) s
    ),
    'longest_query_seconds', (
      select coalesce(max(extract(epoch from now() - query_start)), 0)
      from pg_stat_activity
      where state = 'active' and backend_type = 'client backend' and pid <> pg_backend_pid()
    ),
    'waiting_locks', (select count(*) from pg_locks where not granted),
    'cache_hit_ratio', (
      select sum(heap_blks_hit)::float8 / nullif(sum(heap_blks_hit) + sum(heap_blks_read), 0)
      from pg_statio_user_tables
    ),
    'index_hit_ratio', (
      select sum(idx_blks_hit)::float8 / nullif(sum(idx_blks_hit) + sum(idx_blks_read), 0)
      from pg_statio_user_indexes
    ),
    'xact_commit', d.xact_commit,
    'xact_rollback', d.xact_rollback,
    'deadlocks', d.deadlocks,
    'temp_bytes', d.temp_bytes,
    'stats_reset', d.stats_reset
  )
  from pg_stat_database d
  where d.datname = current_database();
$$;

-- Per-table size, row estimates, read/write activity and vacuum state (public schema).
create or replace function public.admin_table_stats()
returns table (
  table_name text,
  total_bytes bigint,
  table_bytes bigint,
  index_bytes bigint,
  live_rows bigint,
  dead_rows bigint,
  seq_scan bigint,
  idx_scan bigint,
  inserts bigint,
  updates bigint,
  deletes bigint,
  last_vacuum timestamptz,
  last_analyze timestamptz
)
language sql
stable
security definer
set search_path = ''
as $$
  select
    s.relname::text,
    pg_total_relation_size(s.relid),
    pg_relation_size(s.relid),
    pg_indexes_size(s.relid),
    s.n_live_tup,
    s.n_dead_tup,
    s.seq_scan,
    coalesce(s.idx_scan, 0),
    s.n_tup_ins,
    s.n_tup_upd,
    s.n_tup_del,
    greatest(s.last_vacuum, s.last_autovacuum),
    greatest(s.last_analyze, s.last_autoanalyze)
  from pg_stat_user_tables s
  where s.schemaname = 'public'
  order by pg_total_relation_size(s.relid) desc;
$$;

-- Top statements from pg_stat_statements. p_order: 'total' (time consumed), 'mean' (slowest), 'calls'.
create or replace function public.admin_top_queries(p_order text default 'total', p_limit int default 15)
returns table (
  query_id text,
  query text,
  role text,
  calls bigint,
  total_ms float8,
  mean_ms float8,
  max_ms float8,
  rows bigint,
  cache_hit_ratio float8,
  share float8
)
language sql
stable
security definer
set search_path = ''
as $$
  select
    s.queryid::text,
    left(regexp_replace(s.query, '\s+', ' ', 'g'), 500),
    r.rolname::text,
    s.calls,
    s.total_exec_time,
    s.mean_exec_time,
    s.max_exec_time,
    s.rows,
    s.shared_blks_hit::float8 / nullif(s.shared_blks_hit + s.shared_blks_read, 0),
    s.total_exec_time / nullif(sum(s.total_exec_time) over (), 0)
  from extensions.pg_stat_statements s
  join pg_roles r on r.oid = s.userid
  where s.dbid = (select oid from pg_database where datname = current_database())
    and r.rolname <> 'supabase_admin' -- platform health polling, not app traffic
    and s.query !~* 'admin_(db_health|table_stats|top_queries|unused_indexes|active_queries|daily_counts)'
  order by
    case p_order
      when 'mean' then s.mean_exec_time
      when 'calls' then s.calls::float8
      else s.total_exec_time
    end desc
  limit least(greatest(p_limit, 1), 100);
$$;

-- Indexes that have never been scanned since stats reset (excluding unique/primary keys,
-- which enforce constraints even when unused for reads).
create or replace function public.admin_unused_indexes()
returns table (table_name text, index_name text, index_bytes bigint, idx_scan bigint)
language sql
stable
security definer
set search_path = ''
as $$
  select s.relname::text, s.indexrelname::text, pg_relation_size(s.indexrelid), s.idx_scan
  from pg_stat_user_indexes s
  join pg_index i on i.indexrelid = s.indexrelid
  where s.schemaname = 'public'
    and s.idx_scan = 0
    and not i.indisunique
    and not i.indisprimary
  order by pg_relation_size(s.indexrelid) desc;
$$;

-- Non-idle client connections right now, longest running first.
create or replace function public.admin_active_queries()
returns table (
  pid int,
  role text,
  application text,
  state text,
  wait_event text,
  duration_seconds float8,
  query text
)
language sql
stable
security definer
set search_path = ''
as $$
  select
    a.pid,
    a.usename::text,
    a.application_name,
    a.state,
    nullif(concat_ws(': ', a.wait_event_type, a.wait_event), ''),
    extract(epoch from now() - coalesce(a.query_start, a.xact_start))::float8,
    left(regexp_replace(a.query, '\s+', ' ', 'g'), 500)
  from pg_stat_activity a
  where a.datname = current_database()
    and a.backend_type = 'client backend'
    and a.state <> 'idle'
    and a.pid <> pg_backend_pid()
  order by 6 desc nulls last
  limit 25;
$$;

-- Rows created per UTC day for the app's core tables, zero-filled.
create or replace function public.admin_daily_counts(p_days int default 30)
returns table (day date, metric text, count bigint)
language sql
stable
security definer
set search_path = ''
as $$
  with bounds as (
    select (current_date - (least(greatest(p_days, 1), 90) - 1))::date as since
  ),
  days as (
    select generate_series((select since from bounds), current_date, interval '1 day')::date as day
  ),
  metrics as (
    select unnest(array['signups', 'activities', 'rsvps', 'messages', 'rides_offered', 'ride_requests']) as metric
  ),
  events as (
    select 'signups' as metric, created_at from public.profiles where created_at >= (select since from bounds)
    union all
    select 'activities', created_at from public.activities where created_at >= (select since from bounds)
    union all
    select 'rsvps', created_at from public.rsvps where created_at >= (select since from bounds)
    union all
    select 'messages', created_at from public.messages where created_at >= (select since from bounds)
    union all
    select 'rides_offered', created_at from public.rides_offered where created_at >= (select since from bounds)
    union all
    select 'ride_requests', created_at from public.ride_requests where created_at >= (select since from bounds)
  )
  select d.day, m.metric, count(e.created_at)
  from days d
  cross join metrics m
  left join events e on e.metric = m.metric and (e.created_at at time zone 'utc')::date = d.day
  group by d.day, m.metric
  order by d.day, m.metric;
$$;

revoke all on function public.admin_db_health() from public, anon, authenticated;
revoke all on function public.admin_table_stats() from public, anon, authenticated;
revoke all on function public.admin_top_queries(text, int) from public, anon, authenticated;
revoke all on function public.admin_unused_indexes() from public, anon, authenticated;
revoke all on function public.admin_active_queries() from public, anon, authenticated;
revoke all on function public.admin_daily_counts(int) from public, anon, authenticated;

grant execute on function public.admin_db_health() to service_role;
grant execute on function public.admin_table_stats() to service_role;
grant execute on function public.admin_top_queries(text, int) to service_role;
grant execute on function public.admin_unused_indexes() to service_role;
grant execute on function public.admin_active_queries() to service_role;
grant execute on function public.admin_daily_counts(int) to service_role;

commit;
