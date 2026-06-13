# 🍳 Our Recipe Book

A personal, customizable recipe-book website. Snap a photo of a handwritten card,
a screenshot, or a cookbook page — or paste text — and Claude transcribes it into a
clean, structured recipe you review and publish. Anyone signed in can contribute, and
everything is searchable by keyword, ingredient, and tag.

## Stack
- **Client:** React 19 + Vite + TypeScript + Tailwind v4, React Router, Supabase JS.
- **Server:** Express + TypeScript holding the Anthropic key (`/api/extract`).
- **Data/Auth/Storage:** Supabase (Postgres + Auth + Storage).
- **AI:** Claude (vision + text → structured recipe via forced tool use).

```
recipe-book/
  client/   # Vite SPA
  server/   # Express + Claude extraction
  .env.example
  vercel.json
```

## One-time setup

### 1. Supabase project
1. Create a project at https://supabase.com.
2. **Database:** open the SQL editor and run `server/database_migrations.sql`.
3. **Storage:** from `server/`, run `npm run setup-storage` (after step 3 env below),
   or create two **public** buckets manually: `recipe-images`, `recipe-sources`.
4. **Auth:** Authentication → Providers → enable **Email** (magic link is on by default).
   Add `http://localhost:5173` and your production URL to the allowed redirect URLs.
5. Grab your **Project URL**, **anon key**, and **service_role key** (Settings → API).

### 2. Environment files
```bash
cp .env.example .env                 # repo root — used by the SERVER
cp client/.env.example client/.env   # used by the CLIENT
```
Fill in:
- **`.env`** (server, secret): `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`,
  `SUPABASE_ANON_KEY`, `ANTHROPIC_API_KEY`, and optionally `CLAUDE_MODEL`.
- **`client/.env`** (browser-exposed): `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`,
  `VITE_API_URL` (e.g. `http://localhost:3001`).

> The Anthropic key lives ONLY in the server `.env`. It is never sent to the browser.

### 3. Install & run
```bash
# Server
cd server && npm install
npm run setup-storage        # creates the storage buckets (one time)
npm run dev                  # http://localhost:3001

# Client (separate terminal)
cd client && npm install
npm run dev                  # http://localhost:5173
```

## Recipe extraction model
`CLAUDE_MODEL` (server `.env`) controls extraction. Default `claude-opus-4-8` — maximum
accuracy on messy handwriting. Set `claude-sonnet-4-6` for a cheaper cost/quality balance.

## Deploy
- **Client → Vercel:** the included `vercel.json` builds `client/` as a static SPA.
  Set `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, and `VITE_API_URL` (pointing at your
  deployed server) as Vercel env vars.
- **Server:** deploy `server/` to any Node host (Render, Railway, Fly, a small VM).
  Set the server env vars there. Update `CLIENT_URL` to your deployed client origin (CORS).

## How it works
1. **Add recipe** → upload a photo or paste text → client POSTs it to `/api/extract`.
2. The server calls Claude with the image/text and a forced `save_recipe` tool, returning
   a validated structured recipe (title, ingredients, steps, times, servings, tags).
3. You review/edit in the form, add a finished-dish photo, and **publish** — the client
   inserts the row into Supabase (RLS ensures you can only write your own).
4. **Home** shows a gallery with full-text search, tag filters, and ingredient search.
