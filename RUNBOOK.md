# The Cook Book Club — Runbook

Everything needed to run, maintain, recover, or hand off this project. Keep it current.

## What it is
A members-only recipe site for a Berkeley community. Upload a photo (or paste text);
Claude extracts a structured recipe; members browse by category, filter, and search.

- **Live site:** https://recipe-book-iota-two.vercel.app
- **Repo:** https://github.com/sunnyhsu-growth/-the-cook-book-club
- **Stack:** React + Vite (client) · Vercel serverless function `api/extract.ts` (AI) ·
  Supabase (Postgres + Auth + Storage) · Anthropic Claude.

## Accounts / services (who owns what)
| Service | Used for | Notes |
|---|---|---|
| **Vercel** (`yentingsunnys-projects`, project `recipe-book`) | Hosting client + `/api/extract`; env vars | Auto-deploys on push to `main`. |
| **Supabase** (project `gcvpbzkdxxulrupwqlrv`) | Postgres DB, Auth, Storage | Dashboard for SQL, users, providers. |
| **Google Cloud** | Google OAuth client (Sign in with Google) | Client ID/secret pasted into Supabase Auth. |
| **Anthropic** | Claude API (recipe extraction) | `ANTHROPIC_API_KEY` (server-only). |

## Environment variables
**Vercel project (production)** — set in Vercel → Settings → Environment Variables:
- `ANTHROPIC_API_KEY` — Claude key (server/function only; never client).
- `CLAUDE_MODEL` — extraction model (`claude-opus-4-8`; `claude-sonnet-4-6` is ~5× cheaper).
- `SUPABASE_URL`, `SUPABASE_ANON_KEY` — used by the function to verify the caller's session.
- `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` — baked into the client at build.
- (`VITE_API_URL` left unset in prod → client calls same-origin `/api/extract`.)

**Local dev** — `.env` at repo root (server) and `client/.env` (client). Templates:
`.env.example` and `client/.env.example`. `.env` files are git-ignored.

## Local development
```bash
# server (Express dev API on :3001) — reuses api/extract.ts
cd server && npm install && npm run dev
# client (Vite on :5173/5174)
cd client && npm install && npm run dev
```
Local extraction uses the same logic as production (`api/extract.ts`).

## Deploy
- **Normal:** `git push origin main` → Vercel auto-deploys.
- **Manual (fallback):** `npx vercel deploy --prod --yes` from the repo root.

## Database
- Schema + RLS: `server/database_migrations.sql` (source of truth).
- Run SQL: Supabase Dashboard → SQL Editor, or the Management API
  (`POST https://api.supabase.com/v1/projects/gcvpbzkdxxulrupwqlrv/database/query`
  with a personal access token from supabase.com/account/tokens).
- Table `public.recipes`: title, description, ingredients/steps (jsonb), prep/cook/servings,
  `category` (course), `tags[]` (cuisine+dietary), `notes`, `contributor`, `video_url`,
  image_url, source_image_url, `search_tsv` (full-text, trigger-maintained), status, user_id.
- **RLS:** everyone signed-in reads published; users write their own; **admin email can
  edit/delete any** (see Admin).
- Storage buckets: `recipe-images`, `recipe-sources` (public). Re-create via
  `server/setup-storage.js` or the dashboard.

## Auth
- **Google** (primary) and **email + password** (auto-confirm on → no emails sent, so no
  rate limits). Magic-link email was removed (built-in sender is rate-limited).
- Configure providers: Supabase → Authentication → Providers.
- URL config: Supabase → Auth → URL Configuration. Site URL + redirect URLs must include
  the production URL (and `http://localhost:5174` for dev).

## Admin
- Admin = **sunny_hsu@berkeley.edu** (set in two places, keep in sync):
  - DB: the recipes update/delete RLS policies.
  - Client: `client/src/lib/admin.ts` (`ADMIN_EMAILS`).
- Admin can edit/delete any recipe and use the **Export** (backup) button in the navbar.

## Backup & restore
- **Backup:** sign in as admin → click the download icon in the navbar → saves
  `cookbookclub-backup-YYYY-MM-DD.json` (all recipe rows + image URLs). Do this regularly.
- Images live in Supabase Storage (referenced by URL in the backup).
- **Restore:** re-insert rows from the JSON via the SQL editor / a small script (recipes
  table columns map 1:1). Storage images would need re-upload if the bucket were lost.

## Common tasks
- **Change extraction model:** update `CLAUDE_MODEL` in Vercel env → redeploy.
- **Add/remove an admin:** edit the two RLS policies + `client/src/lib/admin.ts`.
- **Rotate a secret:** regenerate in the provider, update the Vercel env / Supabase, redeploy.
- **Add a sign-in provider:** create the OAuth app at the provider → enable in Supabase →
  add a button in `client/src/pages/Login.tsx`.

## Cost
- Per-extraction Claude cost (Opus 4.8 pricier; Sonnet 4.6 ~5× cheaper). Set a budget
  alert in the Anthropic console. Photos are downscaled client-side to ~1568px to cut tokens.
- Vercel + Supabase free tiers cover light community use; watch their dashboards as usage grows.
