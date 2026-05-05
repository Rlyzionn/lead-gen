# Deployment Notes — Lessons Learned

Compact reference for the Railway + Supabase deploy. Captures every gotcha hit during the first deployment so future re-deploys are smooth.

---

## Architecture

```
Browser → @hha/web (Next.js, Railway)
            │ NEXT_PUBLIC_API_URL
            ▼
         @hha/api (NestJS, Railway)
            │ DATABASE_URL (session pooler)
            ▼
         Supabase (Postgres + Storage)
```

Two separate Railway services from the same GitHub repo (`Rlyzionn/lead-gen`). Web on `hhaweb-production.up.railway.app`, API on `hhaapi-production.up.railway.app`.

---

## Required env vars

### `@hha/api`
```
NODE_ENV=production
DEMO_MODE=true
PORT=$PORT                              # Railway sets this; we read it

DATABASE_URL=postgresql://postgres.<ref>:<pwd>@aws-1-ap-southeast-1.pooler.supabase.com:5432/postgres
SUPABASE_URL=https://<ref>.supabase.co
SUPABASE_SERVICE_KEY=<service-role-jwt>

CORS_ORIGINS=https://hhaweb-production.up.railway.app   # NO trailing slash
```

Optional (for non-demo mode): `OPENAI_API_KEY`, `CLERK_SECRET_KEY`, `TWILIO_*`, `GOOGLE_*`, `DYNAMICS_*`, `APIFY_TOKEN`, `APOLLO_API_KEY`, `REDIS_URL`.

### `@hha/web`
```
NODE_ENV=production
NEXT_PUBLIC_DEMO_MODE=true              # critical — see "Clerk crash" below
PORT=$PORT

NEXT_PUBLIC_API_URL=https://hhaapi-production.up.railway.app/api   # MUST end with /api
API_URL=https://hhaapi-production.up.railway.app

NEXT_PUBLIC_SUPABASE_URL=https://<ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon-jwt>
```

---

## Railway service settings

### `@hha/api`
- **Source:** GitHub repo `Rlyzionn/lead-gen`, branch `main`
- **Config-as-Code Path:** `railway.api.json` (defines build/start commands)
- **Custom Start Command** (override in Settings → Deploy):
  ```
  cd apps/api && node dist/main.js
  ```
  Without this, Railpack auto-detected `npm run dev` (TypeScript watch mode).
- **Health Check Path:** **leave empty.** A misconfigured probe will mark the container unhealthy and trigger a restart loop → 502 to all traffic even though the app is healthy.
- **Networking:** generated domain auto-routes to PORT.

### `@hha/web`
- **Config-as-Code Path:** `railway.web.json`
- Default Railpack-detected commands work (`npm run start`).

---

## Known gotchas (each one cost a deploy cycle)

| Symptom | Root cause | Fix |
|---|---|---|
| `Next.js 14.2.3 has CVE-2025-55184` (Railway security scan) | Pinned old patch | Bump to `^14.2.35` in `apps/web/package.json` |
| `Property 'enrichedData' does not exist on type 'Candidate'` (build) | Shared type was missing fields the UI uses | Added `enrichedData`, `personalizationTokens`, `deepResearch`, `rawData`, `dynamicsContactId` to `packages/shared/src/types/candidate.ts` |
| Lucide icon type mismatch | Strict `ComponentType<{size?:number}>` rejects lucide's `LucideIcon` | Use `LucideIcon` from `lucide-react` |
| `useSession can only be used within ClerkProvider` (SSG) | `/login` statically pre-rendered without provider | `export const dynamic = "force-dynamic"` + dynamic-import the Clerk component |
| `useSearchParams` crash on `/candidates` | Same SSG issue | `export const dynamic = "force-dynamic"` |
| `Application error` on dashboard | Anything calling Clerk hooks when no key | Single `lib/auth-mode.ts` helper: `isAuthDisabled = NEXT_PUBLIC_DEMO_MODE === "true" || !NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` — wired into root layout, dashboard layout, TopBar, login page |
| 404 on `/activity`, `/metrics` | Missing `/api` prefix | `NEXT_PUBLIC_API_URL` must end with `/api` |
| `Node.js 20 detected without native WebSocket support` (API crash) | `@supabase/supabase-js` v2.43+ instantiates RealtimeClient at construction; Node 20 has no native WebSocket | Added `ws` package + passed as `realtime.transport` in `SupabaseService` constructor |
| `OPENAI_API_KEY environment variable is missing` (API crash) | `TranscriptParserService` eagerly `new OpenAI()` at DI time | Same pattern as `ai.service.ts`: instantiate only when `!DEMO && OPENAI_API_KEY` |
| Twilio constructor crash | Same shape with `twilio(undefined, undefined)` | Check creds before instantiating |
| API logs healthy but `/api/health` returns 502 | Railway healthcheck killing container before bootstrap finished, OR proxy routing to dead container | (a) Clear the Health Check Path in Railway Settings; (b) Delete the public domain and regenerate it |
| CORS "Missing Access-Control-Allow-Origin" | Actually a 502 — Railway's error page has no CORS headers | Same fix as above (the API itself has CORS configured correctly via `origin: true` in demo mode) |

---

## Database

- Schema lives in `apps/api/prisma/schema.prisma`. Push with:
  ```
  cd apps/api && npx prisma db push
  ```
- Seed (5 campaigns + 60 candidates + message threads + activity events):
  ```
  cd apps/api && npx prisma db seed
  ```
- Local seed pushes to the same Supabase the Railway API connects to.

### Supabase connection string

Use the **Session Pooler** URL, not the direct `db.<ref>.supabase.co:5432` host (that's IPv6 and blocked on Railway / many ISPs):
```
postgresql://postgres.<ref>:<pwd>@aws-1-ap-southeast-1.pooler.supabase.com:5432/postgres
```
Special chars in the password must be URL-encoded (`*` → `%2A`).

---

## Demo mode

`DEMO_MODE=true` (API) + `NEXT_PUBLIC_DEMO_MODE=true` (Web) gives a fully-functional sandbox with no third-party keys:

- **AI:** stub responses for transcript parsing, scoring, deep research, drafts
- **Twilio/Apify/Apollo/Dynamics:** all log + return fake data
- **Clerk:** bypassed; "Demo User" badge in TopBar, dashboard accessible without login
- **Pusher:** noop client, no realtime (initial query data still loads)
- **Bull queues:** orchestrator skips `queue.add()` so no Redis required
- **CORS:** API reflects any origin (`origin: true`)

To go live, set `DEMO_MODE=false` on both services and provide the real credentials.

---

## Security reminders

The Supabase service role key and DB password were shared during initial setup. **Rotate both** in the Supabase dashboard and update Railway env vars:

- Settings → API → Reset service role secret
- Settings → Database → Reset database password

The anon key is fine to leave — it's designed for browser exposure and gated by RLS.

---

## File index

- `RAILWAY.md` — full step-by-step deploy guide
- `railway.api.json` / `railway.web.json` — per-service Railpack configs
- `.env.example` — all env vars documented (no secrets)
- `apps/api/src/main.ts` — bootstrap with breadcrumb logging
- `apps/web/lib/auth-mode.ts` — single source of truth for Clerk gating
- `apps/api/src/supabase/supabase.service.ts` — `ws` transport for Node 20
- `apps/api/prisma/seed.ts` — 5 demo campaigns

---

## Smoke tests after any deploy

1. **API health:** `https://hhaapi-production.up.railway.app/api/health` → `{"ok":true,...}`
2. **API data:** `https://hhaapi-production.up.railway.app/api/campaigns` → JSON array of 5 campaigns
3. **Web loads:** open `https://hhaweb-production.up.railway.app/` in incognito → dashboard with Top Candidates, metrics row populated
4. **Browser console:** no red errors, especially no CORS or Clerk errors

If any fail, check `[Bootstrap]` lines at the top of the API logs — they print `node`, `PORT`, `DEMO_MODE`, CORS allowed origins, and "API READY".
