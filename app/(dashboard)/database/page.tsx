import { PageHeader } from "@/components/layout/page-header";
import { Section, SectionNav } from "@/components/layout/section";
import { ActiveQueriesCard } from "@/components/database/active-queries-card";
import { AdvisoriesCard } from "@/components/database/advisories-card";
import { ApiBreakdownCard } from "@/components/database/api-breakdown-card";
import { DbHealthTiles } from "@/components/database/db-health-tiles";
import { TableActivityCards } from "@/components/database/table-activity-cards";
import { TableStatsCard } from "@/components/database/table-stats-card";
import { TopQueriesCard } from "@/components/database/top-queries-card";
import { LatencyChartCard, RequestsChartCard } from "@/components/database/traffic-charts";
import { UnusedIndexesCard } from "@/components/database/unused-indexes-card";
import { FunctionErrorsCard } from "@/components/edge-functions/function-errors-card";
import { FunctionSummaryTiles } from "@/components/edge-functions/function-summary-tiles";
import { FunctionsTableCard } from "@/components/edge-functions/functions-table-card";
import { buildAdvisories } from "@/lib/advisories";
import { formatDate } from "@/lib/format";
import {
  getActiveQueries,
  getDbHealth,
  getTableStats,
  getTopQueries,
  getUnusedIndexes,
} from "@/lib/queries/database";
import {
  getApiByService,
  getApiByTable,
  getApiHourly,
  getApiSummary,
  getEdgeFunctions,
  getFunctionErrors,
  getFunctionHourly,
  getFunctionStats,
} from "@/lib/queries/platform";

const SECTIONS = [
  { id: "health", label: "Health" },
  { id: "api", label: "API traffic" },
  { id: "queries", label: "Queries" },
  { id: "tables", label: "Tables" },
  { id: "functions", label: "Edge functions" },
  { id: "live", label: "Live" },
];

export default async function DatabasePage() {
  const edgeFunctions = await getEdgeFunctions();
  const [
    health,
    tables,
    unusedIndexes,
    activeQueries,
    slowestTotal,
    slowestMean,
    apiSummary,
    apiHourly,
    apiByService,
    apiByTable,
    functionHourly,
    functionStats,
    functionErrors,
  ] = await Promise.all([
    getDbHealth(),
    getTableStats(),
    getUnusedIndexes(),
    getActiveQueries(),
    getTopQueries("total"),
    getTopQueries("mean"),
    getApiSummary(),
    getApiHourly(),
    getApiByService(),
    getApiByTable(),
    getFunctionHourly(),
    getFunctionStats(edgeFunctions),
    getFunctionErrors(edgeFunctions),
  ]);

  const advisories = buildAdvisories({ health, tables, unusedIndexes, api: apiSummary, functions: functionStats });
  const statsSince = health.ok && health.data.stats_reset ? formatDate(health.data.stats_reset) : "the last stats reset";

  return (
    <>
      <PageHeader
        title="Database"
        description={`Logs cover the last 24 hours. Postgres counters run since ${statsSince}.`}
      />
      <SectionNav items={SECTIONS} />

      <div className="grid gap-10">
        <Section id="health" title="Health">
          <DbHealthTiles health={health} />
          <AdvisoriesCard advisories={advisories} />
        </Section>

        <Section id="api" title="API traffic" description="Every request through the Supabase API gateway">
          <div className="grid gap-4 xl:grid-cols-2">
            <RequestsChartCard hourly={apiHourly} title="Requests per hour" description="By outcome, last 24 hours" />
            <LatencyChartCard hourly={apiHourly} title="Response time" description="Upstream response time per hour" />
          </div>
          <div className="grid gap-4 lg:grid-cols-2">
            <ApiBreakdownCard
              title="Most requested tables"
              description="PostgREST requests per table or RPC, last 24 hours"
              breakdown={apiByTable}
              errorLabel="errors (4xx/5xx)"
            />
            <ApiBreakdownCard
              title="Requests by service"
              description="REST, Auth, Storage, Realtime, Functions"
              breakdown={apiByService}
              errorLabel="server errors"
            />
          </div>
        </Section>

        <Section id="queries" title="Query performance" description="From pg_stat_statements">
          <TopQueriesCard title="Most time-consuming" description="Statements that use the most total database time" queries={slowestTotal} />
          <TopQueriesCard title="Slowest on average" description="Highest mean execution time per call" queries={slowestMean} />
        </Section>

        <Section id="tables" title="Tables">
          <TableActivityCards tables={tables} />
          <TableStatsCard tables={tables} />
          <UnusedIndexesCard indexes={unusedIndexes} />
        </Section>

        <Section id="functions" title="Edge functions" description="Invocations from function_edge_logs, last 24 hours">
          <FunctionSummaryTiles stats={functionStats} />
          <div className="grid gap-4 xl:grid-cols-2">
            <RequestsChartCard hourly={functionHourly} title="Invocations per hour" description="By outcome, last 24 hours" />
            <LatencyChartCard hourly={functionHourly} title="Execution time" description="Function execution time per hour" />
          </div>
          <FunctionsTableCard stats={functionStats} />
          <FunctionErrorsCard errors={functionErrors} />
        </Section>

        <Section id="live" title="Live">
          <ActiveQueriesCard queries={activeQueries} />
        </Section>
      </div>
    </>
  );
}
