import { StatCard } from "@/components/ui/stat-card";
import { SetupNotice } from "@/components/ui/setup-notice";
import { formatMs, formatPercent } from "@/lib/format";
import type { FunctionStat } from "@/types/metrics";
import type { Result } from "@/types/result";

export function FunctionSummaryTiles({ stats }: { stats: Result<FunctionStat[]> }) {
  if (!stats.ok) return <SetupNotice result={stats} />;

  const invocations = stats.data.reduce((a, f) => a + f.invocations, 0);
  const serverErrors = stats.data.reduce((a, f) => a + f.serverErrors, 0);
  const errorRate = invocations ? serverErrors / invocations : 0;
  const slowest = stats.data.filter((f) => f.p95Ms != null).sort((a, b) => (b.p95Ms ?? 0) - (a.p95Ms ?? 0))[0];
  const deployed = stats.data.filter((f) => f.status === "ACTIVE").length;

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <StatCard label="Invocations (24h)" value={invocations} />
      <StatCard
        label="5xx error rate (24h)"
        value={formatPercent(errorRate, 2)}
        status={errorRate > 0.05 ? "critical" : errorRate > 0.02 ? "serious" : errorRate > 0 ? "warning" : "good"}
        hint={`${serverErrors.toLocaleString()} failed invocations`}
      />
      <StatCard
        label="Slowest function (p95)"
        value={slowest ? formatMs(slowest.p95Ms) : "—"}
        hint={slowest ? slowest.slug : "No invocations yet"}
      />
      <StatCard label="Active functions" value={deployed} hint={`${stats.data.length} known in total`} />
    </div>
  );
}
