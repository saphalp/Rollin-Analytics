import { SetupNotice } from "@/components/ui/setup-notice";
import { StatusLabel, type Status } from "@/components/ui/status";
import type { ServiceHealth } from "@/types/metrics";
import type { Result } from "@/types/result";

const NAMES: Record<string, string> = {
  db: "Database",
  rest: "REST API",
  auth: "Auth",
  realtime: "Realtime",
  storage: "Storage",
  pooler: "Pooler",
};

const STATUS: Record<ServiceHealth["status"], { status: Status; label: string }> = {
  ACTIVE_HEALTHY: { status: "good", label: "Healthy" },
  COMING_UP: { status: "warning", label: "Starting" },
  UNHEALTHY: { status: "critical", label: "Unhealthy" },
};

export function ServiceHealthStrip({ health }: { health: Result<ServiceHealth[]> }) {
  if (!health.ok) return <SetupNotice result={health} />;

  return (
    <ul className="grid grid-cols-2 gap-2 rounded-xl border border-outline-variant bg-card p-4 sm:grid-cols-3 lg:grid-cols-6">
      {health.data.map((s) => {
        const state = STATUS[s.status] ?? STATUS.UNHEALTHY;
        return (
          <li key={s.name} title={s.error}>
            <p className="text-xs text-on-surface-variant">{NAMES[s.name] ?? s.name}</p>
            <StatusLabel status={state.status} label={state.label} />
          </li>
        );
      })}
    </ul>
  );
}
