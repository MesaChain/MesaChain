import { Controller, Get, UseGuards, Query } from '@nestjs/common';
import { AnalyticsService, AnalyticsResult } from './analytics.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AggregationPeriod } from './types/enums';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@Controller('analytics')
@UseGuards(JwtAuthGuard)
@ApiTags('analytics')
@ApiBearerAuth()
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get()
  @ApiOperation({ summary: 'Get analytics data' })
  async getAnalytics(@Query('period') period?: AggregationPeriod): Promise<AnalyticsResult> {
    return this.analyticsService.getAnalytics(period);
  }

  @Get('predictive')
  @ApiOperation({ summary: 'Get predictive analytics' })
  async getPredictiveAnalytics(
    @Query('metric') metricName: string,
    @Query('days') days?: number,
  ) {
    return this.analyticsService.getPredictiveAnalytics(metricName, days);
  }
}