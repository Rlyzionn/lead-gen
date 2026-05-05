import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  Delete,
  UseGuards,
  UseInterceptors,
  UploadedFile,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { memoryStorage } from "multer";
import { CampaignsService } from "./campaigns.service";
import { CreateCampaignDto } from "./dto/create-campaign.dto";
import { ParseTranscriptDto } from "./dto/parse-transcript.dto";
import { ClerkGuard } from "../auth/clerk.guard";
import { SupabaseService } from "../supabase/supabase.service";
import { TranscriptParserService } from "../ai/transcript-parser.service";

@Controller("campaigns")
@UseGuards(ClerkGuard)
export class CampaignsController {
  constructor(
    private readonly campaignsService: CampaignsService,
    private readonly supabase: SupabaseService,
    private readonly transcriptParser: TranscriptParserService,
  ) {}

  @Get()
  findAll() {
    return this.campaignsService.findAll();
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.campaignsService.findOne(id);
  }

  @Post()
  create(@Body() dto: CreateCampaignDto) {
    return this.campaignsService.create(dto);
  }

  @Post("parse")
  parseTranscript(@Body() dto: ParseTranscriptDto) {
    return this.campaignsService.parseTranscript(dto);
  }

  // Upload an audio file → transcribe with Whisper → store in Supabase → return transcript text
  @Post("upload-audio")
  @UseInterceptors(FileInterceptor("file", { storage: memoryStorage() }))
  async uploadAudio(@UploadedFile() file: Express.Multer.File) {
    const path = `audio/${Date.now()}-${file.originalname}`;
    const [storageUrl, transcript] = await Promise.all([
      this.supabase.uploadFile(path, file.buffer, file.mimetype),
      this.transcriptParser.transcribeBuffer(file.buffer, file.originalname),
    ]);
    return { transcript, storageUrl };
  }

  // Upload a CSV of past placements for a campaign → store in Supabase → return storage URL
  @Post(":id/upload-placements")
  @UseInterceptors(FileInterceptor("file", { storage: memoryStorage() }))
  async uploadPlacements(
    @Param("id") id: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const path = `placements/${id}/${Date.now()}-${file.originalname}`;
    const storageUrl = await this.supabase.uploadFile(path, file.buffer, "text/csv");
    return { storageUrl };
  }

  @Patch(":id/pause")
  pause(@Param("id") id: string) {
    return this.campaignsService.pause(id);
  }

  @Patch(":id/resume")
  resume(@Param("id") id: string) {
    return this.campaignsService.resume(id);
  }

  @Post(":id/sync")
  forceDynamicsSync(@Param("id") id: string) {
    return this.campaignsService.forceDynamicsSync(id);
  }

  @Get(":id/candidates")
  getCandidates(@Param("id") id: string) {
    return this.campaignsService.getCandidates(id);
  }

  @Patch(":id")
  update(
    @Param("id") id: string,
    @Body() dto: Partial<{
      name: string;
      sourcingSpec: string;
      irpPrompt: string;
      threshold: number;
      channels: string[];
      cadenceTemplate: string;
      conditionalLogicDsl: string;
      status: string;
    }>,
  ) {
    return this.campaignsService.update(id, dto);
  }

  @Delete(":id")
  remove(@Param("id") id: string) {
    return this.campaignsService.remove(id);
  }
}
