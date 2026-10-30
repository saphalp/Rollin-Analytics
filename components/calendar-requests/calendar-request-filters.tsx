import Link from "next/link";
import { CALENDAR_SUBMISSION_STATUSES, type CalendarSubmissionStatus } from "@/types/calendar-submissions";

// "all" is explicit because no status param means the pending queue.
export type CalendarRequestFilter = CalendarSubmissionStatus | "all";

const FILTERS: CalendarRequestFilter[] = [...CALENDAR_SUBMISSION_STATUSES, "all"];

export function CalendarRequestFilters({ active }: { active: CalendarRequestFilter }) {
  return (
    <div className="flex flex-wrap justify-end gap-1">
      {FILTERS.map((f) => (
        <Link
          key={f}
          href={f === "pending" ? "/calendar-requests" : `/calendar-requests?status=${f}`}
          aria-current={f === active ? "page" : undefined}
          className={`rounded-full px-3 py-1 text-sm capitalize ${
            f === active ? "bg-primary text-on-primary" : "bg-surface-container text-on-surface-variant"
          }`}
        >
          {f}
        </Link>
      ))}
    </div>
  );
}
