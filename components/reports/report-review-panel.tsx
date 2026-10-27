"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { cancelActivity, closeReportsForTarget, deletePost, updateReportStatus } from "@/lib/actions/reports";
import type { ReportStatus, ReportTarget, ReportTargetType } from "@/types/reports";

const DEFAULT_CANCEL_REASON = "Removed for violating Rollin's community guidelines";

type ReviewPanelProps = {
  reportId: string;
  status: ReportStatus;
  resolutionNote: string | null;
  targetType: ReportTargetType;
  targetId: string;
  target: ReportTarget | null;
  // Open reports on the same target, including this one.
  openOnTarget: number;
};

export function ReportReviewPanel({
  reportId,
  status,
  resolutionNote,
  targetType,
  targetId,
  target,
  openOnTarget,
}: ReviewPanelProps) {
  const [note, setNote] = useState(resolutionNote ?? "");
  const [applyToAll, setApplyToAll] = useState(openOnTarget > 1);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [dialog, setDialog] = useState<"delete-post" | "cancel-activity" | null>(null);
  const [cancelReason, setCancelReason] = useState(DEFAULT_CANCEL_REASON);

  const openDialog = (next: "delete-post" | "cancel-activity") => {
    setError(null);
    setDialog(next);
  };

  const run = (action: () => Promise<void>) =>
    startTransition(async () => {
      setError(null);
      try {
        await action();
      } catch (e) {
        setError(e instanceof Error ? e.message : "Something went wrong");
      }
    });

  const close = (next: "resolved" | "dismissed") =>
    run(() =>
      applyToAll && openOnTarget > 1
        ? closeReportsForTarget(targetType, targetId, next, note)
        : updateReportStatus(reportId, next, note),
    );

  const canDeletePost = target?.type === "post";
  const canCancelActivity = target?.type === "activity" && target.status !== "cancelled";

  return (
    <div className="space-y-5">
      <label className="block text-sm">
        <span className="text-on-surface-variant">Resolution note (internal)</span>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={3}
          placeholder="What you decided and why"
          className="mt-1 w-full rounded-lg border border-outline-variant bg-card px-3 py-2 text-on-surface"
        />
      </label>

      {openOnTarget > 1 && (
        <label className="flex items-center gap-2 text-sm text-on-surface">
          <input type="checkbox" checked={applyToAll} onChange={(e) => setApplyToAll(e.target.checked)} />
          Apply to all {openOnTarget} open reports on this {targetType === "user" ? "profile" : targetType}
        </label>
      )}

      <div className="flex flex-wrap gap-2">
        {status === "pending" && (
          <Button variant="secondary" disabled={pending} onClick={() => run(() => updateReportStatus(reportId, "reviewing", note))}>
            Mark reviewing
          </Button>
        )}
        <Button disabled={pending} onClick={() => close("resolved")}>
          Resolve
        </Button>
        <Button variant="secondary" disabled={pending} onClick={() => close("dismissed")}>
          Dismiss
        </Button>
        {(status === "resolved" || status === "dismissed") && (
          <Button variant="secondary" disabled={pending} onClick={() => run(() => updateReportStatus(reportId, "pending", note))}>
            Reopen
          </Button>
        )}
      </div>

      {(canDeletePost || canCancelActivity) && (
        <div className="border-t border-outline-variant pt-4">
          <p className="mb-2 text-sm font-medium text-on-surface">Content action</p>
          <p className="mb-3 text-sm text-on-surface-variant">
            Also resolves every open report on this {targetType}. The report keeps a snapshot of the content.
          </p>
          {canDeletePost && (
            <Button variant="danger" disabled={pending} onClick={() => openDialog("delete-post")}>
              Delete post
            </Button>
          )}
          {canCancelActivity && (
            <Button variant="danger" disabled={pending} onClick={() => openDialog("cancel-activity")}>
              Cancel activity
            </Button>
          )}
        </div>
      )}

      {!dialog && error && <p className="text-sm text-error">{error}</p>}

      <ConfirmDialog
        open={dialog === "delete-post"}
        title="Delete this post?"
        description="The post and all its images will be permanently removed. This can't be undone."
        confirmLabel="Delete post"
        pending={pending}
        error={error}
        onClose={() => setDialog(null)}
        onConfirm={() =>
          run(async () => {
            await deletePost(targetId, note);
            setDialog(null);
          })
        }
      />

      {target?.type === "activity" && (
        <ConfirmDialog
          open={dialog === "cancel-activity"}
          title="Cancel this activity?"
          description={`${target.rsvp_count} attendee${target.rsvp_count === 1 ? "" : "s"} will see it as cancelled but won't get a notification.`}
          confirmLabel="Cancel activity"
          pending={pending}
          error={error}
          onClose={() => setDialog(null)}
          onConfirm={() =>
            run(async () => {
              await cancelActivity(targetId, cancelReason, note);
              setDialog(null);
            })
          }
        >
          <label className="block text-sm">
            <span className="text-on-surface-variant">Reason shown in the app</span>
            <textarea
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              rows={2}
              maxLength={500}
              className="mt-1 w-full rounded-lg border border-outline-variant bg-card px-3 py-2 text-on-surface"
            />
          </label>
        </ConfirmDialog>
      )}
    </div>
  );
}
