import type { ReactNode } from "react";

type CardProps = {
  title?: string;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
};

export function Card({ title, description, action, children, className = "" }: CardProps) {
  return (
    <section className={`rounded-xl border border-outline-variant bg-card p-5 ${className}`}>
      {(title || action) && (
        <header className="mb-4 flex items-start justify-between gap-4">
          <div>
            {title && <h2 className="text-base font-semibold text-on-surface">{title}</h2>}
            {description && <p className="mt-0.5 text-sm text-on-surface-variant">{description}</p>}
          </div>
          {action}
        </header>
      )}
      {children}
    </section>
  );
}
