"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import type { ReportStatus } from "@/types/reports";

export async function updateReportStatus(reportId: string, status: ReportStatus, adminNotes?: string) {
  await requireAdmin();
  const supabase = createAdminClient();
  const done = status === "resolved" || status === "dismissed";
  const { error } = await supabase
    .from("user_reports")
    .update({
      status,
      admin_notes: adminNotes ?? null,
      resolved_at: done ? new Date().toISOString() : null,
    })
    .eq("id", reportId);
  if (error) throw error;
  revalidatePath("/reports");
}
