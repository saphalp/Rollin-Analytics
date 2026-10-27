import { Card } from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import { EmptyState } from "@/components/ui/empty-state";
import { SetupNotice } from "@/components/ui/setup-notice";
import { formatMs, formatNumber, formatPercent } from "@/lib/format";
import type { QueryStat } from "@/types/metrics";
import type { Result } from "@/types/result";

type Props = {
  title: string;
  description: string;
  queries: Result<QueryStat[]>;
};

export function TopQueriesCard({ title, description, queries }: Props) {
  return (
    <Card title={title} description={description}>
      {!queries.ok ? (
        <SetupNotice result={queries} />
      ) : (
        <DataTable
          rows={queries.data}
          rowKey={(q) => q.query_id}
          empty={<EmptyState title="No statements recorded yet" />}
          columns={[
            {
              header: "Query",
              cell: (q) => (
                <div className="max-w-xl">
                  <code className="line-clamp-2 break-all text-xs" title={q.query}>
                    {q.query}
                  </code>
                  <span className="text-xs text-on-surface-variant">{q.role}</span>
                </div>
              ),
            },
            { header: "Calls", className: "whitespace-nowrap text-right tabular-nums", cell: (q) => formatNumber(q.calls) },
            { header: "Mean", className: "whitespace-nowrap text-right tabular-nums", cell: (q) => formatMs(q.mean_ms) },
            { header: "Max", className: "whitespace-nowrap text-right tabular-nums", cell: (q) => formatMs(q.max_ms) },
            {
              header: "Share of DB time",
              className: "w-40",
              cell: (q) => (
                <div className="flex items-center gap-2">
                  <div className="h-2 flex-1">
                    <div className="h-2 rounded-r-[4px] bg-series-1" style={{ width: `${(q.share ?? 0) * 100}%` }} />
                  </div>
                  <span className="w-12 text-right text-xs tabular-nums">{formatPercent(q.share)}</span>
                </div>
              ),
            },
            { header: "Cache hit", className: "whitespace-nowrap text-right tabular-nums", cell: (q) => formatPercent(q.cache_hit_ratio) },
          ]}
        />
      )}
    </Card>
  );
}
