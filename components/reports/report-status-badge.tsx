import { Badge, type BadgeTone } from "@/components/ui/badge";
import type { ReportStatus } from "@/types/reports";

const toneByStatus: Record<ReportStatus, BadgeTone> = {
  open: "danger",
  reviewing: "warning",
  resolved: "success",
  dismissed: "neutral",
};

export function ReportStatusBadge({ status }: { status: ReportStatus }) {
  return <Badge tone={toneByStatus[status]}>{status}</Badge>;
}
