import Link from "next/link";
import { TARGET_LABELS } from "@/components/reports/report-status-badge";
import { REPORT_STATUSES, REPORT_TARGET_TYPES, type ReportStatus, type ReportTargetType } from "@/types/reports";

type Filters = { status?: ReportStatus; type?: ReportTargetType };

function href(filters: Filters) {
  const params = new URLSearchParams();
  if (filters.status) params.set("status", filters.status);
  if (filters.type) params.set("type", filters.type);
  const qs = params.toString();
  return qs ? `/reports?${qs}` : "/reports";
}

function Pill({ active, href, children }: { active: boolean; href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className={`rounded-full px-3 py-1 text-sm capitalize ${
        active ? "bg-primary text-on-primary" : "bg-surface-container text-on-surface-variant"
      }`}
    >
      {children}
    </Link>
  );
}

export function ReportFilters({ status, type }: Filters) {
  return (
    <div className="flex flex-col items-end gap-2">
      <div className="flex flex-wrap justify-end gap-1">
        <Pill active={!type} href={href({ status })}>
          All types
        </Pill>
        {REPORT_TARGET_TYPES.map((t) => (
          <Pill key={t} active={type === t} href={href({ status, type: t })}>
            {TARGET_LABELS[t]}s
          </Pill>
        ))}
      </div>
      <div className="flex flex-wrap justify-end gap-1">
        <Pill active={!status} href={href({ type })}>
          Any status
        </Pill>
        {REPORT_STATUSES.map((s) => (
          <Pill key={s} active={status === s} href={href({ status: s, type })}>
            {s}
          </Pill>
        ))}
      </div>
    </div>
  );
}
