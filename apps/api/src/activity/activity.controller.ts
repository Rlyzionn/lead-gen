import { Controller, Get, Query, UseGuards } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { ClerkGuard } from "../auth/clerk.guard";

@Controller("activity")
@UseGuards(ClerkGuard)
export class ActivityController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  async getRecent(
    @Query("campaignId") campaignId?: string,
    @Query("limit") limit = "50"
  ) {
    return this.prisma.activityEvent.findMany({
      where: campaignId ? { campaignId } : {},
      orderBy: { ts: "desc" },
      take: parseInt(limit, 10),
    });
  }
}
