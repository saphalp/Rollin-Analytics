import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import type { ReportStatus, UserReport } from "@/types/reports";

export type ReportWithProfiles = UserReport & {
  reporter: { full_name: string | null; email: string } | null;
  reported: { full_name: string | null; email: string } | null;
};

// Requires the user_reports table from supabase/drafts/user_reports.sql. Returns null until it exists.
export async function getReports(status?: ReportStatus): Promise<ReportWithProfiles[] | null> {
  const supabase = createAdminClient();
  let query = supabase
    .from("user_reports")
    .select(
      "*, reporter:profiles!user_reports_reporter_id_fkey(full_name, email), reported:profiles!user_reports_reported_user_id_fkey(full_name, email)",
    )
    .order("created_at", { ascending: false });
  if (status) query = query.eq("status", status);

  const { data, error } = await query;
  return error ? null : (data as ReportWithProfiles[]);
}

export async function getReportsAgainstUser(userId: string): Promise<UserReport[]> {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("user_reports")
    .select("*")
    .eq("reported_user_id", userId)
    .order("created_at", { ascending: false });
  return (data as UserReport[]) ?? [];
}

export async function getOpenReportCount() {
  const supabase = createAdminClient();
  const { count, error } = await supabase
    .from("user_reports")
    .select("*", { count: "exact", head: true })
    .in("status", ["open", "reviewing"]);
  return error ? null : count;
}
