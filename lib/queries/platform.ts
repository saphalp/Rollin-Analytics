import "server-only";
import { managementGet, queryLogs } from "@/lib/supabase/management";
import type {
  EdgeFunction,
  FunctionLogError,
  FunctionStat,
  HourlyTraffic,
  ServiceHealth,
  TrafficBreakdown,
  TrafficSummary,
} from "@/types/metrics";
import type { Result } from "@/types/result";

// Log fields are strings in ClickHouse (see Supabase "Log sources and fields"), so cast them.
// response.origin_time is the upstream (PostgREST/Auth/Storage) response time in ms.
const STATUS = "toInt32OrZero(log_attributes['response.status_code'])";
const ORIGIN_MS = "toFloat64OrNull(log_attributes['response.origin_time'])";
const EXEC_MS = "toFloat64OrNull(log_attributes['execution_time_ms'])";

// ClickHouse serializes 64-bit ints as strings and empty quantiles as null/NaN.
function num(v: unknown): number | null {
  const n = typeof v === "string" ? Number(v) : (v as number);
  return typeof n === "number" && Number.isFinite(n) ? n : null;
}

function mapResult<A, B>(res: Result<A>, fn: (a: A) => B): Result<B> {
  return res.ok ? { ok: true, data: fn(res.data) } : res;
}

type HourlyRow = { hour: unknown; requests: unknown; client_errors: unknown; server_errors: unknown; p50: unknown; p95: unknown };

function hourlySql(source: string, latency: string) {
  return `
    select toUnixTimestamp(toStartOfHour(timestamp)) as hour,
      count() as requests,
      countIf(${STATUS} between 400 and 499) as client_errors,
      countIf(${STATUS} >= 500) as server_errors,
      quantile(0.5)(${latency}) as p50,
      quantile(0.95)(${latency}) as p95
    from logs
    where source = '${source}'
    group by hour
    order by hour
    limit 100`;
}

// Zero-fills the last 24 hourly buckets so quiet hours still show on the chart.
function fillHours(rows: HourlyRow[]): HourlyTraffic[] {
  const byHour = new Map(rows.map((r) => [num(r.hour), r]));
  const currentHour = Math.floor(Date.now() / 3_600_000) * 3600;
  return Array.from({ length: 24 }, (_, i) => {
    const hour = currentHour - (23 - i) * 3600;
    const r = byHour.get(hour);
    const requests = num(r?.requests) ?? 0;
    const clientErrors = num(r?.client_errors) ?? 0;
    const serverErrors = num(r?.server_errors) ?? 0;
    return {
      ts: hour * 1000,
      ok: requests - clientErrors - serverErrors,
      clientErrors,
      serverErrors,
      p50: num(r?.p50),
      p95: num(r?.p95),
    };
  });
}

// ---------- Service health ----------

export async function getServiceHealth() {
  return managementGet<ServiceHealth[]>("/health", { services: "db,rest,auth,realtime,storage,pooler" });
}

// ---------- API gateway (edge_logs) ----------

export async function getApiSummary(): Promise<Result<TrafficSummary>> {
  const res = await queryLogs<Record<string, unknown>>(`
    select count() as requests,
      countIf(${STATUS} between 400 and 499) as client_errors,
      countIf(${STATUS} >= 500) as server_errors,
      quantile(0.5)(${ORIGIN_MS}) as p50,
      quantile(0.95)(${ORIGIN_MS}) as p95,
      quantile(0.99)(${ORIGIN_MS}) as p99
    from logs
    where source = 'edge_logs'
    limit 1`);
  return mapResult(res, ([r]) => ({
    requests: num(r?.requests) ?? 0,
    clientErrors: num(r?.client_errors) ?? 0,
    serverErrors: num(r?.server_errors) ?? 0,
    p50: num(r?.p50),
    p95: num(r?.p95),
    p99: num(r?.p99),
  }));
}

export async function getApiHourly() {
  return mapResult(await queryLogs<HourlyRow>(hourlySql("edge_logs", ORIGIN_MS)), fillHours);
}

type BreakdownRow = { name: unknown; requests: unknown; errors: unknown; p95: unknown };

function toBreakdown(rows: BreakdownRow[]): TrafficBreakdown[] {
  return rows.map((r) => ({
    name: String(r.name || "other"),
    requests: num(r.requests) ?? 0,
    errors: num(r.errors) ?? 0,
    p95: num(r.p95),
  }));
}

// Requests per Supabase service: rest, auth, storage, functions, realtime, graphql.
export async function getApiByService() {
  const res = await queryLogs<BreakdownRow>(`
    select extract(log_attributes['request.path'], '^/([a-z0-9-]+)/v[0-9]') as name,
      count() as requests,
      countIf(${STATUS} >= 500) as errors,
      quantile(0.95)(${ORIGIN_MS}) as p95
    from logs
    where source = 'edge_logs'
    group by name
    order by requests desc
    limit 10`);
  return mapResult(res, toBreakdown);
}

// Most requested tables (and RPC functions) through PostgREST, i.e. what the app actually hits.
export async function getApiByTable() {
  const res = await queryLogs<BreakdownRow>(`
    select extract(log_attributes['request.path'], '^/rest/v1/((?:rpc/)?[^/?]+)') as name,
      count() as requests,
      countIf(${STATUS} >= 400) as errors,
      quantile(0.95)(${ORIGIN_MS}) as p95
    from logs
    where source = 'edge_logs' and startsWith(log_attributes['request.path'], '/rest/v1/')
    group by name
    order by requests desc
    limit 12`);
  return mapResult(res, toBreakdown);
}

// ---------- Edge functions (function_edge_logs / function_logs) ----------

export async function getEdgeFunctions() {
  return managementGet<EdgeFunction[]>("/functions");
}

export async function getFunctionHourly() {
  return mapResult(await queryLogs<HourlyRow>(hourlySql("function_edge_logs", EXEC_MS)), fillHours);
}

// Per-function invocation stats, merged with the deployed function list so idle functions show too.
export async function getFunctionStats(functions: Result<EdgeFunction[]>): Promise<Result<FunctionStat[]>> {
  const res = await queryLogs<Record<string, unknown>>(`
    select log_attributes['function_id'] as function_id,
      count() as invocations,
      countIf(${STATUS} between 400 and 499) as client_errors,
      countIf(${STATUS} >= 500) as server_errors,
      avg(${EXEC_MS}) as avg_ms,
      quantile(0.95)(${EXEC_MS}) as p95_ms,
      max(${EXEC_MS}) as max_ms
    from logs
    where source = 'function_edge_logs'
    group by function_id
    order by invocations desc
    limit 50`);
  if (!res.ok) return res;

  const deployed = functions.ok ? functions.data : [];
  const statsById = new Map(res.data.map((r) => [String(r.function_id), r]));
  const ids = new Set([...deployed.map((f) => f.id), ...statsById.keys()]);

  const stats = [...ids].map((id): FunctionStat => {
    const fn = deployed.find((f) => f.id === id);
    const r = statsById.get(id);
    return {
      functionId: id,
      slug: fn?.slug ?? id,
      status: fn?.status ?? null,
      version: fn?.version ?? null,
      updatedAt: fn?.updated_at ?? null,
      invocations: num(r?.invocations) ?? 0,
      clientErrors: num(r?.client_errors) ?? 0,
      serverErrors: num(r?.server_errors) ?? 0,
      avgMs: num(r?.avg_ms),
      p95Ms: num(r?.p95_ms),
      maxMs: num(r?.max_ms),
    };
  });
  return { ok: true, data: stats.sort((a, b) => b.invocations - a.invocations) };
}

// Recent error-level console output from inside edge functions.
export async function getFunctionErrors(functions: Result<EdgeFunction[]>): Promise<Result<FunctionLogError[]>> {
  const res = await queryLogs<Record<string, unknown>>(`
    select id,
      toUnixTimestamp64Milli(timestamp) as ts,
      log_attributes['function_id'] as function_id,
      substring(event_message, 1, 400) as message
    from logs
    where source = 'function_logs'
      and (lower(log_attributes['level']) = 'error' or lower(severity_text) = 'error')
    order by timestamp desc
    limit 20`);
  const slugs = new Map((functions.ok ? functions.data : []).map((f) => [f.id, f.slug]));
  return mapResult(res, (rows) =>
    rows.map((r) => ({
      id: String(r.id),
      ts: num(r.ts) ?? 0,
      slug: slugs.get(String(r.function_id)) ?? String(r.function_id),
      message: String(r.message ?? ""),
    })),
  );
}
