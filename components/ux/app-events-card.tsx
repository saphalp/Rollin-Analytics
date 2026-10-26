import { Card } from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import { EmptyState } from "@/components/ui/empty-state";
import { Badge } from "@/components/ui/badge";
import { formatDateTime } from "@/lib/format";
import type { AppEvent } from "@/types/metrics";

export function AppEventsCard({ events }: { events: AppEvent[] | null }) {
  return (
    <Card title="Recent app events" description="Screen views, sessions and client errors">
      {events == null ? (
        <EmptyState title="Event tracking isn't set up yet">
          Apply <code>supabase/drafts/app_events.sql</code> and log events from the Rollin app.
        </EmptyState>
      ) : (
        <DataTable
          rows={events}
          rowKey={(r) => r.id}
          empty={<EmptyState title="No events yet" />}
          columns={[
            {
              header: "Type",
              cell: (r) => <Badge tone={r.event_type === "error" ? "danger" : "neutral"}>{r.event_type}</Badge>,
            },
            { header: "Screen", cell: (r) => r.screen ?? "—" },
            { header: "Platform", cell: (r) => r.platform ?? "—" },
            { header: "Version", cell: (r) => r.app_version ?? "—" },
            { header: "When", cell: (r) => formatDateTime(r.created_at) },
          ]}
        />
      )}
    </Card>
  );
}
