import type { ReactNode } from "react";

export function Section({ id, title, description, children }: { id: string; title: string; description?: string; children: ReactNode }) {
  return (
    <section id={id} className="scroll-mt-6">
      <div className="mb-3">
        <h2 className="text-lg font-semibold text-on-surface">{title}</h2>
        {description && <p className="text-sm text-on-surface-variant">{description}</p>}
      </div>
      <div className="grid gap-4">{children}</div>
    </section>
  );
}

export function SectionNav({ items }: { items: { id: string; label: string }[] }) {
  return (
    <nav className="mb-6 flex flex-wrap gap-1" aria-label="Page sections">
      {items.map((item) => (
        <a
          key={item.id}
          href={`#${item.id}`}
          className="rounded-full bg-surface-container px-3 py-1 text-sm text-on-surface-variant hover:bg-outline-variant/50 hover:text-on-surface"
        >
          {item.label}
        </a>
      ))}
    </nav>
  );
}
