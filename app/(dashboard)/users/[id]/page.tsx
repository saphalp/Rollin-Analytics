import { notFound } from "next/navigation";
import { PageHeader } from "@/components/layout/page-header";
import { Card } from "@/components/ui/card";
import { UserProfileCard, isSuspended } from "@/components/users/user-profile-card";
import { UserModerationActions } from "@/components/users/user-moderation-actions";
import { UserReportsList } from "@/components/users/user-reports-list";
import { getUser } from "@/lib/queries/users";
import { getReportsAgainstUser } from "@/lib/queries/reports";

export default async function UserDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [user, reports] = await Promise.all([getUser(id), getReportsAgainstUser(id)]);
  if (!user) notFound();

  return (
    <>
      <PageHeader title="User" />
      <div className="grid gap-6">
        <UserProfileCard user={user} />
        <Card title="Moderation" description="Suspensions use Supabase Auth bans and block sign-in">
          <UserModerationActions userId={user.id} suspended={isSuspended(user)} />
        </Card>
        <Card title={`Reports against this user (${reports.length})`}>
          <UserReportsList reports={reports} />
        </Card>
      </div>
    </>
  );
}
