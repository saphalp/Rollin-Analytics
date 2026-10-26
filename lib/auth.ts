import "server-only";
import { redirect } from "next/navigation";
import { createSessionClient } from "@/lib/supabase/server";

function adminEmails() {
  return (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

export function isAdminEmail(email: string | undefined) {
  return !!email && adminEmails().includes(email.toLowerCase());
}

// Gate for every dashboard page and server action. Redirects non-admins to /login.
export async function requireAdmin() {
  const supabase = await createSessionClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user || !isAdminEmail(data.user.email)) redirect("/login");
  return data.user;
}
