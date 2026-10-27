"use client";

import { Area, AreaChart, ResponsiveContainer, Tooltip } from "recharts";
import { formatValue, formatX, type ValueFormat, type XFormat } from "@/components/charts/chart-utils";

type SparklineProps = {
  data: { x: string | number; y: number }[];
  xFormat: XFormat;
  valueFormat?: ValueFormat;
  label: string;
};

// Trend line for a stat tile. De-emphasized stroke, latest point marked in the accent.
export function Sparkline({ data, xFormat, valueFormat = "number", label }: SparklineProps) {
  const last = data.length - 1;
  return (
    <div className="h-10" role="img" aria-label={`${label} trend`}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 4, right: 4, bottom: 4, left: 4 }}>
          <Tooltip
            cursor={{ stroke: "var(--color-chart-axis)", strokeWidth: 1 }}
            content={(p) =>
              p.active && p.payload?.length ? (
                <div className="rounded-md border border-outline-variant bg-card px-2 py-1 text-xs shadow-sm">
                  <span className="font-semibold text-on-surface">{formatValue(p.payload[0].value, valueFormat)}</span>{" "}
                  <span className="text-on-surface-variant">{formatX(p.payload[0].payload.x, xFormat, true)}</span>
                </div>
              ) : null
            }
          />
          <Area
            type="monotone"
            dataKey="y"
            stroke="var(--color-chart-muted)"
            strokeWidth={1.5}
            fill="var(--color-chart-muted)"
            fillOpacity={0.08}
            isAnimationActive={false}
            dot={(props: { cx?: number; cy?: number; index?: number }) =>
              props.index === last ? (
                <circle key="last" cx={props.cx} cy={props.cy} r={3.5} fill="var(--color-series-1)" stroke="var(--color-card)" strokeWidth={2} />
              ) : (
                <g key={props.index} />
              )
            }
            activeDot={{ r: 3.5, fill: "var(--color-series-1)", stroke: "var(--color-card)", strokeWidth: 2 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
