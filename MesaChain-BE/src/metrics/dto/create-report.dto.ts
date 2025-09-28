import { IsString, IsEnum, IsOptional, IsObject, IsBoolean } from 'class-validator';
import { ReportFormat } from '../types/enums';

export class CreateReportDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsString()
  query: string;

  @IsOptional()
  @IsObject()
  parameters?: Record<string, any>;

  @IsEnum(ReportFormat)
  format: ReportFormat;

  @IsOptional()
  @IsString()
  schedule?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean = true;
}