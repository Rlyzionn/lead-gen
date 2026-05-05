import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class MetricsService {
  constructor(private prisma: PrismaService) {}

  async getDashboardMetrics(campaignId?: string) {
    const where = campaignId ? { campaignId } : {};

    const [sourced, enriched, qualified, sent, replied, booked, synced] =
      await Promise.all([
        this.prisma.candidate.count({ where: { ...where, status: "sourced" } }),
        this.prisma.candidate.count({ where: { ...where, status: "enriched" } }),
        this.prisma.candidate.count({ where: { ...where, status: "qualified" } }),
        this.prisma.candidate.count({ where: { ...where, status: "sent" } }),
        this.prisma.candidate.count({ where: { ...where, status: "replied" } }),
        this.prisma.candidate.count({ where: { ...where, status: "booked" } }),
        this.prisma.candidate.count({
          where: { ...where, dynamicsSyncedAt: { not: null } },
        }),
      ]);

    return [
      { label: "Sourced", value: sourced, href: "/candidates?status=sourced" },
      { label: "Enriched", value: enriched, href: "/candidates?status=enriched" },
      { label: "Qualified", value: qualified, href: "/candidates?status=qualified" },
      { label: "Sent", value: sent, href: "/candidates?status=sent" },
      { label: "Replied", value: replied, href: "/candidates?status=replied" },
      { label: "Booked", value: booked, href: "/candidates?status=booked" },
      { label: "In CRM", value: synced, href: "/candidates?status=synced" },
    ];
  }

  async getCampaignMetrics(campaignId: string) {
    const messages = await this.prisma.message.groupBy({
      by: ["channel", "direction"],
      where: { campaignId },
      _count: { id: true },
    });

    const candidates = await this.prisma.candidate.groupBy({
      by: ["status"],
      where: { campaignId },
      _count: { id: true },
    });

    return { messages, candidates };
  }

  async getAgentStats(campaignId?: string) {
    const where = campaignId ? { campaignId } : {};

    // Status flow: sourced → enriched → qualified|disqualified → personalized → sent → replied → booked
    const [
      sourced,
      enriched,
      qualified,
      disqualified,
      personalized,
      sent,
      replied,
      booked,
      total,
    ] = await Promise.all([
      this.prisma.candidate.count({ where: { ...where, status: "sourced" } }),
      this.prisma.candidate.count({ where: { ...where, status: "enriched" } }),
      this.prisma.candidate.count({ where: { ...where, status: "qualified" } }),
      this.prisma.candidate.count({ where: { ...where, status: "disqualified" } }),
      this.prisma.candidate.count({ where: { ...where, status: "personalized" } }),
      this.prisma.candidate.count({ where: { ...where, status: "sent" } }),
      this.prisma.candidate.count({ where: { ...where, status: "replied" } }),
      this.prisma.candidate.count({ where: { ...where, status: "booked" } }),
      this.prisma.candidate.count({ where }),
    ]);

    // Each downstream stage represents candidates that *passed through* the upstream agent.
    // A candidate at "sent" was sourced → enriched → qualified → personalized → sent.
    const beyondSourced = enriched + qualified + disqualified + personalized + sent + replied + booked;
    const beyondEnriched = qualified + disqualified + personalized + sent + replied + booked;
    const beyondQualified = personalized + sent + replied + booked;
    const beyondPersonalized = sent + replied + booked;
    const beyondSent = replied + booked;
    const beyondReplied = booked;

    const sourcedTotal = sourced + beyondSourced;
    const enrichedTotal = enriched + beyondEnriched;
    const qualifiedThroughput = qualified + beyondQualified; // qualified passes
    const screenedTotal = qualifiedThroughput + disqualified;
    const personalizedTotal = personalized + beyondPersonalized;
    const sentTotal = sent + beyondSent;
    const replyTotal = replied + beyondReplied;
    const callTotal = replyTotal; // calls fire after reply
    const bookedTotal = booked;

    const pct = (n: number, d: number) => (d === 0 ? 0 : Math.round((n / d) * 100));

    const agents = [
      {
        key: "sourcing",
        label: "Job Board Scraping",
        icon: "globe",
        accent: "blue",
        description: "Scraping LinkedIn and Indeed for candidates matching the campaign sourcing spec.",
        processed: sourcedTotal,
        total: Math.max(sourcedTotal, 1),
        successRate: pct(sourcedTotal, Math.max(total, sourcedTotal, 1)),
        throughputPerHour: 156,
        status: "running",
      },
      {
        key: "enrichment",
        label: "Waterfall Contact Enrichment",
        icon: "users",
        accent: "green",
        description: "Multi-source contact verification — Apollo, identity match, license check.",
        processed: enrichedTotal,
        total: Math.max(sourcedTotal, 1),
        successRate: pct(enrichedTotal, Math.max(sourcedTotal, 1)),
        throughputPerHour: 153,
        status: enrichedTotal > 0 ? "running" : "idle",
      },
      {
        key: "qualification",
        label: "AI Screening & Qualification",
        icon: "shield-check",
        accent: "purple",
        description: "License verification, IRP scoring, location proximity, pay range fit.",
        processed: screenedTotal,
        total: Math.max(enrichedTotal, 1),
        successRate: pct(qualifiedThroughput, Math.max(screenedTotal, 1)),
        throughputPerHour: 148,
        status: screenedTotal > 0 ? "running" : "idle",
      },
      {
        key: "personalization",
        label: "AI Personalization Engine",
        icon: "sparkles",
        accent: "pink",
        description: "Generates per-candidate tokens — opening hook, compliment, achievement reference.",
        processed: personalizedTotal,
        total: Math.max(qualifiedThroughput, 1),
        successRate: pct(personalizedTotal, Math.max(qualifiedThroughput, 1)),
        throughputPerHour: 132,
        status: personalizedTotal > 0 ? "running" : "idle",
      },
      {
        key: "outreach",
        label: "Personalized Email/SMS Sequence",
        icon: "mail",
        accent: "blue",
        description: "Multi-touch outreach via Twilio + Gmail with drip-pacing and number rotation.",
        processed: sentTotal,
        total: Math.max(personalizedTotal, 1),
        successRate: pct(sentTotal, Math.max(personalizedTotal, 1)),
        throughputPerHour: 105,
        status: sentTotal > 0 ? "running" : "idle",
      },
      {
        key: "calling",
        label: "AI Calling Agent",
        icon: "phone",
        accent: "yellow",
        description: "Recruiter call notifications with full context, talking points, and one-click dial.",
        processed: callTotal,
        total: Math.max(sentTotal, 1),
        successRate: pct(callTotal, Math.max(sentTotal, 1)),
        throughputPerHour: 10,
        status: callTotal > 0 ? "running" : "idle",
      },
      {
        key: "booking",
        label: "Calendar Booking",
        icon: "calendar",
        accent: "emerald",
        description: "Auto-schedules interviews via Calendly with personalized booking links and confirmations.",
        processed: bookedTotal,
        total: Math.max(callTotal, 1),
        successRate: pct(bookedTotal, Math.max(callTotal, 1)),
        throughputPerHour: 2,
        status: bookedTotal > 0 ? "running" : "idle",
      },
    ];

    const activeCount = agents.filter((a) => a.status === "running").length;
    return { agents, activeCount, totalCount: agents.length };
  }
}
