import { Controller, Get, Query, Redirect, UseGuards } from "@nestjs/common";
import { OAuthService } from "./oauth.service";
import { ClerkGuard } from "../auth/clerk.guard";
import { CurrentUser } from "../auth/current-user.decorator";

const DEMO = process.env.DEMO_MODE === "true";

@Controller("oauth")
export class OAuthController {
  constructor(private readonly oauthService: OAuthService) {}

  @Get("google")
  @UseGuards(ClerkGuard)
  initiateGoogleAuth(@CurrentUser() userId: string) {
    const url = this.oauthService.getGoogleAuthUrl(userId);
    return { url };
  }

  @Get("google/callback")
  @Redirect()
  async handleGoogleCallback(
    @Query("code") code: string,
    @Query("state") userId: string
  ) {
    await this.oauthService.handleGoogleCallback(code, userId);
    return { url: `${process.env.NEXT_PUBLIC_APP_URL}/settings?gmail=connected` };
  }

  @Get("google/status")
  @UseGuards(ClerkGuard)
  async getGoogleStatus(@CurrentUser() userId: string) {
    if (DEMO) return { connected: true };
    const token = await this.oauthService.getGoogleTokens(userId);
    return { connected: !!token };
  }
}
