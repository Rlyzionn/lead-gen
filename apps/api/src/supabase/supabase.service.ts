import { Injectable, OnModuleInit } from "@nestjs/common";
import { createClient, SupabaseClient } from "@supabase/supabase-js";

@Injectable()
export class SupabaseService implements OnModuleInit {
  readonly client: SupabaseClient;

  constructor() {
    this.client = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_KEY!,
    );
  }

  async onModuleInit() {
    await this.client.storage.createBucket("uploads", { public: false }).catch(() => {});
  }

  async uploadFile(path: string, buffer: Buffer, contentType: string): Promise<string> {
    const { error } = await this.client.storage
      .from("uploads")
      .upload(path, buffer, { contentType, upsert: true });
    if (error) throw new Error(`Supabase Storage upload failed: ${error.message}`);
    const { data } = this.client.storage.from("uploads").getPublicUrl(path);
    return data.publicUrl;
  }

  async deleteFile(path: string): Promise<void> {
    await this.client.storage.from("uploads").remove([path]);
  }
}
