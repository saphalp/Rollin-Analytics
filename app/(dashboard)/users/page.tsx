import { PageHeader } from "@/components/layout/page-header";
import { Card } from "@/components/ui/card";
import { UserSearch } from "@/components/users/user-search";
import { UsersTable } from "@/components/users/users-table";
import { getUsers } from "@/lib/queries/users";

export default async function UsersPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q } = await searchParams;
  const users = await getUsers({ search: q });

  return (
    <>
      <PageHeader title="Users" description="Look up accounts and act on reports" action={<UserSearch defaultValue={q} />} />
      <Card>
        <UsersTable users={users} />
      </Card>
    </>
  );
}
