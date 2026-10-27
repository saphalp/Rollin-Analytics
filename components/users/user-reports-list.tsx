import Link from "next/link";
import { EmptyState } from "@/components/ui/empty-state";
import { ReportStatusBadge, ReportTargetBadge, formatReason } from "@/components/reports/report-status-badge";
import { snapshotLabel } from "@/components/reports/reports-table";
import { formatDate } from "@/lib/format";
import type { Report } from "@/types/reports";

export function UserReportsList({ reports }: { reports: Report[] }) {
  if (reports.length === 0) return <EmptyState title="No reports against this user" />;

  return (
    <ul className="divide-y divide-outline-variant/60">
      {reports.map((r) => (
        <li key={r.id} className="flex items-start justify-between gap-4 py-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <ReportTargetBadge type={r.target_type} />
              <Link href={`/reports/${r.id}`} className="font-medium capitalize text-primary hover:underline">
                {formatReason(r.reason)}
              </Link>
            </div>
            {r.target_type !== "user" && (
              <p className="mt-1 line-clamp-1 text-sm text-on-surface">{snapshotLabel(r)}</p>
            )}
            {r.details && <p className="mt-0.5 text-sm text-on-surface-variant">{r.details}</p>}
            <p className="mt-1 text-xs text-on-surface-variant">{formatDate(r.created_at)}</p>
          </div>
          <ReportStatusBadge status={r.status} />
        </li>
      ))}
    </ul>
  );
}
