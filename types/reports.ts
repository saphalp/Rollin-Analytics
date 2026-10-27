// Mirrors the enums in Rollin's supabase/migrations/20261026120000_reports.sql.
export type ReportTargetType = "user" | "activity" | "post";

export type ReportStatus = "pending" | "reviewing" | "resolved" | "dismissed";

export type ReportReason =
  | "spam"
  | "harassment"
  | "hate_speech"
  | "nudity"
  | "violence"
  | "false_information"
  | "impersonation"
  | "scam"
  | "other";

export const REPORT_STATUSES: ReportStatus[] = ["pending", "reviewing", "resolved", "dismissed"];
export const REPORT_TARGET_TYPES: ReportTargetType[] = ["user", "activity", "post"];
export const OPEN_STATUSES: ReportStatus[] = ["pending", "reviewing"];

// Captured by submit_report when the report is filed; the live row may since have been edited or deleted.
export type UserSnapshot = { full_name?: string | null; profile_picture?: string | null; university?: string | null };
export type ActivitySnapshot = { title?: string | null; image_url?: string | null; date_time?: string | null };
export type PostSnapshot = { caption?: string | null; activity_id?: string | null; image_paths?: (string | null)[] };

export type Report = {
  id: string;
  reporter_id: string | null;
  target_type: ReportTargetType;
  target_id: string;
  reported_user_id: string | null;
  reason: ReportReason;
  details: string | null;
  target_snapshot: UserSnapshot & ActivitySnapshot & PostSnapshot;
  status: ReportStatus;
  reviewed_by: string | null;
  reviewed_at: string | null;
  resolution_note: string | null;
  created_at: string;
};

type ProfileRef = { id: string; full_name: string | null; email: string } | null;

export type ReportWithProfiles = Report & {
  reporter: ProfileRef;
  reported: ProfileRef;
  reviewer: ProfileRef;
};

// Live state of what was reported. `null` from the loader means the target has been deleted.
export type ReportTarget =
  | {
      type: "user";
      id: string;
      full_name: string | null;
      email: string;
      university: string | null;
      avatar_url: string | null;
      created_at: string;
    }
  | {
      type: "activity";
      id: string;
      title: string;
      description: string | null;
      category: string | null;
      location: string | null;
      date_time: string | null;
      image_url: string | null;
      status: "active" | "expired" | "cancelled";
      cancel_reason: string | null;
      cancelled_at: string | null;
      host_id: string;
      rsvp_count: number;
      created_at: string;
    }
  | {
      type: "post";
      id: string;
      caption: string | null;
      activity_id: string | null;
      activity_title: string | null;
      image_urls: string[];
      user_id: string;
      created_at: string;
    };
