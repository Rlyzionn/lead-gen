# Deploying to Railway

Two separate Railway services from this monorepo: `lead-gen-api` and `lead-gen-web`.

---

## Prerequisites

- Railway account with GitHub connected
- This repo pushed to GitHub (already done: `Rlyzionn/lead-gen`)
- Supabase project (Postgres + optional Storage)
- (Optional) Redis service for non-demo background jobs

---

## Step 1 — Create the API service

1. Open Railway → **New Project** → **Deploy from GitHub repo** → pick `Rlyzionn/lead-gen`.
2. Railway will create a project. Rename the auto-created service to **`lead-gen-api`**.
3. Open the service → **Settings** tab:
   - **Root Directory**: leave blank (`/`)
   - **Config-as-code Path**: `railway.api.json`
   - **Watch Paths**: `apps/api/**` and `packages/shared/**`
4. **Networking** tab → **Generate Domain**. Note the URL (e.g. `lead-gen-api-production.up.railway.app`).

### API environment variables

Variables tab → paste these in (replace `<...>` with real values):

```
NODE_ENV=production
DEMO_MODE=true
PORT=$PORT

# Supabase Postgres (use the Session pooler URL — port 5432, hostname starts with aws-*)
DATABASE_URL=postgresql://postgres.<project-ref>:<password>@aws-0-<region>.pooler.supabase.com:5432/postgres
SUPABASE_URL=https://<project-ref>.supabase.co
SUPABASE_SERVICE_KEY=<service-role-jwt>

# Set after the web service is created (Step 2). Comma-separate multiple origins.
CORS_ORIGINS=https://lead-gen-web-production.up.railway.app

# Optional in demo mode (still required for full mode):
OPENAI_API_KEY=
ANTHROPIC_API_KEY=
CLERK_SECRET_KEY=
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_MESSAGING_SERVICE_SID=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
DYNAMICS_TENANT_ID=
DYNAMICS_CLIENT_ID=
DYNAMICS_CLIENT_SECRET=
DYNAMICS_RESOURCE_URL=
APIFY_TOKEN=
APOLLO_API_KEY=
SLACK_BOT_TOKEN=

# Pusher (only if you wire real-time later — safe to leave empty in demo mode)
PUSHER_APP_ID=
PUSHER_KEY=
PUSHER_SECRET=
PUSHER_CLUSTER=

# REDIS_URL — see Step 4. Safe to leave empty in DEMO_MODE.
```

5. **Deploy** — Railway builds with `npm install && prisma generate && npm run build --workspace=@hha/api`.
6. After first deploy, run the seed once from Railway's **Logs/Shell**:
   ```
   cd apps/api && npx prisma db seed
   ```

---

## Step 2 — Create the Web service

1. In the same project → **New Service** → **GitHub Repo** → select the same repo.
2. Rename to **`lead-gen-web`**.
3. Settings tab:
   - **Root Directory**: leave blank (`/`)
   - **Config-as-code Path**: `railway.web.json`
   - **Watch Paths**: `apps/web/**` and `packages/shared/**`
4. **Networking** tab → **Generate Domain**. Note the URL.

### Web environment variables

```
NODE_ENV=production
NEXT_PUBLIC_DEMO_MODE=true
PORT=$PORT

# Backend
NEXT_PUBLIC_API_URL=https://lead-gen-api-production.up.railway.app/api
API_URL=https://lead-gen-api-production.up.railway.app
NEXT_PUBLIC_APP_URL=https://lead-gen-web-production.up.railway.app

# Supabase (browser-safe)
NEXT_PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon-jwt>

# Auth (only needed if NEXT_PUBLIC_DEMO_MODE=false)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=

# Real-time (safe to leave empty in demo mode)
NEXT_PUBLIC_PUSHER_KEY=
NEXT_PUBLIC_PUSHER_CLUSTER=
```

5. **Deploy**.

---

## Step 3 — Wire CORS

After the web service has a URL, go back to the **API** service Variables and update:

```
CORS_ORIGINS=https://lead-gen-web-production.up.railway.app
```

Add multiple origins comma-separated if you have a custom domain too. Save — Railway redeploys automatically.

In **DEMO_MODE=true** the API allows any origin, so CORS_ORIGINS is optional during demo.

---

## Step 4 — (Optional) Add Redis for background jobs

In demo mode the agent queues are stubbed out, so Redis isn't required. For production:

1. Project → **New Service** → **Database** → **Redis**.
2. Once provisioned, copy its **REDIS_URL** internal connection string from the Connect tab.
3. Add to the **API** service variables:
   ```
   REDIS_URL=redis://default:<password>@redis.railway.internal:6379
   ```
4. Set `DEMO_MODE=false` on the API once you're ready to run real outreach.

---

## Step 5 — Custom domains (optional)

For each service → Settings → **Networking** → **Custom Domain**. Add your domain, copy the CNAME target into your DNS, and update CORS_ORIGINS / NEXT_PUBLIC_APP_URL accordingly.

---

## Troubleshooting

- **Build fails on `prisma generate`** — verify `DATABASE_URL` is set on the API service (Prisma reads it during generate).
- **Web shows "Failed to fetch" / CORS errors** — check `NEXT_PUBLIC_API_URL` (web) and `CORS_ORIGINS` (api) match the actual deployed URLs (no trailing slash).
- **Health check timing out** — increase `healthcheckTimeout` in `railway.api.json` / `railway.web.json` if cold-start is slow.
- **Workspace package not found (`@hha/shared`)** — make sure `npm install` runs at the repo root, not inside `apps/api`. The provided `railway.api.json` does this correctly.
- **"Can't reach database server"** — use the Supabase **Session Pooler** URL (hostname `aws-*.pooler.supabase.com`, port 5432). Direct DB hostnames are often blocked by Railway's network.
- **Web port not bound** — start command must use `-p $PORT`. The provided `railway.web.json` does this.

---

## Local dev parity

- API runs on `http://localhost:3001`
- Web runs on `http://localhost:3000`
- Both load env from `apps/api/.env` and `apps/web/.env.local` respectively.
- Run with `npm run dev` from the project root (Turbo runs both in parallel).
