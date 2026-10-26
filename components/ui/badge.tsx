import type { ReactNode } from "react";

const tones = {
  neutral: "bg-surface-container text-on-surface-variant",
  primary: "bg-primary/10 text-primary",
  success: "bg-verified/15 text-verified-strong",
  warning: "bg-secondary-container/30 text-on-secondary-container",
  danger: "bg-error-container text-error",
} as const;

export type BadgeTone = keyof typeof tones;

export function Badge({ tone = "neutral", children }: { tone?: BadgeTone; children: ReactNode }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${tones[tone]}`}>
      {children}
    </span>
  );
}
