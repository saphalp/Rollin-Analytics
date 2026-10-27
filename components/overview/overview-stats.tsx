import { Sparkline } from "@/components/charts/sparkline";
import { StatCard } from "@/components/ui/stat-card";
import type { Status } from "@/components/ui/status";
import { formatMs, formatPercent } from "@/lib/format";
import type { DailyCount, HourlyTraffic, TrafficSummary } from "@/types/metrics";
import type { Result } from "@/types/result";

type OverviewStatsProps = {
  totalUsers: number | null;
  daily: Result<DailyCount[]>;
  api: Result<TrafficSummary>;
  apiHourly: Result<HourlyTraffic[]>;
  openReports: number | null;
};

function weekOverWeek(daily: DailyCount[]) {
  const signups = daily.filter((d) => d.metric === "signups").map((d) => d.count);
  const thisWeek = signups.slice(-7).reduce((a, b) => a + b, 0);
  const lastWeek = signups.slice(-14, -7).reduce((a, b) => a + b, 0);
  if (lastWeek === 0) return { thisWeek, delta: undefined };
  const change = (thisWeek - lastWeek) / lastWeek;
  return {
    thisWeek,
    delta: {
      text: `${change >= 0 ? "+" : ""}${Math.round(change * 100)}% vs previous 7 days`,
      direction: change > 0 ? ("up" as const) : change < 0 ? ("down" as const) : ("flat" as const),
      good: change >= 0,
    },
  };
}

export function OverviewStats({ totalUsers, daily, api, apiHourly, openReports }: OverviewStatsProps) {
  const signupTrend = daily.ok
    ? daily.data.filter((d) => d.metric === "signups").map((d) => ({ x: d.day, y: d.count }))
    : null;
  const week = daily.ok ? weekOverWeek(daily.data) : null;
  const requestTrend = apiHourly.ok ? apiHourly.data.map((h) => ({ x: h.ts, y: h.ok + h.clientErrors + h.serverErrors })) : null;

  const errorRate = api.ok && api.data.requests ? api.data.serverErrors / api.data.requests : null;
  const errorStatus: Status | undefined =
    errorRate == null ? undefined : errorRate > 0.05 ? "critical" : errorRate > 0.01 ? "serious" : errorRate > 0 ? "warning" : "good";
  const p95 = api.ok ? api.data.p95 : null;

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
      <StatCard label="Total users" value={totalUsers}>
        {signupTrend && <Sparkline data={signupTrend} xFormat="day" label="Daily signups" />}
      </StatCard>
      <StatCard
        label="New users (7 days)"
        value={week?.thisWeek ?? null}
        delta={week?.delta}
        hint={daily.ok ? undefined : "Signup trends unavailable"}
      />
      <StatCard label="Open reports" value={openReports} hint={openReports == null ? "Unavailable" : "Open or under review"} />
      <StatCard label="API requests (24h)" value={api.ok ? api.data.requests : null} hint={api.ok ? undefined : "Add SUPABASE_ACCESS_TOKEN"}>
        {requestTrend && <Sparkline data={requestTrend} xFormat="hour" label="Hourly API requests" />}
      </StatCard>
      <StatCard
        label="API 5xx error rate (24h)"
        value={formatPercent(errorRate, 2)}
        status={errorStatus}
        hint={api.ok ? `${api.data.serverErrors.toLocaleString()} server · ${api.data.clientErrors.toLocaleString()} client errors` : undefined}
      />
      <StatCard
        label="API latency p95 (24h)"
        value={formatMs(p95)}
        status={p95 == null ? undefined : p95 > 1000 ? "warning" : "good"}
        hint={api.ok ? `median ${formatMs(api.data.p50)} · p99 ${formatMs(api.data.p99)}` : undefined}
      />
    </div>
  );
}
