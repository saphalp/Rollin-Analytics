import { Card } from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import { SetupNotice } from "@/components/ui/setup-notice";
import { Badge } from "@/components/ui/badge";
import { StatusLabel } from "@/components/ui/status";
import { formatDuration } from "@/lib/format";
import type { ActiveQuery } from "@/types/metrics";
import type { Result } from "@/types/result";

export function ActiveQueriesCard({ queries }: { queries: Result<ActiveQuery[]> }) {
  return (
    <Card title="Active queries" description="Non-idle connections at the moment this page loaded">
      {!queries.ok ? (
        <SetupNotice result={queries} />
      ) : queries.data.length === 0 ? (
        <StatusLabel status="good" label="Nothing running right now" />
      ) : (
        <DataTable
          rows={queries.data}
          rowKey={(q) => String(q.pid)}
          columns={[
            {
              header: "Query",
              cell: (q) => (
                <code className="line-clamp-2 max-w-xl break-all text-xs" title={q.query}>
                  {q.query}
                </code>
              ),
            },
            { header: "State", cell: (q) => <Badge tone={q.state === "active" ? "primary" : "warning"}>{q.state}</Badge> },
            { header: "Running for", className: "whitespace-nowrap tabular-nums", cell: (q) => formatDuration(q.duration_seconds) },
            { header: "Waiting on", cell: (q) => q.wait_event ?? "—" },
            { header: "Role / app", cell: (q) => `${q.role}${q.application ? ` · ${q.application}` : ""}` },
          ]}
        />
      )}
    </Card>
  );
}
