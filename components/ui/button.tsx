import type { ButtonHTMLAttributes } from "react";

const variants = {
  primary: "bg-primary text-on-primary hover:bg-primary-container",
  secondary: "border border-outline-variant bg-card text-on-surface hover:bg-surface-container",
  danger: "bg-error text-on-error hover:opacity-90",
} as const;

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: keyof typeof variants;
};

export function Button({ variant = "primary", className = "", ...props }: ButtonProps) {
  return (
    <button
      className={`inline-flex items-center justify-center rounded-lg px-3.5 py-2 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${variants[variant]} ${className}`}
      {...props}
    />
  );
}
