"use client";

import { formatValue, formatX, type Series, type ValueFormat, type XFormat } from "@/components/charts/chart-utils";

type Row = { dataKey?: unknown; value?: unknown };

type ChartTooltipProps = {
  active?: boolean;
  payload?: readonly Row[];
  label?: unknown;
  series: Series[];
  xFormat: XFormat;
  valueFormat: ValueFormat;
};

// One readout for every series at the hovered x. Values lead, series names follow.
export function ChartTooltip({ active, payload, label, series, xFormat, valueFormat }: ChartTooltipProps) {
  if (!active || !payload?.length) return null;

  return (
    <div className="rounded-lg border border-outline-variant bg-card px-3 py-2 text-xs shadow-sm">
      <p className="mb-1 text-on-surface-variant">{formatX(label, xFormat, true)}</p>
      <ul className="space-y-0.5">
        {[...series].reverse().map((s) => {
          const row = payload.find((p) => p.dataKey === s.key);
          if (!row) return null;
          return (
            <li key={s.key} className="flex items-center gap-2">
              <span className="h-0.5 w-3 rounded-full" style={{ background: s.color }} />
              <span className="font-semibold tabular-nums text-on-surface">{formatValue(row.value, valueFormat)}</span>
              <span className="text-on-surface-variant">{s.label}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
