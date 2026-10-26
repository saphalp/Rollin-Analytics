export function UserSearch({ defaultValue }: { defaultValue?: string }) {
  return (
    <form className="flex gap-2">
      <input
        name="q"
        defaultValue={defaultValue}
        placeholder="Search name or email"
        className="w-64 rounded-lg border border-outline-variant bg-card px-3 py-2 text-sm outline-none focus:border-primary"
      />
      <button type="submit" className="rounded-lg bg-primary px-3.5 py-2 text-sm font-medium text-on-primary">
        Search
      </button>
    </form>
  );
}
