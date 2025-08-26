import { IsOptional, IsEnum, IsDateString, IsString, IsArray, IsNumber, Min, Max } from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { MetricCategory, AggregationPeriod } from '../types/enums';

export class QueryMetricsDto {
  @IsOptional()
  @IsEnum(MetricCategory)
  category?: MetricCategory;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  source?: string;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(1000)
  limit?: number = 100;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  offset?: number = 0;

  @IsOptional()
  @IsEnum(AggregationPeriod)
  aggregation?: AggregationPeriod;
}