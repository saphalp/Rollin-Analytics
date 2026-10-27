import { Card } from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import { EmptyState } from "@/components/ui/empty-state";
import { SetupNotice } from "@/components/ui/setup-notice";
import { Badge } from "@/components/ui/badge";
import { formatMs, formatNumber, formatPercent, formatRelative } from "@/lib/format";
import type { FunctionStat } from "@/types/metrics";
import type { Result } from "@/types/result";

export function FunctionsTableCard({ stats }: { stats: Result<FunctionStat[]> }) {
  if (!stats.ok) {
    return (
      <Card title="Functions">
        <SetupNotice result={stats} />
      </Card>
    );
  }
  const max = Math.max(...stats.data.map((f) => f.invocations), 1);

  return (
    <Card title="Functions" description="Per-function invocations and execution time, last 24 hours">
      <DataTable
        rows={stats.data}
        rowKey={(f) => f.functionId}
        empty={<EmptyState title="No edge functions deployed" />}
        columns={[
          {
            header: "Function",
            cell: (f) => (
              <div>
                <code className="text-sm">{f.slug}</code>
                <p className="text-xs text-on-surface-variant">
                  {f.version != null ? `v${f.version} · deployed ${formatRelative(f.updatedAt)}` : "no longer deployed"}
                </p>
              </div>
            ),
          },
          {
            header: "Status",
            cell: (f) =>
              f.status ? <Badge tone={f.status === "ACTIVE" ? "success" : "warning"}>{f.status.toLowerCase()}</Badge> : "—",
          },
          {
            header: "Invocations",
            className: "w-44",
            cell: (f) => (
              <div className="flex items-center gap-2">
                <div className="h-2 flex-1">
                  <div className="h-2 min-w-0.5 rounded-r-[4px] bg-series-1" style={{ width: `${(f.invocations / max) * 100}%` }} />
                </div>
                <span className="w-12 text-right text-xs tabular-nums">{formatNumber(f.invocations)}</span>
              </div>
            ),
          },
          {
            header: "5xx",
            className: "whitespace-nowrap text-right tabular-nums",
            cell: (f) => (f.invocations ? `${formatNumber(f.serverErrors)} (${formatPercent(f.serverErrors / f.invocations, 1)})` : "—"),
          },
          { header: "4xx", className: "whitespace-nowrap text-right tabular-nums", cell: (f) => formatNumber(f.clientErrors) },
          { header: "Avg", className: "whitespace-nowrap text-right tabular-nums", cell: (f) => formatMs(f.avgMs) },
          { header: "p95", className: "whitespace-nowrap text-right tabular-nums", cell: (f) => formatMs(f.p95Ms) },
          { header: "Max", className: "whitespace-nowrap text-right tabular-nums", cell: (f) => formatMs(f.maxMs) },
        ]}
      />
    </Card>
  );
}
