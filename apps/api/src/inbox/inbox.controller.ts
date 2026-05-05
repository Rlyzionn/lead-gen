import { Controller, Get, Post, Param, Body, Query, UseGuards } from "@nestjs/common";
import { InboxService } from "./inbox.service";
import { ClerkGuard } from "../auth/clerk.guard";
import { CurrentUser } from "../auth/current-user.decorator";

@Controller("inbox")
export class InboxController {
  constructor(private readonly inboxService: InboxService) {}

  @Get()
  @UseGuards(ClerkGuard)
  getThreads(@Query("campaignId") campaignId?: string) {
    return this.inboxService.getThreads(campaignId);
  }

  @Post(":threadId/messages")
  @UseGuards(ClerkGuard)
  sendReply(
    @Param("threadId") threadId: string,
    @Body("body") body: string,
    @Body("channel") channel: string
  ) {
    return this.inboxService.sendReply(threadId, body, channel);
  }

  @Get(":threadId/draft")
  @UseGuards(ClerkGuard)
  getDraft(@Param("threadId") threadId: string, @CurrentUser() userId: string) {
    return this.inboxService.generateAiDraft(threadId, userId);
  }

  @Post(":threadId/read")
  @UseGuards(ClerkGuard)
  markRead(@Param("threadId") threadId: string) {
    return this.inboxService.markRead(threadId);
  }

  // Twilio webhook — no Clerk guard, validated by TwilioWebhookMiddleware
  @Post("webhooks/sms")
  handleSmsWebhook(@Body() payload: Record<string, string>) {
    return this.inboxService.handleInboundSms(payload);
  }

  // Gmail Pub/Sub push notification — no Clerk guard
  @Post("webhooks/gmail")
  handleGmailWebhook(@Body() payload: Record<string, unknown>) {
    return this.inboxService.handleInboundEmail(payload);
  }
}
