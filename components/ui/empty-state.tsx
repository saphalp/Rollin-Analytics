import type { ReactNode } from "react";

export function EmptyState({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <div className="rounded-lg border border-dashed border-outline-variant px-6 py-10 text-center">
      <p className="font-medium text-on-surface">{title}</p>
      {children && <div className="mt-1 text-sm text-on-surface-variant">{children}</div>}
    </div>
  );
}
