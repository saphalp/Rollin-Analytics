import { BarList } from "@/components/charts/bar-list";
import { Card } from "@/components/ui/card";
import { SetupNotice } from "@/components/ui/setup-notice";
import { formatMs, formatNumber } from "@/lib/format";
import type { TrafficBreakdown } from "@/types/metrics";
import type { Result } from "@/types/result";

type Props = {
  title: string;
  description: string;
  breakdown: Result<TrafficBreakdown[]>;
  errorLabel: string;
};

export function ApiBreakdownCard({ title, description, breakdown, errorLabel }: Props) {
  return (
    <Card title={title} description={description}>
      {breakdown.ok ? (
        <BarList
          rows={breakdown.data.map((b) => ({
            label: b.name,
            value: b.requests,
            detail: `${formatNumber(b.errors)} ${errorLabel} · p95 ${formatMs(b.p95)}`,
          }))}
          emptyText="No requests in the last 24 hours"
        />
      ) : (
        <SetupNotice result={breakdown} />
      )}
    </Card>
  );
}
