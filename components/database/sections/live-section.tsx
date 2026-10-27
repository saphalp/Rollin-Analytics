import { Section } from "@/components/layout/section";
import { ActiveQueriesCard } from "@/components/database/active-queries-card";
import { getActiveQueries } from "@/lib/queries/database";

export async function LiveSection() {
  const queries = await getActiveQueries();

  return (
    <Section id="live" title="Live">
      <ActiveQueriesCard queries={queries} />
    </Section>
  );
}
