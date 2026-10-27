import { Suspense } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { SectionTabs } from "@/components/layout/section";
import { Spinner } from "@/components/ui/spinner";
import { ApiSection } from "@/components/database/sections/api-section";
import { FunctionsSection } from "@/components/database/sections/functions-section";
import { HealthSection } from "@/components/database/sections/health-section";
import { LiveSection } from "@/components/database/sections/live-section";
import { QueriesSection } from "@/components/database/sections/queries-section";
import { TablesSection } from "@/components/database/sections/tables-section";
import { formatDate } from "@/lib/format";
import { getDbHealth } from "@/lib/queries/database";

const SECTIONS = [
  { id: "health", label: "Health" },
  { id: "api", label: "API traffic" },
  { id: "queries", label: "Queries" },
  { id: "tables", label: "Tables" },
  { id: "functions", label: "Edge functions" },
  { id: "live", label: "Live" },
] as const;

type SectionId = (typeof SECTIONS)[number]["id"];

export default async function DatabasePage({ searchParams }: { searchParams: Promise<{ section?: string }> }) {
  const params = await searchParams;
  const section: SectionId = SECTIONS.some((s) => s.id === params.section) ? (params.section as SectionId) : "health";

  const health = await getDbHealth();
  const statsSince = health.ok && health.data.stats_reset ? formatDate(health.data.stats_reset) : "the last stats reset";

  return (
    <>
      <PageHeader
        title="Database"
        description={`Logs cover the last 24 hours. Postgres counters run since ${statsSince}.`}
      />
      <SectionTabs items={SECTIONS} active={section} basePath="/database" />

      {/* Keyed so switching tabs shows the fallback instead of the previous section's stale content. */}
      <Suspense key={section} fallback={<Spinner />}>
        {section === "health" && <HealthSection health={health} />}
        {section === "api" && <ApiSection />}
        {section === "queries" && <QueriesSection />}
        {section === "tables" && <TablesSection />}
        {section === "functions" && <FunctionsSection />}
        {section === "live" && <LiveSection />}
      </Suspense>
    </>
  );
}
