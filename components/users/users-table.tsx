import Link from "next/link";
import { DataTable } from "@/components/ui/data-table";
import { EmptyState } from "@/components/ui/empty-state";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/format";
import type { Profile } from "@/types/users";

export function UsersTable({ users }: { users: Profile[] }) {
  return (
    <DataTable
      rows={users}
      rowKey={(u) => u.id}
      empty={<EmptyState title="No users found" />}
      columns={[
        {
          header: "Name",
          cell: (u) => (
            <Link href={`/users/${u.id}`} className="font-medium text-primary hover:underline">
              {u.full_name ?? "Unnamed"}
            </Link>
          ),
        },
        { header: "Email", cell: (u) => u.email },
        { header: "University", cell: (u) => u.university ?? "—" },
        {
          header: "Status",
          cell: (u) => (
            <div className="flex gap-1">
              {!u.profile_completed && <Badge tone="warning">incomplete</Badge>}
              {u.is_driver && <Badge tone="primary">driver</Badge>}
              {u.is_educational_email && <Badge tone="success">.edu</Badge>}
            </div>
          ),
        },
        { header: "Joined", cell: (u) => formatDate(u.created_at) },
      ]}
    />
  );
}
