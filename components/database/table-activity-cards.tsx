import { BarList } from "@/components/charts/bar-list";
import { Card } from "@/components/ui/card";
import { SetupNotice } from "@/components/ui/setup-notice";
import { formatPercent } from "@/lib/format";
import type { TableStat } from "@/types/metrics";
import type { Result } from "@/types/result";

const TOP = 10;

// What Postgres itself sees: scans (reads) and row writes per table since stats reset.
export function TableActivityCards({ tables }: { tables: Result<TableStat[]> }) {
  if (!tables.ok) return <SetupNotice result={tables} />;

  const reads = [...tables.data]
    .map((t) => ({ t, value: t.seq_scan + t.idx_scan }))
    .sort((a, b) => b.value - a.value)
    .slice(0, TOP)
    .map(({ t, value }) => ({
      label: t.table_name,
      value,
      detail: `${formatPercent(t.idx_scan / Math.max(value, 1), 0)} via index`,
    }));

  const writes = [...tables.data]
    .map((t) => ({ t, value: t.inserts + t.updates + t.deletes }))
    .sort((a, b) => b.value - a.value)
    .slice(0, TOP)
    .map(({ t, value }) => ({
      label: t.table_name,
      value,
      detail: `${t.inserts.toLocaleString()} inserts · ${t.updates.toLocaleString()} updates · ${t.deletes.toLocaleString()} deletes`,
    }));

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card title="Most read tables" description="Sequential + index scans since stats reset">
        <BarList rows={reads} valueFormat="compact" />
      </Card>
      <Card title="Most written tables" description="Rows inserted, updated and deleted since stats reset">
        <BarList rows={writes} valueFormat="compact" color="var(--color-series-2)" />
      </Card>
    </div>
  );
}
