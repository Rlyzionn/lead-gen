import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { AiService } from "../ai/ai.service";
import { AgentOrchestrator } from "../agents/agent-orchestrator.service";
import { DynamicsService } from "../integrations/dynamics/dynamics.service";
import { CreateCampaignDto } from "./dto/create-campaign.dto";
import { ParseTranscriptDto } from "./dto/parse-transcript.dto";

@Injectable()
export class CampaignsService {
  constructor(
    private prisma: PrismaService,
    private ai: AiService,
    private orchestrator: AgentOrchestrator,
    private dynamics: DynamicsService
  ) {}

  async findAll() {
    const campaigns = await this.prisma.campaign.findMany({
      orderBy: { createdAt: "desc" },
    });
    // For each campaign, aggregate candidate counts by status so the UI
    // can show real Sourced / Qualified / Sent / Replied numbers.
    return Promise.all(
      campaigns.map(async (c) => {
        const grouped = await this.prisma.candidate.groupBy({
          by: ["status"],
          where: { campaignId: c.id },
          _count: { id: true },
        });
        const counts = Object.fromEntries(
          grouped.map((g) => [g.status, g._count.id])
        );
        const beyond = (s: string[]) =>
          s.reduce((acc, k) => acc + (counts[k] ?? 0), 0);
        // Each downstream stage implies the candidate passed through earlier ones,
        // so totals reflect cumulative pipeline movement.
        return {
          ...c,
          stats: {
            sourced:
              (counts.sourced ?? 0) +
              beyond([
                "enriched",
                "qualified",
                "disqualified",
                "personalized",
                "sent",
                "replied",
                "booked",
              ]),
            qualified:
              (counts.qualified ?? 0) +
              beyond(["personalized", "sent", "replied", "booked"]),
            sent:
              (counts.sent ?? 0) + beyond(["replied", "booked"]),
            replied: (counts.replied ?? 0) + (counts.booked ?? 0),
            booked: counts.booked ?? 0,
            disqualified: counts.disqualified ?? 0,
          },
        };
      })
    );
  }

  findOne(id: string) {
    return this.prisma.campaign.findUniqueOrThrow({ where: { id } });
  }

  async create(dto: CreateCampaignDto) {
    const campaign = await this.prisma.campaign.create({
      data: {
        name: dto.name,
        irpPrompt: dto.irpPrompt,
        threshold: dto.threshold ?? 70,
        channels: dto.channels ?? ["sms", "email"],
        cadenceTemplate: dto.cadenceTemplate,
        conditionalLogicDsl: dto.conditionalLogicDsl,
        sourcingSpec: dto.sourcingSpec,
        status: "active",
      },
    });
    // Fire-and-forget so the API response doesn't wait on the queue
    this.orchestrator.startSourcing(campaign.id).catch((e) => {
      console.error("startSourcing failed:", e);
    });
    return campaign;
  }

  async update(
    id: string,
    dto: Partial<{
      name: string;
      sourcingSpec: string;
      irpPrompt: string;
      threshold: number;
      channels: string[];
      cadenceTemplate: string;
      conditionalLogicDsl: string;
      status: string;
    }>,
  ) {
    return this.prisma.campaign.update({
      where: { id },
      data: dto,
    });
  }

  async remove(id: string) {
    // Cascade-delete dependents first to satisfy FK constraints
    await this.prisma.message.deleteMany({ where: { campaignId: id } });
    await this.prisma.activityEvent.deleteMany({ where: { campaignId: id } });
    await this.prisma.candidate.deleteMany({ where: { campaignId: id } });
    await this.prisma.campaign.delete({ where: { id } });
    return { deleted: true, id };
  }

  async parseTranscript(dto: ParseTranscriptDto) {
    return this.ai.parseTranscript(dto.text ?? "", dto.mode);
  }

  async pause(id: string) {
    return this.prisma.campaign.update({ where: { id }, data: { status: "paused" } });
  }

  async resume(id: string) {
    return this.prisma.campaign.update({ where: { id }, data: { status: "active" } });
  }

  async forceDynamicsSync(id: string) {
    const candidates = await this.prisma.candidate.findMany({
      where: { campaignId: id },
    });
    await Promise.allSettled(
      candidates.map((c) =>
        this.dynamics.syncEvent(c.id, "force_sync", { campaignId: id })
      )
    );
    return { queued: true, count: candidates.length };
  }

  async getCandidates(id: string) {
    return this.prisma.candidate.findMany({
      where: { campaignId: id },
      orderBy: { score: "desc" },
    });
  }
}
