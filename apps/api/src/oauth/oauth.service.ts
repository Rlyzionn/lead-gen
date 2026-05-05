import { Injectable } from "@nestjs/common";
import { google } from "googleapis";
import { PrismaService } from "../prisma/prisma.service";

const SCOPES = [
  "https://www.googleapis.com/auth/gmail.send",
  "https://www.googleapis.com/auth/gmail.readonly",
  "https://www.googleapis.com/auth/gmail.modify",
];

@Injectable()
export class OAuthService {
  constructor(private prisma: PrismaService) {}

  private getGoogleClient() {
    return new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      `${process.env.NEXT_PUBLIC_APP_URL}/api/oauth/google/callback`
    );
  }

  getGoogleAuthUrl(userId: string): string {
    const client = this.getGoogleClient();
    return client.generateAuthUrl({
      access_type: "offline",
      scope: SCOPES,
      prompt: "consent",
      state: userId,
    });
  }

  async handleGoogleCallback(code: string, userId: string) {
    const client = this.getGoogleClient();
    const { tokens } = await client.getToken(code);

    await this.prisma.oAuthToken.upsert({
      where: { userId_provider: { userId, provider: "google" } },
      create: {
        userId,
        provider: "google",
        accessToken: tokens.access_token!,
        refreshToken: tokens.refresh_token ?? undefined,
        expiresAt: new Date(tokens.expiry_date!),
      },
      update: {
        accessToken: tokens.access_token!,
        refreshToken: tokens.refresh_token ?? undefined,
        expiresAt: new Date(tokens.expiry_date!),
      },
    });

    return { connected: true };
  }

  async getGoogleTokens(userId: string) {
    const record = await this.prisma.oAuthToken.findUnique({
      where: { userId_provider: { userId, provider: "google" } },
    });
    if (!record) return null;

    // Refresh if expiring within 5 min
    if (record.expiresAt < new Date(Date.now() + 5 * 60_000) && record.refreshToken) {
      const client = this.getGoogleClient();
      client.setCredentials({ refresh_token: record.refreshToken });
      const { credentials } = await client.refreshAccessToken();
      await this.prisma.oAuthToken.update({
        where: { userId_provider: { userId, provider: "google" } },
        data: {
          accessToken: credentials.access_token!,
          expiresAt: new Date(credentials.expiry_date!),
        },
      });
      return credentials.access_token;
    }

    return record.accessToken;
  }
}
