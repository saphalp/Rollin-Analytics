import { Card } from "@/components/ui/card";
import { StatusIcon, StatusLabel } from "@/components/ui/status";
import type { Advisory } from "@/lib/advisories";

export function AdvisoriesCard({ advisories }: { advisories: Advisory[] }) {
  return (
    <Card title="Health checks" description="Automatic checks across Postgres, the API and edge functions">
      {advisories.length === 0 ? (
        <StatusLabel status="good" label="All checks passing" />
      ) : (
        <ul className="divide-y divide-outline-variant/60">
          {advisories.map((a) => (
            <li key={a.title} className="flex gap-3 py-3 first:pt-0 last:pb-0">
              <StatusIcon status={a.status} className="mt-0.5 size-4" />
              <div>
                <p className="text-sm font-medium text-on-surface">{a.title}</p>
                <p className="text-sm text-on-surface-variant">{a.detail}</p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
