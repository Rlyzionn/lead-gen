import { Processor, Process } from "@nestjs/bull";
import { Job } from "bull";
import { Injectable, Logger } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { AiService } from "../ai/ai.service";
import { AgentOrchestrator } from "./agent-orchestrator.service";
import { ActivityService } from "../activity/activity.service";

@Processor("qualification")
@Injectable()
export class QualificationAgent {
  private readonly log = new Logger(QualificationAgent.name);

  constructor(
    private prisma: PrismaService,
    private ai: AiService,
    private orchestrator: AgentOrchestrator,
    private activity: ActivityService
  ) {}

  @Process("qualify")
  async handleQualify(job: Job<{ candidateId: string }>) {
    const { candidateId } = job.data;
    const candidate = await this.prisma.candidate.findUniqueOrThrow({
      where: { id: candidateId },
      include: { campaign: true },
    });

    const campaign = candidate.campaign;

    // Score against IRP — pass/fail runs BEFORE scoring (per plan)
    const { passes, score, reasoning } = await this.ai.scoreCandidate(
      candidate,
      campaign.irpPrompt ?? "",
      campaign.threshold ?? 70,
      campaign.pastPlacementEmbeddings as any
    );

    await this.prisma.candidate.update({
      where: { id: candidateId },
      data: {
        score,
        scoreReasoning: reasoning,
        status: passes ? "qualified" : "disqualified",
      },
    });

    if (passes) {
      await this.activity.emit(campaign.id, "qualified", candidateId, candidate.name);
      await this.orchestrator.enqueuePersonalization(candidateId);
    }
  }
}
