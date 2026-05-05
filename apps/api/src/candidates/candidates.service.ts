import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { AiService } from "../ai/ai.service";

interface FindAllFilters {
  status?: string;
  campaignId?: string;
}

@Injectable()
export class CandidatesService {
  constructor(
    private prisma: PrismaService,
    private ai: AiService,
  ) {}

  findAll({ status, campaignId }: FindAllFilters = {}) {
    return this.prisma.candidate.findMany({
      where: {
        ...(status ? { status } : {}),
        ...(campaignId ? { campaignId } : {}),
      },
      orderBy: { score: "desc" },
      include: { campaign: { select: { name: true } } },
    });
  }

  findOne(id: string) {
    return this.prisma.candidate.findUniqueOrThrow({
      where: { id },
      include: { campaign: { select: { name: true, threshold: true } } },
    });
  }

  getScore(id: string) {
    return this.prisma.candidate.findUniqueOrThrow({
      where: { id },
      select: { score: true, scoreReasoning: true },
    });
  }

  getMessages(id: string) {
    return this.prisma.message.findMany({
      where: { candidateId: id },
      orderBy: { sentAt: "asc" },
    });
  }

  async forceDynamicsSync(id: string) {
    await this.prisma.candidate.update({
      where: { id },
      data: { dynamicsSyncedAt: null },
    });
    return { queued: true, candidateId: id };
  }

  async regenerateScore(id: string) {
    const candidate = await this.prisma.candidate.findUniqueOrThrow({
      where: { id },
      include: { campaign: true },
    });
    const result = await this.ai.scoreCandidate(
      candidate,
      candidate.campaign.irpPrompt ?? "",
      candidate.campaign.threshold,
      candidate.campaign.pastPlacementEmbeddings,
    );
    return this.prisma.candidate.update({
      where: { id },
      data: {
        score: result.score,
        scoreReasoning: result.reasoning,
        status: result.passes ? "qualified" : "disqualified",
      },
    });
  }

  async regeneratePersonalization(id: string) {
    const candidate = await this.prisma.candidate.findUniqueOrThrow({ where: { id } });
    const tokens = await this.ai.generatePersonalizationTokens(candidate);
    return this.prisma.candidate.update({
      where: { id },
      data: { personalizationTokens: tokens as any },
    });
  }
}
