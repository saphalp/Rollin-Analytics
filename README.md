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
| `/`           | Overview: users, new signups, activities, open reports     |
| `/database`   | Row counts for each Rollin table                           |
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
  ui/                generic building blocks: card, stat card, badge, button, data table, empty state
  overview/  database/  ux/  reports/  users/
lib/
  supabase/          admin.ts (service role, server only) and server.ts (session cookies)
  queries/           read-only data access, one file per feature
  actions/           server actions (mutations), each calls requireAdmin()
  auth.ts            requireAdmin() gate
types/               shared TypeScript types
supabase/drafts/     SQL for tables the dashboard needs that don't exist in Rollin yet
```

## Security

- `SUPABASE_SERVICE_ROLE_KEY` bypasses RLS. It's only imported from files marked `server-only`, so it never reaches the browser.
- Every dashboard page goes through `requireAdmin()` in `app/(dashboard)/layout.tsx`, and every server action calls it again.
- When you host this, set the env vars in your provider's dashboard, not in a committed file.

## Tables that don't exist yet

The Reports and UX event views show a "not set up yet" state until these exist. Move them into Rollin's `supabase/migrations/` when ready:

- `supabase/drafts/user_reports.sql` for the in-app report feature
- `supabase/drafts/app_events.sql` for client-side screen/session/error tracking
