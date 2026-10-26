export type ReportStatus = "open" | "reviewing" | "resolved" | "dismissed";

export type ReportReason =
  | "harassment"
  | "spam"
  | "inappropriate_content"
  | "impersonation"
  | "unsafe_behavior"
  | "other";

export type UserReport = {
  id: string;
  reporter_id: string;
  reported_user_id: string;
  reason: ReportReason;
  details: string | null;
  status: ReportStatus;
  admin_notes: string | null;
  created_at: string;
  resolved_at: string | null;
};
