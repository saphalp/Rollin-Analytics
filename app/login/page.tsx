import { LoginForm } from "@/components/layout/login-form";

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm rounded-xl border border-outline-variant bg-card p-6">
        <h1 className="text-xl font-semibold text-primary">Rollin Analytics</h1>
        <p className="mb-5 mt-1 text-sm text-on-surface-variant">Sign in with an admin account.</p>
        <LoginForm />
      </div>
    </main>
  );
}
