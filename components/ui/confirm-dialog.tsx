"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { Button } from "@/components/ui/button";

type ConfirmDialogProps = {
  open: boolean;
  title: string;
  description?: ReactNode;
  confirmLabel: string;
  cancelLabel?: string;
  variant?: "primary" | "danger";
  pending?: boolean;
  error?: string | null;
  onConfirm: () => void;
  onClose: () => void;
  // Extra fields (e.g. a reason input) rendered between the description and the buttons.
  children?: ReactNode;
};

// Native <dialog> via showModal(): gives us focus trapping, Esc to close and a backdrop for free.
export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel,
  cancelLabel = "Keep it",
  variant = "danger",
  pending = false,
  error,
  onConfirm,
  onClose,
  children,
}: ConfirmDialogProps) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  const dismiss = () => {
    if (!pending) onClose();
  };

  return (
    <dialog
      ref={ref}
      aria-labelledby="confirm-dialog-title"
      onCancel={(e) => {
        e.preventDefault();
        dismiss();
      }}
      onClick={(e) => {
        // Clicks on the dialog element itself (not its content) land on the backdrop.
        if (e.target === e.currentTarget) dismiss();
      }}
      className="m-auto w-[calc(100%-2rem)] max-w-md rounded-xl bg-card p-0 text-on-surface shadow-xl backdrop:bg-black/40"
    >
      <form
        method="dialog"
        className="space-y-4 p-6"
        onSubmit={(e) => {
          e.preventDefault();
          onConfirm();
        }}
      >
        <h2 id="confirm-dialog-title" className="text-lg font-semibold">
          {title}
        </h2>
        {description && <div className="text-sm text-on-surface-variant">{description}</div>}
        {children}
        {error && <p className="text-sm text-error">{error}</p>}
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="secondary" disabled={pending} onClick={dismiss}>
            {cancelLabel}
          </Button>
          <Button type="submit" variant={variant} disabled={pending}>
            {pending ? "Working…" : confirmLabel}
          </Button>
        </div>
      </form>
    </dialog>
  );
}
