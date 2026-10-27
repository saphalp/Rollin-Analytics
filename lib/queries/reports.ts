import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import { avatarUrl, postImageUrl } from "@/lib/storage";
import {
  OPEN_STATUSES,
  type Report,
  type ReportStatus,
  type ReportTarget,
  type ReportTargetType,
  type ReportWithProfiles,
} from "@/types/reports";

const WITH_PROFILES =
  "*, reporter:profiles!reports_reporter_id_fkey(id, full_name, email), reported:profiles!reports_reported_user_id_fkey(id, full_name, email), reviewer:profiles!reports_reviewed_by_fkey(id, full_name, email)";

// Requires the reports table from Rollin's 20261026120000_reports.sql. Returns null until it exists.
export async function getReports({
  status,
  type,
}: { status?: ReportStatus; type?: ReportTargetType } = {}): Promise<ReportWithProfiles[] | null> {
  const supabase = createAdminClient();
  let query = supabase.from("reports").select(WITH_PROFILES).order("created_at", { ascending: false }).limit(200);
  if (status) query = query.eq("status", status);
  if (type) query = query.eq("target_type", type);

  const { data, error } = await query;
  return error ? null : (data as ReportWithProfiles[]);
}

export async function getReport(id: string): Promise<ReportWithProfiles | null> {
  const supabase = createAdminClient();
  const { data } = await supabase.from("reports").select(WITH_PROFILES).eq("id", id).maybeSingle();
  return data as ReportWithProfiles | null;
}

// Every report filed against the same post/activity/user, so moderators can act on them together.
export async function getReportsForTarget(type: ReportTargetType, targetId: string): Promise<ReportWithProfiles[]> {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("reports")
    .select(WITH_PROFILES)
    .eq("target_type", type)
    .eq("target_id", targetId)
    .order("created_at", { ascending: false });
  return (data as ReportWithProfiles[]) ?? [];
}

export async function getReportsAgainstUser(userId: string): Promise<Report[]> {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("reports")
    .select("*")
    .eq("reported_user_id", userId)
    .order("created_at", { ascending: false });
  return (data as Report[]) ?? [];
}

export async function getOpenReportCount() {
  const supabase = createAdminClient();
  const { count, error } = await supabase
    .from("reports")
    .select("*", { count: "exact", head: true })
    .in("status", OPEN_STATUSES);
  return error ? null : count;
}

// Loads the live row behind a report. Returns null when it has been deleted, so the UI falls back to the snapshot.
export async function getReportTarget(type: ReportTargetType, id: string): Promise<ReportTarget | null> {
  const supabase = createAdminClient();

  if (type === "user") {
    const { data } = await supabase
      .from("profiles")
      .select("id, full_name, email, university, profile_picture, created_at")
      .eq("id", id)
      .maybeSingle();
    if (!data) return null;
    const { profile_picture, ...rest } = data;
    return { type, ...rest, avatar_url: avatarUrl(profile_picture) };
  }

  if (type === "activity") {
    const [{ data }, { count }] = await Promise.all([
      supabase
        .from("activities")
        .select(
          "id, title, description, category, location, date_time, image_url, status, cancel_reason, cancelled_at, host_id, created_at",
        )
        .eq("id", id)
        .maybeSingle(),
      supabase.from("rsvps").select("*", { count: "exact", head: true }).eq("activity_id", id),
    ]);
    if (!data) return null;
    return { type, ...data, rsvp_count: count ?? 0 };
  }

  const { data: post } = await supabase
    .from("activity_photos")
    .select("id, user_id, caption, activity_id, image_path, created_at")
    .eq("id", id)
    .maybeSingle();
  if (!post) return null;

  const [{ data: images }, { data: activity }] = await Promise.all([
    supabase.from("activity_photo_images").select("image_path").eq("post_id", id).order("position"),
    post.activity_id
      ? supabase.from("activities").select("title").eq("id", post.activity_id).maybeSingle()
      : Promise.resolve({ data: null }),
  ]);
  // Older posts have a single image_path and no rows in activity_photo_images.
  const paths = images?.length ? images.map((i) => i.image_path) : [post.image_path];

  return {
    type,
    id: post.id,
    caption: post.caption,
    activity_id: post.activity_id,
    activity_title: activity?.title ?? null,
    image_urls: paths.map(postImageUrl).filter((u): u is string => !!u),
    user_id: post.user_id,
    created_at: post.created_at,
  };
}
