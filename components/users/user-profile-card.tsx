import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDate, formatDateTime } from "@/lib/format";
import type { AdminUser } from "@/types/users";

export function isSuspended(user: AdminUser) {
  return !!user.banned_until && new Date(user.banned_until) > new Date();
}

export function UserProfileCard({ user }: { user: AdminUser }) {
  const fields: [string, string][] = [
    ["Email", user.email],
    ["University", user.university ?? "—"],
    ["Major", user.major ?? "—"],
    ["Joined", formatDate(user.created_at)],
    ["Last sign-in", formatDateTime(user.last_sign_in_at)],
  ];

  return (
    <Card
      title={user.full_name ?? "Unnamed user"}
      action={
        isSuspended(user) ? (
          <Badge tone="danger">suspended until {formatDate(user.banned_until)}</Badge>
        ) : (
          <Badge tone="success">active</Badge>
        )
      }
    >
      <dl className="grid grid-cols-1 gap-x-6 gap-y-3 text-sm sm:grid-cols-2">
        {fields.map(([label, value]) => (
          <div key={label}>
            <dt className="text-on-surface-variant">{label}</dt>
            <dd className="text-on-surface">{value}</dd>
          </div>
        ))}
      </dl>
    </Card>
  );
}
