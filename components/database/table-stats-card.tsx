import { Card } from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import { SetupNotice } from "@/components/ui/setup-notice";
import { StatusIcon } from "@/components/ui/status";
import { formatBytes, formatNumber, formatPercent, formatRelative } from "@/lib/format";
import type { TableStat } from "@/types/metrics";
import type { Result } from "@/types/result";

export function TableStatsCard({ tables }: { tables: Result<TableStat[]> }) {
  if (!tables.ok) {
    return (
      <Card title="Tables">
        <SetupNotice result={tables} />
      </Card>
    );
  }
  const maxBytes = Math.max(...tables.data.map((t) => t.total_bytes), 1);

  return (
    <Card title="Tables" description="Size, row estimates and vacuum state for the public schema">
      <DataTable
        rows={tables.data}
        rowKey={(t) => t.table_name}
        columns={[
          { header: "Table", cell: (t) => <code className="text-sm">{t.table_name}</code> },
          {
            header: "Size",
            className: "w-44",
            cell: (t) => (
              <div className="flex items-center gap-2" title={`${formatBytes(t.table_bytes)} data · ${formatBytes(t.index_bytes)} indexes`}>
                <div className="h-2 flex-1">
                  <div className="h-2 rounded-r-[4px] bg-series-1" style={{ width: `${(t.total_bytes / maxBytes) * 100}%` }} />
                </div>
                <span className="w-16 text-right text-xs tabular-nums">{formatBytes(t.total_bytes)}</span>
              </div>
            ),
          },
          { header: "Rows (est.)", className: "whitespace-nowrap text-right tabular-nums", cell: (t) => formatNumber(t.live_rows) },
          {
            header: "Dead rows",
            className: "whitespace-nowrap text-right tabular-nums",
            cell: (t) => {
              const ratio = t.dead_rows / Math.max(t.live_rows + t.dead_rows, 1);
              return (
                <span className="inline-flex items-center gap-1">
                  {t.dead_rows > 1000 && ratio > 0.2 && <StatusIcon status="warning" className="size-3.5" />}
                  {formatPercent(ratio, 0)}
                </span>
              );
            },
          },
          {
            header: "Index scans",
            className: "whitespace-nowrap text-right tabular-nums",
            cell: (t) => formatPercent(t.idx_scan / Math.max(t.seq_scan + t.idx_scan, 1), 0),
          },
          { header: "Last vacuum", className: "whitespace-nowrap", cell: (t) => formatRelative(t.last_vacuum) },
          { header: "Last analyze", className: "whitespace-nowrap", cell: (t) => formatRelative(t.last_analyze) },
        ]}
      />
    </Card>
  );
}
