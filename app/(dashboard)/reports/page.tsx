import { PageHeader } from "@/components/layout/page-header";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { ReportsTable } from "@/components/reports/reports-table";
import { ReportFilters } from "@/components/reports/report-filters";
import { getReports } from "@/lib/queries/reports";
import { REPORT_STATUSES, REPORT_TARGET_TYPES, type ReportStatus, type ReportTargetType } from "@/types/reports";

export default async function ReportsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; type?: string }>;
}) {
  const params = await searchParams;
  const status = REPORT_STATUSES.includes(params.status as ReportStatus) ? (params.status as ReportStatus) : undefined;
  const type = REPORT_TARGET_TYPES.includes(params.type as ReportTargetType) ? (params.type as ReportTargetType) : undefined;
  const reports = await getReports({ status, type });

  return (
    <>
      <PageHeader title="Reports" description="Profile, activity and post reports filed from the app" />
      <Card action={<ReportFilters status={status} type={type} />}>
        {reports == null ? (
          <EmptyState title="Couldn't load reports" />
        ) : (
          <ReportsTable reports={reports} />
        )}
      </Card>
    </>
  );
}
