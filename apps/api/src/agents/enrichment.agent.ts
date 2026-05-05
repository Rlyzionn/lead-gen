import { Processor, Process } from "@nestjs/bull";
import { Job } from "bull";
import { Injectable, Logger } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { ApolloService } from "../integrations/apollo/apollo.service";
import { AiService } from "../ai/ai.service";
import { AgentOrchestrator } from "./agent-orchestrator.service";
import { ActivityService } from "../activity/activity.service";

@Processor("enrichment")
@Injectable()
export class EnrichmentAgent {
  private readonly log = new Logger(EnrichmentAgent.name);

  constructor(
    private prisma: PrismaService,
    private apollo: ApolloService,
    private ai: AiService,
    private orchestrator: AgentOrchestrator,
    private activity: ActivityService
  ) {}

  @Process("enrich")
  async handleEnrich(job: Job<{ candidateId: string }>) {
    const { candidateId } = job.data;
    const candidate = await this.prisma.candidate.findUniqueOrThrow({
      where: { id: candidateId },
      include: { campaign: true },
    });

    // Step 1: Apollo enrichment
    const apolloData = await this.apollo.enrich(candidate.name, candidate.email ?? "");

    // Step 2: Deep research via LLM + web search
    const deepResearch = await this.ai.deepResearch(candidate.name, candidate.campaign.sourcingSpec ?? "");

    // Step 3: Cross-platform identity verification
    const identityCheck = await this.ai.verifyIdentity(candidate.rawData as any, apolloData);

    // Step 4: Credential verification (role-specific)
    const credentialCheck = await this.ai.verifyCredentials(candidate.rawData as any, candidate.campaign.sourcingSpec ?? "");

    await this.prisma.candidate.update({
      where: { id: candidateId },
      data: {
        enrichedData: apolloData,
        deepResearch,
        identityVerified: identityCheck.confidence > 0.7,
        credentialsVerified: credentialCheck.verified,
        status: "enriched",
      },
    });

    await this.activity.emit(candidate.campaignId, "enriched", candidateId, candidate.name);
    await this.orchestrator.enqueueQualification(candidateId);
  }
}
