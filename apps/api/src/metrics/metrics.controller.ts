import { Controller, Get, Param, Query, UseGuards } from "@nestjs/common";
import { MetricsService } from "./metrics.service";
import { ClerkGuard } from "../auth/clerk.guard";

@Controller("metrics")
@UseGuards(ClerkGuard)
export class MetricsController {
  constructor(private readonly metricsService: MetricsService) {}

  @Get()
  getDashboard(@Query("campaignId") campaignId?: string) {
    return this.metricsService.getDashboardMetrics(campaignId);
  }

  @Get("campaigns/:id")
  getCampaignMetrics(@Param("id") id: string) {
    return this.metricsService.getCampaignMetrics(id);
  }

  @Get("agents")
  getAgentStats(@Query("campaignId") campaignId?: string) {
    return this.metricsService.getAgentStats(campaignId);
  }
}
