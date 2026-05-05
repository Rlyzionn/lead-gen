import { Injectable, Logger } from "@nestjs/common";
import { google } from "googleapis";
import { PrismaService } from "../../prisma/prisma.service";

interface SendEmailOptions {
  to: string;
  subject: string;
  body: string;
  userId: string;
}

const DEMO = process.env.DEMO_MODE === "true";

@Injectable()
export class GmailService {
  private readonly log = new Logger(GmailService.name);

  constructor(private prisma: PrismaService) {}

  private async getClient(userId: string) {
    const record = await this.prisma.oAuthToken.findUnique({
      where: { userId_provider: { userId, provider: "google" } },
    });
    if (!record) throw new Error(`No Gmail token for user ${userId}`);

    const auth = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET
    );

    if (record.expiresAt < new Date(Date.now() + 5 * 60_000) && record.refreshToken) {
      auth.setCredentials({ refresh_token: record.refreshToken });
      const { credentials } = await auth.refreshAccessToken();
      await this.prisma.oAuthToken.update({
        where: { userId_provider: { userId, provider: "google" } },
        data: {
          accessToken: credentials.access_token!,
          expiresAt: new Date(credentials.expiry_date!),
        },
      });
      auth.setCredentials(credentials);
    } else {
      auth.setCredentials({ access_token: record.accessToken });
    }
    return auth;
  }

  async sendEmail({ to, subject, body, userId }: SendEmailOptions) {
    if (DEMO) {
      const fakeId = `email_demo_${Math.random().toString(36).slice(2, 12)}`;
      this.log.log(`[DEMO] Email to=${to} subject="${subject}" id=${fakeId}`);
      return { id: fakeId };
    }

    const auth = await this.getClient(userId);
    const gmail = google.gmail({ version: "v1", auth });
    const raw = this.encodeEmail(to, subject, body);
    const res = await gmail.users.messages.send({ userId: "me", requestBody: { raw } });
    this.log.log(`Email sent id=${res.data.id} to=${to}`);
    return res.data;
  }

  async setupWatchInbox(userId: string) {
    if (DEMO) { this.log.log("[DEMO] Gmail watch skipped"); return; }
    const auth = await this.getClient(userId);
    const gmail = google.gmail({ version: "v1", auth });
    await gmail.users.watch({
      userId: "me",
      requestBody: {
        topicName: `projects/${process.env.GOOGLE_CLOUD_PROJECT}/topics/gmail-replies`,
        labelIds: ["INBOX"],
      },
    });
  }

  async fetchMessage(userId: string, messageId: string) {
    if (DEMO) return { id: messageId, snippet: "[DEMO] No real message" };
    const auth = await this.getClient(userId);
    const gmail = google.gmail({ version: "v1", auth });
    const res = await gmail.users.messages.get({ userId: "me", id: messageId });
    return res.data;
  }

  private encodeEmail(to: string, subject: string, body: string): string {
    const message = [`To: ${to}`, `Subject: ${subject}`, "", body].join("\n");
    return Buffer.from(message).toString("base64url");
  }
}
