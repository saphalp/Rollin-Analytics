import { Section } from "@/components/layout/section";
import { ApiBreakdownCard } from "@/components/database/api-breakdown-card";
import { LatencyChartCard, RequestsChartCard } from "@/components/database/traffic-charts";
import { getApiByService, getApiByTable, getApiHourly } from "@/lib/queries/platform";

export async function ApiSection() {
  const [hourly, byService, byTable] = await Promise.all([getApiHourly(), getApiByService(), getApiByTable()]);

  return (
    <Section id="api" title="API traffic" description="Every request through the Supabase API gateway">
      <div className="grid gap-4 xl:grid-cols-2">
        <RequestsChartCard hourly={hourly} title="Requests per hour" description="By outcome, last 24 hours" />
        <LatencyChartCard hourly={hourly} title="Response time" description="Upstream response time per hour" />
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <ApiBreakdownCard
          title="Most requested tables"
          description="PostgREST requests per table or RPC, last 24 hours"
          breakdown={byTable}
          errorLabel="errors (4xx/5xx)"
        />
        <ApiBreakdownCard
          title="Requests by service"
          description="REST, Auth, Storage, Realtime, Functions"
          breakdown={byService}
          errorLabel="server errors"
        />
      </div>
    </Section>
  );
}
