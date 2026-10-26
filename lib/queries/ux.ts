import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import type { AppEvent, TopActivity } from "@/types/metrics";

// activity_views already exists in Rollin (one row per activity per viewer).
export async function getTopViewedActivities(limit = 10): Promise<TopActivity[]> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("activity_views")
    .select("activity_id, activities(title)");
  if (error || !data) return [];

  const tally = new Map<string, TopActivity>();
  for (const row of data as unknown as { activity_id: string; activities: { title: string } | null }[]) {
    const current = tally.get(row.activity_id);
    if (current) current.views += 1;
    else tally.set(row.activity_id, { activityId: row.activity_id, title: row.activities?.title ?? "Untitled", views: 1 });
  }
  return [...tally.values()].sort((a, b) => b.views - a.views).slice(0, limit);
}

// Requires the app_events table from supabase/drafts/app_events.sql. Returns null until it exists.
export async function getRecentAppEvents(limit = 50): Promise<AppEvent[] | null> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("app_events")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);
  return error ? null : (data as AppEvent[]);
}
