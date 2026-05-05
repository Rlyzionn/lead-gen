# EmpowerAI 365 — Recruiting Automation Platform

A self-contained brief covering what the platform does, how the pipeline works,
what every label means, and how the integrations slot together.

Live demo: [hhaweb-production.up.railway.app](https://hhaweb-production.up.railway.app)
Repo: [github.com/Rlyzionn/lead-gen](https://github.com/Rlyzionn/lead-gen)

---

## 1. The product in one sentence

> Drop in a transcript or prompt → the platform sources candidates,
> verifies them, scores them, personalizes outreach, sends it across
> SMS + email, captures replies in a unified inbox, and syncs everything
> to Microsoft Dynamics — without a recruiter touching anyone who isn't
> already a qualified, interested fit.

Built for recruiting agencies that hate top-of-funnel busywork.

---

## 2. Who uses it

| Persona | What they do here |
|---|---|
| **Agency owner / Chris** | Defines the "Ideal Recruit Profile" once, watches campaigns run themselves, pops in to approve high-stakes replies. |
| **Recruiter** | Receives reply notifications, takes booked calls, edits AI-drafted replies before sending. |
| **Client (hiring manager)** | Their intake call gets dropped in as a transcript — campaign auto-creates around what they said they want. |

---

## 3. The lifecycle of one candidate

A candidate moves through these statuses **in order**. Each transition is
performed by a specific AI agent (see §6). Status flows top-to-bottom:

```
sourced ──▶ enriched ──▶ qualified ─────▶ personalized ──▶ sent ──▶ replied ──▶ booked
                      └▶ disqualified  (terminal — never contacted)
```

### What every label means

| Status | Meaning | Triggered when |
|---|---|---|
| **sourced** | Found on LinkedIn / Indeed / ZipRecruiter / CSV. Raw profile only — no contact info verified yet. | Sourcing Agent scrapes a matching profile. |
| **enriched** | Apollo (or equivalent) attached email, phone, current employer, certifications, education. Identity cross-verified across sources. | Enrichment Agent finishes the waterfall + identity match. |
| **qualified** | Scored against the Ideal Recruit Profile — passed the campaign's threshold. **Ready for outreach.** | Qualification Agent's score ≥ campaign threshold. |
| **disqualified** | Scored below threshold. Has a written rationale ("missing CCRN", "step-down not true ICU", etc.). Never contacted. | Qualification Agent's score < threshold. |
| **personalized** | AI generated outreach tokens specific to this candidate (`firstName`, `currentRole`, `specificCompliment`, `relevantAchievement`, `openingHook`). | Personalization Agent finishes after qualification. |
| **sent** | First outreach touch (SMS or email) actually went out via Twilio / Gmail. | Outreach Agent's first send returns success. |
| **replied** | Candidate responded on any channel. AI drafts a reply suggestion, recruiter can approve or rewrite. | Inbound webhook (Twilio SMS / Gmail push) hits and matches a candidate. |
| **booked** | Calendly meeting booked. Synced to Dynamics. Recruiter sees it in their calendar. | Calendly webhook fires + booking event posts back to the candidate record. |
| **In CRM** | (Not a status — a flag.) Candidate exists as a Contact in Microsoft Dynamics, with a `dynamicsContactId` and a `dynamicsSyncedAt` timestamp. | Dynamics Service successfully upserts the Contact. |

### What the dashboard counters mean

The 7 metric cards on the home dashboard (Sourced / Enriched / Qualified /
Sent / Replied / Booked / In CRM) are **cumulative counts** of candidates
that have *passed through* that stage. So if a candidate is currently
"replied", they're counted in Sourced + Enriched + Qualified + Sent +
Replied (5 of the 7 cards). Click any card → filtered candidate list.

---

## 4. How sourcing works

The Sourcing Agent doesn't crawl LinkedIn directly — that's how accounts
get banned. It uses **managed scraping providers**.

### Sources (configurable per-campaign in Settings → Default Search Configuration)

| Source | What it provides | How |
|---|---|---|
| **Indeed** | Resume database + job-board scraping | Apify actor `apify/indeed-scraper` |
| **LinkedIn** | Profile + InMail-eligible candidates | Apify actor `apify/linkedin-scraper` (or BrightData) |
| **ZipRecruiter** | Resume database access + job posting matches | Apify |
| **Internal DB** | Candidates already in the platform's Postgres | Direct query |
| **Vivian Health** | Healthcare-vertical marketplace | Custom connector (deferred to Phase 2) |
| **Monster** | General resume database | Custom connector (deferred to Phase 2) |
| **Webhooks** | Anything else: ATS exports, partner feeds | `POST /api/webhooks/candidates` |
| **Manual CSV/XLSX** | One-off uploads, past-placement reference data | Settings → Integrations Hub → Manual Import |

### The sourcing job

1. Campaign creator defines the **sourcing spec** (free-text role description).
2. Sourcing Agent calls each enabled scraping provider in parallel with that spec.
3. Each candidate returned is **upserted** by `externalId` so re-runs don't duplicate.
4. Per-source rate limits enforced — stays under provider quotas + carrier flags.
5. Cross-platform identity verification (next stage) catches the same person
   on Indeed and LinkedIn.

### Live UI feedback

Candidates appear on the Active Agents pipeline as soon as their initial
scrape lands, then update in place as later stages complete. This is what
makes Chris's "results in seconds" feel real — he sees activity immediately
even though the full pipeline runs in the background.

---

## 5. How enrichment works (the waterfall)

The Enrichment Agent runs **four steps in order**. Each is a separate
LLM/API call that can fail and be re-run independently.

```
1. Apollo (primary)              — pulls email, phone, current company, tenure, certifications
2. Deep Research (LLM + web)     — finds public info NOT on the candidate's primary profile
3. Identity Verification (LLM)   — cross-checks the same person across LinkedIn + Apollo + Indeed
4. Credential Verification (LLM) — for licensed roles: license #, expiry, state-board status
```

Output stored on the `Candidate` row:

| Field | Type | What's in it |
|---|---|---|
| `enrichedData` | JSON | `{ company, yearsExperience, education, certifications[], previousRoles[] }` |
| `deepResearch` | string | Markdown summary of public mentions, recent moves, conference talks, GitHub, etc. |
| `identityVerified` | bool | The 3 cross-source identity check returned `match: true, confidence > 0.8` |
| `credentialsVerified` | bool | License/cert verified active. RNs: Texas BON lookup. SWEs: GitHub presence. AEs: LinkedIn/President's Club. |

If identity or credentials fail, the candidate is **flagged for manual
review** rather than silently disqualified — Chris's recruiters trust the
system more when borderline cases surface.

---

## 6. How candidates are ranked (the IRP)

The **Ideal Recruit Profile** is the single most important config in
each campaign. It's a free-text prompt that defines what "good" looks
like for that role.

Example (Senior RN — Dallas ICU):

```
You are scoring candidates for an ICU Registered Nurse role in Dallas, TX.
Score 0–100 based on:
- Active RN license in Texas (required, disqualify if absent)
- ICU or critical care experience (3+ years preferred)
- BSN degree (required) / MSN (bonus)
- CCRN certification (strong positive signal)
- Proximity to Dallas metro
- History of stable employment (< 3 jobs in 5 years preferred)
```

### How scoring runs

1. Qualification Agent takes the candidate's `enrichedData` + `deepResearch`
   + `rawData` and feeds it into GPT-4o with the IRP prompt.
2. Optional **few-shot context**: a CSV of past successful placements
   uploaded by Chris is embedded and injected into the prompt as worked examples.
3. Returns `{ score: 0–100, reasoning: "..." }`.
4. If `score >= campaign.threshold` → status becomes `qualified`. Otherwise
   `disqualified` with the reasoning stored on the candidate so recruiters
   can audit.

### Tunable per-campaign

- **Threshold** (default 70) — the cut-off
- **IRP prompt** — fully editable
- **Past-placement CSV** — uploaded once per role-type, used as few-shot examples
- **Re-score** button on every candidate — re-runs after IRP changes

### AI Personality (Settings → AI Personality)

A separate set of preferences (`AIPreferences` table) controls *how* the
AI sounds in outreach drafts and replies — not what it scores. Five sliders:

| Setting | Options | What it does |
|---|---|---|
| Tone | Formal / Casual / Friendly / Direct | Word choice, contraction usage |
| Verbosity | Concise / Balanced / Detailed | Length of replies |
| Creativity | 0.0–1.0 slider | OpenAI `temperature` parameter |
| Emoji usage | None / Minimal / Liberal | Self-explanatory |
| Sign-off | Warm / Professional / None | "Talk soon" vs "Best regards" vs nothing |
| Custom instructions | Free text | "Always mention the $8k sign-on bonus", "Never use the word 'opportunity'", etc. |

Used by the Personalization Agent (token generation) and the Inbox AI
draft endpoint (`GET /api/inbox/:threadId/draft`).

---

## 7. How outreach works

### Channels

| Channel | Provider | When |
|---|---|---|
| **SMS** | Twilio (10DLC registered) | Highest priority. Most replies happen here. |
| **Email** | Gmail OAuth (low volume) → Instantly Phase 2 (mass) | Touch 2/3 in most cadences. |
| **Voice** | AI agent (Phase 2) OR human-recruiter notification (MVP default) | When SMS + email fail to elicit a response. |
| **LinkedIn** | Phase 2 only — accounts get banned fastest | — |

### Cadence templates (campaign config)

- **3-touch** — SMS day 1, email day 3, SMS day 7
- **5-touch** — extended drip with channel switching
- **Hyper-personalized** — single deeply-researched email, no follow-up

Each touch's body is interpolated with the candidate's `personalizationTokens`:

```
Hi {{firstName}}, your {{currentRole}} background caught my attention.
{{specificCompliment}}. {{openingHook}}
```

becomes:

```
Hi Sarah, your ICU Registered Nurse background caught my attention.
Your 6 years in critical care is exactly the calibre we're placing.
Sarah, ICU nurses with your background are the hardest to find in DFW right now.
```

### Compliance layer (SMS)

- **10DLC registered** with carriers — required for compliant business SMS at scale
- **Number pool with rotation** — each campaign draws from a pool, sends rotate to keep per-number volume below carrier flag thresholds
- **Drip-paced sending** — 5s spacing for SMS, 1s for email (configured in `AgentOrchestrator.calculateSendDelay`)
- **Per-recruiter consistent display number** — each candidate sees outbound from one number for their assigned recruiter, so when the recruiter calls back from that same number, candidates trust it. This is the routing layer (`RecruiterNumberMapping` table) on top of Twilio's pool rotation.
- **STOP/HELP keyword handling** — auto opt-out per regulation

---

## 8. How replies work (Unified Inbox)

When a candidate replies on any channel:

1. **Inbound webhook** fires:
   - SMS: `POST /api/inbox/webhooks/sms` (Twilio, validated by `TwilioWebhookMiddleware`)
   - Email: `POST /api/inbox/webhooks/gmail` (Gmail Pub/Sub push notification)
2. Inbox service matches `From` phone or email back to a `Candidate` row.
3. `Message` record created with `direction: inbound`.
4. Activity event emitted (`type: replied`) → live notification appears.
5. Candidate status moves to `replied`.

### The unified view

`/inbox` shows all conversations across all channels in one place.
Click a thread → message thread + AI-drafted reply pre-filled in the
compose box. Toggle **AI mode**: on = AI auto-drafts; off = recruiter
writes from scratch. Either way the recruiter approves before send.

The AI draft uses:
- The full message history of that thread
- The campaign's `sourcingSpec` for context
- The user's saved AI Personality settings (tone, verbosity, etc.)

### Hybrid AI mode

A toggle on every thread. Two modes:
- **AI auto** — AI handles the conversation unless an escalation condition fires (price negotiation, scheduling conflict, off-script question). On escalation, recruiter is notified.
- **Human takeover** — AI drafts, human approves and sends.

---

## 9. Calendar booking

When the AI says "would you like to set up a call?", the SMS includes a
**dynamic Calendly link** specific to that candidate. When booked:

1. Calendly webhook hits the platform.
2. Booking event added to candidate's activity timeline.
3. Status moves to `booked`.
4. Synced to Dynamics as a meeting record.
5. Recruiter gets a Slack/email notification with the candidate's full
   context, AI-summarised research, and suggested talking points.

Phase 2: Zoom round-robin scheduling across multiple recruiters with
load balancing.

---

## 10. CRM Sync (Microsoft Dynamics)

This is Chris's #1 non-negotiable. Every candidate-facing event syncs.

### Events that sync

| Event | Default cadence |
|---|---|
| `candidateCreated` | Real-time |
| `candidateScored` | Hourly batch |
| `candidateQualified` | Real-time |
| `messageSent` (per channel) | Every 5 min |
| `replyReceived` | Real-time |
| `meetingBooked` | Real-time |
| `callOutcomeLogged` | Real-time |
| `statusChange` | Real-time |

Each event type's cadence is **configurable per-tenant** in Settings →
Dynamics Sync (`DynamicsSyncSettings` table). Chris can have replies
push real-time but candidate creation batch nightly, for example.

### Field mapping

Settings → Field Mappings — editable mapping between platform fields and
Dynamics entity fields. Defaults:

| Platform | Dynamics |
|---|---|
| `name` | `fullname` |
| `email` | `emailaddress1` |
| `phone` | `mobilephone` |
| `title` | `jobtitle` |
| `location` | `address1_city` |
| `score` | `new_aiqualificationscore` (custom field) |
| `status` | `new_candidatestatus` (custom field) |

Every Dynamics instance is custom — Chris's mapping won't match the next
client's, hence the editable settings.

### Sync mechanics

- **OAuth 2** flow stores tokens in `OAuthToken` table, refreshed automatically
- `dynamics.service.upsertContact` does a Dynamics Web API `PATCH` on the contact
- **Force-sync button** on every candidate + every campaign for immediate push
- **Last-sync timestamp** + **error count** visible per record in the UI
- **Reconciliation job** (Phase 2) catches drift — records that should have synced but didn't

---

## 11. AI Command Center

The chat interface at `/command`. Three things it does:

### 1. Conversational queries over your data

> "How many qualified RNs in Texas didn't reply to touch 1?"
> "Show me the reply rate on the 5-touch vs 3-touch template."
> "What's the booking rate for candidates above score 85?"

Translates natural-language to Prisma queries via OpenAI tool-use.

### 2. Cross-session memory

`CommandMemory` table per user. The chat remembers prior context:

> "Create another campaign like the Dallas RN one but for Houston"
>
> *(Reads the Dallas RN campaign config, regenerates with Houston in
> sourcing spec, returns a confirmation prompt.)*

### 3. Action-connected

Every tool the AI can call is a real API endpoint:

```
launch_campaign      pause_campaign         resume_campaign
force_dynamics_sync  reassign_candidate     change_threshold
draft_reply          regenerate_score       regenerate_personalization
```

Destructive actions prompt for confirmation in the chat.

---

## 12. The Active Agents pipeline view (`/agents`)

A live visualization of the 7 agents (Sourcing → Booking) showing:

- Status (Running with pulsing dot, or Idle)
- Description of what the agent does
- Progress bar: `processed / total` with percentage
- Success rate %
- Throughput per hour

Numbers come from `GET /api/metrics/agents` which derives them from
candidate-status counts in the DB. Updates every 10 seconds.

---

## 13. Architecture (one screen)

```
┌─────────────────────────────────────────────────────────────────┐
│                          BROWSER (Next.js)                      │
│  Dashboard │ Campaigns │ Candidates │ Inbox │ Command │ Settings │
└────────────────────────────────────────┬────────────────────────┘
                                         │ axios → /api/*
                                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                      NestJS API (apps/api)                      │
│                                                                  │
│  Auth (Clerk)  ◀─────  Routes  ─────▶  Webhooks (Twilio, Gmail) │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │            Agent Orchestrator (BullMQ + Redis)             │ │
│  │                                                             │ │
│  │  Sourcing → Enrichment → Qualification → Personalization → │ │
│  │  Outreach → (Calling → Booking)                            │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                  │
│  Integrations: Apify, Apollo, Twilio, Gmail, Calendly,          │
│                Dynamics CRM, Slack, OpenAI, Anthropic            │
└────────┬──────────────────┬───────────────────┬─────────────────┘
         │                  │                   │
         ▼                  ▼                   ▼
   Supabase            Redis (Bull)      Microsoft Dynamics
   Postgres + Storage  job queues        (CRM sync)
   (Prisma)
```

### Database (Prisma + Supabase Postgres)

| Table | What it holds |
|---|---|
| `Campaign` | Role definition, IRP prompt, threshold, channels, cadence templates |
| `Candidate` | Everything about one person — profile, enrichment, score, status, tokens |
| `Message` | One row per inbound or outbound SMS/email |
| `ActivityEvent` | Audit log — sourced/qualified/sent/replied/booked/error/synced |
| `CommandMemory` | Per-user chat history for the AI Command Center |
| `RecruiterNumberMapping` | Recruiter → consistent outbound phone number |
| `DynamicsSyncSettings` | Per-event-type cadence config |
| `OAuthToken` | Google + Dynamics tokens, auto-refreshed |
| `AIPreferences` | Per-user tone/verbosity/creativity/sign-off |
| `SearchConfig` | Per-user default search filters used when creating new campaigns |

### Backend agents (NestJS BullMQ processors)

Each agent is a `@Processor("name")` class with `@Process` handlers.
Demo mode (`DEMO_MODE=true`) makes the orchestrator skip queue.add so
the API works without Redis.

---

## 14. Demo mode

`DEMO_MODE=true` (API) + `NEXT_PUBLIC_DEMO_MODE=true` (Web) gives a
fully-functional sandbox with **zero third-party keys**:

- AI returns realistic stub responses
- Twilio/Apify/Apollo/Dynamics log + return fake data
- Clerk is bypassed (Demo User badge in TopBar)
- Pusher is a noop client
- Bull queues are stubbed (no Redis required)
- 5 seeded campaigns + 60 seeded candidates + message threads

Set both flags to `false` and provide real credentials → the same code
runs end-to-end against real services.

---

## 15. Glossary (recruiter-facing)

| Term | What it really means |
|---|---|
| **Sourcing spec** | Free-text description of the role used by the scraping providers |
| **IRP (Ideal Recruit Profile)** | The scoring rubric for a campaign — written in plain English, runs as an LLM prompt |
| **Threshold** | Minimum IRP score (0–100) for a candidate to move from Qualified → Personalized → Outreach |
| **Touch** | One outreach attempt (e.g. "Touch 1" = first SMS, "Touch 3" = third email) |
| **Cadence** | The sequence of touches (3-touch, 5-touch, hyper-personalized) |
| **Drip pacing** | Spacing sends so carriers don't flag the number as spam |
| **Number pool rotation** | Multiple Twilio numbers per campaign, used in rotation to stay under per-number volume thresholds |
| **Cross-platform identity verification** | Confirming the LinkedIn person and the Indeed person are the same human, before scoring or messaging |
| **Personalization tokens** | The `{{firstName}}`, `{{specificCompliment}}` etc. that get substituted into outreach templates |
| **Hybrid AI mode** | The toggle that decides whether AI auto-replies or just drafts for human approval |
| **Force CRM Sync** | Manual button to push a candidate or whole campaign to Dynamics immediately, bypassing the configured cadence |
| **In CRM** | The candidate has a Dynamics Contact record with a non-null `dynamicsSyncedAt` |
| **Disqualified** | Below threshold + has written rationale. Never contacted. |

---

## 16. Definition of "MVP done"

Chris should be able to, in one session on his real data:

1. Paste an Otter transcript from a client intake call
2. Click "Parse Requirements" → review/edit auto-generated campaign brief
3. Upload a CSV of past successful RN placements as the "good fit" pattern
4. Confirm the IRP prompt + threshold
5. Launch the campaign across SMS + email + call reminders
6. Watch candidates flow through the pipeline in real time
7. Reply to a candidate from the unified inbox using the AI draft
8. Open Dynamics and see the full candidate record + activity log
9. Ask the Command Center "how many of the 800 we sent got replies?"
10. Force a Dynamics resync from the chat without leaving the conversation

If those ten flows work end-to-end on real data, MVP is done.

---

## 17. What's deferred to Phase 2

- AI voice agent (Vapi / Retell)
- Ringless voicemail at scale
- LinkedIn messaging
- Round-robin Zoom scheduling
- Direct Otter / Zoom API ingestion (paste-in works for MVP)
- Headhunter Academy playbook RAG ingestion
- Bidirectional Dynamics sync (currently push-only)
- Instantly cold-email integration
- Sub-agent orchestration full UI visualization
- Complex conditionals tied to call state or interview attendance

Every deferred item has a documented reason in `Plan and Handover/mvp-plan.md`.

---

## 18. File index for navigating the repo

```
project/
├── apps/
│   ├── api/                      NestJS backend
│   │   ├── prisma/schema.prisma  DB schema (single source of truth)
│   │   ├── prisma/seed.ts        5 demo campaigns + 60 candidates
│   │   └── src/
│   │       ├── agents/           5-stage pipeline (Sourcing → Outreach)
│   │       ├── ai/               Transcript parser, scoring, command center
│   │       ├── campaigns/        Campaign CRUD + transcript parsing endpoint
│   │       ├── candidates/       Candidate CRUD + AI quick actions
│   │       ├── inbox/            Threads, drafts, inbound webhooks
│   │       ├── integrations/     Apify, Apollo, Twilio, Gmail, Dynamics, Calendly
│   │       ├── settings/         AI prefs, search config, integrations status
│   │       ├── supabase/         Storage client (with ws transport for Node 20)
│   │       └── main.ts           Bootstrap, CORS, port binding
│   └── web/                      Next.js 14 app router frontend
│       ├── app/(dashboard)/      All authenticated routes
│       ├── components/           UI by feature folder
│       └── lib/                  hooks (TanStack Query) + auth-mode helper
├── packages/shared/              Cross-app TypeScript types
├── RAILWAY.md                    Deploy guide
├── DEPLOYMENT_NOTES.md           Every gotcha hit during first deploy
├── PROJECT_BRIEF.md              You are here
└── HANDOVER.md                   Original handover doc
```

---

*Last updated 2026-05-05.*
