import type { Status } from "@/components/ui/status";
import type { DbHealth, FunctionStat, TableStat, TrafficSummary, UnusedIndex } from "@/types/metrics";
import type { Result } from "@/types/result";
import { formatBytes, formatDuration, formatMs, formatPercent } from "@/lib/format";

export type Advisory = {
  status: Status;
  title: string;
  detail: string;
};

type Inputs = {
  health: Result<DbHealth>;
  tables: Result<TableStat[]>;
  unusedIndexes: Result<UnusedIndex[]>;
  api: Result<TrafficSummary>;
  functions: Result<FunctionStat[]>;
};

// Rules of thumb a developer would check by hand, turned into a list of findings.
// Thresholds follow Supabase's own guidance where it exists (e.g. 99% cache hit ratio).
export function buildAdvisories({ health, tables, unusedIndexes, api, functions }: Inputs): Advisory[] {
  const out: Advisory[] = [];

  if (health.ok) {
    const h = health.data;
    if (h.cache_hit_ratio != null && h.cache_hit_ratio < 0.99) {
      out.push({
        status: h.cache_hit_ratio < 0.95 ? "serious" : "warning",
        title: `Table cache hit ratio is ${formatPercent(h.cache_hit_ratio)}`,
        detail: "Below 99% means Postgres is reading from disk often. Add indexes for hot queries or move to a larger compute size.",
      });
    }
    if (h.index_hit_ratio != null && h.index_hit_ratio < 0.99) {
      out.push({
        status: "warning",
        title: `Index cache hit ratio is ${formatPercent(h.index_hit_ratio)}`,
        detail: "Indexes don't fit in memory. Check the unused indexes below, or move to a larger compute size.",
      });
    }
    const used = Object.values(h.connections).reduce((a, b) => a + b, 0);
    if (used / h.max_connections > 0.8) {
      out.push({
        status: "serious",
        title: `${used} of ${h.max_connections} connections in use`,
        detail: "Close to the connection limit. Route server traffic through the pooler (Supavisor).",
      });
    }
    if (h.longest_query_seconds > 60) {
      out.push({
        status: "warning",
        title: `A query has been running for ${formatDuration(h.longest_query_seconds)}`,
        detail: "See Active queries at the bottom of the page.",
      });
    }
    if ((h.connections["idle in transaction"] ?? 0) > 0) {
      out.push({
        status: "warning",
        title: `${h.connections["idle in transaction"]} connection(s) idle in transaction`,
        detail: "Open transactions hold locks and block vacuum. Look for code that begins a transaction and never commits.",
      });
    }
    if (h.deadlocks > 0) {
      out.push({
        status: "warning",
        title: `${h.deadlocks} deadlock(s) since stats reset`,
        detail: "Two transactions locked rows in opposite order. Check Postgres logs for the statements involved.",
      });
    }
  }

  if (tables.ok) {
    for (const t of tables.data) {
      const deadRatio = t.dead_rows / Math.max(t.live_rows + t.dead_rows, 1);
      if (t.dead_rows > 1000 && deadRatio > 0.2) {
        out.push({
          status: "warning",
          title: `${t.table_name}: ${formatPercent(deadRatio, 0)} dead rows`,
          detail: "Autovacuum is falling behind on this table. Consider running VACUUM ANALYZE or tuning autovacuum for it.",
        });
      }
      if (t.live_rows > 10_000 && t.seq_scan > 100 && t.seq_scan > t.idx_scan) {
        out.push({
          status: "warning",
          title: `${t.table_name}: mostly sequential scans`,
          detail: `${t.seq_scan.toLocaleString()} sequential vs ${t.idx_scan.toLocaleString()} index scans on ${t.live_rows.toLocaleString()} rows. A filter column may be missing an index.`,
        });
      }
    }
  }

  if (unusedIndexes.ok && unusedIndexes.data.length > 0) {
    const bytes = unusedIndexes.data.reduce((a, i) => a + i.index_bytes, 0);
    out.push({
      status: "warning",
      title: `${unusedIndexes.data.length} index(es) never used`,
      detail: `They take ${formatBytes(bytes)} and slow down writes. Confirm against production traffic before dropping.`,
    });
  }

  if (api.ok && api.data.requests > 0) {
    const errorRate = api.data.serverErrors / api.data.requests;
    if (errorRate > 0.01) {
      out.push({
        status: errorRate > 0.05 ? "critical" : "serious",
        title: `API 5xx error rate is ${formatPercent(errorRate)}`,
        detail: "Server errors over the last 24 hours. Check the API traffic chart for when they started.",
      });
    }
    if (api.data.p95 != null && api.data.p95 > 1000) {
      out.push({
        status: "warning",
        title: `API p95 latency is ${formatMs(api.data.p95)}`,
        detail: "Slow requests over the last 24 hours. Check the slowest queries below.",
      });
    }
  }

  if (functions.ok) {
    for (const f of functions.data) {
      if (f.invocations >= 20 && f.serverErrors / f.invocations > 0.02) {
        out.push({
          status: "serious",
          title: `Edge function ${f.slug} is failing ${formatPercent(f.serverErrors / f.invocations)} of calls`,
          detail: `${f.serverErrors} server errors in ${f.invocations} invocations over the last 24 hours.`,
        });
      }
    }
  }

  const rank: Record<Status, number> = { critical: 0, serious: 1, warning: 2, good: 3 };
  return out.sort((a, b) => rank[a.status] - rank[b.status]);
}
