import { Meter } from "@/components/charts/meter";
import { SetupNotice } from "@/components/ui/setup-notice";
import { StatCard } from "@/components/ui/stat-card";
import type { Status } from "@/components/ui/status";
import { formatBytes, formatDuration, formatPercent } from "@/lib/format";
import type { DbHealth } from "@/types/metrics";
import type { Result } from "@/types/result";

function hitStatus(ratio: number | null): Status {
  if (ratio == null || ratio >= 0.99) return "good";
  return ratio >= 0.95 ? "warning" : "serious";
}

export function DbHealthTiles({ health }: { health: Result<DbHealth> }) {
  if (!health.ok) return <SetupNotice result={health} />;
  const h = health.data;

  const connections = Object.values(h.connections).reduce((a, b) => a + b, 0);
  const connectionUse = connections / h.max_connections;
  const connectionStatus: Status = connectionUse > 0.9 ? "critical" : connectionUse > 0.8 ? "serious" : connectionUse > 0.6 ? "warning" : "good";
  const rollbackRate = h.xact_rollback / Math.max(h.xact_commit + h.xact_rollback, 1);
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <StatCard label="Database size" value={formatBytes(h.db_size_bytes)} hint={`Postgres ${h.pg_version.split(" ")[0]} · up ${formatDuration(h.uptime_seconds)}`} />
      <StatCard
        label="Table cache hit ratio"
        value={formatPercent(h.cache_hit_ratio, 2)}
        status={hitStatus(h.cache_hit_ratio)}
        hint="Reads served from memory. Aim for 99% or more."
      >
        <Meter value={h.cache_hit_ratio ?? 0} status={hitStatus(h.cache_hit_ratio)} label="Table cache hit ratio" />
      </StatCard>
      <StatCard
        label="Index cache hit ratio"
        value={formatPercent(h.index_hit_ratio, 2)}
        status={hitStatus(h.index_hit_ratio)}
        hint="Index reads served from memory."
      >
        <Meter value={h.index_hit_ratio ?? 0} status={hitStatus(h.index_hit_ratio)} label="Index cache hit ratio" />
      </StatCard>
      <StatCard
        label="Connections"
        value={`${connections} / ${h.max_connections}`}
        status={connectionStatus}
        hint={Object.entries(h.connections).map(([state, n]) => `${n} ${state}`).join(" · ") || "No client connections"}
      >
        <Meter value={connectionUse} status={connectionStatus} label="Connections in use" />
      </StatCard>
      <StatCard
        label="Longest running query"
        value={h.longest_query_seconds > 0 ? formatDuration(h.longest_query_seconds) : "None"}
        status={h.longest_query_seconds > 60 ? "warning" : "good"}
        hint={`${h.waiting_locks} lock(s) waiting`}
      />
      <StatCard label="Transaction rollback rate" value={formatPercent(rollbackRate, 2)} hint={`${h.xact_commit.toLocaleString()} commits since stats reset`} />
      <StatCard label="Deadlocks" value={h.deadlocks} status={h.deadlocks > 0 ? "warning" : "good"} hint="Since stats reset" />
      <StatCard label="Temp files written" value={formatBytes(h.temp_bytes)} hint="Sorts/hashes that spilled to disk. Raise work_mem if large." />
    </div>
  );
}
