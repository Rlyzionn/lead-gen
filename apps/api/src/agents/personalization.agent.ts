import { Processor, Process } from "@nestjs/bull";
import { Job } from "bull";
import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { AiService } from "../ai/ai.service";
import { AgentOrchestrator } from "./agent-orchestrator.service";

@Processor("personalization")
@Injectable()
export class PersonalizationAgent {
  constructor(
    private prisma: PrismaService,
    private ai: AiService,
    private orchestrator: AgentOrchestrator
  ) {}

  @Process("personalize")
  async handlePersonalize(job: Job<{ candidateId: string }>) {
    const { candidateId } = job.data;
    const candidate = await this.prisma.candidate.findUniqueOrThrow({
      where: { id: candidateId },
      include: { campaign: true },
    });

    // Generate personalization tokens from enrichment + deep research
    const tokens = await this.ai.generatePersonalizationTokens(candidate);

    await this.prisma.candidate.update({
      where: { id: candidateId },
      data: { personalizationTokens: tokens, status: "personalized" },
    });

    // Kick off first outreach touch for all configured channels
    for (const channel of candidate.campaign.channels as string[]) {
      await this.orchestrator.enqueueOutreach(candidateId, channel);
    }
  }
}
