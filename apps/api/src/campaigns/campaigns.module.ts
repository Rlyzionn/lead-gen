import { Module } from "@nestjs/common";
import { MulterModule } from "@nestjs/platform-express";
import { CampaignsController } from "./campaigns.controller";
import { CampaignsService } from "./campaigns.service";
import { AiModule } from "../ai/ai.module";
import { AgentsModule } from "../agents/agents.module";
import { IntegrationsModule } from "../integrations/integrations.module";

@Module({
  imports: [
    MulterModule.register({ limits: { fileSize: 100 * 1024 * 1024 } }), // 100 MB
    AiModule,
    AgentsModule,
    IntegrationsModule,
  ],
  controllers: [CampaignsController],
  providers: [CampaignsService],
  exports: [CampaignsService],
})
export class CampaignsModule {}
