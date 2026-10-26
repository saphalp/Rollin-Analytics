import { EmptyState } from "@/components/ui/empty-state";
import { ReportStatusBadge } from "@/components/reports/report-status-badge";
import { formatDate } from "@/lib/format";
import type { UserReport } from "@/types/reports";

export function UserReportsList({ reports }: { reports: UserReport[] }) {
  if (reports.length === 0) return <EmptyState title="No reports against this user" />;

  return (
    <ul className="divide-y divide-outline-variant/60">
      {reports.map((r) => (
        <li key={r.id} className="flex items-start justify-between gap-4 py-3">
          <div>
            <p className="font-medium capitalize text-on-surface">{r.reason.replaceAll("_", " ")}</p>
            {r.details && <p className="mt-0.5 text-sm text-on-surface-variant">{r.details}</p>}
            <p className="mt-1 text-xs text-on-surface-variant">{formatDate(r.created_at)}</p>
          </div>
          <ReportStatusBadge status={r.status} />
        </li>
      ))}
    </ul>
  );
}
