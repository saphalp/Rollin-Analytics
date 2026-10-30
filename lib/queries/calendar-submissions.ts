import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import type { CalendarSubmission, CalendarSubmissionRow, CalendarSubmissionStatus } from "@/types/calendar-submissions";
import type { Result } from "@/types/result";

// user_id references auth.users rather than profiles, and university_id has no foreign key,
// so PostgREST can't embed either. Both are looked up separately and joined here.
export async function getCalendarSubmissions(status?: CalendarSubmissionStatus): Promise<Result<CalendarSubmissionRow[]>> {
  const supabase = createAdminClient();
  let query = supabase
    .from("campus_calendar_submissions")
    .select("*")
    // The pending queue is worked oldest first; history reads newest first.
    .order("submitted_at", { ascending: status === "pending" })
    .limit(200);
  if (status) query = query.eq("status", status);

  const { data, error } = await query;
  if (error) {
    if (error.code === "42501") {
      return {
        ok: false,
        reason: "not_configured",
        message: "The dashboard can't read campus_calendar_submissions. Run: grant select, update on public.campus_calendar_submissions to service_role;",
      };
    }
    return { ok: false, reason: "error", message: error.message };
  }

  const submissions = data as CalendarSubmission[];
  const userIds = [...new Set(submissions.map((s) => s.user_id))];
  const universityIds = [...new Set(submissions.map((s) => s.university_id))];

  const [{ data: profiles }, { data: universities }] = await Promise.all([
    userIds.length
      ? supabase.from("profiles").select("id, full_name, email").in("id", userIds)
      : Promise.resolve({ data: [] }),
    universityIds.length
      ? supabase.from("universities").select("id, name").in("id", universityIds)
      : Promise.resolve({ data: [] }),
  ]);
  const profileById = new Map((profiles ?? []).map((p) => [p.id, p]));
  const universityById = new Map((universities ?? []).map((u) => [u.id, u]));

  return {
    ok: true,
    data: submissions.map((s) => ({
      ...s,
      submitter: profileById.get(s.user_id) ?? null,
      university: universityById.get(s.university_id) ?? null,
    })),
  };
}
