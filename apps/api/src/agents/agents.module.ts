import { Module } from "@nestjs/common";
import { BullModule } from "@nestjs/bull";
import { AgentOrchestrator } from "./agent-orchestrator.service";
import { SourcingAgent } from "./sourcing.agent";
import { EnrichmentAgent } from "./enrichment.agent";
import { QualificationAgent } from "./qualification.agent";
import { PersonalizationAgent } from "./personalization.agent";
import { OutreachAgent } from "./outreach.agent";
import { AiModule } from "../ai/ai.module";
import { IntegrationsModule } from "../integrations/integrations.module";
import { ActivityModule } from "../activity/activity.module";

@Module({
  imports: [
    BullModule.registerQueue(
      { name: "sourcing" },
      { name: "enrichment" },
      { name: "qualification" },
      { name: "personalization" },
      { name: "outreach" }
    ),
    AiModule,
    IntegrationsModule,
    ActivityModule,
  ],
  providers: [
    AgentOrchestrator,
    SourcingAgent,
    EnrichmentAgent,
    QualificationAgent,
    PersonalizationAgent,
    OutreachAgent,
  ],
  exports: [AgentOrchestrator],
})
export class AgentsModule {}
