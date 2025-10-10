import { IsString, IsEnum, IsOptional, IsNumber, IsObject } from 'class-validator';
import { MetricCategory } from '../types/enums';

export class CreateMetricDto {
  @IsString()
  name: string;

  @IsEnum(MetricCategory)
  category: MetricCategory;

  @IsNumber()
  value: number;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;

  @IsOptional()
  @IsString()
  userId?: string;

  @IsOptional()
  @IsString()
  sessionId?: string;

  @IsString()
  source: string = 'api';

  @IsOptional()
  @IsString()
  timestamp?: string;
}