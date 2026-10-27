import "server-only";
import type { Result } from "@/types/result";

// Supabase Management API: service health, edge function metadata and log queries.
// Needs a personal access token (SUPABASE_ACCESS_TOKEN). That token can manage every project
// on the account, so keep it server-side only, like the service-role key.
const API_BASE = "https://api.supabase.com/v1";
const CACHE_SECONDS = 60;

function projectRef() {
  if (process.env.SUPABASE_PROJECT_REF) return process.env.SUPABASE_PROJECT_REF;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  return url ? new URL(url).hostname.split(".")[0] : undefined;
}

export async function managementGet<T>(path: string, params: Record<string, string> = {}): Promise<Result<T>> {
  const token = process.env.SUPABASE_ACCESS_TOKEN;
  const ref = projectRef();
  if (!token || !ref) {
    return {
      ok: false,
      reason: "not_configured",
      message: "Add SUPABASE_ACCESS_TOKEN to .env.local to load platform metrics.",
    };
  }

  const url = new URL(`${API_BASE}/projects/${ref}${path}`);
  for (const [key, value] of Object.entries(params)) url.searchParams.set(key, value);

  try {
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
      next: { revalidate: CACHE_SECONDS },
    });
    if (!res.ok) {
      const body = (await res.text()).slice(0, 200);
      return { ok: false, reason: "error", message: `Management API ${res.status}: ${body}` };
    }
    return { ok: true, data: (await res.json()) as T };
  } catch (e) {
    return { ok: false, reason: "error", message: e instanceof Error ? e.message : String(e) };
  }
}

// Runs ClickHouse SQL against the project's logs. The API caps a query at 24 hours.
// The window is rounded down to the minute so reloads within a minute share one cached request.
export async function queryLogs<T>(sql: string, hours = 24): Promise<Result<T[]>> {
  const end = new Date(Math.floor(Date.now() / 60_000) * 60_000);
  const start = new Date(end.getTime() - Math.min(hours, 24) * 3_600_000);

  const res = await managementGet<{ result?: T[]; error?: unknown }>("/analytics/endpoints/logs", {
    sql,
    iso_timestamp_start: start.toISOString(),
    iso_timestamp_end: end.toISOString(),
  });
  if (!res.ok) return res;
  if (res.data.error) {
    const err = res.data.error;
    const message = typeof err === "string" ? err : ((err as { message?: string }).message ?? JSON.stringify(err));
    return { ok: false, reason: "error", message: `Log query failed: ${message.slice(0, 300)}` };
  }
  return { ok: true, data: res.data.result ?? [] };
}
