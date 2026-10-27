import Link from "next/link";
import { EmptyState } from "@/components/ui/empty-state";
import { ReportStatusBadge, formatReason } from "@/components/reports/report-status-badge";
import { formatDateTime } from "@/lib/format";
import type { ReportWithProfiles } from "@/types/reports";

export function TargetReportsList({ reports, currentId }: { reports: ReportWithProfiles[]; currentId: string }) {
  if (reports.length === 0) return <EmptyState title="No reports" />;

  return (
    <ul className="divide-y divide-outline-variant/60">
      {reports.map((r) => (
        <li key={r.id} className="flex items-start justify-between gap-4 py-3">
          <div className="min-w-0">
            <p className="font-medium capitalize text-on-surface">
              {r.id === currentId ? (
                formatReason(r.reason)
              ) : (
                <Link href={`/reports/${r.id}`} className="text-primary hover:underline">
                  {formatReason(r.reason)}
                </Link>
              )}
              {r.id === currentId && <span className="ml-2 text-xs font-normal normal-case text-on-surface-variant">(this report)</span>}
            </p>
            {r.details && <p className="mt-0.5 text-sm text-on-surface-variant">{r.details}</p>}
            <p className="mt-1 text-xs text-on-surface-variant">
              {r.reporter?.full_name ?? r.reporter?.email ?? "Deleted account"} · {formatDateTime(r.created_at)}
            </p>
          </div>
          <ReportStatusBadge status={r.status} />
        </li>
      ))}
    </ul>
  );
}
