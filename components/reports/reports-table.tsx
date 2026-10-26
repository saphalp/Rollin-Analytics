import Link from "next/link";
import { DataTable } from "@/components/ui/data-table";
import { EmptyState } from "@/components/ui/empty-state";
import { ReportStatusBadge } from "@/components/reports/report-status-badge";
import { ReportActions } from "@/components/reports/report-actions";
import { formatDate } from "@/lib/format";
import type { ReportWithProfiles } from "@/lib/queries/reports";

export function ReportsTable({ reports }: { reports: ReportWithProfiles[] }) {
  return (
    <DataTable
      rows={reports}
      rowKey={(r) => r.id}
      empty={<EmptyState title="No reports match this filter" />}
      columns={[
        {
          header: "Reported user",
          cell: (r) => (
            <Link href={`/users/${r.reported_user_id}`} className="font-medium text-primary hover:underline">
              {r.reported?.full_name ?? r.reported?.email ?? r.reported_user_id}
            </Link>
          ),
        },
        { header: "Reason", cell: (r) => r.reason.replaceAll("_", " ") },
        { header: "Details", cell: (r) => <span className="line-clamp-2 max-w-sm">{r.details ?? "—"}</span> },
        { header: "Reporter", cell: (r) => r.reporter?.full_name ?? r.reporter?.email ?? "—" },
        { header: "Filed", cell: (r) => formatDate(r.created_at) },
        { header: "Status", cell: (r) => <ReportStatusBadge status={r.status} /> },
        { header: "", cell: (r) => <ReportActions reportId={r.id} status={r.status} /> },
      ]}
    />
  );
}
