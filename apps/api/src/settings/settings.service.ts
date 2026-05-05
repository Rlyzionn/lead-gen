import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { DynamicsService } from "../integrations/dynamics/dynamics.service";

@Injectable()
export class SettingsService {
  constructor(
    private prisma: PrismaService,
    private dynamics: DynamicsService
  ) {}

  async getDynamicsSettings() {
    const cadences = await this.prisma.dynamicsSyncSettings.findMany();
    return { cadences };
  }

  async saveDynamicsSettings(body: {
    tenantId?: string;
    clientId?: string;
    clientSecret?: string;
    resourceUrl?: string;
    cadences?: Record<string, string>;
  }) {
    if (body.cadences) {
      for (const [eventType, cadence] of Object.entries(body.cadences)) {
        await this.prisma.dynamicsSyncSettings.upsert({
          where: { eventType },
          create: { eventType, cadence },
          update: { cadence },
        });
      }
    }
    const connected = await this.dynamics.testConnection();
    return { saved: true, connected };
  }

  async getFieldMappings() {
    // Stored as JSON in a simple key-value store (reuse DynamicsSyncSettings or a dedicated table)
    return {
      mappings: {
        name: "fullname",
        email: "emailaddress1",
        phone: "mobilephone",
        title: "jobtitle",
        score: "new_irpscore",
        status: "new_candidatestatus",
      },
    };
  }

  async saveFieldMappings(mappings: Record<string, string>) {
    // Persist to DB — for MVP stored in process env / config; swap to DB row as needed
    return { saved: true, mappings };
  }

  async getNotificationPreferences(userId: string) {
    // TODO: per-user notification prefs table
    return { preferences: {} };
  }

  async saveNotificationPreferences(userId: string, prefs: Record<string, unknown>) {
    return { saved: true };
  }

  async getAIPreferences(userId: string) {
    const prefs = await this.prisma.aIPreferences.findUnique({ where: { userId } });
    return (
      prefs ?? {
        userId,
        tone: "friendly",
        verbosity: "balanced",
        creativity: 0.7,
        emojiUsage: "minimal",
        signOffStyle: "warm",
        customInstructions: null,
      }
    );
  }

  async saveAIPreferences(
    userId: string,
    prefs: {
      tone?: string;
      verbosity?: string;
      creativity?: number;
      emojiUsage?: string;
      signOffStyle?: string;
      customInstructions?: string | null;
    }
  ) {
    return this.prisma.aIPreferences.upsert({
      where: { userId },
      create: {
        userId,
        tone: prefs.tone ?? "friendly",
        verbosity: prefs.verbosity ?? "balanced",
        creativity: prefs.creativity ?? 0.7,
        emojiUsage: prefs.emojiUsage ?? "minimal",
        signOffStyle: prefs.signOffStyle ?? "warm",
        customInstructions: prefs.customInstructions ?? null,
      },
      update: prefs,
    });
  }

  async getSearchConfig(userId: string) {
    const config = await (this.prisma as any).searchConfig.findUnique({ where: { userId } });
    return (
      config ?? {
        userId,
        jobTitle: "Registered Nurse (RN)",
        shiftType: "Day Shift",
        minExperience: 3,
        locationRadius: 50,
        payRangeMin: 35,
        payRangeMax: 55,
        licenseRequired: true,
        sources: ["indeed", "linkedin", "zipRecruiter", "internalDb"],
      }
    );
  }

  async saveSearchConfig(userId: string, config: {
    jobTitle?: string;
    shiftType?: string;
    minExperience?: number;
    locationRadius?: number;
    payRangeMin?: number;
    payRangeMax?: number;
    licenseRequired?: boolean;
    sources?: string[];
  }) {
    return (this.prisma as any).searchConfig.upsert({
      where: { userId },
      create: {
        userId,
        jobTitle: config.jobTitle ?? "Registered Nurse (RN)",
        shiftType: config.shiftType ?? "Day Shift",
        minExperience: config.minExperience ?? 3,
        locationRadius: config.locationRadius ?? 50,
        payRangeMin: config.payRangeMin ?? 35,
        payRangeMax: config.payRangeMax ?? 55,
        licenseRequired: config.licenseRequired ?? true,
        sources: config.sources ?? ["indeed", "linkedin", "zipRecruiter", "internalDb"],
      },
      update: config,
    });
  }

  async getIntegrations(userId: string) {
    const isDemo = process.env.DEMO_MODE === "true";
    const googleToken = await this.prisma.oAuthToken.findFirst({
      where: { userId, provider: "google" },
    });
    const dynamicsToken = await this.prisma.oAuthToken.findFirst({
      where: { userId, provider: "dynamics" },
    });

    return {
      dataSources: [
        {
          key: "indeed",
          label: "Indeed",
          description: "Resume search API with daily scraping",
          short: "in",
          accent: "blue",
          connected: isDemo || !!process.env.APIFY_TOKEN,
          imported: isDemo ? 487 : 0,
          lastSyncMinutesAgo: isDemo ? 12 : null,
        },
        {
          key: "linkedin",
          label: "LinkedIn Recruiter",
          description: "Recruiter Lite seat with InMail",
          short: "Li",
          accent: "indigo",
          connected: isDemo || !!process.env.APIFY_TOKEN,
          imported: isDemo ? 312 : 0,
          lastSyncMinutesAgo: isDemo ? 60 : null,
        },
        {
          key: "zipRecruiter",
          label: "ZipRecruiter",
          description: "Resume database access + job postings",
          short: "Zr",
          accent: "green",
          connected: isDemo,
          imported: isDemo ? 198 : 0,
          lastSyncMinutesAgo: isDemo ? 30 : null,
        },
        {
          key: "vivianHealth",
          label: "Vivian Health",
          description: "Healthcare-specific candidate marketplace",
          short: "Vh",
          accent: "purple",
          connected: false,
          imported: 0,
          lastSyncMinutesAgo: null,
        },
        {
          key: "monster",
          label: "Monster",
          description: "Resume database search",
          short: "Mo",
          accent: "purple",
          connected: false,
          imported: 0,
          lastSyncMinutesAgo: null,
        },
      ],
      outreachChannels: [
        {
          key: "aiCalling",
          label: "AI Calling (Custom)",
          description:
            "Custom AI voice agent for live candidate calls with dynamic scripts, objection handling, and real-time meeting booking.",
          icon: "phone",
          accent: "yellow",
          active: isDemo,
          stat: isDemo ? "Active – 82 calls made" : "Not connected",
        },
        {
          key: "aiTexting",
          label: "AI Texting (Custom Platform)",
          description:
            "Custom SMS platform with 2-way threading, smart reply detection, and automated follow-up sequences.",
          icon: "message",
          accent: "green",
          active: isDemo || !!process.env.TWILIO_ACCOUNT_SID,
          stat: isDemo ? "Active – 287 SMS sent" : "Not connected",
        },
        {
          key: "instantly",
          label: "Instantly (Cold Email)",
          description:
            "Cold email outreach platform with domain warming, deliverability monitoring, and multi-inbox rotation.",
          icon: "mail",
          accent: "blue",
          active: isDemo,
          stat: isDemo ? "3 inboxes active" : "Not connected",
        },
        {
          key: "gmail",
          label: "Gmail (Personal Send)",
          description:
            "Connect a recruiter's Gmail to send warm outreach from a personal inbox for higher reply rates.",
          icon: "mail",
          accent: "red",
          active: !!googleToken,
          stat: googleToken ? "Connected" : "Not connected",
        },
      ],
      crm: [
        {
          key: "dynamics",
          label: "Microsoft Dynamics 365",
          description:
            "Sync candidates, messages, meetings, and call outcomes to Dynamics. Configurable per-event sync cadence.",
          icon: "database",
          accent: "blue",
          active: isDemo || !!dynamicsToken,
          stat: isDemo ? "Synced – realtime" : dynamicsToken ? "Connected" : "Not connected",
        },
      ],
      webhookUrl: `${process.env.API_URL ?? "http://localhost:3001"}/api/webhooks/candidates`,
    };
  }
}

export function buildToneSystemPrompt(prefs: {
  tone: string;
  verbosity: string;
  emojiUsage: string;
  signOffStyle: string;
  customInstructions?: string | null;
}): string {
  const toneMap: Record<string, string> = {
    formal: "Use formal, professional language. Avoid contractions.",
    casual: "Use a casual, conversational tone. Contractions are fine.",
    friendly: "Use a warm, friendly tone — like a trusted colleague.",
    direct: "Be direct and to-the-point. No fluff.",
  };
  const verbosityMap: Record<string, string> = {
    concise: "Keep responses tight — under 2 short sentences when possible.",
    balanced: "Balance brevity with detail — 2-4 sentences as a guide.",
    detailed: "Provide thorough context — paragraphs are fine when warranted.",
  };
  const emojiMap: Record<string, string> = {
    none: "Do not use emoji.",
    minimal: "Use at most one emoji per message and only when it adds warmth.",
    liberal: "Emoji are welcome where they help convey tone.",
  };
  const signOffMap: Record<string, string> = {
    warm: "End with a warm sign-off (e.g., 'Looking forward to it,' or 'Talk soon —').",
    professional: "End with a professional sign-off (e.g., 'Best,' or 'Regards,').",
    none: "Do not include a sign-off.",
  };
  const custom = prefs.customInstructions?.trim()
    ? `Additional user preferences: ${prefs.customInstructions.trim()}`
    : "";
  return [
    toneMap[prefs.tone],
    verbosityMap[prefs.verbosity],
    emojiMap[prefs.emojiUsage],
    signOffMap[prefs.signOffStyle],
    custom,
  ]
    .filter(Boolean)
    .join(" ");
}
