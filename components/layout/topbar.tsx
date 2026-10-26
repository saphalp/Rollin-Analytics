import { signOut } from "@/lib/actions/auth";

export function Topbar({ email }: { email: string | undefined }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-lg font-bold text-primary">Rollin Analytics</span>
      <form action={signOut} className="flex items-center gap-3 text-sm">
        <span className="hidden text-on-surface-variant sm:inline">{email}</span>
        <button type="submit" className="text-primary hover:underline">
          Sign out
        </button>
      </form>
    </div>
  );
}
