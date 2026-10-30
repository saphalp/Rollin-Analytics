"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";

export async function reviewCalendarSubmission(id: string, decision: "approved" | "rejected", note?: string) {
  await requireAdmin();
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("campus_calendar_submissions")
    .update({
      status: decision,
      reviewed_at: new Date().toISOString(),
      review_notes: note?.trim() || null,
    })
    .eq("id", id)
    // Only decide pending rows, so two admins reviewing at once can't overwrite each other.
    .eq("status", "pending")
    .select("id");
  if (error) throw error;
  if (!data?.length) throw new Error("This request was already reviewed. Refresh to see its current status.");
  revalidatePath("/calendar-requests");
}
