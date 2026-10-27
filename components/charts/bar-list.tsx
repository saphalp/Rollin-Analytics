import { formatValue, type ValueFormat } from "@/components/charts/chart-utils";
import { EmptyState } from "@/components/ui/empty-state";

export type BarListRow = {
  label: string;
  value: number;
  detail?: string;
};

type BarListProps = {
  rows: BarListRow[];
  valueFormat?: ValueFormat;
  color?: string;
  emptyText?: string;
};

// Ranked horizontal bars with the value at the tip. One series, one color.
export function BarList({ rows, valueFormat = "number", color = "var(--color-series-1)", emptyText = "No data yet" }: BarListProps) {
  if (rows.length === 0) return <EmptyState title={emptyText} />;
  const max = Math.max(...rows.map((r) => r.value), 1);

  return (
    <ul className="space-y-3">
      {rows.map((r) => (
        <li key={r.label}>
          <div className="flex items-baseline justify-between gap-3 text-sm">
            <span className="truncate font-mono text-[13px] text-on-surface" title={r.label}>
              {r.label}
            </span>
            <span className="shrink-0 tabular-nums font-medium text-on-surface">{formatValue(r.value, valueFormat)}</span>
          </div>
          <div className="mt-1 h-2">
            <div
              className="h-2 min-w-0.5 rounded-r-[4px]"
              style={{ width: `${(r.value / max) * 100}%`, background: color }}
            />
          </div>
          {r.detail && <p className="mt-0.5 text-xs text-on-surface-variant">{r.detail}</p>}
        </li>
      ))}
    </ul>
  );
}
