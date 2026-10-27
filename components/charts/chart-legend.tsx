import type { Series } from "@/components/charts/chart-utils";

// Legend keys mirror the mark: a swatch for bars/areas, a short line for lines.
export function ChartLegend({ series, mark }: { series: Series[]; mark: "rect" | "line" }) {
  if (series.length < 2) return null;
  return (
    <ul className="mb-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-on-surface-variant">
      {series.map((s) => (
        <li key={s.key} className="flex items-center gap-1.5">
          <span
            className={mark === "rect" ? "size-2.5 rounded-sm" : "h-0.5 w-3.5 rounded-full"}
            style={{ background: s.color }}
          />
          {s.label}
        </li>
      ))}
    </ul>
  );
}
