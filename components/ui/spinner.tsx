// Fades in after a short delay so fast navigations don't flash a spinner.
export function Spinner({ label = "Loading…" }: { label?: string }) {
  return (
    <div role="status" className="flex animate-delayed-fade-in flex-col items-center justify-center gap-3 py-24">
      <div className="size-8 animate-spin rounded-full border-[3px] border-surface-container border-t-primary" />
      <span className="text-sm text-on-surface-variant">{label}</span>
    </div>
  );
}
