"use server";

import { redirect } from "next/navigation";
import { isAdminEmail } from "@/lib/auth";
import { createSessionClient } from "@/lib/supabase/server";

export async function signIn(_prev: { error?: string } | undefined, formData: FormData) {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");

  if (!isAdminEmail(email)) return { error: "This account does not have dashboard access." };

  const supabase = await createSessionClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { error: error.message };

  redirect("/");
}

export async function signOut() {
  const supabase = await createSessionClient();
  await supabase.auth.signOut();
  redirect("/login");
}
