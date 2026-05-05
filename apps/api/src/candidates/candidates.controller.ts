import { Controller, Get, Param, Post, Query, UseGuards } from "@nestjs/common";
import { CandidatesService } from "./candidates.service";
import { ClerkGuard } from "../auth/clerk.guard";

@Controller("candidates")
@UseGuards(ClerkGuard)
export class CandidatesController {
  constructor(private readonly candidatesService: CandidatesService) {}

  @Get()
  findAll(
    @Query("status") status?: string,
    @Query("campaignId") campaignId?: string,
  ) {
    return this.candidatesService.findAll({ status, campaignId });
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.candidatesService.findOne(id);
  }

  @Get(":id/score")
  getScore(@Param("id") id: string) {
    return this.candidatesService.getScore(id);
  }

  @Get(":id/messages")
  getMessages(@Param("id") id: string) {
    return this.candidatesService.getMessages(id);
  }

  @Post(":id/sync")
  forceDynamicsSync(@Param("id") id: string) {
    return this.candidatesService.forceDynamicsSync(id);
  }

  @Post(":id/regenerate-score")
  regenerateScore(@Param("id") id: string) {
    return this.candidatesService.regenerateScore(id);
  }

  @Post(":id/regenerate-personalization")
  regeneratePersonalization(@Param("id") id: string) {
    return this.candidatesService.regeneratePersonalization(id);
  }
}
