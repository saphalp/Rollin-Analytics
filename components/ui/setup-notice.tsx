import type { Result } from "@/types/result";

// Shown in place of a chart/table when its data source isn't set up or failed.
export function SetupNotice({ result }: { result: Extract<Result<unknown>, { ok: false }> }) {
  const notConfigured = result.reason === "not_configured";
  return (
    <div
      className={`rounded-lg border border-dashed px-4 py-6 text-center text-sm ${
        notConfigured ? "border-outline-variant text-on-surface-variant" : "border-error/40 text-error"
      }`}
    >
      <p className="font-medium">{notConfigured ? "Not set up yet" : "Couldn't load this data"}</p>
      <p className="mt-1 break-words">{result.message}</p>
    </div>
  );
}
