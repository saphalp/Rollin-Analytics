import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import type { AdminUser, Profile } from "@/types/users";

const PROFILE_COLUMNS =
  "id, email, full_name, university, major, profile_picture, profile_completed, is_educational_email, is_private, is_driver, created_at";

export async function getUsers({ search, limit = 50 }: { search?: string; limit?: number } = {}) {
  const supabase = createAdminClient();
  let query = supabase
    .from("profiles")
    .select(PROFILE_COLUMNS)
    .order("created_at", { ascending: false })
    .limit(limit);
  // Strip characters that have meaning inside a PostgREST or() filter.
  const term = search?.replace(/[,()%*\\]/g, "").trim();
  if (term) query = query.or(`full_name.ilike.%${term}%,email.ilike.%${term}%`);

  const { data, error } = await query;
  if (error) throw error;
  return data as Profile[];
}

// Merges the profile row with auth-level fields (ban state, last sign-in).
export async function getUser(id: string): Promise<AdminUser | null> {
  const supabase = createAdminClient();
  const [{ data: profile }, { data: auth }] = await Promise.all([
    supabase.from("profiles").select(PROFILE_COLUMNS).eq("id", id).maybeSingle(),
    supabase.auth.admin.getUserById(id),
  ]);
  if (!profile) return null;

  return {
    ...(profile as Profile),
    banned_until: auth.user?.banned_until ?? null,
    last_sign_in_at: auth.user?.last_sign_in_at ?? null,
  };
}
