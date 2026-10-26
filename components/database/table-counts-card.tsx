import { Card } from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import { Badge } from "@/components/ui/badge";
import { formatNumber } from "@/lib/format";
import type { TableCount } from "@/types/metrics";

export function TableCountsCard({ counts }: { counts: TableCount[] }) {
  return (
    <Card title="Table row counts" description="Exact counts via the service-role client">
      <DataTable
        rows={[...counts].sort((a, b) => (b.count ?? -1) - (a.count ?? -1))}
        rowKey={(r) => r.table}
        columns={[
          { header: "Table", cell: (r) => <code className="text-sm">{r.table}</code> },
          {
            header: "Rows",
            className: "text-right tabular-nums",
            cell: (r) => (r.count == null ? <Badge tone="warning">unavailable</Badge> : formatNumber(r.count)),
          },
        ]}
      />
    </Card>
  );
}
