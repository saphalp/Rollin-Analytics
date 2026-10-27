import type { ReactNode } from "react";
import { formatNumber } from "@/lib/format";
import { StatusIcon, type Status } from "@/components/ui/status";

type Delta = {
  text: string; // e.g. "+12% vs previous 7 days"
  direction: "up" | "down" | "flat";
  good: boolean;
};

type StatCardProps = {
  label: string;
  value: number | string | null;
  hint?: string;
  status?: Status;
  delta?: Delta;
  children?: ReactNode; // sparkline or meter
};

export function StatCard({ label, value, hint, status, delta, children }: StatCardProps) {
  const display = typeof value === "string" ? value : formatNumber(value);

  return (
    <div className="flex flex-col rounded-xl border border-outline-variant bg-card p-5">
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm text-on-surface-variant">{label}</p>
        {status && <StatusIcon status={status} />}
      </div>
      <p className="mt-1 text-3xl font-semibold text-on-surface">{display}</p>
      {delta && (
        <p
          className="mt-1 text-xs font-medium"
          style={{ color: delta.direction === "flat" ? undefined : delta.good ? "var(--color-delta-good)" : "var(--color-error)" }}
        >
          {delta.direction === "up" ? "▲ " : delta.direction === "down" ? "▼ " : ""}
          {delta.text}
        </p>
      )}
      {hint && <p className="mt-1 text-xs text-on-surface-variant">{hint}</p>}
      {children && <div className="mt-auto pt-3">{children}</div>}
    </div>
  );
}
