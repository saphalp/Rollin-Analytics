// Mirrors public.campus_calendar_submissions in Rollin's database.
export type CalendarSubmissionStatus = "pending" | "approved" | "rejected";

export const CALENDAR_SUBMISSION_STATUSES: CalendarSubmissionStatus[] = ["pending", "approved", "rejected"];

export type CalendarSubmission = {
  id: string;
  user_id: string;
  university_id: string;
  calendar_url: string;
  status: CalendarSubmissionStatus;
  submitted_at: string;
  reviewed_at: string | null;
  review_notes: string | null;
};

export type CalendarSubmissionRow = CalendarSubmission & {
  university: { name: string } | null;
  submitter: { id: string; full_name: string | null; email: string } | null;
};
