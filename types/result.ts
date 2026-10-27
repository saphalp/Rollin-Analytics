// A data source that may not be set up yet (missing table/RPC/token) or may fail.
// Cards render a setup notice instead of crashing the whole page.
export type Result<T> =
  | { ok: true; data: T }
  | { ok: false; reason: "not_configured" | "error"; message: string };
