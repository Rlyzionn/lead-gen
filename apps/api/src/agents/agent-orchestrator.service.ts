import { Injectable, Logger } from "@nestjs/common";
import { InjectQueue } from "@nestjs/bull";
import { Queue } from "bull";

const DEMO = process.env.DEMO_MODE === "true";

@Injectable()
export class AgentOrchestrator {
  private readonly log = new Logger(AgentOrchestrator.name);

  constructor(
    @InjectQueue("sourcing") private sourcingQueue: Queue,
    @InjectQueue("enrichment") private enrichmentQueue: Queue,
    @InjectQueue("qualification") private qualificationQueue: Queue,
    @InjectQueue("personalization") private personalizationQueue: Queue,
    @InjectQueue("outreach") private outreachQueue: Queue
  ) {}

  async startSourcing(campaignId: string) {
    if (DEMO) return this.demoStub("startSourcing", { campaignId });
    return this.sourcingQueue.add("scrape", { campaignId }, { attempts: 3 });
  }

  async enqueueEnrichment(candidateId: string) {
    if (DEMO) return this.demoStub("enqueueEnrichment", { candidateId });
    return this.enrichmentQueue.add("enrich", { candidateId }, { attempts: 3 });
  }

  async enqueueQualification(candidateId: string) {
    if (DEMO) return this.demoStub("enqueueQualification", { candidateId });
    return this.qualificationQueue.add("qualify", { candidateId }, { attempts: 3 });
  }

  async enqueuePersonalization(candidateId: string) {
    if (DEMO) return this.demoStub("enqueuePersonalization", { candidateId });
    return this.personalizationQueue.add("personalize", { candidateId }, { attempts: 3 });
  }

  async enqueueOutreach(candidateId: string, channel: string) {
    if (DEMO) return this.demoStub("enqueueOutreach", { candidateId, channel });
    return this.outreachQueue.add(
      "send",
      { candidateId, channel },
      {
        delay: this.calculateSendDelay(channel),
        attempts: 3,
      },
    );
  }

  private calculateSendDelay(channel: string): number {
    // Drip-paced: space sends to stay below carrier thresholds
    return channel === "sms" ? 5_000 : 1_000;
  }

  private demoStub(method: string, payload: Record<string, unknown>) {
    this.log.log(`[DEMO] ${method} ${JSON.stringify(payload)} — skipping queue`);
    return { id: `demo-${Date.now()}`, queued: false };
  }
}
