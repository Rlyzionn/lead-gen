import { PrismaClient, Prisma } from "@prisma/client";
import {
  DEMO_CAMPAIGN,
  DEMO_CANDIDATES,
  DEMO_MESSAGES,
  DEMO_SCORE_REASONING,
  DEMO_CAMPAIGN_TRAVEL,
  DEMO_CANDIDATES_TRAVEL,
  DEMO_CAMPAIGN_SWE,
  DEMO_CANDIDATES_SWE,
  DEMO_CAMPAIGN_SALES,
  DEMO_CANDIDATES_SALES,
  DEMO_CAMPAIGN_SDR,
  DEMO_CANDIDATES_SDR,
  DEMO_MESSAGES_EXTRA,
} from "../src/demo/mock-data";

type CampaignSpec = {
  name: string;
  status: string;
  sourcingSpec: string;
  irpPrompt: string;
  threshold: number;
  channels: string[];
  cadenceTemplate: string;
};

type CandidateSpec = {
  name: string;
  title: string;
  location: string;
  email: string;
  phone: string;
  score: number | null;
  status: string;
  source: string;
};

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding demo data…");

  // Wipe existing data
  await prisma.activityEvent.deleteMany();
  await prisma.message.deleteMany();
  await prisma.candidate.deleteMany();
  await prisma.campaign.deleteMany();

  const campaigns: { spec: CampaignSpec; candidates: CandidateSpec[]; defaultDomain: string }[] = [
    { spec: DEMO_CAMPAIGN as CampaignSpec, candidates: DEMO_CANDIDATES as CandidateSpec[], defaultDomain: "icu" },
    { spec: DEMO_CAMPAIGN_TRAVEL as CampaignSpec, candidates: DEMO_CANDIDATES_TRAVEL as CandidateSpec[], defaultDomain: "travel" },
    { spec: DEMO_CAMPAIGN_SWE as CampaignSpec, candidates: DEMO_CANDIDATES_SWE as CandidateSpec[], defaultDomain: "swe" },
    { spec: DEMO_CAMPAIGN_SALES as CampaignSpec, candidates: DEMO_CANDIDATES_SALES as CandidateSpec[], defaultDomain: "sales" },
    { spec: DEMO_CAMPAIGN_SDR as CampaignSpec, candidates: DEMO_CANDIDATES_SDR as CandidateSpec[], defaultDomain: "sdr" },
  ];

  const createdByName: Record<string, string> = {};
  const allActivityRows: { campaignId: string; campaignName: string; cand: CandidateSpec }[] = [];

  for (const { spec, candidates, defaultDomain } of campaigns) {
    const campaign = await prisma.campaign.create({
      data: {
        name: spec.name,
        status: spec.status,
        sourcingSpec: spec.sourcingSpec,
        irpPrompt: spec.irpPrompt,
        threshold: spec.threshold,
        channels: spec.channels,
        cadenceTemplate: spec.cadenceTemplate,
      },
    });
    console.log(`✓ Campaign: ${campaign.name}`);

    for (const c of candidates) {
      const scoreReasoning =
        c.score && c.score >= 80
          ? DEMO_SCORE_REASONING.high
          : c.score && c.score >= 70
          ? DEMO_SCORE_REASONING.mid
          : c.status === "disqualified"
          ? DEMO_SCORE_REASONING.low
          : null;

      const enriched = enrichmentForDomain(defaultDomain, c);

      const candidate = await prisma.candidate.create({
        data: {
          externalId: `demo-${c.phone}`,
          name: c.name,
          email: c.email,
          phone: c.phone,
          title: c.title,
          location: c.location,
          source: c.source,
          status: c.status,
          score: c.score,
          scoreReasoning,
          identityVerified: ["qualified", "personalized", "sent", "replied", "booked"].includes(c.status),
          credentialsVerified: ["qualified", "personalized", "sent", "replied", "booked"].includes(c.status),
          enrichedData: enriched as Prisma.InputJsonValue,
          deepResearch: deepResearchForDomain(defaultDomain, c),
          personalizationTokens:
            ["personalized", "sent", "replied", "booked"].includes(c.status)
              ? (personalizationForDomain(defaultDomain, c) as Prisma.InputJsonValue)
              : Prisma.JsonNull,
          campaignId: campaign.id,
          recruiterId: "demo-recruiter-1",
          dynamicsSyncedAt:
            ["sent", "replied", "booked"].includes(c.status) ? new Date() : null,
          dynamicsContactId:
            ["sent", "replied", "booked"].includes(c.status)
              ? `crm-${Math.random().toString(36).slice(2, 10).toUpperCase()}`
              : null,
        },
      });
      createdByName[c.name] = candidate.id;
      allActivityRows.push({ campaignId: campaign.id, campaignName: campaign.name, cand: c });
    }
  }

  console.log(`✓ ${Object.keys(createdByName).length} candidates created across ${campaigns.length} campaigns`);

  // Combine all message threads, find their campaign by candidate
  const allThreads = [...DEMO_MESSAGES, ...DEMO_MESSAGES_EXTRA];
  for (const thread of allThreads) {
    const candidateId = createdByName[thread.candidateName];
    if (!candidateId) continue;

    const cand = await prisma.candidate.findUnique({ where: { id: candidateId } });
    if (!cand) continue;

    const baseTime = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);
    for (let i = 0; i < thread.messages.length; i++) {
      const msg = thread.messages[i];
      await prisma.message.create({
        data: {
          candidateId,
          campaignId: cand.campaignId,
          channel: msg.channel,
          direction: msg.direction,
          body: msg.body,
          externalId: `demo-msg-${Math.random().toString(36).slice(2, 10)}`,
          touchNumber: msg.direction === "outbound" ? 1 : undefined,
          sentAt: new Date(baseTime.getTime() + i * 6 * 60 * 60 * 1000),
        },
      });
    }
  }
  console.log(`✓ ${allThreads.length} message threads created`);

  // Activity events — newest first, spread across all campaigns
  let offset = 0;
  const sequence: { type: string; statuses: string[]; detail: (c: CandidateSpec) => string | null }[] = [
    { type: "sourced", statuses: ["sourced"], detail: () => null },
    { type: "enriched", statuses: ["enriched"], detail: () => "Apollo + identity match complete" },
    {
      type: "qualified",
      statuses: ["qualified", "personalized", "sent", "replied", "booked"],
      detail: (c) => (c.score != null ? `Score: ${c.score}/100 — passed threshold` : null),
    },
    {
      type: "sent",
      statuses: ["sent", "replied", "booked"],
      detail: (c) => `Touch 1 via ${c.source === "linkedin" ? "SMS" : "email"}`,
    },
    {
      type: "replied",
      statuses: ["replied", "booked"],
      detail: () => "Candidate responded — flagged for follow-up",
    },
    {
      type: "booked",
      statuses: ["booked"],
      detail: () => "Interview booked for Thursday 2pm",
    },
  ];

  for (const { type, statuses, detail } of sequence) {
    for (const row of allActivityRows.filter((r) => statuses.includes(r.cand.status))) {
      await prisma.activityEvent.create({
        data: {
          campaignId: row.campaignId,
          candidateId: createdByName[row.cand.name],
          candidateName: row.cand.name,
          type,
          detail: detail(row.cand) ?? undefined,
          ts: new Date(Date.now() - (offset += 4) * 60 * 1000),
        },
      });
    }
  }

  // System sync events for each campaign
  for (const { spec } of campaigns) {
    const campaign = await prisma.campaign.findFirst({ where: { name: spec.name } });
    if (!campaign) continue;
    await prisma.activityEvent.create({
      data: {
        campaignId: campaign.id,
        candidateName: "System",
        type: "synced",
        detail: `Synced to Dynamics CRM`,
        ts: new Date(Date.now() - (offset += 4) * 60 * 1000),
      },
    });
  }

  console.log("✓ Activity events created");
  console.log("Demo seed complete.");
}

function enrichmentForDomain(domain: string, c: CandidateSpec) {
  if (domain === "icu" || domain === "travel") {
    return {
      company: c.title.split("–")[0].trim(),
      yearsExperience: c.score ? Math.round((c.score - 50) / 6) + 2 : 1,
      education: "BSN, University of Texas",
      certifications:
        c.score && c.score >= 85 ? ["RN", "CCRN", "BLS", "ACLS"] : ["RN", "BLS", "ACLS"],
      previousRoles: [`${c.title} at Baylor Scott & White`, "Staff RN at Texas Health Resources"],
    };
  }
  if (domain === "swe") {
    return {
      company: ["Datadog", "Stripe", "Snowflake", "Cockroach Labs", "MongoDB"][Math.floor(Math.random() * 5)],
      yearsExperience: c.score ? Math.round((c.score - 50) / 5) + 3 : 2,
      education: "BS Computer Science, UT Austin",
      certifications: ["AWS Solutions Architect", "Kubernetes CKA"],
      previousRoles: [`Senior Engineer at ${["Indeed", "Bumble", "RetailMeNot"][Math.floor(Math.random() * 3)]}`, "Software Engineer at Dell EMC"],
    };
  }
  if (domain === "sales" || domain === "sdr") {
    return {
      company: ["MongoDB", "Snowflake", "DataDog", "HubSpot", "Salesforce"][Math.floor(Math.random() * 5)],
      yearsExperience: c.score ? Math.round((c.score - 50) / 6) + 2 : 1,
      education: "BBA, Indiana University Kelley School",
      certifications: ["MEDDIC Certified", "Sandler Trained"],
      previousRoles: [`Account Executive at Outreach.io`, "Senior SDR at Drift"],
    };
  }
  return {};
}

function deepResearchForDomain(domain: string, c: CandidateSpec): string {
  const first = c.name.split(" ")[0];
  if (domain === "icu" || domain === "travel") {
    return `${c.name} is a credentialed ${c.title} based in ${c.location}. Consistent tenure across major regional health systems with no public red flags. License status confirmed active. Multiple peer endorsements in critical care competencies.`;
  }
  if (domain === "swe") {
    return `${first} maintains an active GitHub with notable contributions to open-source distributed-systems projects. Authored two well-received talks at GoCon and PostgresConf. Strong public reputation; tenure-stable across last three roles.`;
  }
  if (domain === "sales") {
    return `${first}'s LinkedIn shows consistent quota over-attainment (President's Club 2023, Top 10% 2024). Strong endorsements from CROs at MongoDB and Snowflake. Active in NYC enterprise SaaS community.`;
  }
  if (domain === "sdr") {
    return `${first} has a strong outbound dial discipline per LinkedIn manager endorsements. Active in the Atlanta SaaS community and a regular at SDR meetups. Consistent quota performance.`;
  }
  return `${c.name} — profile reviewed.`;
}

function personalizationForDomain(domain: string, c: CandidateSpec) {
  const first = c.name.split(" ")[0];
  if (domain === "icu") {
    return {
      firstName: first,
      currentRole: c.title,
      specificCompliment: `Your ${Math.floor((c.score ?? 75) / 10) + 3} years in critical care is exactly the calibre we're placing`,
      relevantAchievement: "Rapid response leadership recognition",
      openingHook: `${first}, ICU nurses with your background are the hardest to find in DFW right now.`,
    };
  }
  if (domain === "travel") {
    return {
      firstName: first,
      currentRole: c.title,
      specificCompliment: `Compact-license travel RNs with your tenure are who hospitals fight over`,
      relevantAchievement: "Multiple completed 13-week assignments without extension fatigue",
      openingHook: `${first}, this PNW assignment is one of the better-paying acute roles we've seen this quarter.`,
    };
  }
  if (domain === "swe") {
    return {
      firstName: first,
      currentRole: c.title,
      specificCompliment: `Your distributed-systems work — particularly the consensus algorithm thread on your blog — stood out`,
      relevantAchievement: "Conference speaker on Go runtime internals",
      openingHook: `${first}, the platform team is small and the autonomy is real — exactly the kind of problem you've written about.`,
    };
  }
  if (domain === "sales") {
    return {
      firstName: first,
      currentRole: c.title,
      specificCompliment: `Top quartile last year + Magic Quadrant deal closes is the profile we're hiring`,
      relevantAchievement: "President's Club 2023",
      openingHook: `${first}, this is a $1.2M Northeast strategic territory with room to push past $1.6M with the accelerator.`,
    };
  }
  if (domain === "sdr") {
    return {
      firstName: first,
      currentRole: c.title,
      specificCompliment: `Your activity-to-meeting conversion is well above the team average`,
      relevantAchievement: "Quota attainment 105% last quarter",
      openingHook: `${first}, this is a path-to-AE SDR role with a clear 12-month progression plan.`,
    };
  }
  return {};
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
