import { PageHeader } from "@/components/layout/page-header";
import { TableCountsCard } from "@/components/database/table-counts-card";
import { getTableCounts } from "@/lib/queries/database";

export default async function DatabasePage() {
  const counts = await getTableCounts();

  return (
    <>
      <PageHeader title="Database" description="Row counts and growth across Rollin's Supabase tables" />
      <TableCountsCard counts={counts} />
    </>
  );
}
