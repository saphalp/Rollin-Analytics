"use client";

import { useActionState } from "react";
import { signIn } from "@/lib/actions/auth";
import { Button } from "@/components/ui/button";

const inputClass =
  "w-full rounded-lg border border-outline-variant bg-card px-3 py-2 text-sm outline-none focus:border-primary";

export function LoginForm() {
  const [state, formAction, pending] = useActionState(signIn, undefined);

  return (
    <form action={formAction} className="space-y-3">
      <input name="email" type="email" required placeholder="Email" autoComplete="email" className={inputClass} />
      <input
        name="password"
        type="password"
        required
        placeholder="Password"
        autoComplete="current-password"
        className={inputClass}
      />
      {state?.error && <p className="text-sm text-error">{state.error}</p>}
      <Button type="submit" disabled={pending} className="w-full">
        {pending ? "Signing in…" : "Sign in"}
      </Button>
    </form>
  );
}
