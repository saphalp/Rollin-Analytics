import { PageHeader } from "@/components/layout/page-header";
import { OverviewStats } from "@/components/overview/overview-stats";
import { getSignupsSince, getTableCounts } from "@/lib/queries/database";
import { getOpenReportCount } from "@/lib/queries/reports";

export default async function OverviewPage() {
  const [counts, newUsers7d, openReports] = await Promise.all([
    getTableCounts(),
    getSignupsSince(7),
    getOpenReportCount(),
  ]);
  const countOf = (table: string) => counts.find((c) => c.table === table)?.count ?? null;

  return (
    <>
      <PageHeader title="Overview" description="A quick read on Rollin's health" />
      <OverviewStats
        totalUsers={countOf("profiles")}
        newUsers7d={newUsers7d}
        totalActivities={countOf("activities")}
        openReports={openReports}
      />
    </>
  );
}
