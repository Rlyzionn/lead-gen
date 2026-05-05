import { Injectable, Logger } from "@nestjs/common";
import axios from "axios";

type NotificationChannel = "slack" | "email" | "in-app";
type NotificationEvent =
  | "reply_needs_human"
  | "candidate_above_threshold"
  | "meeting_booked"
  | "call_notification"
  | "sync_error"
  | "campaign_milestone";

interface NotificationPayload {
  event: NotificationEvent;
  candidateName?: string;
  campaignName?: string;
  detail?: string;
  channels: NotificationChannel[];
}

@Injectable()
export class NotificationsService {
  private readonly log = new Logger(NotificationsService.name);

  async send(payload: NotificationPayload) {
    const tasks = payload.channels.map((ch) => this.sendToChannel(ch, payload));
    await Promise.allSettled(tasks);
  }

  private async sendToChannel(channel: NotificationChannel, payload: NotificationPayload) {
    if (channel === "slack") {
      await axios.post(process.env.SLACK_WEBHOOK_URL ?? "", {
        text: this.formatSlackMessage(payload),
      });
    }
    // email and in-app channels wired here
  }

  private formatSlackMessage(payload: NotificationPayload): string {
    return `*${payload.event}* — ${payload.candidateName ?? ""} ${payload.detail ?? ""}`;
  }
}
