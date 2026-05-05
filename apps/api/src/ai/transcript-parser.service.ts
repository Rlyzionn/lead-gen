import { Injectable, Logger } from "@nestjs/common";
import OpenAI, { toFile } from "openai";
import * as fs from "fs";

const DEMO = process.env.DEMO_MODE === "true";

@Injectable()
export class TranscriptParserService {
  private readonly log = new Logger(TranscriptParserService.name);
  // Lazily / conditionally instantiate so the API can boot without an
  // OPENAI_API_KEY (e.g. in demo mode). Without this guard the OpenAI
  // constructor throws at Nest DI time and the whole app crashes.
  private readonly openai =
    DEMO || !process.env.OPENAI_API_KEY
      ? null
      : new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  async transcribeAudio(filePath: string): Promise<string> {
    if (!this.openai) {
      this.log.warn("[DEMO/no-key] transcribeAudio returning stub transcript");
      return "[Demo transcript] Client wants Senior ICU Registered Nurses in Dallas. 3+ years critical care experience required, BSN required, CCRN preferred. Pay range $48-56/hr.";
    }
    const transcription = await this.openai.audio.transcriptions.create({
      file: fs.createReadStream(filePath),
      model: "whisper-1",
    });
    return transcription.text;
  }

  async transcribeBuffer(buffer: Buffer, filename: string): Promise<string> {
    if (!this.openai) {
      this.log.warn(`[DEMO/no-key] transcribeBuffer(${filename}) returning stub`);
      return "[Demo transcript] Client wants Senior ICU Registered Nurses in Dallas. 3+ years critical care experience required, BSN required, CCRN preferred. Pay range $48-56/hr.";
    }
    const file = await toFile(buffer, filename);
    const transcription = await this.openai.audio.transcriptions.create({
      file,
      model: "whisper-1",
    });
    return transcription.text;
  }
}
