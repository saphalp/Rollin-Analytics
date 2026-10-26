"use client";

import { useTransition } from "react";
import { updateReportStatus } from "@/lib/actions/reports";
import type { ReportStatus } from "@/types/reports";

const NEXT_STATUSES: ReportStatus[] = ["reviewing", "resolved", "dismissed"];

export function ReportActions({ reportId, status }: { reportId: string; status: ReportStatus }) {
  const [pending, startTransition] = useTransition();

  return (
    <select
      aria-label="Change report status"
      disabled={pending}
      value={status}
      onChange={(e) => {
        const next = e.target.value as ReportStatus;
        startTransition(() => updateReportStatus(reportId, next));
      }}
      className="rounded-md border border-outline-variant bg-card px-2 py-1 text-sm"
    >
      <option value={status} disabled>
        {status}
      </option>
      {NEXT_STATUSES.filter((s) => s !== status).map((s) => (
        <option key={s} value={s}>
          Mark {s}
        </option>
      ))}
    </select>
  );
}
