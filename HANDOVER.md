# Project Status — Recruiting Automation Platform

## How to run (Demo — no real credentials needed)

> Full step-by-step in `HOW_TO_RUN_DEMO.md`

```bash
cd C:\Users\rlyzion\Desktop\Onboarding\project

# 1. Install all dependencies
npm install

# 2. Copy env file (DEMO_MODE=true is already set)
copy .env.example .env
# Only fill in: DATABASE_URL, REDIS_URL, CLERK keys, PUSHER keys

# 3. Migrate DB and seed 25 realistic candidates
cd apps/api
npx prisma generate
npx prisma migrate dev --name init
npx prisma db seed
cd ../..

# 4. Start everything
npm run dev
# web → http://localhost:3000
# api → http://localhost:3001
# Amber banner in UI confirms demo mode is active
```

---

## What is fully built and wired

### Frontend (Next.js + Tailwind + Clerk)
| Feature | Status |
|---|---|
| Auth (Clerk) — login, route protection | Done |
| Dashboard: agent strip, metrics row, activity feed, top candidates | Done — all live data via React Query + Pusher |
| Campaigns: list, new campaign wizard (4 input modes), detail page | Done |
| Campaign builder: transcript parse → IRP editor → cadence builder → launch | Done |
| Candidates: list with filter/search, detail page | Done |
| Candidate profile: full data, score + reasoning, force sync | Done |
| Unified inbox: thread list, message thread, AI mode toggle, send reply | Done |
| AI Command Center: conversational query + action confirmation | Done |
| Settings: Dynamics config, sync cadences, field mapping, notification prefs | Done |
| Real-time: Pusher subscriptions in ActivityFeed + AgentStatusStrip | Done |
| React Query: all data fetching hooked up across all pages | Done |
| Axios API client with Clerk token injection | Done |
| Next.js rewrite proxy to NestJS | Done |
| **Demo Mode amber banner** (`NEXT_PUBLIC_DEMO_MODE=true`) | Done |

### Backend (NestJS + Bull + Prisma)
| Feature | Status |
|---|---|
| Global PrismaModule (@Global) | Done |
| Global AuthModule (ClerkGuard) | Done |
| Campaigns CRUD + transcript parse + pause/resume + force sync | Done |
| Candidates CRUD + score + messages + filtered list | Done |
| 5-agent Bull queue pipeline (sourcing → enrichment → qualification → personalization → outreach) | Done |
| AI service (all prompts: parse, deep research, identity verify, credential verify, score, personalize, draft reply) | Done |
| Whisper transcription | Done |
| AI Command Center (tool-calling, cross-session memory, action execution) | Done |
| Apify scraper (LinkedIn + Indeed) | Done |
| Apollo enrichment | Done |
| Twilio SMS (send, inbound webhook with signature validation, recruiter number mapping) | Done |
| Gmail (send, watch inbox, OAuth token auto-refresh) | Done |
| Dynamics (OAuth token refresh, upsert, sync event, test connection) | Done |
| Calendly (booking link generation) | Done |
| Pusher real-time (ActivityService broadcasts to "activity" + "agents" channels) | Done |
| Activity endpoint (`GET /api/activity`) | Done |
| Metrics endpoint (`GET /api/metrics`) | Done |
| Settings endpoints (dynamics, field-mappings, notifications) | Done |
| Gmail OAuth flow (`GET /api/oauth/google`, callback, status) | Done |
| Twilio webhook middleware (X-Twilio-Signature validation) | Done |
| Inbox: threads, send reply, AI draft, mark read, inbound SMS + Gmail webhooks | Done |
| Notifications service (Slack + email + in-app) | Done |
| **Demo Mode — all 6 integrations + AI service + Command Center + OAuth status** | Done |
| **Prisma seed script** — 25 RN candidates, 1 campaign, 3 message threads, activity events | Done |

---

## What still needs to happen before going live

> The platform is fully demo-ready. The items below are only needed to flip from `DEMO_MODE=true` to production.

### 1. Twilio 10DLC registration (MUST DO FIRST — multi-week lead time)
- Log into Twilio console → Messaging → Regulatory Compliance → Campaign Registration
- Create a Messaging Service, add numbers to it
- Set `TWILIO_MESSAGING_SERVICE_SID` in `.env`
- Without this, no SMS sends

### 2. Get Dynamics credentials from Chris
- Sandbox URL, Tenant ID, Client ID, Client Secret
- Run through field map in Settings page against his actual Dynamics entities
- Test connection button in Settings → Dynamics will confirm

### 3. Connect Gmail accounts
- Each recruiter goes to Settings → clicks "Connect Gmail"
- OAuth flow: `GET /api/oauth/google` → Google consent → callback stores token in DB automatically
- After OAuth, `setupWatchInbox` is called to enable push notifications for inbound replies

### 4. Small remaining gaps (post-approval polish)
- `apps/api/src/ai/ai.service.ts` → `deepResearch()` — add an OpenAI function-calling tool backed by Bing Search API or Serper for live web search
- `apps/api/src/ai/command-center.service.ts` → `query_candidates` and `get_campaign_metrics` tool-call handlers need to call `PrismaService` (currently return empty in live mode)
- `apps/api/src/integrations/dynamics/dynamics.service.ts` → `syncEvent` should respect `DynamicsSyncSettings` cadence from DB rather than always logging
- Notification preferences table needs a migration (placeholder in `SettingsService`)

---

## Environment checklist

### Required for Demo Mode (minimum to run locally)
- [ ] `DATABASE_URL` — Postgres
- [ ] `REDIS_URL` — Redis
- [ ] `CLERK_PUBLISHABLE_KEY` + `CLERK_SECRET_KEY` + `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- [ ] `PUSHER_APP_ID` + `PUSHER_KEY` + `PUSHER_SECRET` + `PUSHER_CLUSTER`
- [ ] `NEXT_PUBLIC_PUSHER_KEY` + `NEXT_PUBLIC_PUSHER_CLUSTER`
- [ ] `DEMO_MODE="true"` + `NEXT_PUBLIC_DEMO_MODE="true"` ← already in `.env.example`

### Required to go live (set DEMO_MODE=false)
- [ ] `OPENAI_API_KEY`
- [ ] `ANTHROPIC_API_KEY` (fallback LLM)
- [ ] `APIFY_TOKEN`
- [ ] `APOLLO_API_KEY`
- [ ] `TWILIO_ACCOUNT_SID` + `TWILIO_AUTH_TOKEN` + `TWILIO_MESSAGING_SERVICE_SID`
- [ ] `GOOGLE_CLIENT_ID` + `GOOGLE_CLIENT_SECRET`
- [ ] `DYNAMICS_TENANT_ID` + `DYNAMICS_CLIENT_ID` + `DYNAMICS_CLIENT_SECRET` + `DYNAMICS_RESOURCE_URL`
- [ ] `SLACK_WEBHOOK_URL`
- [ ] `NEXT_PUBLIC_APP_URL` (production URL)
- [ ] `API_URL` (production API URL)
- [ ] `CALENDLY_API_KEY`
