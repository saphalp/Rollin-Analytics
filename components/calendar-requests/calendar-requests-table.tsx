import Link from "next/link";
import { CalendarRequestActions } from "@/components/calendar-requests/calendar-request-actions";
import { Badge, type BadgeTone } from "@/components/ui/badge";
import { DataTable } from "@/components/ui/data-table";
import { EmptyState } from "@/components/ui/empty-state";
import { formatDate } from "@/lib/format";
import type { CalendarSubmissionRow, CalendarSubmissionStatus } from "@/types/calendar-submissions";

const toneByStatus: Record<CalendarSubmissionStatus, BadgeTone> = {
  pending: "warning",
  approved: "success",
  rejected: "neutral",
};

// The URL is user-submitted, so only http(s) is ever rendered as a link (never javascript: etc).
function parseHttpUrl(raw: string) {
  try {
    const url = new URL(raw);
    return url.protocol === "http:" || url.protocol === "https:" ? url : null;
  } catch {
    return null;
  }
}

function CalendarLink({ row }: { row: CalendarSubmissionRow }) {
  const url = parseHttpUrl(row.calendar_url);
  if (!url) {
    return (
      <div className="space-y-1">
        <p className="break-all text-on-surface-variant">{row.calendar_url}</p>
        <Badge tone="danger">Not a web link</Badge>
      </div>
    );
  }

  return (
    <div className="max-w-md space-y-1">
      <a
        href={url.href}
        target="_blank"
        rel="noopener noreferrer nofollow"
        className="block break-all font-medium text-primary hover:underline"
      >
        {row.calendar_url}
      </a>
      <div className="flex flex-wrap items-center gap-1.5 text-xs text-on-surface-variant">
        <span>{url.hostname}</span>
        {url.protocol === "http:" && <Badge tone="warning">Not HTTPS</Badge>}
      </div>
    </div>
  );
}

export function CalendarRequestsTable({ rows }: { rows: CalendarSubmissionRow[] }) {
  return (
    <DataTable
      rows={rows}
      rowKey={(r) => r.id}
      empty={<EmptyState title="No calendar requests here" />}
      columns={[
        {
          header: "University",
          cell: (r) => r.university?.name ?? <span className="text-on-surface-variant">{r.university_id}</span>,
        },
        { header: "Calendar link", cell: (r) => <CalendarLink row={r} /> },
        {
          header: "Submitted by",
          cell: (r) =>
            r.submitter ? (
              <Link href={`/users/${r.submitter.id}`} className="hover:underline">
                {r.submitter.full_name ?? r.submitter.email}
              </Link>
            ) : (
              "Unknown user"
            ),
        },
        { header: "Submitted", cell: (r) => formatDate(r.submitted_at) },
        {
          header: "Status",
          cell: (r) => (
            <div className="space-y-1">
              <Badge tone={toneByStatus[r.status]}>
                <span className="capitalize">{r.status}</span>
              </Badge>
              {r.reviewed_at && <p className="text-xs text-on-surface-variant">{formatDate(r.reviewed_at)}</p>}
              {r.review_notes && <p className="max-w-48 text-xs text-on-surface-variant">{r.review_notes}</p>}
            </div>
          ),
        },
        {
          header: "",
          className: "text-right",
          cell: (r) => (r.status === "pending" ? <CalendarRequestActions id={r.id} url={r.calendar_url} /> : null),
        },
      ]}
    />
  );
}
