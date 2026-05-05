import { Module } from "@nestjs/common";
import { AiService } from "./ai.service";
import { TranscriptParserService } from "./transcript-parser.service";
import { CommandCenterService } from "./command-center.service";
import { CommandCenterController } from "./command-center.controller";

@Module({
  providers: [AiService, TranscriptParserService, CommandCenterService],
  controllers: [CommandCenterController],
  exports: [AiService, TranscriptParserService, CommandCenterService],
})
export class AiModule {}
