import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  ValidationPipe,
} from "@nestjs/common";
import { MetricsService } from "./metrics.service";
import { AnalyticsService } from "./services/analytics.service";
import { DataProcessingService } from "./services/data-processing.service";
import { ReportingService } from "./services/reporting.service";
// import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";

@Controller("metrics")
// @UseGuards(JwtAuthGuard)
export class MetricsController {
  constructor(
    private readonly metricsService: MetricsService,
    private readonly dataProcessingService: DataProcessingService,
    private readonly analyticsService: AnalyticsService,
    private readonly reportingService: ReportingService
  ) {}

  @Post()
  async createMetric(@Body(ValidationPipe) data: any) {
    return await this.metricsService.createMetric(data);
  }

  @Post("time-series")
  async recordTimeSeriesData(@Body(ValidationPipe) data: any) {
    return await this.metricsService.recordTimeSeriesData(data);
  }

  @Get("time-series/:metricId")
  async getTimeSeriesData(
    @Param("metricId") metricId: string,
    @Query("startTime") startTime: string,
    @Query("endTime") endTime: string
  ) {
    return await this.metricsService.getMetricsByTimeRange(
      metricId,
      new Date(startTime),
      new Date(endTime)
    );
  }

  @Post("process")
  async processData(
    @Body(ValidationPipe)
    data: {
      metricId: string;
      startTime: string;
      endTime: string;
      interval: string;
    }
  ) {
    return await this.dataProcessingService.processTimeSeriesData(
      data.metricId,
      new Date(data.startTime),
      new Date(data.endTime),
      data.interval
    );
  }

  @Get("trends/:metricId")
  async getMetricTrends(
    @Param("metricId") metricId: string,
    @Query("startTime") startTime: string,
    @Query("endTime") endTime: string,
    @Query("interval") interval: string = "1h"
  ) {
    return await this.analyticsService.getMetricTrends(
      metricId,
      new Date(startTime),
      new Date(endTime),
      interval
    );
  }

  @Get("correlations")
  async getMetricCorrelations(
    @Query("metricIds") metricIds: string,
    @Query("startTime") startTime: string,
    @Query("endTime") endTime: string
  ) {
    return await this.analyticsService.getMetricCorrelations(
      metricIds.split(","),
      new Date(startTime),
      new Date(endTime)
    );
  }

  @Get("reports")
  async generateReport(
    @Query("metricIds") metricIds: string,
    @Query("startTime") startTime: string,
    @Query("endTime") endTime: string,
    @Query("format") format: "json" | "csv" | "pdf" = "json"
  ) {
    return await this.reportingService.generateReport(
      metricIds.split(","),
      new Date(startTime),
      new Date(endTime),
      format
    );
  }

  @Get("search")
  async searchMetrics(@Query("query") query: string) {
    return await this.metricsService.searchMetrics(query);
  }
}
