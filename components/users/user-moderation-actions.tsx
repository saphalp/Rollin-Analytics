"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { suspendUser, unsuspendUser } from "@/lib/actions/users";

const DURATIONS = [
  { label: "24 hours", hours: 24 },
  { label: "7 days", hours: 24 * 7 },
  { label: "30 days", hours: 24 * 30 },
  { label: "Permanent", hours: 24 * 365 * 100 },
];

type Duration = (typeof DURATIONS)[number];

export function UserModerationActions({ userId, suspended }: { userId: string; suspended: boolean }) {
  const [pending, startTransition] = useTransition();
  const [selected, setSelected] = useState<Duration | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (suspended) {
    return (
      <Button variant="secondary" disabled={pending} onClick={() => startTransition(() => unsuspendUser(userId))}>
        Lift suspension
      </Button>
    );
  }

  const suspend = (d: Duration) =>
    startTransition(async () => {
      setError(null);
      try {
        await suspendUser(userId, d.hours);
        setSelected(null);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Something went wrong");
      }
    });

  const permanent = selected?.label === "Permanent";

  return (
    <div className="flex flex-wrap gap-2">
      {DURATIONS.map((d) => (
        <Button
          key={d.label}
          variant="danger"
          disabled={pending}
          onClick={() => {
            setError(null);
            setSelected(d);
          }}
        >
          Suspend {d.label.toLowerCase()}
        </Button>
      ))}

      <ConfirmDialog
        open={selected !== null}
        title={permanent ? "Suspend this user permanently?" : `Suspend this user for ${selected?.label.toLowerCase()}?`}
        description={
          permanent
            ? "They won't be able to sign in until you lift the suspension."
            : "They won't be able to sign in until the suspension ends. You can lift it early at any time."
        }
        confirmLabel="Suspend user"
        pending={pending}
        error={error}
        onClose={() => setSelected(null)}
        onConfirm={() => selected && suspend(selected)}
      />
    </div>
  );
}
