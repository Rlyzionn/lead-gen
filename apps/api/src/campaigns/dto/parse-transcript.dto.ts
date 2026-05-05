import { IsString, IsEnum, IsOptional } from "class-validator";

export class ParseTranscriptDto {
  @IsString()
  @IsOptional()
  text?: string;

  @IsEnum(["transcript", "audio-upload", "voice-note", "text"])
  mode: "transcript" | "audio-upload" | "voice-note" | "text";

  @IsString()
  @IsOptional()
  audioUrl?: string;
}
