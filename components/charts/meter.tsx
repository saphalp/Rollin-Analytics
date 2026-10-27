import { STATUS_COLOR, type Status } from "@/components/ui/status";

// Fill carries severity; the track is a lighter step of the same color.
export function Meter({ value, status, label }: { value: number; status: Status; label: string }) {
  const pct = Math.min(Math.max(value, 0), 1) * 100;
  const color = STATUS_COLOR[status];
  return (
    <div
      role="meter"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(pct)}
      className="h-2 w-full overflow-hidden rounded-full"
      style={{ background: `color-mix(in srgb, ${color} 20%, transparent)` }}
    >
      <div className="h-full rounded-full" style={{ width: `${pct}%`, background: color }} />
    </div>
  );
}
