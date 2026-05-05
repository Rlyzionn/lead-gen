# Running the Demo

This guide gets the full recruiting automation platform running locally in **Demo Mode** — no Twilio, Gmail OAuth, Dynamics CRM, or OpenAI account required. All integrations are simulated with realistic data.

---

## Prerequisites

| Tool | Version |
|---|---|
| Node.js | 18+ |
| PostgreSQL | 14+ (running locally or via Docker) |
| Redis | 6+ (running locally or via Docker) |

---

## Step 1 — Clone & install

```bash
cd project
npm install          # installs all workspaces via Turborepo
```

---

## Step 2 — Set up environment variables

```bash
cp .env.example .env
```

The `.env` file ships with `DEMO_MODE="true"` and `NEXT_PUBLIC_DEMO_MODE="true"` already set.

You **only** need to fill in:

```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/headhunter_db"
REDIS_URL="redis://localhost:6379"

# Clerk — create a free app at clerk.com, copy the keys
CLERK_PUBLISHABLE_KEY=""
CLERK_SECRET_KEY=""
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=""

# Pusher — create a free Channels app at pusher.com, copy the keys
PUSHER_APP_ID=""
PUSHER_KEY=""
PUSHER_SECRET=""
PUSHER_CLUSTER=""
NEXT_PUBLIC_PUSHER_KEY=""
NEXT_PUBLIC_PUSHER_CLUSTER=""
```

Everything else (OpenAI, Twilio, Gmail, Dynamics, Apollo, Apify) can remain blank when `DEMO_MODE=true`.

---

## Step 3 — Set up the database

```bash
cd apps/api

# Create tables
npx prisma migrate dev --name init

# Seed with 25 realistic RN candidates, 1 campaign, message threads, and activity events
npx prisma db seed
```

---

## Step 4 — Start the dev servers

From the project root:

```bash
npm run dev
```

This starts both servers via Turborepo:

| Service | URL |
|---|---|
| Next.js frontend | http://localhost:3000 |
| NestJS API | http://localhost:3001 |

---

## Step 5 — Sign in

1. Open http://localhost:3000
2. Sign up with any email via the Clerk login page
3. You'll land on the dashboard — a **yellow demo banner** at the top confirms demo mode is active

---

## What you'll see in Demo Mode

| Feature | Demo behaviour |
|---|---|
| Dashboard | 25 pre-seeded candidates across all pipeline stages |
| Agent pipeline | Runs and logs activity, no real scraping |
| Candidate scores | Calculated from name length (deterministic variety: 55–99) |
| Email / SMS outreach | Logged with fake IDs, nothing actually sent |
| Gmail inbox | Shows pre-seeded message threads for 3 candidates |
| AI Command Center | Returns context-aware canned responses based on keywords |
| Dynamics CRM sync | Logs sync events, no real API calls |
| Gmail status | Shows as "Connected" |

---

## Going live (post-approval)

When Chris approves the MVP, swap in real credentials by setting `DEMO_MODE="false"` and `NEXT_PUBLIC_DEMO_MODE="false"` in `.env`, then fill in:

1. **OpenAI** — `OPENAI_API_KEY`
2. **Twilio** — complete 10DLC registration, then add `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_MESSAGING_SERVICE_SID`
3. **Gmail** — each recruiter connects via `/settings` → Gmail OAuth flow; credentials stored in DB automatically
4. **Dynamics** — Chris provides sandbox credentials: `DYNAMICS_TENANT_ID`, `DYNAMICS_CLIENT_ID`, `DYNAMICS_CLIENT_SECRET`, `DYNAMICS_RESOURCE_URL`
5. **Apify** — `APIFY_TOKEN` for LinkedIn/Indeed scraping
6. **Apollo** — `APOLLO_API_KEY` for candidate enrichment

Full integration setup details are in `HANDOVER.md`.
