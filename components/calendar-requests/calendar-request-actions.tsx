"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { reviewCalendarSubmission } from "@/lib/actions/calendar-submissions";

export function CalendarRequestActions({ id, url }: { id: string; url: string }) {
  const [pending, startTransition] = useTransition();
  const [rejecting, setRejecting] = useState(false);
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);

  const decide = (decision: "approved" | "rejected", onDone?: () => void) =>
    startTransition(async () => {
      setError(null);
      try {
        await reviewCalendarSubmission(id, decision, decision === "rejected" ? note : undefined);
        onDone?.();
      } catch (e) {
        setError(e instanceof Error ? e.message : "Something went wrong");
      }
    });

  return (
    <div className="flex flex-col items-end gap-1">
      <div className="flex justify-end gap-2">
        <Button disabled={pending} onClick={() => decide("approved")}>
          Approve
        </Button>
        <Button
          variant="secondary"
          disabled={pending}
          onClick={() => {
            setError(null);
            setRejecting(true);
          }}
        >
          Reject
        </Button>
      </div>
      {!rejecting && error && <p className="max-w-56 text-right text-xs text-error">{error}</p>}

      <ConfirmDialog
        open={rejecting}
        title="Reject this calendar?"
        description={<span className="break-all">{url}</span>}
        confirmLabel="Reject"
        cancelLabel="Cancel"
        pending={pending}
        error={error}
        onClose={() => setRejecting(false)}
        onConfirm={() => decide("rejected", () => setRejecting(false))}
      >
        <label className="block text-left text-sm">
          <span className="text-on-surface-variant">Note (optional)</span>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={2}
            placeholder="e.g. Not an official university calendar"
            className="mt-1 w-full rounded-lg border border-outline-variant bg-card px-3 py-2 text-on-surface"
          />
        </label>
      </ConfirmDialog>
    </div>
  );
}
