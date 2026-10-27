"use server";

import { revalidatePath } from "next/cache";
import type { SupabaseClient } from "@supabase/supabase-js";
import { requireAdmin } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { OPEN_STATUSES, type ReportStatus, type ReportTargetType } from "@/types/reports";

// reviewed_by references profiles, and a dashboard admin may not have a Rollin profile.
async function reviewFields(supabase: SupabaseClient, adminId: string, status: ReportStatus, note?: string) {
  const done = status === "resolved" || status === "dismissed";
  const { data: profile } = await supabase.from("profiles").select("id").eq("id", adminId).maybeSingle();
  return {
    status,
    resolution_note: note?.trim() || null,
    reviewed_by: profile?.id ?? null,
    reviewed_at: done ? new Date().toISOString() : null,
  };
}

function revalidateReports(reportId?: string) {
  revalidatePath("/reports");
  if (reportId) revalidatePath(`/reports/${reportId}`);
}

export async function updateReportStatus(reportId: string, status: ReportStatus, note?: string) {
  const admin = await requireAdmin();
  const supabase = createAdminClient();
  const { error } = await supabase
    .from("reports")
    .update(await reviewFields(supabase, admin.id, status, note))
    .eq("id", reportId);
  if (error) throw error;
  revalidateReports(reportId);
}

// Closes every open report against the same target, e.g. after the post is removed.
export async function closeReportsForTarget(
  type: ReportTargetType,
  targetId: string,
  status: "resolved" | "dismissed",
  note?: string,
) {
  const admin = await requireAdmin();
  const supabase = createAdminClient();
  const { error } = await supabase
    .from("reports")
    .update(await reviewFields(supabase, admin.id, status, note))
    .eq("target_type", type)
    .eq("target_id", targetId)
    .in("status", OPEN_STATUSES);
  if (error) throw error;
  revalidateReports();
}

// Removes an explore post and its images, then resolves its open reports.
// The report keeps target_snapshot, so the content stays reviewable afterwards.
export async function deletePost(postId: string, note?: string) {
  await requireAdmin();
  const supabase = createAdminClient();

  const [{ data: post }, { data: images }] = await Promise.all([
    supabase.from("activity_photos").select("image_path").eq("id", postId).maybeSingle(),
    supabase.from("activity_photo_images").select("image_path").eq("post_id", postId),
  ]);
  const paths = [post?.image_path, ...(images ?? []).map((i) => i.image_path)].filter(
    (p): p is string => !!p && !p.startsWith("http"),
  );

  await supabase.from("activity_photo_images").delete().eq("post_id", postId);
  const { error } = await supabase.from("activity_photos").delete().eq("id", postId);
  if (error) throw error;
  // Best effort: an orphaned file is harmless, so don't fail the moderation action over it.
  if (paths.length) await supabase.storage.from("activity-photos").remove([...new Set(paths)]);

  await closeReportsForTarget("post", postId, "resolved", note || "Post removed by moderator");
}

// Same status change the host's cancel-activity function makes, so the app blocks new RSVPs.
// Attendees are not notified: the edge function only lets the host trigger notifications.
export async function cancelActivity(activityId: string, reason: string, note?: string) {
  await requireAdmin();
  const supabase = createAdminClient();
  const { error } = await supabase
    .from("activities")
    .update({
      status: "cancelled",
      cancel_reason: reason.trim().slice(0, 500) || "Removed by Rollin moderators",
      cancelled_at: new Date().toISOString(),
    })
    .eq("id", activityId);
  if (error) throw error;

  await closeReportsForTarget("activity", activityId, "resolved", note || "Activity cancelled by moderator");
}
