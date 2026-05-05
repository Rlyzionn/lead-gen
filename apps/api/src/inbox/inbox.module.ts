import { MiddlewareConsumer, Module, NestModule, RequestMethod } from "@nestjs/common";
import { InboxController } from "./inbox.controller";
import { InboxService } from "./inbox.service";
import { AiModule } from "../ai/ai.module";
import { IntegrationsModule } from "../integrations/integrations.module";
import { ActivityModule } from "../activity/activity.module";
import { SettingsModule } from "../settings/settings.module";
import { TwilioWebhookMiddleware } from "../integrations/twilio/twilio.middleware";

@Module({
  imports: [AiModule, IntegrationsModule, ActivityModule, SettingsModule],
  controllers: [InboxController],
  providers: [InboxService],
})
export class InboxModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(TwilioWebhookMiddleware)
      .forRoutes({ path: "inbox/webhooks/sms", method: RequestMethod.POST });
  }
}
