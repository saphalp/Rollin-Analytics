import { formatValue, formatX, type Datum, type Series, type ValueFormat, type XFormat } from "@/components/charts/chart-utils";

type ChartTableProps = {
  data: Datum[];
  xKey: string;
  xFormat: XFormat;
  series: Series[];
  valueFormat?: ValueFormat;
};

// Every chart has a table twin so no value is reachable only by hovering or by color.
export function ChartTable({ data, xKey, xFormat, series, valueFormat = "number" }: ChartTableProps) {
  return (
    <details className="mt-3 text-sm">
      <summary className="cursor-pointer select-none text-xs text-on-surface-variant hover:text-on-surface">
        Show data table
      </summary>
      <div className="mt-2 max-h-64 overflow-auto rounded-lg border border-outline-variant/60">
        <table className="w-full text-left text-xs">
          <thead className="sticky top-0 bg-card text-on-surface-variant">
            <tr>
              <th className="px-3 py-1.5 font-medium">{xFormat === "day" ? "Day" : "Hour"}</th>
              {series.map((s) => (
                <th key={s.key} className="px-3 py-1.5 text-right font-medium">
                  {s.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant/40 tabular-nums">
            {data.map((d) => (
              <tr key={String(d[xKey])}>
                <td className="px-3 py-1" suppressHydrationWarning>
                  {formatX(d[xKey], xFormat, true)}
                </td>
                {series.map((s) => (
                  <td key={s.key} className="px-3 py-1 text-right">
                    {formatValue(d[s.key], valueFormat)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </details>
  );
}
