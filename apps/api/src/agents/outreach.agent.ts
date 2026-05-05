import { Processor, Process } from "@nestjs/bull";
import { Job } from "bull";
import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { TwilioService } from "../integrations/twilio/twilio.service";
import { GmailService } from "../integrations/gmail/gmail.service";
import { ActivityService } from "../activity/activity.service";
import { DynamicsService } from "../integrations/dynamics/dynamics.service";

@Processor("outreach")
@Injectable()
export class OutreachAgent {
  constructor(
    private prisma: PrismaService,
    private twilio: TwilioService,
    private gmail: GmailService,
    private activity: ActivityService,
    private dynamics: DynamicsService
  ) {}

  @Process("send")
  async handleSend(job: Job<{ candidateId: string; channel: string; touch: number }>) {
    const { candidateId, channel, touch = 1 } = job.data;
    const candidate = await this.prisma.candidate.findUniqueOrThrow({
      where: { id: candidateId },
      include: { campaign: true },
    });

    const tokens = candidate.personalizationTokens as Record<string, string>;
    const template = this.resolveTemplate(candidate.campaign as any, channel, touch, tokens);

    let messageId: string;

    if (channel === "sms") {
      const msg = await this.twilio.sendSms({
        to: candidate.phone ?? "",
        body: template.body,
        recruiterId: candidate.recruiterId ?? "",
        campaignId: candidate.campaignId,
      });
      messageId = msg.sid;
    } else if (channel === "email") {
      const msg = await this.gmail.sendEmail({
        to: candidate.email ?? "",
        subject: template.subject ?? "",
        body: template.body,
        userId: candidate.recruiterId ?? "",
      });
      messageId = msg.id ?? "";
    } else {
      // call reminder — notify recruiter
      return;
    }

    await this.prisma.message.create({
      data: {
        candidateId,
        campaignId: candidate.campaignId,
        channel,
        direction: "outbound",
        body: template.body,
        externalId: messageId,
        touchNumber: touch,
      },
    });

    await this.activity.emit(candidate.campaignId, "sent", candidateId, candidate.name);
    await this.dynamics.syncEvent(candidateId, "message_sent", { channel, touch });
  }

  private resolveTemplate(
    campaign: any,
    channel: string,
    touch: number,
    tokens: Record<string, string>
  ) {
    const raw = campaign.cadenceTemplates?.[channel]?.[touch - 1] ?? { body: "" };
    const interpolated = (raw.body as string).replace(
      /\{\{(\w+)\}\}/g,
      (_: string, key: string) => tokens[key] ?? ""
    );
    return { ...raw, body: interpolated };
  }
}
