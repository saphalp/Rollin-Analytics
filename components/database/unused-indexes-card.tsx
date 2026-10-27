import { Card } from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import { SetupNotice } from "@/components/ui/setup-notice";
import { StatusLabel } from "@/components/ui/status";
import { formatBytes } from "@/lib/format";
import type { UnusedIndex } from "@/types/metrics";
import type { Result } from "@/types/result";

export function UnusedIndexesCard({ indexes }: { indexes: Result<UnusedIndex[]> }) {
  return (
    <Card title="Unused indexes" description="Never scanned since stats reset. Unique and primary keys are excluded.">
      {!indexes.ok ? (
        <SetupNotice result={indexes} />
      ) : indexes.data.length === 0 ? (
        <StatusLabel status="good" label="Every index has been used" />
      ) : (
        <DataTable
          rows={indexes.data}
          rowKey={(i) => i.index_name}
          columns={[
            { header: "Index", cell: (i) => <code className="text-sm">{i.index_name}</code> },
            { header: "Table", cell: (i) => i.table_name },
            { header: "Size", className: "whitespace-nowrap text-right tabular-nums", cell: (i) => formatBytes(i.index_bytes) },
          ]}
        />
      )}
    </Card>
  );
}
