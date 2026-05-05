import { Injectable, Logger } from "@nestjs/common";
import axios from "axios";
import { DEMO_CANDIDATES } from "../../demo/mock-data";

interface RawCandidate {
  id: string;
  name: string;
  source: "linkedin" | "indeed";
  [key: string]: unknown;
}

const DEMO = process.env.DEMO_MODE === "true";

@Injectable()
export class ApifyService {
  private readonly log = new Logger(ApifyService.name);
  private readonly base = "https://api.apify.com/v2";

  async scrapeLinkedIn(jobSpec: string): Promise<RawCandidate[]> {
    if (DEMO) {
      this.log.log("[DEMO] LinkedIn scrape returning mock candidates");
      await new Promise((r) => setTimeout(r, 800)); // realistic delay
      return DEMO_CANDIDATES.filter((c) => c.source === "linkedin").map((c) => ({
        id: `li-${c.phone}`,
        name: c.name,
        source: "linkedin" as const,
        title: c.title,
        location: c.location,
        email: c.email,
        phone: c.phone,
      }));
    }
    return this.runActor("apify/linkedin-scraper", { jobSpec, maxResults: 100 }, "linkedin");
  }

  async scrapeIndeed(jobSpec: string): Promise<RawCandidate[]> {
    if (DEMO) {
      this.log.log("[DEMO] Indeed scrape returning mock candidates");
      await new Promise((r) => setTimeout(r, 600));
      return DEMO_CANDIDATES.filter((c) => c.source === "indeed").map((c) => ({
        id: `in-${c.phone}`,
        name: c.name,
        source: "indeed" as const,
        title: c.title,
        location: c.location,
        email: c.email,
        phone: c.phone,
      }));
    }
    return this.runActor("apify/indeed-scraper", { jobSpec, maxResults: 100 }, "indeed");
  }

  private async runActor(
    actorId: string,
    input: Record<string, unknown>,
    source: "linkedin" | "indeed"
  ): Promise<RawCandidate[]> {
    const run = await axios.post(
      `${this.base}/acts/${actorId}/runs?token=${process.env.APIFY_TOKEN}`,
      input
    );
    const runId = run.data.data.id;
    await this.waitForRun(runId);
    const dataset = await axios.get(
      `${this.base}/actor-runs/${runId}/dataset/items?token=${process.env.APIFY_TOKEN}`
    );
    return (dataset.data as any[]).map((item: any) => ({
      ...item,
      id: item.profileUrl ?? item.id,
      source,
    }));
  }

  private async waitForRun(runId: string, maxWaitMs = 120_000): Promise<void> {
    const start = Date.now();
    while (Date.now() - start < maxWaitMs) {
      await new Promise((r) => setTimeout(r, 3_000));
      const status = await axios.get(
        `${this.base}/actor-runs/${runId}?token=${process.env.APIFY_TOKEN}`
      );
      if (status.data.data.status === "SUCCEEDED") return;
      if (status.data.data.status === "FAILED") throw new Error(`Apify run ${runId} failed`);
    }
    throw new Error(`Apify run ${runId} timed out`);
  }
}
