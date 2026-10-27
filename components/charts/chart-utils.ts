import { formatBytes, formatCompact, formatMs, formatNumber, formatPercent } from "@/lib/format";

// Charts are client components, so server pages pass format *names* rather than functions.
export type ValueFormat = "number" | "compact" | "ms" | "percent" | "bytes";
export type XFormat = "hour" | "day";

export type Series = {
  key: string;
  label: string;
  color: string; // a CSS color, usually var(--color-series-N)
};

export type Datum = Record<string, string | number | null>;

export function formatValue(v: unknown, format: ValueFormat = "number") {
  const n = typeof v === "number" ? v : v == null ? null : Number(v);
  if (n == null || Number.isNaN(n)) return "—";
  switch (format) {
    case "compact":
      return formatCompact(n);
    case "ms":
      return formatMs(n);
    case "percent":
      return formatPercent(n);
    case "bytes":
      return formatBytes(n);
    default:
      return formatNumber(n);
  }
}

// "day" values are YYYY-MM-DD strings (parsed as local dates to avoid off-by-one);
// "hour" values are unix ms.
export function formatX(v: unknown, format: XFormat, long = false) {
  if (format === "day") {
    const [y, m, d] = String(v).split("-").map(Number);
    return new Date(y, m - 1, d).toLocaleDateString("en-US", long ? { weekday: "short", month: "short", day: "numeric" } : { month: "short", day: "numeric" });
  }
  const date = new Date(Number(v));
  return long
    ? date.toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })
    : date.toLocaleTimeString("en-US", { hour: "numeric" });
}

export const AXIS_TICK = { fill: "var(--color-chart-muted)", fontSize: 12 };
