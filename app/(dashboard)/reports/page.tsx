import { PageHeader } from "@/components/layout/page-header";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { ReportsTable } from "@/components/reports/reports-table";
import { ReportStatusFilter } from "@/components/reports/report-status-filter";
import { getReports } from "@/lib/queries/reports";
import type { ReportStatus } from "@/types/reports";

const STATUSES: ReportStatus[] = ["open", "reviewing", "resolved", "dismissed"];

export default async function ReportsPage({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const { status: raw } = await searchParams;
  const status = STATUSES.includes(raw as ReportStatus) ? (raw as ReportStatus) : undefined;
  const reports = await getReports(status);

  return (
    <>
      <PageHeader title="Reports" description="User-to-user reports filed from the app" />
      <Card action={<ReportStatusFilter current={status} />}>
        {reports == null ? (
          <EmptyState title="Reporting isn't set up yet">
            Apply <code>supabase/drafts/user_reports.sql</code> once the in-app report feature is ready.
          </EmptyState>
        ) : (
          <ReportsTable reports={reports} />
        )}
      </Card>
    </>
  );
}
