import { Section } from "@/components/layout/section";
import { TopQueriesCard } from "@/components/database/top-queries-card";
import { getTopQueries } from "@/lib/queries/database";

export async function QueriesSection() {
  const [slowestTotal, slowestMean] = await Promise.all([getTopQueries("total"), getTopQueries("mean")]);

  return (
    <Section id="queries" title="Query performance" description="From pg_stat_statements">
      <TopQueriesCard title="Most time-consuming" description="Statements that use the most total database time" queries={slowestTotal} />
      <TopQueriesCard title="Slowest on average" description="Highest mean execution time per call" queries={slowestMean} />
    </Section>
  );
}
