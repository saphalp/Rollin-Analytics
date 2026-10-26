import { PageHeader } from "@/components/layout/page-header";
import { TopActivitiesCard } from "@/components/ux/top-activities-card";
import { AppEventsCard } from "@/components/ux/app-events-card";
import { getRecentAppEvents, getTopViewedActivities } from "@/lib/queries/ux";

export default async function UxPage() {
  const [topActivities, events] = await Promise.all([getTopViewedActivities(), getRecentAppEvents()]);

  return (
    <>
      <PageHeader title="Frontend / UX" description="How people use the app" />
      <div className="grid gap-6">
        <TopActivitiesCard activities={topActivities} />
        <AppEventsCard events={events} />
      </div>
    </>
  );
}
