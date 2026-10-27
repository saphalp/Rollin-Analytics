import { Card } from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import { EmptyState } from "@/components/ui/empty-state";
import type { TopActivity } from "@/types/metrics";

export function TopActivitiesCard({ activities }: { activities: TopActivity[] }) {
  return (
    <Card title="Most viewed activities" description="Unique viewers, from activity_views">
      <DataTable
        rows={activities}
        rowKey={(r) => r.activityId}
        empty={<EmptyState title="No activity views recorded yet" />}
        columns={[
          { header: "Activity", cell: (r) => r.title },
          { header: "Unique views", className: "whitespace-nowrap text-right tabular-nums", cell: (r) => r.views },
        ]}
      />
    </Card>
  );
}
