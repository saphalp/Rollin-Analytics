/* eslint-disable @next/next/no-img-element -- Supabase storage URLs; no remotePatterns needed for an admin tool */
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { avatarUrl, postImageUrl } from "@/lib/storage";
import { formatDate, formatDateTime } from "@/lib/format";
import type { Report, ReportTarget } from "@/types/reports";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <dt className="text-on-surface-variant">{label}</dt>
      <dd className="text-on-surface">{children}</dd>
    </div>
  );
}

function ImageGrid({ urls, alt }: { urls: string[]; alt: string }) {
  if (urls.length === 0) return null;
  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
      {urls.map((url, i) => (
        <a key={url} href={url} target="_blank" rel="noreferrer" className="block">
          <img
            src={url}
            alt={`${alt} ${i + 1}`}
            className="aspect-square w-full rounded-lg border border-outline-variant object-cover"
          />
        </a>
      ))}
    </div>
  );
}

// Shows the live content when it still exists, otherwise what submit_report captured at filing time.
export function ReportTargetPreview({ report, target }: { report: Report; target: ReportTarget | null }) {
  if (!target) return <SnapshotPreview report={report} />;

  if (target.type === "user") {
    return (
      <div className="flex items-start gap-4">
        {target.avatar_url && (
          <img src={target.avatar_url} alt="" className="size-16 rounded-full border border-outline-variant object-cover" />
        )}
        <dl className="grid flex-1 grid-cols-1 gap-x-6 gap-y-3 text-sm sm:grid-cols-2">
          <Field label="Name">
            <Link href={`/users/${target.id}`} className="text-primary hover:underline">
              {target.full_name ?? "Unnamed user"}
            </Link>
          </Field>
          <Field label="Email">{target.email}</Field>
          <Field label="University">{target.university ?? "—"}</Field>
          <Field label="Joined">{formatDate(target.created_at)}</Field>
        </dl>
      </div>
    );
  }

  if (target.type === "activity") {
    return (
      <div className="grid gap-4 sm:grid-cols-[12rem_1fr]">
        {target.image_url && (
          <img src={target.image_url} alt="" className="aspect-square w-full rounded-lg border border-outline-variant object-cover" />
        )}
        <div className="space-y-3 text-sm">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-lg font-semibold text-on-surface">{target.title}</h3>
            <Badge tone={target.status === "active" ? "success" : target.status === "cancelled" ? "danger" : "neutral"}>
              {target.status}
            </Badge>
          </div>
          {target.description && <p className="whitespace-pre-line text-on-surface">{target.description}</p>}
          <dl className="grid grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-2">
            <Field label="When">{formatDateTime(target.date_time)}</Field>
            <Field label="Where">{target.location ?? "—"}</Field>
            <Field label="Category">{target.category ?? "—"}</Field>
            <Field label="RSVPs">{target.rsvp_count}</Field>
            <Field label="Created">{formatDate(target.created_at)}</Field>
            {target.status === "cancelled" && (
              <Field label="Cancelled">
                {formatDate(target.cancelled_at)}
                {target.cancel_reason && ` — ${target.cancel_reason}`}
              </Field>
            )}
          </dl>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3 text-sm">
      <ImageGrid urls={target.image_urls} alt="Post image" />
      {target.caption && <p className="whitespace-pre-line text-on-surface">{target.caption}</p>}
      <dl className="grid grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-2">
        <Field label="Posted">{formatDateTime(target.created_at)}</Field>
        <Field label="From activity">{target.activity_title ?? (target.activity_id ? "Deleted activity" : "—")}</Field>
      </dl>
    </div>
  );
}

function SnapshotPreview({ report }: { report: Report }) {
  const s = report.target_snapshot;
  const images =
    report.target_type === "post"
      ? (s.image_paths ?? []).map(postImageUrl)
      : [report.target_type === "user" ? avatarUrl(s.profile_picture) : s.image_url ?? null];

  return (
    <div className="space-y-3 text-sm">
      <p className="rounded-lg bg-surface-container px-3 py-2 text-on-surface-variant">
        This {report.target_type === "user" ? "account" : report.target_type} no longer exists. Showing what was captured
        when the report was filed{report.target_type === "post" ? "; images may have been deleted from storage" : ""}.
      </p>
      <ImageGrid urls={images.filter((u): u is string => !!u)} alt="Snapshot image" />
      <dl className="grid grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-2">
        {report.target_type === "user" && (
          <>
            <Field label="Name">{s.full_name ?? "—"}</Field>
            <Field label="University">{s.university ?? "—"}</Field>
          </>
        )}
        {report.target_type === "activity" && (
          <>
            <Field label="Title">{s.title ?? "—"}</Field>
            <Field label="When">{formatDateTime(s.date_time)}</Field>
          </>
        )}
        {report.target_type === "post" && <Field label="Caption">{s.caption || "—"}</Field>}
      </dl>
    </div>
  );
}
