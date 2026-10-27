"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { ChartLegend } from "@/components/charts/chart-legend";
import { ChartTable } from "@/components/charts/chart-table";
import { ChartTooltip } from "@/components/charts/chart-tooltip";
import { AXIS_TICK, formatValue, formatX, type Datum, type Series, type ValueFormat, type XFormat } from "@/components/charts/chart-utils";

type ColumnChartProps = {
  data: Datum[];
  xKey: string;
  xFormat: XFormat;
  series: Series[]; // bottom of the stack first
  valueFormat?: ValueFormat;
  height?: number;
  stacked?: boolean;
};

// Columns over time: capped at 24px, 4px rounded tops, 2px surface gap between stacked segments.
export function ColumnChart({ data, xKey, xFormat, series, valueFormat = "number", height = 220, stacked = false }: ColumnChartProps) {
  return (
    <div>
      <ChartLegend series={series} mark="rect" />
      <div style={{ height }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 4, right: 8, bottom: 0, left: 0 }} barCategoryGap="20%">
            <CartesianGrid vertical={false} stroke="var(--color-chart-grid)" />
            <XAxis
              dataKey={xKey}
              tickFormatter={(v) => formatX(v, xFormat)}
              tick={AXIS_TICK}
              axisLine={{ stroke: "var(--color-chart-axis)" }}
              tickLine={false}
              minTickGap={24}
              height={28}
            />
            <YAxis
              width={valueFormat === "ms" || valueFormat === "bytes" ? 64 : 48}
              tick={AXIS_TICK}
              axisLine={false}
              tickLine={false}
              allowDecimals={false}
              tickFormatter={(v) => formatValue(v, valueFormat === "number" ? "compact" : valueFormat)}
            />
            <Tooltip
              cursor={{ fill: "var(--color-surface-container)", opacity: 0.7 }}
              content={(p) => (
                <ChartTooltip active={p.active} payload={p.payload} label={p.label} series={series} xFormat={xFormat} valueFormat={valueFormat} />
              )}
            />
            {series.map((s, i) => (
              <Bar
                key={s.key}
                dataKey={s.key}
                name={s.label}
                fill={s.color}
                stackId={stacked ? "stack" : undefined}
                maxBarSize={24}
                radius={!stacked || i === series.length - 1 ? [4, 4, 0, 0] : 0}
                stroke={stacked ? "var(--color-card)" : undefined}
                strokeWidth={stacked ? 1 : 0}
                isAnimationActive={false}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>
      <ChartTable data={data} xKey={xKey} xFormat={xFormat} series={series} valueFormat={valueFormat} />
    </div>
  );
}
