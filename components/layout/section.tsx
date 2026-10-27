import Link from "next/link";
import type { ReactNode } from "react";

export function Section({ id, title, description, children }: { id: string; title: string; description?: string; children: ReactNode }) {
  return (
    <section id={id}>
      <div className="mb-3">
        <h2 className="text-lg font-semibold text-on-surface">{title}</h2>
        {description && <p className="text-sm text-on-surface-variant">{description}</p>}
      </div>
      <div className="grid gap-4">{children}</div>
    </section>
  );
}

// Switches sections via ?section=, so only the selected one is rendered and fetched.
export function SectionTabs({
  items,
  active,
  basePath,
}: {
  items: readonly { id: string; label: string }[];
  active: string;
  basePath: string;
}) {
  return (
    <nav className="mb-6 flex flex-wrap gap-1" aria-label="Page sections">
      {items.map((item) => {
        const current = item.id === active;
        return (
          <Link
            key={item.id}
            href={`${basePath}?section=${item.id}`}
            scroll={false}
            aria-current={current ? "page" : undefined}
            className={`rounded-full px-3 py-1 text-sm ${
              current
                ? "bg-primary text-on-primary"
                : "bg-surface-container text-on-surface-variant hover:bg-outline-variant/50 hover:text-on-surface"
            }`}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
