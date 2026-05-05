import { Injectable, Logger } from "@nestjs/common";
import twilio from "twilio";
import { PrismaService } from "../../prisma/prisma.service";

interface SendSmsOptions {
  to: string;
  body: string;
  recruiterId: string;
  campaignId: string;
}

const DEMO = process.env.DEMO_MODE === "true";

@Injectable()
export class TwilioService {
  private readonly log = new Logger(TwilioService.name);
  private readonly client = DEMO
    ? null
    : twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

  constructor(private prisma: PrismaService) {}

  async sendSms({ to, body, recruiterId, campaignId }: SendSmsOptions) {
    if (DEMO) {
      const fakeSid = `SM_DEMO_${Math.random().toString(36).slice(2, 12).toUpperCase()}`;
      this.log.log(`[DEMO] SMS to=${to} body="${body.slice(0, 40)}…" sid=${fakeSid}`);
      return { sid: fakeSid };
    }

    const from = await this.resolveOutboundNumber(recruiterId, campaignId);
    const message = await this.client!.messages.create({
      to,
      from,
      messagingServiceSid: process.env.TWILIO_MESSAGING_SERVICE_SID,
      body,
    });
    this.log.log(`SMS sent sid=${message.sid} to=${to}`);
    return message;
  }

  async handleInbound(payload: Record<string, string>) {
    return { received: true, from: payload.From, body: payload.Body };
  }

  private async resolveOutboundNumber(recruiterId: string, campaignId: string): Promise<string> {
    const mapping = await this.prisma.recruiterNumberMapping.findFirst({
      where: { recruiterId },
    });
    return mapping?.phoneNumber ?? "";
  }
}
