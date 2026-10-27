# Rollin Analytics

Admin/developer dashboard for the [Rollin](https://github.com/saphalp/Rollin) app. It reads from the same Supabase project as the app.

**Stack:** Next.js (App Router) · TypeScript · Tailwind CSS v4 · Supabase

## Setup

```bash
npm install
cp .env.example .env.local   # fill in the Supabase keys and ADMIN_EMAILS
npm run dev                  # http://localhost:3000
```

Sign in with a Rollin account (email + password) whose email is listed in `ADMIN_EMAILS`.

## Pages

| Route         | What it shows                                              |
| ------------- | ---------------------------------------------------------- |
| `/`           | Overview: service health, growth, API traffic, app activity |
| `/database`   | Postgres health, API traffic & latency, slow queries, tables, edge functions |
| `/ux`         | Most viewed activities, recent app events                  |
| `/reports`    | User-to-user reports, filter by status, change status      |
| `/users`      | Search users                                               |
| `/users/[id]` | Profile, reports against the user, suspend / unsuspend     |

## Project layout

```
app/                 routes; pages stay thin and compose components
  (dashboard)/       everything behind the admin check (see layout.tsx)
  login/
components/          UI, one folder per feature
  layout/            sidebar, topbar, page header, login form
  ui/                generic building blocks: card, stat card, status, badge, button, data table, setup notice
  charts/            Recharts wrappers (time series, columns, sparkline) + bar list, meter, legend, table view
  overview/  database/  edge-functions/  ux/  reports/  users/
lib/
  supabase/          admin.ts (service role, server only) and server.ts (session cookies)
  queries/           read-only data access: database.ts (Postgres RPCs), platform.ts (Management API logs)
  advisories.ts      health-check rules shown on the Database page
  actions/           server actions (mutations), each calls requireAdmin()
  auth.ts            requireAdmin() gate
types/               shared TypeScript types
supabase/drafts/     SQL for tables the dashboard needs that don't exist in Rollin yet
```

## Security

- `SUPABASE_SERVICE_ROLE_KEY` bypasses RLS. It's only imported from files marked `server-only`, so it never reaches the browser.
- Every dashboard page goes through `requireAdmin()` in `app/(dashboard)/layout.tsx`, and every server action calls it again.
- When you host this, set the env vars in your provider's dashboard, not in a committed file.

## Data sources

| Source | Powers | Setup |
| ------ | ------ | ----- |
| Postgres stats views (`pg_stat_*`, `pg_stat_statements`) | DB health, cache hit ratios, connections, slow queries, table and index stats, daily signups/activity | Run `supabase/drafts/admin_metrics.sql` once in the SQL editor |
| Supabase Management API (logs, health, functions) | Service health, API requests/errors/latency, most requested tables, edge function invocations/errors | Set `SUPABASE_ACCESS_TOKEN` |

Each card shows a "Not set up yet" message until its source is configured. Log-based metrics cover the last 24 hours (the API's maximum per query) and are cached for 60 seconds. Postgres counters accumulate since the last stats reset.

## Reports

The Reports page reads Rollin's `reports` table (`supabase/migrations/20261026120000_reports.sql` in the app repo). Profile, activity and post reports share one queue; each report detail page shows the live content (or the snapshot captured at filing time if it was deleted) and lets moderators resolve/dismiss, delete a post, cancel an activity, or suspend the owner.

## Tables that don't exist yet

The UX event views show a "not set up yet" state until these exist. Move them into Rollin's `supabase/migrations/` when ready:

- `supabase/drafts/app_events.sql` for client-side screen/session/error tracking
