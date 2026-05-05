import { Injectable } from "@nestjs/common";
import OpenAI from "openai";
import { PrismaService } from "../prisma/prisma.service";

const DEMO = process.env.DEMO_MODE === "true";

const DEMO_RESPONSES: Record<string, { content: string; action: null | { type: string; params: Record<string, unknown> } }> = {
  default: {
    content: "You have **12 qualified candidates** across your active campaign. Top performer: Sarah Mitchell (score 94). Would you like me to start outreach or pull a detailed breakdown?",
    action: null,
  },
  score: {
    content: "Your highest-scoring candidates right now are **Sarah Mitchell (94)**, **James Okafor (88)**, and **Priya Nair (85)**. All three have active TX RN licenses and ICU experience. Ready to prioritise outreach?",
    action: null,
  },
  metrics: {
    content: "**Campaign metrics:** 48 emails sent, 72% open rate, 31% reply rate. 6 candidates have requested booking links. SMS reply rate is at 44% — above industry average.",
    action: null,
  },
  pause: {
    content: "I'll pause the Senior RN – Dallas ICU Network campaign — this will stop all outreach immediately. Confirm?",
    action: { type: "pause_campaign", params: { campaignId: "demo-campaign-001" } },
  },
  sync: {
    content: "I'll force a Dynamics CRM sync for all qualified candidates. This will push the latest scores and status updates. Confirm?",
    action: { type: "force_dynamics_sync", params: { campaignId: "demo-campaign-001" } },
  },
};

function getDemoResponse(message: string) {
  const lower = message.toLowerCase();
  if (lower.includes("score") || lower.includes("top") || lower.includes("best")) return DEMO_RESPONSES.score;
  if (lower.includes("metric") || lower.includes("open") || lower.includes("reply") || lower.includes("rate")) return DEMO_RESPONSES.metrics;
  if (lower.includes("pause") || lower.includes("stop")) return DEMO_RESPONSES.pause;
  if (lower.includes("sync") || lower.includes("dynamics") || lower.includes("crm")) return DEMO_RESPONSES.sync;
  return DEMO_RESPONSES.default;
}

const TOOLS: OpenAI.ChatCompletionTool[] = [
  {
    type: "function",
    function: {
      name: "query_candidates",
      description: "Query candidates with filters",
      parameters: {
        type: "object",
        properties: {
          campaignId: { type: "string" },
          status: { type: "string" },
          minScore: { type: "number" },
          location: { type: "string" },
          limit: { type: "number" },
        },
      },
    },
  },
  {
    type: "function",
    function: {
      name: "get_campaign_metrics",
      description: "Get message delivery and reply metrics for a campaign",
      parameters: {
        type: "object",
        properties: { campaignId: { type: "string" } },
        required: ["campaignId"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "pause_campaign",
      description: "Pause all outreach for a campaign",
      parameters: {
        type: "object",
        properties: { campaignId: { type: "string" } },
        required: ["campaignId"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "force_dynamics_sync",
      description: "Force Dynamics CRM sync for a campaign or candidate",
      parameters: {
        type: "object",
        properties: {
          campaignId: { type: "string" },
          candidateId: { type: "string" },
        },
      },
    },
  },
  {
    type: "function",
    function: {
      name: "create_campaign",
      description: "Create a new campaign from a natural language description",
      parameters: {
        type: "object",
        properties: { description: { type: "string" } },
        required: ["description"],
      },
    },
  },
];

@Injectable()
export class CommandCenterService {
  private readonly openai = DEMO ? null : new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  constructor(private prisma: PrismaService) {}

  async chat(userId: string, message: string) {
    if (DEMO) {
      return getDemoResponse(message);
    }

    // Load cross-session memory for this user
    const memory = await this.prisma.commandMemory.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 20,
    });
    const memoryContext = memory.map((m) => m.content).join("\n");

    const response = await this.openai!.chat.completions.create({
      model: "gpt-4o",
      tools: TOOLS,
      messages: [
        {
          role: "system",
          content: `You are an AI command assistant for a recruiting platform.
You can query candidates, metrics, and campaigns — and take actions like pausing campaigns or syncing CRM.
Always confirm before taking destructive actions.
User context:\n${memoryContext}`,
        },
        { role: "user", content: message },
      ],
    });

    const msg = response.choices[0].message;

    // Persist to cross-session memory
    await this.prisma.commandMemory.create({
      data: { userId, content: `User: ${message}\nAssistant: ${msg.content ?? "(tool call)"}` },
    });

    if (msg.tool_calls?.length) {
      const call = msg.tool_calls[0];
      return {
        content: `I'll ${call.function.name.replace(/_/g, " ")} — confirm?`,
        action: { type: call.function.name, params: JSON.parse(call.function.arguments) },
      };
    }

    return { content: msg.content, action: null };
  }

  async executeAction(userId: string, type: string, params: Record<string, unknown>) {
    switch (type) {
      case "pause_campaign":
        return this.prisma.campaign.update({
          where: { id: params.campaignId as string },
          data: { status: "paused" },
        });
      case "force_dynamics_sync":
        return { queued: true };
      default:
        return { error: "Unknown action" };
    }
  }
}
