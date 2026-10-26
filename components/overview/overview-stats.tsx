import { StatCard } from "@/components/ui/stat-card";

type OverviewStatsProps = {
  totalUsers: number | null;
  newUsers7d: number;
  totalActivities: number | null;
  openReports: number | null;
};

export function OverviewStats({ totalUsers, newUsers7d, totalActivities, openReports }: OverviewStatsProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <StatCard label="Total users" value={totalUsers} />
      <StatCard label="New users (7 days)" value={newUsers7d} />
      <StatCard label="Activities" value={totalActivities} />
      <StatCard
        label="Open reports"
        value={openReports}
        hint={openReports == null ? "user_reports table not created yet" : undefined}
      />
    </div>
  );
}
