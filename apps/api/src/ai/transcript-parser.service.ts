import { Injectable } from "@nestjs/common";
import OpenAI, { toFile } from "openai";
import * as fs from "fs";

@Injectable()
export class TranscriptParserService {
  private readonly openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  async transcribeAudio(filePath: string): Promise<string> {
    const transcription = await this.openai.audio.transcriptions.create({
      file: fs.createReadStream(filePath),
      model: "whisper-1",
    });
    return transcription.text;
  }

  async transcribeBuffer(buffer: Buffer, filename: string): Promise<string> {
    const file = await toFile(buffer, filename);
    const transcription = await this.openai.audio.transcriptions.create({
      file,
      model: "whisper-1",
    });
    return transcription.text;
  }
}
