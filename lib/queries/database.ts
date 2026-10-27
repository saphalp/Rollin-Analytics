import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import type { ActiveQuery, DailyCount, DbHealth, QueryStat, TableStat, UnusedIndex } from "@/types/metrics";
import type { Result } from "@/types/result";

const SETUP_MESSAGE = "Postgres metrics aren't available for this project.";

async function rpc<T>(fn: string, args?: Record<string, unknown>): Promise<Result<T>> {
  const { data, error } = await createAdminClient().rpc(fn, args);
  if (error) {
    // PGRST202: PostgREST can't find the function, i.e. the SQL hasn't been applied yet.
    const missing = error.code === "PGRST202" || error.code === "42883";
    return missing
      ? { ok: false, reason: "not_configured", message: SETUP_MESSAGE }
      : { ok: false, reason: "error", message: error.message };
  }
  return { ok: true, data: data as T };
}

export const getDbHealth = () => rpc<DbHealth>("admin_db_health");
export const getTableStats = () => rpc<TableStat[]>("admin_table_stats");
export const getUnusedIndexes = () => rpc<UnusedIndex[]>("admin_unused_indexes");
export const getActiveQueries = () => rpc<ActiveQuery[]>("admin_active_queries");
export const getDailyCounts = (days = 30) => rpc<DailyCount[]>("admin_daily_counts", { p_days: days });

export const getTopQueries = (order: "total" | "mean" | "calls", limit = 10) =>
  rpc<QueryStat[]>("admin_top_queries", { p_order: order, p_limit: limit });

export async function getTotalUsers() {
  const { count, error } = await createAdminClient()
    .from("profiles")
    .select("*", { count: "exact", head: true });
  return error ? null : count;
}
