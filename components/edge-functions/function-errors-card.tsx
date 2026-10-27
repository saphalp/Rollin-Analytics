import { Card } from "@/components/ui/card";
import { SetupNotice } from "@/components/ui/setup-notice";
import { StatusLabel } from "@/components/ui/status";
import { formatDateTime } from "@/lib/format";
import type { FunctionLogError } from "@/types/metrics";
import type { Result } from "@/types/result";

export function FunctionErrorsCard({ errors }: { errors: Result<FunctionLogError[]> }) {
  return (
    <Card title="Recent function errors" description="Error-level console output from inside functions, newest first">
      {!errors.ok ? (
        <SetupNotice result={errors} />
      ) : errors.data.length === 0 ? (
        <StatusLabel status="good" label="No errors logged in the last 24 hours" />
      ) : (
        <ul className="divide-y divide-outline-variant/60">
          {errors.data.map((e) => (
            <li key={e.id} className="py-2.5 first:pt-0 last:pb-0">
              <div className="flex items-center justify-between gap-3 text-xs text-on-surface-variant">
                <code className="font-medium text-on-surface">{e.slug}</code>
                <span className="whitespace-nowrap">{formatDateTime(e.ts)}</span>
              </div>
              <pre className="mt-1 whitespace-pre-wrap break-all font-mono text-xs text-on-surface">{e.message}</pre>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
