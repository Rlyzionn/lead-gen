# Module Map & Workflows

Companion to `PROJECT_BRIEF.md`. While the brief explains *what* the
platform does, this doc explains *how the modules wire together internally*
and the step-by-step workflow inside each one.

---

## 1. The 10,000-foot view

```
                    ┌──────────────────────────────────────────────────┐
                    │                    BROWSER                       │
                    │  Pages → React Query hooks → axios → /api/*      │
                    └────────────────────────┬─────────────────────────┘
                                             │ HTTPS + Clerk JWT
                                             ▼
       ┌─────────────────────────────────────────────────────────────────────┐
       │                         NestJS API (apps/api)                        │
       │                                                                      │
       │   AUTH (ClerkGuard) ────┐                                            │
       │                         ▼                                            │
       │  ┌──────────┐    ┌──────────────┐    ┌─────────────────────────┐    │
       │  │Campaigns │    │  Candidates  │    │  Inbox / Activity / AI  │    │
       │  └────┬─────┘    └──────┬───────┘    └────────────┬────────────┘    │
       │       │                 │                          │                 │
       │       └────────┬────────┴──────────────┬───────────┘                 │
       │                ▼                        ▼                            │
       │   ┌──────────────────────┐   ┌────────────────────────────┐          │
       │   │  Agent Orchestrator  │   │   Settings / Metrics /     │          │
       │   │  (BullMQ + Redis)    │   │   OAuth / Notifications    │          │
       │   │                      │   └────────────────────────────┘          │
       │   │  ┌────────────────┐  │                                           │
       │   │  │  Sourcing      │──┼──▶ Apify (LinkedIn + Indeed)              │
       │   │  │  Enrichment    │──┼──▶ Apollo + AI deep research              │
       │   │  │  Qualification │──┼──▶ AI scoring (OpenAI)                    │
       │   │  │  Personalization──┼──▶ AI token generation                    │
       │   │  │  Outreach      │──┼──▶ Twilio + Gmail                         │
       │   │  └────────────────┘  │                                           │
       │   └──────────────────────┘                                           │
       │                                                                      │
       │   Webhooks (Twilio inbound SMS, Gmail push, Calendly bookings)      │
       │   ──────────────────────────────────────────────────────────────    │
       │                                                                      │
       │   Cross-cutting: PrismaService, SupabaseService, ActivityService    │
       └────────┬─────────────────────────┬──────────────────────────────────┘
                │                         │
                ▼                         ▼
         Supabase Postgres          Microsoft Dynamics
         + Storage                  (CRM)
                                    Twilio / Gmail / Calendly
                                    (outbound)
```

---

## 2. Backend modules

Listed in dependency order — earlier modules are imported by later ones.

### 2.1 `PrismaModule` (foundational)

**Purpose:** Single Prisma client instance shared across the API.

**Exports:** `PrismaService extends PrismaClient`.

**Imported by:** Every service that touches the DB. Marked `@Global()` is *not* used; each module that needs Prisma imports `PrismaModule` explicitly.

**Workflow:** `onModuleInit` calls `$connect()`, `onModuleDestroy` calls `$disconnect()`. Otherwise transparent — services do `prisma.candidate.findMany(...)` etc.

---

### 2.2 `SupabaseModule` (foundational, `@Global()`)

**Purpose:** Wrap `@supabase/supabase-js` for Storage operations (file uploads).

**Exports:** `SupabaseService.client` + `uploadFile(path, buffer, contentType)` + `deleteFile(path)`.

**Notable:** Constructor instantiates `createClient()` with `realtime.transport: ws` because Node 20 has no native WebSocket. Also auto-creates the `uploads` bucket on `onModuleInit`. If `SUPABASE_URL` / `SUPABASE_SERVICE_KEY` are missing, the client is `null` and uploads no-op (logged warning).

**Used by:** `CampaignsController.uploadAudio` and `uploadPlacements` for transcript audio + past-placement CSVs.

---

### 2.3 `AuthModule`

**Purpose:** Clerk-based JWT verification.

**Exports:** `ClerkGuard` (used as `@UseGuards(ClerkGuard)` on every controller) + `@CurrentUser()` decorator (extracts `userId` from the request).

**Demo bypass:** When `DEMO_MODE=true`, `ClerkGuard.canActivate` returns true unconditionally and sets `request.userId = "demo-recruiter-1"`.

**Imported by:** Every controller in the system.

---

### 2.4 `IntegrationsModule`

**Purpose:** Adapters for every third-party service. Each integration is a separate `@Injectable` service that's exported.

| Service | Demo behavior | Real behavior |
|---|---|---|
| `ApifyService` | Returns hardcoded `RawCandidate[]` for LinkedIn + Indeed | Calls Apify actors `apify/linkedin-scraper` and `apify/indeed-scraper` |
| `ApolloService` | Returns mock enrichment data | Calls Apollo People Search API |
| `TwilioService` | Logs `[DEMO] SMS to=...` and returns fake SID | Calls Twilio Messaging Service with rotation pool |
| `GmailService` | Skips actual send | OAuth token from `OAuthToken`, sends via `googleapis` |
| `DynamicsService` | Logs sync events | Dynamics Web API PATCH on Contact entity |
| `CalendlyService` | Returns stub booking link | Calendly v2 API |

**Imported by:** Agents (Sourcing imports Apify; Outreach imports Twilio + Gmail; etc.) and Settings (for connection status).

---

### 2.5 `AiModule`

**Purpose:** Wraps OpenAI for the 7 distinct AI tasks the platform performs.

**Exports:** `AiService` with these methods:

| Method | Used by | Returns |
|---|---|---|
| `parseTranscript(text, mode)` | `CampaignsController.parseTranscript` | `CampaignBrief` JSON |
| `deepResearch(name, roleSpec)` | `EnrichmentAgent` | Markdown summary string |
| `verifyIdentity(profileA, profileB)` | `EnrichmentAgent` | `{ match, confidence, notes }` |
| `verifyCredentials(profile, roleSpec)` | `EnrichmentAgent` | `{ verified, details, flagsForReview[] }` |
| `scoreCandidate(candidate, irpPrompt, threshold, pastPlacements)` | `QualificationAgent`, `CandidatesService.regenerateScore` | `{ score, reasoning, passes }` |
| `generatePersonalizationTokens(candidate)` | `PersonalizationAgent`, `CandidatesService.regeneratePersonalization` | `Record<string, string>` |
| `draftReply(history, context, tonePrompt?, creativity?)` | `InboxService.generateAiDraft` | Reply body string |

`TranscriptParserService` is also in this module for Whisper audio→text.

**Demo behavior:** Every method has a `if (DEMO) return <stub>` early-return that produces realistic-looking fake output. The OpenAI client itself is `null` when no API key, so even non-demo mode without a key won't crash.

**Imported by:** Campaigns, Candidates, Agents (Enrichment + Qualification + Personalization), Inbox.

---

### 2.6 `SettingsModule`

**Purpose:** Per-tenant configuration storage + retrieval.

**Endpoints (all behind `ClerkGuard`):**

| Route | What it does |
|---|---|
| `GET /api/settings/dynamics` | Returns sync cadence per event type |
| `PATCH /api/settings/dynamics` | Saves cadences + tests connection |
| `GET /api/settings/field-mappings` | Returns Platform→Dynamics field map |
| `PATCH /api/settings/field-mappings` | Updates field map |
| `GET /api/settings/notifications` | Returns per-user notification prefs (in-app/email/Slack per event) |
| `PATCH /api/settings/notifications` | Saves notification prefs |
| `GET /api/settings/ai` | Returns `AIPreferences` row (tone/verbosity/creativity/...) |
| `PATCH /api/settings/ai` | Upserts AI preferences |
| `GET /api/settings/search-config` | Returns `SearchConfig` row (default campaign filters) |
| `PATCH /api/settings/search-config` | Upserts search config |
| `GET /api/settings/integrations` | Aggregated status of every integration (data sources + outreach channels + CRM) |

**Exports:** `SettingsService` + `buildToneSystemPrompt(prefs)` helper.

**Used by:** `InboxService.generateAiDraft` reads `getAIPreferences(userId)` and passes the result through `buildToneSystemPrompt` → AiService.draftReply.

---

### 2.7 `ActivityModule`

**Purpose:** The platform's audit log + live feed source.

**Exports:** `ActivityService.emit(campaignId, type, candidateId?, candidateName?, detail?)`.

**Endpoint:** `GET /api/activity` — returns last 100 events newest-first.

**Used by:** Every agent (Sourcing emits "sourced", Qualification emits "qualified", Outreach emits "sent", Inbox emits "replied", Booking emits "booked", Dynamics emits "synced").

**Consumed by frontend:** `ActivityFeed` component (initial fetch + Pusher subscription) and `NotificationsDropdown` (filters to important types only).

---

### 2.8 `MetricsModule`

**Purpose:** Aggregated counts for dashboard + Active Agents pipeline.

**Endpoints:**
- `GET /api/metrics` — 7 dashboard cards (Sourced/Enriched/Qualified/Sent/Replied/Booked/In CRM)
- `GET /api/metrics/campaigns/:id` — per-campaign breakdown
- `GET /api/metrics/agents` — Active Agents pipeline data with cumulative counts, success rates, throughput

**Workflow:** Pure DB aggregation — Prisma `count()` and `groupBy()` over `Candidate.status`. Cumulative semantics (a candidate at "replied" counts toward Sourced + Enriched + Qualified + Sent + Replied).

---

### 2.9 `OAuthModule`

**Purpose:** OAuth flows for Google (Gmail) and Microsoft (Dynamics).

**Endpoints:**
- `GET /api/oauth/google` — initiates flow, returns auth URL
- `GET /api/oauth/google/callback` — handles redirect, stores token in `OAuthToken` table
- `GET /api/oauth/google/status` — used by Integrations Hub to show connected/disconnected

**Used by:** `GmailService` reads + refreshes Google tokens automatically before each API call. Same pattern for Dynamics.

---

### 2.10 `AgentsModule` (the orchestration core)

**Purpose:** The 5 background agents that move candidates through the pipeline + the orchestrator that schedules them.

**Components:**

```
AgentOrchestrator
   ├─ enqueueSourcing(campaignId)        ──▶ "sourcing" queue
   ├─ enqueueEnrichment(candidateId)     ──▶ "enrichment" queue
   ├─ enqueueQualification(candidateId)  ──▶ "qualification" queue
   ├─ enqueuePersonalization(candidateId)──▶ "personalization" queue
   └─ enqueueOutreach(candidateId, ch)   ──▶ "outreach" queue (with delay)

SourcingAgent       @Process("scrape")
EnrichmentAgent     @Process("enrich")
QualificationAgent  @Process("qualify")
PersonalizationAgent @Process("personalize")
OutreachAgent       @Process("send")
```

Each agent:
1. Receives a job from its Bull queue
2. Calls integrations + AI services
3. Updates the candidate
4. Emits an activity event
5. Enqueues the next agent

**Demo bypass:** Orchestrator's `enqueueX` methods log `[DEMO] enqueueX` and return `{ id, queued: false }` instead of touching Redis. So the API works with no Redis service attached.

**Detailed agent workflows in §4 below.**

---

### 2.11 `CampaignsModule`

**Purpose:** Campaign CRUD + transcript parsing entry point + file uploads.

**Endpoints:**
- `GET /api/campaigns` — list with cumulative stats per campaign
- `GET /api/campaigns/:id` — single campaign
- `POST /api/campaigns` — create + auto-trigger sourcing
- `PATCH /api/campaigns/:id` — update name/IRP/threshold/etc.
- `DELETE /api/campaigns/:id` — cascade delete (messages → activity → candidates → campaign)
- `POST /api/campaigns/parse` — transcript → `CampaignBrief` JSON via AiService
- `POST /api/campaigns/upload-audio` — multipart audio file → Supabase Storage + Whisper transcription → returns `{ transcript, storageUrl }`
- `POST /api/campaigns/:id/upload-placements` — multipart CSV → Supabase Storage → returns URL
- `PATCH /api/campaigns/:id/pause` + `/resume`
- `POST /api/campaigns/:id/sync` — force-Dynamics-sync every candidate
- `GET /api/campaigns/:id/candidates` — campaign's candidate list ordered by score

**Imports:** AiModule, AgentsModule, IntegrationsModule, MulterModule (file upload).

---

### 2.12 `CandidatesModule`

**Purpose:** Candidate CRUD + AI quick-actions.

**Endpoints:**
- `GET /api/candidates?status=&campaignId=` — filtered list
- `GET /api/candidates/:id` — full record including campaign join
- `GET /api/candidates/:id/score` — IRP score + reasoning
- `GET /api/candidates/:id/messages` — full message thread
- `POST /api/candidates/:id/sync` — force Dynamics sync
- `POST /api/candidates/:id/regenerate-score` — re-run IRP scoring through AiService
- `POST /api/candidates/:id/regenerate-personalization` — regenerate tokens

**Imports:** AiModule (for the regenerate endpoints).

---

### 2.13 `InboxModule`

**Purpose:** Unified inbox + AI drafts + inbound webhooks.

**Endpoints:**
- `GET /api/inbox?campaignId=` — thread list (one per candidate, last message + unread flag)
- `POST /api/inbox/:threadId/messages` — send a reply (recruiter's outbound message)
- `GET /api/inbox/:threadId/draft` — generate AI-drafted reply with user's AI personality applied
- `POST /api/inbox/:threadId/read` — mark all inbound messages as read
- `POST /api/inbox/webhooks/sms` — Twilio inbound (validated by `TwilioWebhookMiddleware`, no Clerk)
- `POST /api/inbox/webhooks/gmail` — Gmail Pub/Sub push (no Clerk)

**Imports:** AiModule, IntegrationsModule (Gmail), ActivityModule, SettingsModule (for AI preferences).

---

### 2.14 `NotificationsModule`

**Purpose:** Multi-channel notification delivery (Slack live; email + in-app stubbed).

**Triggered by:** Various services — when an activity event matches a user's notification preferences, the corresponding channel(s) are fired.

**Used by:** Currently called from `ActivityService.emit` for high-priority types (replies, bookings, errors). Phase 2 will wire all event types.

---

## 3. Frontend modules

Listed by route. Each page is a Next.js App Router file under `apps/web/app/(dashboard)/`.

### 3.1 `/` Dashboard (`page.tsx`)

**Components rendered (top to bottom):**
- `AgentStatusStrip` — horizontal strip of 6 agent pills, subscribes to Pusher `agents` channel
- `MetricsRow` — 7 cards (clickable, link to `/candidates?status=...`), uses `useDashboardMetrics()`
- `TopCandidates` — 8 highest-scored qualified candidates, uses `useCandidates({ status: "qualified" })`
- `ActivityFeed` — last 100 events, initial fetch via `useQuery(["activity"])` + Pusher `activity` channel for live appends

**Why this matters:** Every card is clickable and routes to a filtered list. Click "Sourced" → `/candidates?status=sourced`. Click a candidate name → `/candidates/[id]`. Click "View pipeline" → `/agents`.

---

### 3.2 `/agents` Active Agents Pipeline

**Component:** `ActiveAgentsPanel`.

**Hook:** `useAgentStats(campaignId?)` — polls `/api/metrics/agents` every 10s.

**What it does:** Renders 7 agent cards in a vertical pipeline (Job Board Scraping → Waterfall Enrichment → AI Screening → Personalization → SMS/Email → Calling → Booking). Each card shows live processed/total counts, success rate, throughput per hour, and a pulsing dot when running.

---

### 3.3 `/campaigns` Campaign list + `/campaigns/[id]` Campaign detail + `/campaigns/new` Builder

**List page:** `CampaignsList` → renders `CampaignCard` per row. Hooks: `useCampaigns()`, `useDeleteCampaign()`.

**Card:** Shows real cumulative stats from API (sourced/qualified/sent/replied). Kebab menu has Open/Edit/Delete actions.

**Detail page:** `CampaignHeader` (with edit + pause/resume + delete + force-sync) + `CandidatePipeline` (scored list of candidates in this campaign).

**Builder (`/campaigns/new`):** 4-step wizard.
- Step 1 `TranscriptParser` — paste text or upload audio, calls `POST /api/campaigns/parse`
- Step 2 `IdealRecruitProfile` — review/edit the IRP prompt + threshold
- Step 3 `CadenceBuilder` — pick template (3-touch / 5-touch / hyper-personalized)
- Step 4 Review → `useCreateCampaign()` → redirects to detail page

---

### 3.4 `/candidates` Candidate list + `/candidates/[id]` Candidate detail

**List:** `CandidateList` reads `?status=` from URL, syncs filter changes back to URL. Components: search input + status select + filter chip + `CandidateCard` rows.

**Detail:** Three columns on desktop (single column on mobile):
- `ScoreBreakdown` — score, reasoning, progress bar
- `CandidateProfile` — name, verification badges (Identity/Credentials/In CRM), enrichment data, deep research, personalization tokens, AI quick-action buttons
- `MessageHistory` — full conversation across SMS + email + activity events

**AI quick actions** (on the profile card): Re-score and Re-personalize. Both call `POST /api/candidates/:id/regenerate-*` and invalidate the candidate cache so UI updates.

---

### 3.5 `/inbox` Unified Inbox

**Component:** `InboxView` — two-pane on desktop, single-pane with back button on mobile.

**Pane 1: `ThreadList`** — uses `useThreads()`, shows candidate name + last-message preview + channel badge + unread dot.

**Pane 2: `MessageThread`** — uses `useCandidateMessages(threadId)`, `useAiDraft(threadId)` (only when AI mode is on), `useSendReply(threadId)`, `useMarkRead(threadId)`.

**AI mode toggle** — when on, the AI-drafted reply is pre-filled in the textarea. Recruiter can edit or send as-is.

**Channel selector** — switches between SMS / email outbound. Inbound channel is determined by where the candidate replied.

---

### 3.6 `/command` AI Command Center

**Component:** `AICommandCenter` — chat interface.

**Endpoint:** `POST /api/command` — sends `{ message }`, returns `{ content, action? }` where action is an optional structured tool-call requiring confirmation.

**Examples:** "How many of the 800 we sent got replies?", "Pause the Dallas RN campaign", "Create another campaign like Dallas RN but for Austin".

**Memory:** `CommandMemory` table per user holds chat history. Cross-session — closing the browser doesn't lose context.

---

### 3.7 `/integrations` Integrations Hub

**Component:** `IntegrationsHub`.

**Hook:** `useIntegrations()` — reads `GET /api/settings/integrations`, returns aggregated status of every connector.

**Sections:**
- Candidate Data Sources: Indeed, LinkedIn, ZipRecruiter, Vivian Health, Monster, + Add Custom
- Outreach Channels: AI Calling, AI Texting, Instantly, Gmail
- CRM Sync: Microsoft Dynamics 365
- Manual Import: drag-drop CSV/Excel upload
- Incoming Webhooks: copyable POST URL for external candidate ingestion

---

### 3.8 `/settings` Settings

Stacks 5 panels:
1. `AISettings` — tone/verbosity/creativity/emoji/sign-off/custom instructions → saves to `AIPreferences`
2. `DefaultSearchConfig` — job title, shift, experience, location radius slider, pay range, license required toggle, sources checkboxes → saves to `SearchConfig`
3. `DynamicsSettings` — tenant ID, resource URL, per-event sync cadence
4. `FieldMappingSettings` — Platform↔Dynamics field map
5. `NotificationSettings` — global event×channel toggle grid

---

### 3.9 `/profile` User Profile

Personal account page (separate from workspace settings):
- Avatar + name + title + organization
- Stat cards: active campaigns, sourced count, replies this week, meetings booked
- Personal info form (name, email, phone, title, org, timezone)
- Notification preferences (per-event in-app/email/Slack toggles)
- Quick links to AI Personality, Search Defaults, Integrations
- Sign out / Exit Demo Mode

---

### 3.10 `/upgrade` Exit Demo

Contact page reached from the demo banner's "Exit →" pill. Two CTAs (mailto + website) and a feature list of what unlocks in full mode.

---

### 3.11 Shared layout chrome

| Component | Where it lives | Notes |
|---|---|---|
| `Sidebar` | All dashboard pages | Hamburger drawer on mobile, static glass-panel on desktop |
| `TopBar` | All dashboard pages | NotificationsDropdown + DemoUser/UserButton |
| `NotificationsDropdown` | Inside TopBar | Bell icon → list of important activity events. Filters to replied/booked/qualified/error. |
| `DemoBanner` | Top of dashboard layout | Amber strip with "Exit →" pill, hidden when `NEXT_PUBLIC_DEMO_MODE=false` |

---

## 4. End-to-end workflows (sequence flow)

### 4.1 Campaign creation

```
User pastes Otter transcript in /campaigns/new
   │
   ▼
TranscriptParser → POST /api/campaigns/parse
   │   (or POST /api/campaigns/upload-audio for voice notes)
   ▼
CampaignsService.parseTranscript
   ├─ AiService.parseTranscript(text, "transcript")
   └─ Returns CampaignBrief {role, mustHaveCredentials, niceToHaves, ...}
   │
   ▼
User edits IRP prompt + threshold in IdealRecruitProfile step
   │
   ▼
User picks cadence template in CadenceBuilder step
   │
   ▼
Review step → POST /api/campaigns
   │
   ▼
CampaignsService.create
   ├─ prisma.campaign.create({...})
   └─ orchestrator.startSourcing(campaign.id)  [fire-and-forget]
   │
   ▼
[BullMQ "sourcing" queue]
   │
   ▼
SourcingAgent.handleScrape
   ├─ ApifyService.scrapeLinkedIn(sourcingSpec)  ┐
   ├─ ApifyService.scrapeIndeed(sourcingSpec)    │ Promise.allSettled
   │                                              ┘
   ├─ For each rawCandidate:
   │     prisma.candidate.upsert({ status: "sourced" })
   │     ActivityService.emit("sourced")
   │     orchestrator.enqueueEnrichment(candidate.id)
```

### 4.2 Enrichment → Qualification → Personalization → Outreach

```
[BullMQ "enrichment" queue]
   │
   ▼
EnrichmentAgent.handleEnrich (one candidate)
   ├─ ApolloService.enrich(name, email)              → enrichedData
   ├─ AiService.deepResearch(name, sourcingSpec)     → deepResearch
   ├─ AiService.verifyIdentity(rawData, apolloData)  → identityVerified
   ├─ AiService.verifyCredentials(profile, roleSpec) → credentialsVerified
   ├─ prisma.candidate.update({ status: "enriched", ...everything })
   ├─ ActivityService.emit("enriched")
   └─ orchestrator.enqueueQualification(candidate.id)
   │
   ▼
[BullMQ "qualification" queue]
   │
   ▼
QualificationAgent.handleQualify
   ├─ AiService.scoreCandidate(candidate, irpPrompt, threshold)
   │     ↳ injects past-placement embeddings as few-shot if present
   ├─ prisma.candidate.update({ score, scoreReasoning, status })
   ├─ ActivityService.emit("qualified" | "disqualified")
   └─ if qualified: orchestrator.enqueuePersonalization(candidate.id)
   │
   ▼
[BullMQ "personalization" queue]
   │
   ▼
PersonalizationAgent.handlePersonalize
   ├─ AiService.generatePersonalizationTokens(candidate)
   ├─ prisma.candidate.update({ personalizationTokens, status: "personalized" })
   └─ For each channel in campaign.channels:
        orchestrator.enqueueOutreach(candidate.id, channel, touch=1)
        [delayed by 5s for SMS, 1s for email — drip pacing]
   │
   ▼
[BullMQ "outreach" queue]
   │
   ▼
OutreachAgent.handleSend
   ├─ resolveTemplate(campaign, channel, touch, tokens) — interpolates {{firstName}} etc.
   ├─ TwilioService.sendSms({...})  OR  GmailService.sendEmail({...})
   ├─ prisma.message.create({ direction: "outbound", channel, body, externalId })
   ├─ ActivityService.emit("sent")
   └─ DynamicsService.syncEvent(candidateId, "message_sent", {channel, touch})
```

### 4.3 Reply received → Inbox notification → AI draft → recruiter sends

```
Candidate replies via SMS
   │
   ▼
Twilio POST /api/inbox/webhooks/sms
   │
   ▼
TwilioWebhookMiddleware validates signature
   │
   ▼
InboxService.handleInboundSms
   ├─ prisma.candidate.findFirst({ phone: payload.From })
   ├─ prisma.message.create({ direction: "inbound", channel: "sms", body, externalId })
   └─ ActivityService.emit("replied")
   │
   ▼
ActivityFeed (live) + NotificationsDropdown badge increments
   │
   ▼
Recruiter clicks notification → /candidates/:id  OR  /inbox + selects thread
   │
   ▼
MessageThread component:
   ├─ useCandidateMessages(threadId)  → renders history
   ├─ useAiDraft(threadId)
   │     ↳ GET /api/inbox/:threadId/draft
   │     ↳ InboxService.generateAiDraft(candidateId, userId)
   │           ├─ SettingsService.getAIPreferences(userId)
   │           ├─ buildToneSystemPrompt(prefs)
   │           └─ AiService.draftReply(history, sourcingSpec, tonePrompt, creativity)
   │     ↳ Pre-fills the textarea
   ├─ Recruiter edits or accepts as-is
   └─ useSendReply → POST /api/inbox/:threadId/messages
        ↳ InboxService.sendReply → creates outbound Message, emits "sent"
```

### 4.4 Booking flow

```
Outbound SMS contains a Calendly link
   │
   ▼
Candidate books a slot → Calendly fires webhook
   │
   ▼
CalendlyService handles webhook (Phase 2 endpoint)
   ├─ prisma.candidate.update({ status: "booked" })
   ├─ ActivityService.emit("booked")
   ├─ DynamicsService.syncEvent(candidateId, "meeting_booked", {when, recruiter})
   └─ NotificationsService.send(recruiter, "Meeting booked")
```

### 4.5 Force CRM sync (manual)

```
User clicks "Force CRM Sync" on candidate detail page
   │
   ▼
useForceCandidateSync → POST /api/candidates/:id/sync
   │
   ▼
CandidatesService.forceDynamicsSync
   ├─ prisma.candidate.update({ dynamicsSyncedAt: null })  [marks dirty]
   └─ Returns { queued: true }
   │
   ▼
Next DynamicsService.syncEvent run picks up dirty candidates
   ├─ DynamicsService.upsertContact(candidate)
   │     ├─ Refreshes OAuth token if expired
   │     └─ Dynamics Web API PATCH on Contact entity
   ├─ prisma.candidate.update({ dynamicsSyncedAt: now, dynamicsContactId })
   └─ ActivityService.emit("synced")
```

---

## 5. How settings link to behavior

Settings aren't standalone — they change what other modules do.

| Setting | Stored in | Read by | Effect |
|---|---|---|---|
| AI Personality (tone/verbosity/creativity/emoji/sign-off/custom) | `AIPreferences` | `InboxService.generateAiDraft` (and Phase 2: `PersonalizationAgent`) | Changes AI output style without changing scoring |
| Default Search Configuration | `SearchConfig` | Future: `CampaignsService.create` will pre-fill new campaigns | Sets the default sourcing spec template |
| Dynamics sync cadence per event | `DynamicsSyncSettings` | `DynamicsService.syncEvent` | Controls whether each event type pushes real-time vs batched |
| Field mappings | (Phase 2: dedicated table) | `DynamicsService.upsertContact` | Decides which Dynamics field each platform field writes to |
| Notification preferences | (Phase 2: per-user table) | `NotificationsService.send` | Decides which channel(s) fire for each event type |
| Recruiter number mapping | `RecruiterNumberMapping` | `TwilioService.resolveOutboundNumber` | Each candidate sees the same outbound number from their assigned recruiter |
| OAuth tokens | `OAuthToken` | `GmailService`, `DynamicsService` | Auto-refreshed before each API call |

---

## 6. Real-time channels (Pusher)

| Channel | Event | Producer | Consumer |
|---|---|---|---|
| `activity` | `event` (full ActivityEvent payload) | Backend `ActivityService.emit` (Phase 2 — currently DB-polled) | `ActivityFeed` and `NotificationsDropdown` on the frontend |
| `agents` | `status` (`{ agent, active, count }`) | Backend agents on start/finish (Phase 2) | `AgentStatusStrip` |

In demo mode the noop Pusher client makes both `bind` and `unbind_all` no-ops, so the dashboard renders normally without real-time updates.

---

## 7. Demo mode behavior matrix

What works without any third-party keys:

| Module | Demo behavior |
|---|---|
| Auth | Bypassed — userId = "demo-recruiter-1" |
| Sourcing (Apify) | Returns 4–8 hardcoded fake candidates per scrape |
| Enrichment (Apollo + AI) | Returns realistic mock enrichment, deep research summary, identity match: true |
| Qualification (AI scoring) | Deterministic score from candidate name length (60–95 range) |
| Personalization (AI tokens) | Realistic stub tokens |
| Outreach (Twilio + Gmail) | Logs `[DEMO] SMS to=...` / Gmail skip, returns fake SID |
| Inbox AI drafts | Hard-coded responses based on inbound message keywords |
| Command Center | Pre-canned responses for common queries |
| Dynamics | `syncEvent` logs only — no API call |
| Calendly | Stub booking link |
| Pusher | Noop client |
| Bull queues | Orchestrator skips `queue.add` |

---

## 8. Production toggle path

To go from demo to live:

1. Set `DEMO_MODE=false` (API) and `NEXT_PUBLIC_DEMO_MODE=false` (Web)
2. Provide real credentials in env vars (see `.env.example`):
   - `OPENAI_API_KEY`
   - `CLERK_SECRET_KEY` + `CLERK_PUBLISHABLE_KEY` (re-enables auth)
   - `APIFY_TOKEN`, `APOLLO_API_KEY`
   - `TWILIO_ACCOUNT_SID` + `TWILIO_AUTH_TOKEN` + `TWILIO_MESSAGING_SERVICE_SID`
   - `GOOGLE_CLIENT_ID` + `GOOGLE_CLIENT_SECRET` (then OAuth flow per recruiter)
   - `DYNAMICS_TENANT_ID/CLIENT_ID/CLIENT_SECRET/RESOURCE_URL`
   - `REDIS_URL` (provision Railway Redis service)
3. Run Twilio 10DLC registration (multi-week lead time — start before any other rollout work)
4. Configure recruiter number pool + per-recruiter mappings
5. Verify Dynamics sandbox + run reconciliation job

The same code paths run in both modes — no rewrite needed.

---

*Last updated 2026-05-05.*
