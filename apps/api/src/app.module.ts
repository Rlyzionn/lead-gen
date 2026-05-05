import { Module, Controller, Get } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { BullModule } from "@nestjs/bull";
import { PrismaModule } from "./prisma/prisma.module";
import { SupabaseModule } from "./supabase/supabase.module";
import { AuthModule } from "./auth/auth.module";
import { CampaignsModule } from "./campaigns/campaigns.module";
import { CandidatesModule } from "./candidates/candidates.module";
import { AgentsModule } from "./agents/agents.module";
import { InboxModule } from "./inbox/inbox.module";
import { IntegrationsModule } from "./integrations/integrations.module";
import { AiModule } from "./ai/ai.module";
import { NotificationsModule } from "./notifications/notifications.module";
import { ActivityModule } from "./activity/activity.module";
import { MetricsModule } from "./metrics/metrics.module";
import { SettingsModule } from "./settings/settings.module";
import { OAuthModule } from "./oauth/oauth.module";

// Cheap, dependency-free healthcheck so Railway's probe never fails
// because of a DB or Redis hiccup.
@Controller("health")
class HealthController {
  @Get()
  ok() {
    return { ok: true, service: "api", time: new Date().toISOString() };
  }
}

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    BullModule.forRoot({
      redis: process.env.REDIS_URL ?? "redis://localhost:6379",
    }),
    PrismaModule,
    SupabaseModule,
    AuthModule,
    IntegrationsModule,
    AiModule,
    ActivityModule,
    NotificationsModule,
    AgentsModule,
    CampaignsModule,
    CandidatesModule,
    InboxModule,
    MetricsModule,
    SettingsModule,
    OAuthModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
