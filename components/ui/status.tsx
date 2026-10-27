export type Status = "good" | "warning" | "serious" | "critical";

export const STATUS_COLOR: Record<Status, string> = {
  good: "var(--color-status-good)",
  warning: "var(--color-status-warning)",
  serious: "var(--color-status-serious)",
  critical: "var(--color-status-critical)",
};

const STATUS_LABEL: Record<Status, string> = {
  good: "Healthy",
  warning: "Warning",
  serious: "Serious",
  critical: "Critical",
};

// Distinct shapes per status so meaning never relies on color alone.
export function StatusIcon({ status, className = "size-4" }: { status: Status; className?: string }) {
  const color = STATUS_COLOR[status];
  return (
    <svg viewBox="0 0 16 16" className={`shrink-0 ${className}`} aria-hidden="true">
      {status === "good" && (
        <>
          <circle cx="8" cy="8" r="7" fill={color} />
          <path d="M4.8 8.2 7 10.3l4.2-4.6" fill="none" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </>
      )}
      {status === "warning" && (
        <>
          <path d="M8 1.5 15 14H1z" fill={color} strokeLinejoin="round" />
          <path d="M8 6v3.6M8 11.6v.1" stroke="#191b23" strokeWidth="1.6" strokeLinecap="round" />
        </>
      )}
      {status === "serious" && (
        <>
          <circle cx="8" cy="8" r="7" fill={color} />
          <path d="M8 4.5v4.2M8 11v.1" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" />
        </>
      )}
      {status === "critical" && (
        <>
          <path d="M5.1 1h5.8L15 5.1v5.8L10.9 15H5.1L1 10.9V5.1z" fill={color} />
          <path d="m5.6 5.6 4.8 4.8m0-4.8-4.8 4.8" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" />
        </>
      )}
    </svg>
  );
}

export function StatusLabel({ status, label }: { status: Status; label?: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-sm text-on-surface">
      <StatusIcon status={status} />
      {label ?? STATUS_LABEL[status]}
    </span>
  );
}
