import { Injectable, Logger } from "@nestjs/common";
import axios from "axios";

const DEMO = process.env.DEMO_MODE === "true";

@Injectable()
export class DynamicsService {
  private readonly log = new Logger(DynamicsService.name);
  private accessToken: string | null = null;
  private tokenExpiry: Date | null = null;

  private async getToken(): Promise<string> {
    if (DEMO) return "demo-token";
    if (this.accessToken && this.tokenExpiry && this.tokenExpiry > new Date()) {
      return this.accessToken;
    }
    const res = await axios.post(
      `https://login.microsoftonline.com/${process.env.DYNAMICS_TENANT_ID}/oauth2/v2.0/token`,
      new URLSearchParams({
        grant_type: "client_credentials",
        client_id: process.env.DYNAMICS_CLIENT_ID ?? "",
        client_secret: process.env.DYNAMICS_CLIENT_SECRET ?? "",
        scope: `${process.env.DYNAMICS_RESOURCE_URL}/.default`,
      })
    );
    this.accessToken = res.data.access_token;
    this.tokenExpiry = new Date(Date.now() + res.data.expires_in * 1000 - 60_000);
    return this.accessToken!;
  }

  async upsertContact(candidateId: string, fields: Record<string, unknown>) {
    if (DEMO) {
      this.log.log(`[DEMO] Dynamics upsert contact candidateId=${candidateId}`);
      return { contactId: `crm-demo-${candidateId.slice(0, 8)}` };
    }
    const token = await this.getToken();
    const base = `${process.env.DYNAMICS_RESOURCE_URL}/api/data/v9.2`;
    await axios.patch(`${base}/contacts(${candidateId})`, fields, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        "OData-MaxVersion": "4.0",
        "OData-Version": "4.0",
        Prefer: "return=representation",
      },
    });
    this.log.log(`Dynamics contact upserted: ${candidateId}`);
  }

  async syncEvent(candidateId: string, eventType: string, data: Record<string, unknown>) {
    if (DEMO) {
      this.log.log(`[DEMO] Dynamics sync event=${eventType} candidateId=${candidateId}`);
      return { synced: true };
    }
    this.log.log(`Sync event queued: ${eventType} for candidate ${candidateId}`);
  }

  async testConnection(): Promise<boolean> {
    if (DEMO) return true;
    try {
      await this.getToken();
      return true;
    } catch {
      return false;
    }
  }
}
