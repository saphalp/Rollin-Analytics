"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";

// Uses Supabase Auth bans, so no schema change is needed to suspend a user.
// A banned user can't sign in or refresh their session.
export async function suspendUser(userId: string, hours: number) {
  await requireAdmin();
  const supabase = createAdminClient();
  const { error } = await supabase.auth.admin.updateUserById(userId, { ban_duration: `${hours}h` });
  if (error) throw error;
  revalidatePath(`/users/${userId}`);
}

export async function unsuspendUser(userId: string) {
  await requireAdmin();
  const supabase = createAdminClient();
  const { error } = await supabase.auth.admin.updateUserById(userId, { ban_duration: "none" });
  if (error) throw error;
  revalidatePath(`/users/${userId}`);
}
