import { PageHeader } from "@/components/layout/page-header";
import { ContentActivityCard } from "@/components/overview/content-activity-card";
import { OverviewStats } from "@/components/overview/overview-stats";
import { ServiceHealthStrip } from "@/components/overview/service-health-strip";
import { SignupsCard } from "@/components/overview/signups-card";
import { getDailyCounts, getTotalUsers } from "@/lib/queries/database";
import { getApiHourly, getApiSummary, getServiceHealth } from "@/lib/queries/platform";
import { getOpenReportCount } from "@/lib/queries/reports";

export default async function OverviewPage() {
  const [totalUsers, daily, openReports, health, api, apiHourly] = await Promise.all([
    getTotalUsers(),
    getDailyCounts(30),
    getOpenReportCount(),
    getServiceHealth(),
    getApiSummary(),
    getApiHourly(),
  ]);

  return (
    <>
      <PageHeader title="Overview" description="A quick read on Rollin's health and growth" />
      <div className="grid gap-6">
        <ServiceHealthStrip health={health} />
        <OverviewStats totalUsers={totalUsers} daily={daily} api={api} apiHourly={apiHourly} openReports={openReports} />
        <SignupsCard daily={daily} />
        <ContentActivityCard daily={daily} />
      </div>
    </>
  );
}
