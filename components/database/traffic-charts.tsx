import { ColumnChart } from "@/components/charts/column-chart";
import { TimeSeriesChart } from "@/components/charts/time-series-chart";
import type { Series } from "@/components/charts/chart-utils";
import { Card } from "@/components/ui/card";
import { SetupNotice } from "@/components/ui/setup-notice";
import type { HourlyTraffic } from "@/types/metrics";
import type { Result } from "@/types/result";

// Error classes use status colors because their meaning *is* status.
const OUTCOME_SERIES: Series[] = [
  { key: "ok", label: "Success", color: "var(--color-series-1)" },
  { key: "clientErrors", label: "4xx client errors", color: "var(--color-status-warning)" },
  { key: "serverErrors", label: "5xx server errors", color: "var(--color-status-critical)" },
];

const LATENCY_SERIES: Series[] = [
  { key: "p50", label: "p50 (median)", color: "var(--color-series-1)" },
  { key: "p95", label: "p95", color: "var(--color-series-2)" },
];

type Props = { hourly: Result<HourlyTraffic[]>; title: string; description: string };

export function RequestsChartCard({ hourly, title, description }: Props) {
  return (
    <Card title={title} description={description}>
      {hourly.ok ? (
        <ColumnChart data={hourly.data} xKey="ts" xFormat="hour" series={OUTCOME_SERIES} stacked />
      ) : (
        <SetupNotice result={hourly} />
      )}
    </Card>
  );
}

export function LatencyChartCard({ hourly, title, description }: Props) {
  return (
    <Card title={title} description={description}>
      {hourly.ok ? (
        <TimeSeriesChart data={hourly.data} xKey="ts" xFormat="hour" series={LATENCY_SERIES} valueFormat="ms" />
      ) : (
        <SetupNotice result={hourly} />
      )}
    </Card>
  );
}
