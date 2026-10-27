import { ChartTable } from "@/components/charts/chart-table";
import { TimeSeriesChart } from "@/components/charts/time-series-chart";
import type { Datum } from "@/components/charts/chart-utils";
import { Card } from "@/components/ui/card";
import { SetupNotice } from "@/components/ui/setup-notice";
import { formatNumber } from "@/lib/format";
import type { DailyCount, DailyMetric } from "@/types/metrics";
import type { Result } from "@/types/result";

const METRICS: { key: DailyMetric; label: string }[] = [
  { key: "activities", label: "Activities created" },
  { key: "rsvps", label: "RSVPs" },
  { key: "messages", label: "Messages sent" },
  { key: "rides_offered", label: "Rides offered" },
  { key: "ride_requests", label: "Ride requests" },
];

// Small multiples: each metric has its own scale, so totals are labeled rather than compared by height.
export function ContentActivityCard({ daily }: { daily: Result<DailyCount[]> }) {
  if (!daily.ok) {
    return (
      <Card title="App activity">
        <SetupNotice result={daily} />
      </Card>
    );
  }

  const byDay = new Map<string, Datum>();
  for (const d of daily.data) {
    const row = byDay.get(d.day) ?? { day: d.day };
    row[d.metric] = d.count;
    byDay.set(d.day, row);
  }
  const rows = [...byDay.values()];

  return (
    <Card title="App activity" description="Rows created per day, last 30 days (UTC). Each chart has its own scale.">
      <div className="grid gap-x-6 gap-y-5 sm:grid-cols-2 xl:grid-cols-5">
        {METRICS.map((m) => {
          const total = rows.reduce((a, r) => a + Number(r[m.key] ?? 0), 0);
          return (
            <div key={m.key}>
              <p className="text-sm text-on-surface-variant">{m.label}</p>
              <p className="text-xl font-semibold text-on-surface">{formatNumber(total)}</p>
              <TimeSeriesChart
                data={rows}
                xKey="day"
                xFormat="day"
                series={[{ key: m.key, label: m.label, color: "var(--color-series-1)" }]}
                variant="area"
                height={64}
                compact
                showTable={false}
              />
            </div>
          );
        })}
      </div>
      <ChartTable
        data={rows}
        xKey="day"
        xFormat="day"
        series={METRICS.map((m) => ({ key: m.key, label: m.label, color: "var(--color-series-1)" }))}
      />
    </Card>
  );
}
