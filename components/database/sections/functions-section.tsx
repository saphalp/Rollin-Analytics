import { Section } from "@/components/layout/section";
import { LatencyChartCard, RequestsChartCard } from "@/components/database/traffic-charts";
import { FunctionErrorsCard } from "@/components/edge-functions/function-errors-card";
import { FunctionSummaryTiles } from "@/components/edge-functions/function-summary-tiles";
import { FunctionsTableCard } from "@/components/edge-functions/functions-table-card";
import { getEdgeFunctions, getFunctionErrors, getFunctionHourly, getFunctionStats } from "@/lib/queries/platform";

export async function FunctionsSection() {
  const edgeFunctions = await getEdgeFunctions();
  const [hourly, stats, errors] = await Promise.all([
    getFunctionHourly(),
    getFunctionStats(edgeFunctions),
    getFunctionErrors(edgeFunctions),
  ]);

  return (
    <Section id="functions" title="Edge functions" description="Invocations from function_edge_logs, last 24 hours">
      <FunctionSummaryTiles stats={stats} />
      <div className="grid gap-4 xl:grid-cols-2">
        <RequestsChartCard hourly={hourly} title="Invocations per hour" description="By outcome, last 24 hours" />
        <LatencyChartCard hourly={hourly} title="Execution time" description="Function execution time per hour" />
      </div>
      <FunctionsTableCard stats={stats} />
      <FunctionErrorsCard errors={errors} />
    </Section>
  );
}
