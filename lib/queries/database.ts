import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import type { TableCount } from "@/types/metrics";

// Tables from the Rollin schema (see Rollin docs/backend.md).
export const TRACKED_TABLES = [
  "profiles",
  "activities",
  "rsvps",
  "activity_join_requests",
  "follows",
  "conversations",
  "messages",
  "notifications",
  "rides_offered",
  "ride_requests",
  "ride_wanted_requests",
  "driver_profiles",
  "campus_events",
  "host_reviews",
  "user_reports",
] as const;

export async function getTableCounts(): Promise<TableCount[]> {
  const supabase = createAdminClient();
  return Promise.all(
    TRACKED_TABLES.map(async (table) => {
      const { count, error } = await supabase
        .from(table)
        .select("*", { count: "exact", head: true });
      return { table, count: error ? null : count };
    }),
  );
}

export async function getSignupsSince(days: number) {
  const supabase = createAdminClient();
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
  const { count } = await supabase
    .from("profiles")
    .select("*", { count: "exact", head: true })
    .gte("created_at", since);
  return count ?? 0;
}
