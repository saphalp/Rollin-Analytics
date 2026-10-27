import { ColumnChart } from "@/components/charts/column-chart";
import { Card } from "@/components/ui/card";
import { SetupNotice } from "@/components/ui/setup-notice";
import type { DailyCount } from "@/types/metrics";
import type { Result } from "@/types/result";

export function SignupsCard({ daily }: { daily: Result<DailyCount[]> }) {
  return (
    <Card title="Signups per day" description="New profiles, last 30 days (UTC)">
      {daily.ok ? (
        <ColumnChart
          data={daily.data.filter((d) => d.metric === "signups").map((d) => ({ day: d.day, signups: d.count }))}
          xKey="day"
          xFormat="day"
          series={[{ key: "signups", label: "Signups", color: "var(--color-series-1)" }]}
        />
      ) : (
        <SetupNotice result={daily} />
      )}
    </Card>
  );
}
