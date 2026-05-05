import { Processor, Process } from "@nestjs/bull";
import { Job } from "bull";
import { Injectable, Logger } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { Prisma } from "@prisma/client";
import { ApifyService } from "../integrations/apify/apify.service";
import { AgentOrchestrator } from "./agent-orchestrator.service";
import { ActivityService } from "../activity/activity.service";

@Processor("sourcing")
@Injectable()
export class SourcingAgent {
  private readonly log = new Logger(SourcingAgent.name);

  constructor(
    private prisma: PrismaService,
    private apify: ApifyService,
    private orchestrator: AgentOrchestrator,
    private activity: ActivityService
  ) {}

  @Process("scrape")
  async handleScrape(job: Job<{ campaignId: string }>) {
    const { campaignId } = job.data;
    const campaign = await this.prisma.campaign.findUniqueOrThrow({
      where: { id: campaignId },
    });

    this.log.log(`Sourcing started for campaign ${campaignId}`);

    const [linkedInResults, indeedResults] = await Promise.allSettled([
      this.apify.scrapeLinkedIn(campaign.sourcingSpec ?? ""),
      this.apify.scrapeIndeed(campaign.sourcingSpec ?? ""),
    ]);

    const allRaw = [
      ...(linkedInResults.status === "fulfilled" ? linkedInResults.value : []),
      ...(indeedResults.status === "fulfilled" ? indeedResults.value : []),
    ];

    for (const raw of allRaw) {
      const candidate = await this.prisma.candidate.upsert({
        where: { externalId: raw.id },
        create: {
          externalId: raw.id,
          name: raw.name,
          campaignId,
          source: raw.source,
          rawData: raw as Prisma.InputJsonValue,
          status: "sourced",
        },
        update: { rawData: raw as Prisma.InputJsonValue },
      });
      await this.activity.emit(campaignId, "sourced", candidate.id, candidate.name);
      await this.orchestrator.enqueueEnrichment(candidate.id);
    }
  }
}
