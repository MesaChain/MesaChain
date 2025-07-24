import { IsString, IsNumber, IsEnum, IsOptional, IsObject, IsDateString } from 'class-validator';
import { MetricCategory } from '../types/enums';

export class CreateMetricDto {
  @IsString()
  name: string;

  @IsNumber()
  value: number;

  @IsEnum(MetricCategory)
  category: MetricCategory;

  @IsString()
  source: string;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;

  @IsOptional()
  @IsObject()
  tags?: Record<string, any>;

  @IsOptional()
  @IsDateString()
  timestamp?: string;
}