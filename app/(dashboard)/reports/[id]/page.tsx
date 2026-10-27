import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/layout/page-header";
import { Card } from "@/components/ui/card";
import { ReportStatusBadge, ReportTargetBadge, TARGET_LABELS, formatReason } from "@/components/reports/report-status-badge";
import { ReportTargetPreview } from "@/components/reports/report-target-preview";
import { ReportReviewPanel } from "@/components/reports/report-review-panel";
import { TargetReportsList } from "@/components/reports/target-reports-list";
import { isSuspended } from "@/components/users/user-profile-card";
import { UserModerationActions } from "@/components/users/user-moderation-actions";
import { getReport, getReportTarget, getReportsForTarget } from "@/lib/queries/reports";
import { getUser } from "@/lib/queries/users";
import { formatDateTime } from "@/lib/format";
import { OPEN_STATUSES } from "@/types/reports";

export default async function ReportDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const report = await getReport(id);
  if (!report) notFound();

  const [target, related, owner] = await Promise.all([
    getReportTarget(report.target_type, report.target_id),
    getReportsForTarget(report.target_type, report.target_id),
    report.reported_user_id ? getUser(report.reported_user_id) : Promise.resolve(null),
  ]);
  const openOnTarget = related.filter((r) => OPEN_STATUSES.includes(r.status)).length;

  return (
    <>
      <PageHeader
        title={`${TARGET_LABELS[report.target_type]} report`}
        description={`Filed ${formatDateTime(report.created_at)}`}
        action={
          <Link href="/reports" className="text-sm text-primary hover:underline">
            ← All reports
          </Link>
        }
      />
      <div className="grid gap-6 lg:grid-cols-[1fr_22rem]">
        <div className="grid min-w-0 content-start gap-6">
          <Card
            title="Reported content"
            action={
              <div className="flex gap-2">
                <ReportTargetBadge type={report.target_type} />
                {!target && <span className="text-xs text-error">deleted</span>}
              </div>
            }
          >
            <ReportTargetPreview report={report} target={target} />
          </Card>
          <Card title={`All reports on this ${report.target_type === "user" ? "profile" : report.target_type} (${related.length})`}>
            <TargetReportsList reports={related} currentId={report.id} />
          </Card>
        </div>

        <div className="grid content-start gap-6">
          <Card title="Report" action={<ReportStatusBadge status={report.status} />}>
            <dl className="space-y-3 text-sm">
              <div>
                <dt className="text-on-surface-variant">Reason</dt>
                <dd className="capitalize text-on-surface">{formatReason(report.reason)}</dd>
              </div>
              <div>
                <dt className="text-on-surface-variant">Details from reporter</dt>
                <dd className="whitespace-pre-line text-on-surface">{report.details ?? "—"}</dd>
              </div>
              <div>
                <dt className="text-on-surface-variant">Reporter</dt>
                <dd className="text-on-surface">
                  {report.reporter ? (
                    <Link href={`/users/${report.reporter.id}`} className="text-primary hover:underline">
                      {report.reporter.full_name ?? report.reporter.email}
                    </Link>
                  ) : (
                    "Deleted account"
                  )}
                </dd>
              </div>
              {report.reviewed_at && (
                <div>
                  <dt className="text-on-surface-variant">Reviewed</dt>
                  <dd className="text-on-surface">
                    {formatDateTime(report.reviewed_at)}
                    {report.reviewer && ` by ${report.reviewer.full_name ?? report.reviewer.email}`}
                  </dd>
                </div>
              )}
            </dl>
          </Card>

          <Card title="Take action">
            <ReportReviewPanel
              reportId={report.id}
              status={report.status}
              resolutionNote={report.resolution_note}
              targetType={report.target_type}
              targetId={report.target_id}
              target={target}
              openOnTarget={openOnTarget}
            />
          </Card>

          <Card
            title="Content owner"
            description={owner ? undefined : "This account has been deleted"}
          >
            {owner && (
              <div className="space-y-3">
                <Link href={`/users/${owner.id}`} className="block text-sm font-medium text-primary hover:underline">
                  {owner.full_name ?? owner.email}
                </Link>
                <UserModerationActions userId={owner.id} suspended={isSuspended(owner)} />
              </div>
            )}
          </Card>
        </div>
      </div>
    </>
  );
}
