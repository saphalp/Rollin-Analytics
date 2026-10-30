import { CalendarRequestFilters, type CalendarRequestFilter } from "@/components/calendar-requests/calendar-request-filters";
import { CalendarRequestsTable } from "@/components/calendar-requests/calendar-requests-table";
import { PageHeader } from "@/components/layout/page-header";
import { Card } from "@/components/ui/card";
import { SetupNotice } from "@/components/ui/setup-notice";
import { getCalendarSubmissions } from "@/lib/queries/calendar-submissions";
import { CALENDAR_SUBMISSION_STATUSES, type CalendarSubmissionStatus } from "@/types/calendar-submissions";

export default async function CalendarRequestsPage({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const params = await searchParams;
  const filter: CalendarRequestFilter =
    params.status === "all" || CALENDAR_SUBMISSION_STATUSES.includes(params.status as CalendarSubmissionStatus)
      ? (params.status as CalendarRequestFilter)
      : "pending";
  const result = await getCalendarSubmissions(filter === "all" ? undefined : filter);

  return (
    <>
      <PageHeader
        title="Calendar requests"
        description="Campus calendar feeds users asked to add. Open the link, then approve or reject it."
      />
      <Card action={<CalendarRequestFilters active={filter} />}>
        {result.ok ? <CalendarRequestsTable rows={result.data} /> : <SetupNotice result={result} />}
      </Card>
    </>
  );
}
