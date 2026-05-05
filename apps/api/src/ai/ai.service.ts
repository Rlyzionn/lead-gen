import { Injectable, Logger } from "@nestjs/common";
import OpenAI from "openai";
import { DEMO_SCORE_REASONING } from "../demo/mock-data";

const DEMO = process.env.DEMO_MODE === "true";

@Injectable()
export class AiService {
  private readonly log = new Logger(AiService.name);
  private readonly openai = DEMO
    ? null
    : new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  async parseTranscript(text: string, mode: string) {
    if (DEMO) {
      this.log.log("[DEMO] parseTranscript returning mock brief");
      return {
        role: "ICU Registered Nurse",
        mustHaveCredentials: ["Active Texas RN license", "BSN degree", "3+ years ICU experience"],
        niceToHaves: ["CCRN certification", "Travel nurse experience", "ACLS/BLS"],
        location: "Dallas–Fort Worth, TX",
        compensation: "$48–56/hr + sign-on bonus",
        seniority: "Mid-level (3–8 years)",
        disqualifiers: ["No ICU experience", "Expired RN license", "No BSN"],
        irpPrompt: `Score 0-100 based on: Active TX RN license (required), 3+ years ICU/critical care, BSN required, CCRN preferred, DFW location preferred, stable work history.`,
        threshold: 70,
      };
    }
    const completion = await this.openai!.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are a recruiting campaign parser. Extract a structured campaign brief from the following ${mode}.
Return JSON with: role, mustHaveCredentials (array), niceToHaves (array), location, compensation, seniority, disqualifiers (array), irpPrompt (string), threshold (number 0-100).`,
        },
        { role: "user", content: text },
      ],
      response_format: { type: "json_object" },
    });
    return JSON.parse(completion.choices[0].message.content ?? "{}");
  }

  async deepResearch(candidateName: string, roleSpec: string): Promise<string> {
    if (DEMO) {
      return `${candidateName} is a credentialed RN currently based in the Dallas–Fort Worth metro. LinkedIn profile shows consistent tenure in critical care settings. License status confirmed active through Texas BON. Peer endorsements in ACLS, hemodynamic monitoring, and rapid response.`;
    }
    const completion = await this.openai!.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: "Summarise what you know about this candidate based on their name and context." },
        { role: "user", content: `Candidate: ${candidateName}\nRole context: ${roleSpec}` },
      ],
    });
    return completion.choices[0].message.content ?? "";
  }

  async verifyIdentity(profileA: object, profileB: object) {
    if (DEMO) return { match: true, confidence: 0.92, notes: "[DEMO] Identity verified across LinkedIn and Apollo" };
    const completion = await this.openai!.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: "Compare these two candidate profiles and return JSON with: match (boolean), confidence (0-1), notes (string)." },
        { role: "user", content: JSON.stringify({ profileA, profileB }) },
      ],
      response_format: { type: "json_object" },
    });
    return JSON.parse(completion.choices[0].message.content ?? "{}");
  }

  async verifyCredentials(profile: object, roleSpec: string) {
    if (DEMO) return { verified: true, details: "[DEMO] Active RN license confirmed via Texas BON. BSN verified. CCRN certification on file.", flagsForReview: [] };
    const completion = await this.openai!.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: `Verify credentials for this candidate given the role requirements. Return JSON: verified (boolean), details (string), flagsForReview (array of strings).` },
        { role: "user", content: JSON.stringify({ profile, roleSpec }) },
      ],
      response_format: { type: "json_object" },
    });
    return JSON.parse(completion.choices[0].message.content ?? "{}");
  }

  async scoreCandidate(candidate: any, irpPrompt: string, threshold: number, pastPlacementEmbeddings: any) {
    if (DEMO) {
      // Generate a deterministic-ish score from the candidate's name length (for variety)
      const base = ((candidate.name?.length ?? 10) * 7 + 42) % 35 + 60;
      const score = Math.min(99, Math.max(55, base));
      const passes = score >= threshold;
      const reasoning = passes
        ? score >= 80
          ? DEMO_SCORE_REASONING.high
          : DEMO_SCORE_REASONING.mid
        : DEMO_SCORE_REASONING.low;
      return { score, reasoning, passes };
    }
    const pastExamples = pastPlacementEmbeddings ? "Use the past successful placement examples as few-shot context." : "";
    const completion = await this.openai!.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: `${irpPrompt}\n\n${pastExamples}\n\nReturn JSON: score (0-100), reasoning (string).` },
        { role: "user", content: JSON.stringify({ profile: candidate.rawData, enriched: candidate.enrichedData, deepResearch: candidate.deepResearch }) },
      ],
      response_format: { type: "json_object" },
    });
    const result = JSON.parse(completion.choices[0].message.content ?? "{}");
    return { score: result.score as number, reasoning: result.reasoning as string, passes: (result.score as number) >= threshold };
  }

  async generatePersonalizationTokens(candidate: any): Promise<Record<string, string>> {
    if (DEMO) {
      const first = candidate.name?.split(" ")[0] ?? "there";
      return {
        firstName: first,
        currentRole: candidate.title ?? "Registered Nurse",
        specificCompliment: `Your ICU background at Baylor is exactly what we're placing right now`,
        relevantAchievement: "Recognised for rapid response leadership",
        openingHook: `${first}, critical care RNs with your background are the hardest to find in DFW right now.`,
      };
    }
    const completion = await this.openai!.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: "Generate personalisation tokens for outreach messages. Return JSON with string keys and string values: firstName, currentRole, specificCompliment, relevantAchievement, openingHook." },
        { role: "user", content: JSON.stringify({ enriched: candidate.enrichedData, research: candidate.deepResearch }) },
      ],
      response_format: { type: "json_object" },
    });
    return JSON.parse(completion.choices[0].message.content ?? "{}");
  }

  async draftReply(
    threadHistory: any[],
    campaignContext: string,
    tonePrompt?: string,
    creativity?: number,
  ): Promise<string> {
    if (DEMO) {
      const lastInbound = [...threadHistory].reverse().find((m) => m.direction === "inbound");
      if (!lastInbound) return "Hi! Thanks for reaching out — would love to connect this week. What times work for you?";
      const body = lastInbound.body?.toLowerCase() ?? "";
      if (body.includes("salary") || body.includes("pay") || body.includes("base")) {
        return "Great question! The base is $51–56/hr depending on experience, plus an $8k sign-on bonus and full benefits from day one. Want me to send the full compensation breakdown?";
      }
      if (body.includes("thursday") || body.includes("friday") || body.includes("time")) {
        return "Perfect — I'll send a calendar link now. Looking forward to speaking with you!";
      }
      return "Thanks for getting back to me! I'll share the full job description and would love to schedule a quick 10-minute call. Does tomorrow afternoon work?";
    }
    const systemContent = [
      `You are a recruiting assistant. Draft a reply to continue this conversation.`,
      `Campaign context: ${campaignContext}`,
      tonePrompt ? `Tone preferences: ${tonePrompt}` : "",
      `Return only the message body.`,
    ]
      .filter(Boolean)
      .join("\n");
    const completion = await this.openai!.chat.completions.create({
      model: "gpt-4o",
      temperature: creativity ?? 0.7,
      messages: [
        { role: "system", content: systemContent },
        ...threadHistory.map((m) => ({ role: m.direction === "outbound" ? "assistant" : "user", content: m.body } as any)),
      ],
    });
    return completion.choices[0].message.content ?? "";
  }
}
