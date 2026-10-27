export function formatNumber(n: number | null | undefined) {
  return n == null ? "—" : n.toLocaleString("en-US");
}

export function formatCompact(n: number | null | undefined) {
  if (n == null) return "—";
  return new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 1 }).format(n);
}

export function formatPercent(ratio: number | null | undefined, digits = 1) {
  if (ratio == null || !Number.isFinite(ratio)) return "—";
  return `${(ratio * 100).toFixed(digits)}%`;
}

export function formatMs(ms: number | null | undefined) {
  if (ms == null || !Number.isFinite(ms)) return "—";
  if (ms >= 1000) return `${(ms / 1000).toFixed(ms >= 10_000 ? 0 : 1)} s`;
  return `${ms > 0 && ms < 10 ? ms.toFixed(1) : Math.round(ms)} ms`;
}

export function formatBytes(bytes: number | null | undefined) {
  if (bytes == null) return "—";
  const units = ["B", "KB", "MB", "GB", "TB"];
  let value = bytes;
  let i = 0;
  while (value >= 1024 && i < units.length - 1) {
    value /= 1024;
    i++;
  }
  return `${value < 10 && i > 0 ? value.toFixed(1) : Math.round(value)} ${units[i]}`;
}

export function formatDuration(seconds: number | null | undefined) {
  if (seconds == null) return "—";
  if (seconds < 1) return `${Math.round(seconds * 1000)} ms`;
  if (seconds < 60) return `${seconds.toFixed(1)} s`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ${Math.round(seconds % 60)}s`;
  if (seconds < 86_400) return `${Math.floor(seconds / 3600)}h ${Math.round((seconds % 3600) / 60)}m`;
  return `${Math.floor(seconds / 86_400)}d ${Math.round((seconds % 86_400) / 3600)}h`;
}

export function formatRelative(date: string | number | null | undefined) {
  if (date == null) return "never";
  const seconds = (Date.now() - new Date(date).getTime()) / 1000;
  if (seconds < 60) return "just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86_400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86_400)}d ago`;
}

export function formatDate(iso: string | number | null | undefined) {
  if (iso == null) return "—";
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function formatDateTime(iso: string | number | null | undefined) {
  if (iso == null) return "—";
  return new Date(iso).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}
