import {
  IsString,
  IsOptional,
  IsBoolean,
  IsObject,
  IsEnum,
} from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { ReportFormat } from "../types/enums";

export class CreateReportDto {
  @ApiProperty({ description: "Report name" })
  @IsString()
  name: string;

  @ApiPropertyOptional({ description: "Report description" })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: "Query key for the report" })
  @IsString()
  query: string;

  @ApiProperty({ enum: ReportFormat, description: "Report output format" })
  @IsEnum(ReportFormat)
  format: ReportFormat;

  @ApiPropertyOptional({ description: "Query parameters" })
  @IsOptional()
  @IsObject()
  parameters?: Record<string, any>;

  @ApiPropertyOptional({
    description: "Schedule for automatic report generation",
  })
  @IsOptional()
  @IsString()
  schedule?: string;

  @ApiPropertyOptional({
    description: "Whether the report is active",
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
