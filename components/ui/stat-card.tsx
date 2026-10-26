import { formatNumber } from "@/lib/format";

type StatCardProps = {
  label: string;
  value: number | null;
  hint?: string;
};

export function StatCard({ label, value, hint }: StatCardProps) {
  return (
    <div className="rounded-xl border border-outline-variant bg-card p-5">
      <p className="text-sm text-on-surface-variant">{label}</p>
      <p className="mt-1 text-3xl font-semibold tabular-nums text-on-surface">{formatNumber(value)}</p>
      {hint && <p className="mt-1 text-xs text-on-surface-variant">{hint}</p>}
    </div>
  );
}
