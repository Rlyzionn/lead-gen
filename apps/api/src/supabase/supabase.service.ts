import { Injectable, Logger, OnModuleInit } from "@nestjs/common";
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import WebSocket from "ws";

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

@Injectable()
export class SupabaseService implements OnModuleInit {
  private readonly log = new Logger(SupabaseService.name);
  readonly client: SupabaseClient | null;

  constructor() {
    if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
      this.log.warn("SUPABASE_URL/SUPABASE_SERVICE_KEY not set — Storage features disabled.");
      this.client = null;
      return;
    }
    // @supabase/supabase-js spins up a Realtime WebSocket client at construction
    // time. Node 20 has no native WebSocket, so we inject the `ws` package as
    // the transport. Without this, the API crashes on startup with
    // "Node.js 20 detected without native WebSocket support".
    this.client = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
      realtime: {
        // The shape from @supabase/realtime-js — see RealtimeClientOptions
        transport: WebSocket as unknown as never,
      },
      auth: { persistSession: false },
    });
  }

  async onModuleInit() {
    if (!this.client) return;
    await this.client.storage
      .createBucket("uploads", { public: false })
      .catch(() => {
        // Bucket already exists (or auth not yet propagated) — safe to ignore.
      });
  }

  async uploadFile(path: string, buffer: Buffer, contentType: string): Promise<string> {
    if (!this.client) throw new Error("Supabase Storage is not configured");
    const { error } = await this.client.storage
      .from("uploads")
      .upload(path, buffer, { contentType, upsert: true });
    if (error) throw new Error(`Supabase Storage upload failed: ${error.message}`);
    const { data } = this.client.storage.from("uploads").getPublicUrl(path);
    return data.publicUrl;
  }

  async deleteFile(path: string): Promise<void> {
    if (!this.client) return;
    await this.client.storage.from("uploads").remove([path]);
  }
}
