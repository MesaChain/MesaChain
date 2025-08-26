import {
  Controller,
  Get,
  Query,
  UseGuards,
  UseInterceptors,
  ParseIntPipe,
  BadRequestException,
} from "@nestjs/common";
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
} from "@nestjs/swagger";
import { CacheInterceptor, CacheTTL } from "@nestjs/cache-manager";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { AnalyticsService } from "./analytics.service";
import { AggregationPeriod, MetricCategory } from "./types/enums"; // Added MetricCategory import
import { AnalyticsResult } from "./types/interfaces";

@Controller("analytics")
@UseGuards(JwtAuthGuard)
@UseInterceptors(CacheInterceptor)
@ApiTags("analytics")
@ApiBearerAuth()
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get()
  @CacheTTL(300) // Cache for 5 minutes
  @ApiOperation({ summary: "Get analytics data" })
  @ApiQuery({
    name: "period",
    description: "Aggregation period for analytics data",
    required: false,
    enum: AggregationPeriod,
  })
  async getAnalytics(
    @Query("period") period?: AggregationPeriod
  ): Promise<AnalyticsResult> {
    return this.analyticsService.getAnalytics(period);
  }

  @Get("predictive")
  @CacheTTL(600) // Cache for 10 minutes
  @ApiQuery({
    name: "metric",
    description: "Name of the metric to analyze",
    required: true,
  })
  @ApiQuery({
    name: "days",
    description: "Number of days to predict (default: 30)",
    required: false,
  })
  @ApiOperation({ summary: "Get predictive analytics" })
  async getPredictiveAnalytics(
    @Query("metric") metricName: string,
    @Query("days", new ParseIntPipe({ optional: true })) days?: number
  ) {
    if (!metricName) {
      throw new BadRequestException("Metric name is required");
    }
    return this.analyticsService.getPredictiveAnalytics(metricName, days);
  }

  @Get("trends")
  @CacheTTL(300) // Cache for 5 minutes
  @ApiOperation({ summary: "Get trend analysis" })
  @ApiQuery({
    name: "category",
    description: "Metric category to analyze trends for",
    required: false,
    enum: MetricCategory, // Added enum specification for Swagger
  })
  @ApiQuery({
    name: "period",
    description: "Time period for trend analysis",
    required: false,
    enum: AggregationPeriod,
  })
  async getTrends(
    @Query("category") category?: MetricCategory, // Changed from string to MetricCategory
    @Query("period") period?: AggregationPeriod
  ) {
    return this.analyticsService.getTrends(category, period);
  }
}
