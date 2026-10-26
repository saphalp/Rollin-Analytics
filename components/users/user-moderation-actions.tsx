"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { suspendUser, unsuspendUser } from "@/lib/actions/users";

const DURATIONS = [
  { label: "24 hours", hours: 24 },
  { label: "7 days", hours: 24 * 7 },
  { label: "30 days", hours: 24 * 30 },
  { label: "Permanent", hours: 24 * 365 * 100 },
];

export function UserModerationActions({ userId, suspended }: { userId: string; suspended: boolean }) {
  const [pending, startTransition] = useTransition();

  if (suspended) {
    return (
      <Button variant="secondary" disabled={pending} onClick={() => startTransition(() => unsuspendUser(userId))}>
        Lift suspension
      </Button>
    );
  }

  return (
    <div className="flex flex-wrap gap-2">
      {DURATIONS.map((d) => (
        <Button
          key={d.label}
          variant="danger"
          disabled={pending}
          onClick={() => {
            if (confirm(`Suspend this user for ${d.label.toLowerCase()}?`)) {
              startTransition(() => suspendUser(userId, d.hours));
            }
          }}
        >
          Suspend {d.label.toLowerCase()}
        </Button>
      ))}
    </div>
  );
}
