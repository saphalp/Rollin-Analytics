// ---------- Postgres (supabase/drafts/admin_metrics.sql) ----------

export type DbHealth = {
  db_size_bytes: number;
  pg_version: string;
  started_at: string;
  uptime_seconds: number;
  max_connections: number;
  connections: Record<string, number>; // by state: active, idle, idle in transaction, ...
  longest_query_seconds: number;
  waiting_locks: number;
  cache_hit_ratio: number | null;
  index_hit_ratio: number | null;
  xact_commit: number;
  xact_rollback: number;
  deadlocks: number;
  temp_bytes: number;
  stats_reset: string | null;
};

export type TableStat = {
  table_name: string;
  total_bytes: number;
  table_bytes: number;
  index_bytes: number;
  live_rows: number;
  dead_rows: number;
  seq_scan: number;
  idx_scan: number;
  inserts: number;
  updates: number;
  deletes: number;
  last_vacuum: string | null;
  last_analyze: string | null;
};

export type QueryStat = {
  query_id: string;
  query: string;
  role: string;
  calls: number;
  total_ms: number;
  mean_ms: number;
  max_ms: number;
  rows: number;
  cache_hit_ratio: number | null;
  share: number | null; // fraction of all statement time
};

export type UnusedIndex = {
  table_name: string;
  index_name: string;
  index_bytes: number;
  idx_scan: number;
};

export type ActiveQuery = {
  pid: number;
  role: string;
  application: string;
  state: string;
  wait_event: string | null;
  duration_seconds: number | null;
  query: string;
};

export type DailyMetric = "signups" | "activities" | "rsvps" | "messages" | "rides_offered" | "ride_requests";

export type DailyCount = {
  day: string; // YYYY-MM-DD (UTC)
  metric: DailyMetric;
  count: number;
};

// ---------- Supabase platform (Management API) ----------

export type ServiceHealth = {
  name: string;
  status: "COMING_UP" | "ACTIVE_HEALTHY" | "UNHEALTHY";
  error?: string;
};

export type HourlyTraffic = {
  ts: number; // start of hour, unix ms
  ok: number;
  clientErrors: number;
  serverErrors: number;
  p50: number | null;
  p95: number | null;
};

export type TrafficSummary = {
  requests: number;
  clientErrors: number;
  serverErrors: number;
  p50: number | null;
  p95: number | null;
  p99: number | null;
};

export type TrafficBreakdown = {
  name: string;
  requests: number;
  errors: number;
  p95: number | null;
};

export type EdgeFunction = {
  id: string;
  slug: string;
  name: string;
  status: "ACTIVE" | "REMOVED" | "THROTTLED";
  version: number;
  updated_at: number; // unix ms
};

export type FunctionStat = {
  functionId: string;
  slug: string;
  status: EdgeFunction["status"] | null;
  version: number | null;
  updatedAt: number | null;
  invocations: number;
  clientErrors: number;
  serverErrors: number;
  avgMs: number | null;
  p95Ms: number | null;
  maxMs: number | null;
};

export type FunctionLogError = {
  id: string;
  ts: number;
  slug: string;
  message: string;
};

// ---------- App usage ----------

export type TopActivity = {
  activityId: string;
  title: string;
  views: number;
};

export type AppEvent = {
  id: string;
  user_id: string | null;
  event_type: "screen_view" | "session_start" | "session_end" | "error" | string;
  screen: string | null;
  platform: string | null;
  app_version: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
};
