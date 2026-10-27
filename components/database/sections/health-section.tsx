import { Section } from "@/components/layout/section";
import { AdvisoriesCard } from "@/components/database/advisories-card";
import { DbHealthTiles } from "@/components/database/db-health-tiles";
import { buildAdvisories } from "@/lib/advisories";
import { getTableStats, getUnusedIndexes } from "@/lib/queries/database";
import { getApiSummary, getEdgeFunctions, getFunctionStats } from "@/lib/queries/platform";
import type { DbHealth } from "@/types/metrics";
import type { Result } from "@/types/result";

// The page already loads health for its header, so it's passed in rather than fetched twice.
export async function HealthSection({ health }: { health: Result<DbHealth> }) {
  const [tables, unusedIndexes, api, functions] = await Promise.all([
    getTableStats(),
    getUnusedIndexes(),
    getApiSummary(),
    getEdgeFunctions().then(getFunctionStats),
  ]);
  const advisories = buildAdvisories({ health, tables, unusedIndexes, api, functions });

  return (
    <Section id="health" title="Health">
      <DbHealthTiles health={health} />
      <AdvisoriesCard advisories={advisories} />
    </Section>
  );
}
