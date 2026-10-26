import Link from "next/link";
import type { ReportStatus } from "@/types/reports";

const FILTERS: { label: string; value?: ReportStatus }[] = [
  { label: "All" },
  { label: "Open", value: "open" },
  { label: "Reviewing", value: "reviewing" },
  { label: "Resolved", value: "resolved" },
  { label: "Dismissed", value: "dismissed" },
];

export function ReportStatusFilter({ current }: { current?: ReportStatus }) {
  return (
    <div className="flex flex-wrap gap-1">
      {FILTERS.map((f) => (
        <Link
          key={f.label}
          href={f.value ? `/reports?status=${f.value}` : "/reports"}
          className={`rounded-full px-3 py-1 text-sm ${
            current === f.value ? "bg-primary text-on-primary" : "bg-surface-container text-on-surface-variant"
          }`}
        >
          {f.label}
        </Link>
      ))}
    </div>
  );
}
