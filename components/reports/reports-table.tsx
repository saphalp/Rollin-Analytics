import Link from "next/link";
import { DataTable } from "@/components/ui/data-table";
import { EmptyState } from "@/components/ui/empty-state";
import { ReportStatusBadge, ReportTargetBadge, formatReason } from "@/components/reports/report-status-badge";
import { formatDate } from "@/lib/format";
import type { Report, ReportWithProfiles } from "@/types/reports";

// One-line description of the reported thing, from the snapshot taken when the report was filed.
export function snapshotLabel(r: Pick<Report, "target_type" | "target_snapshot">) {
  const s = r.target_snapshot;
  if (r.target_type === "user") return s.full_name ?? "Unnamed user";
  if (r.target_type === "activity") return s.title ?? "Untitled activity";
  return s.caption?.trim() || `Photo post (${s.image_paths?.length ?? 0} images)`;
}

export function ReportsTable({ reports }: { reports: ReportWithProfiles[] }) {
  return (
    <DataTable
      rows={reports}
      rowKey={(r) => r.id}
      empty={<EmptyState title="No reports match this filter" />}
      columns={[
        { header: "Type", cell: (r) => <ReportTargetBadge type={r.target_type} /> },
        {
          header: "Reported content",
          cell: (r) => (
            <Link href={`/reports/${r.id}`} className="line-clamp-2 max-w-xs font-medium text-primary hover:underline">
              {snapshotLabel(r)}
            </Link>
          ),
        },
        {
          header: "Owner",
          cell: (r) =>
            r.reported ? (
              <Link href={`/users/${r.reported.id}`} className="hover:underline">
                {r.reported.full_name ?? r.reported.email}
              </Link>
            ) : (
              "Deleted account"
            ),
        },
        { header: "Reason", cell: (r) => <span className="capitalize">{formatReason(r.reason)}</span> },
        { header: "Reporter", cell: (r) => r.reporter?.full_name ?? r.reporter?.email ?? "—" },
        { header: "Filed", cell: (r) => formatDate(r.created_at) },
        { header: "Status", cell: (r) => <ReportStatusBadge status={r.status} /> },
        {
          header: "",
          cell: (r) => (
            <Link
              href={`/reports/${r.id}`}
              className="rounded-md border border-outline-variant px-2.5 py-1 text-sm hover:bg-surface-container"
            >
              Review
            </Link>
          ),
        },
      ]}
    />
  );
}
