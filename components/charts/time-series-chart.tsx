"use client";

import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { ChartLegend } from "@/components/charts/chart-legend";
import { ChartTable } from "@/components/charts/chart-table";
import { ChartTooltip } from "@/components/charts/chart-tooltip";
import { AXIS_TICK, formatValue, formatX, type Datum, type Series, type ValueFormat, type XFormat } from "@/components/charts/chart-utils";

type TimeSeriesChartProps = {
  data: Datum[];
  xKey: string;
  xFormat: XFormat;
  series: Series[];
  valueFormat?: ValueFormat;
  height?: number;
  variant?: "line" | "area";
  compact?: boolean; // small multiples: no y-axis, no grid
  showTable?: boolean;
};

// Line/area over time with a crosshair tooltip. 2px lines, area washes at 10%.
export function TimeSeriesChart({
  data,
  xKey,
  xFormat,
  series,
  valueFormat = "number",
  height = 220,
  variant = "line",
  compact = false,
  showTable = true,
}: TimeSeriesChartProps) {
  return (
    <div>
      <ChartLegend series={series} mark="line" />
      <div style={{ height }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 4, right: 8, bottom: 0, left: compact ? 8 : 0 }}>
            {!compact && <CartesianGrid vertical={false} stroke="var(--color-chart-grid)" />}
            <XAxis
              dataKey={xKey}
              tickFormatter={(v) => formatX(v, xFormat)}
              tick={compact ? false : AXIS_TICK}
              axisLine={{ stroke: "var(--color-chart-axis)" }}
              tickLine={false}
              minTickGap={24}
              height={compact ? 4 : 28}
            />
            <YAxis
              hide={compact}
              width={valueFormat === "ms" || valueFormat === "bytes" ? 64 : 48}
              tick={AXIS_TICK}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => formatValue(v, valueFormat === "number" ? "compact" : valueFormat)}
            />
            <Tooltip
              cursor={{ stroke: "var(--color-chart-axis)", strokeWidth: 1 }}
              content={(p) => (
                <ChartTooltip active={p.active} payload={p.payload} label={p.label} series={series} xFormat={xFormat} valueFormat={valueFormat} />
              )}
            />
            {series.map((s) => (
              <Area
                key={s.key}
                type="monotone"
                dataKey={s.key}
                name={s.label}
                stroke={s.color}
                strokeWidth={2}
                fill={s.color}
                fillOpacity={variant === "area" ? 0.1 : 0}
                dot={false}
                activeDot={{ r: 4, fill: s.color, stroke: "var(--color-card)", strokeWidth: 2 }}
                connectNulls
                isAnimationActive={false}
              />
            ))}
          </AreaChart>
        </ResponsiveContainer>
      </div>
      {showTable && <ChartTable data={data} xKey={xKey} xFormat={xFormat} series={series} valueFormat={valueFormat} />}
    </div>
  );
}
