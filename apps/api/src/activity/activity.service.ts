import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import Pusher from "pusher";

@Injectable()
export class ActivityService {
  private readonly pusher = new Pusher({
    appId: process.env.PUSHER_APP_ID ?? "",
    key: process.env.PUSHER_KEY ?? "",
    secret: process.env.PUSHER_SECRET ?? "",
    cluster: process.env.PUSHER_CLUSTER ?? "",
    useTLS: true,
  });

  constructor(private prisma: PrismaService) {}

  async emit(
    campaignId: string,
    type: string,
    candidateId: string,
    candidateName: string,
    detail?: string
  ) {
    const event = await this.prisma.activityEvent.create({
      data: { campaignId, type, candidateId, candidateName, detail },
    });

    await this.pusher.trigger("activity", "event", {
      id: event.id,
      type,
      candidateName,
      detail: detail ?? "",
      ts: event.ts.toISOString(),
    });

    await this.pusher.trigger("agents", "status", {
      agent: this.typeToAgent(type),
      active: true,
    });

    return event;
  }

  private typeToAgent(type: string): string {
    const map: Record<string, string> = {
      sourced: "sourcing",
      enriched: "enrichment",
      qualified: "qualification",
      personalized: "personalization",
      sent: "sending",
    };
    return map[type] ?? "sourcing";
  }
}
