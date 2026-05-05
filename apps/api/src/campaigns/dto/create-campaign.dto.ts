import { IsString, IsOptional, IsNumber, IsArray, Min, Max } from "class-validator";

export class CreateCampaignDto {
  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  irpPrompt?: string;

  @IsNumber()
  @Min(0)
  @Max(100)
  @IsOptional()
  threshold?: number;

  @IsArray()
  @IsOptional()
  channels?: string[];

  @IsString()
  @IsOptional()
  cadenceTemplate?: string;

  @IsString()
  @IsOptional()
  conditionalLogicDsl?: string;

  @IsString()
  @IsOptional()
  sourcingSpec?: string;
}
