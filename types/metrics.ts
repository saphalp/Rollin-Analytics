export type TableCount = {
  table: string;
  count: number | null; // null when the table is missing or the query failed
};

export type TopActivity = {
  activityId: string;
  title: string;
  views: number;
};

export type AppEvent = {
  id: string;
  user_id: string | null;
  event_type: "screen_view" | "session_start" | "session_end" | "error" | string;
  screen: string | null;
  platform: string | null;
  app_version: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
};
