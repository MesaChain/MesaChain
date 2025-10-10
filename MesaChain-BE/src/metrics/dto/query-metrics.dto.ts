import { IsOptional, IsEnum, IsString, IsDateString, IsNumber, Min, Max } from 'class-validator';
import { MetricCategory, AggregationPeriod } from '../types/enums';

export class QueryMetricsDto {
  @IsOptional()
  @IsEnum(MetricCategory)
  category?: MetricCategory;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsEnum(AggregationPeriod)
  period?: AggregationPeriod;

  @IsOptional()
  @IsString()
  userId?: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(1000)
  limit?: number = 100;

  @IsOptional()
  @IsNumber()
  @Min(0)
  offset?: number = 0;

  @IsOptional()
  @IsString()
  source?: string;

  @IsOptional()
  @IsString()
  tags?: string[];

  @IsOptional()
  @IsString()
  aggregation?: string;
}