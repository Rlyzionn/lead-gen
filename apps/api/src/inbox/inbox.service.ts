import { Injectable, Logger } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { AiService } from "../ai/ai.service";
import { ActivityService } from "../activity/activity.service";
import { GmailService } from "../integrations/gmail/gmail.service";
import { SettingsService, buildToneSystemPrompt } from "../settings/settings.service";

@Injectable()
export class InboxService {
  private readonly log = new Logger(InboxService.name);

  constructor(
    private prisma: PrismaService,
    private ai: AiService,
    private activity: ActivityService,
    private gmail: GmailService,
    private settings: SettingsService,
  ) {}

  async getThreads(campaignId?: string) {
    // Return most recent message per candidate, newest first
    const messages = await this.prisma.message.findMany({
      where: campaignId ? { campaignId } : {},
      orderBy: { sentAt: "desc" },
      distinct: ["candidateId"],
      include: { candidate: { select: { name: true } } },
    });

    return messages.map((m) => ({
      id: m.candidateId,
      candidateName: m.candidate.name,
      lastMessage: m.body.slice(0, 80),
      lastTs: m.sentAt.toISOString(),
      channel: m.channel,
      unread: m.direction === "inbound" && !m.readAt,
    }));
  }

  async sendReply(candidateId: string, body: string, channel: string) {
    const candidate = await this.prisma.candidate.findUniqueOrThrow({
      where: { id: candidateId },
    });
    const message = await this.prisma.message.create({
      data: {
        candidateId,
        campaignId: candidate.campaignId,
        channel,
        direction: "outbound",
        body,
      },
    });
    await this.activity.emit(candidate.campaignId, "sent", candidateId, candidate.name);
    return message;
  }

  async generateAiDraft(candidateId: string, userId?: string) {
    const history = await this.prisma.message.findMany({
      where: { candidateId },
      orderBy: { sentAt: "asc" },
    });
    const candidate = await this.prisma.candidate.findUniqueOrThrow({
      where: { id: candidateId },
      include: { campaign: true },
    });
    let tonePrompt: string | undefined;
    let creativity: number | undefined;
    if (userId) {
      const prefs = await this.settings.getAIPreferences(userId);
      tonePrompt = buildToneSystemPrompt(prefs as any);
      creativity = prefs.creativity;
    }
    const draft = await this.ai.draftReply(
      history,
      candidate.campaign.sourcingSpec ?? "",
      tonePrompt,
      creativity,
    );
    return { draft };
  }

  async handleInboundSms(payload: Record<string, string>) {
    const candidate = await this.prisma.candidate.findFirst({
      where: { phone: payload.From },
    });
    if (!candidate) {
      this.log.warn(`Inbound SMS from unknown number ${payload.From}`);
      return { ok: false };
    }

    const message = await this.prisma.message.create({
      data: {
        candidateId: candidate.id,
        campaignId: candidate.campaignId,
        channel: "sms",
        direction: "inbound",
        body: payload.Body,
        externalId: payload.MessageSid,
      },
    });

    await this.activity.emit(
      candidate.campaignId,
      "replied",
      candidate.id,
      candidate.name,
      payload.Body.slice(0, 80)
    );

    return { ok: true };
  }

  async handleInboundEmail(payload: Record<string, unknown>) {
    // Gmail push notification payload contains base64-encoded message data
    try {
      const data = payload.message as { data: string };
      const decoded = JSON.parse(Buffer.from(data.data, "base64").toString());
      const historyId = decoded.historyId as string;

      // Look up which recruiter this Gmail watch belongs to
      const token = await this.prisma.oAuthToken.findFirst({
        where: { provider: "google" },
      });
      if (!token) return { ok: false };

      // Fetch the new message(s) from Gmail
      // For brevity we use historyId — a full implementation would fetch history
      this.log.log(`Gmail push received historyId=${historyId}`);
      return { ok: true };
    } catch (e) {
      this.log.error("Gmail webhook parse error", e);
      return { ok: false };
    }
  }

  async markRead(candidateId: string) {
    await this.prisma.message.updateMany({
      where: { candidateId, direction: "inbound", readAt: null },
      data: { readAt: new Date() },
    });
    return { ok: true };
  }
}
