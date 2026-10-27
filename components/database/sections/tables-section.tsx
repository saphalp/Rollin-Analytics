import { Section } from "@/components/layout/section";
import { TableActivityCards } from "@/components/database/table-activity-cards";
import { TableStatsCard } from "@/components/database/table-stats-card";
import { UnusedIndexesCard } from "@/components/database/unused-indexes-card";
import { getTableStats, getUnusedIndexes } from "@/lib/queries/database";

export async function TablesSection() {
  const [tables, unusedIndexes] = await Promise.all([getTableStats(), getUnusedIndexes()]);

  return (
    <Section id="tables" title="Tables">
      <TableActivityCards tables={tables} />
      <TableStatsCard tables={tables} />
      <UnusedIndexesCard indexes={unusedIndexes} />
    </Section>
  );
}
