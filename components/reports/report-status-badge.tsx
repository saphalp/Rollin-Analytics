import { Badge, type BadgeTone } from "@/components/ui/badge";
import type { ReportStatus, ReportTargetType } from "@/types/reports";

const toneByStatus: Record<ReportStatus, BadgeTone> = {
  pending: "danger",
  reviewing: "warning",
  resolved: "success",
  dismissed: "neutral",
};

export function ReportStatusBadge({ status }: { status: ReportStatus }) {
  return <Badge tone={toneByStatus[status]}>{status}</Badge>;
}

export const TARGET_LABELS: Record<ReportTargetType, string> = {
  user: "Profile",
  activity: "Activity",
  post: "Post",
};

export function ReportTargetBadge({ type }: { type: ReportTargetType }) {
  return <Badge tone="primary">{TARGET_LABELS[type]}</Badge>;
}

export function formatReason(reason: string) {
  return reason.replaceAll("_", " ");
}
