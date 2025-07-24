import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  Param,
  UseGuards,
  HttpStatus,
  HttpCode,
  UseInterceptors,
} from '@nestjs/common';
import { CacheInterceptor, CacheTTL } from '@nestjs/cache-manager';
import { MetricsService } from './metrics.service';
import { CreateMetricDto } from './dto/create-metric.dto';
import { QueryMetricsDto } from './dto/query-metrics.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { MetricCategory, AggregationPeriod } from './types/enums';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@Controller('metrics')
@UseGuards(JwtAuthGuard)
@UseInterceptors(CacheInterceptor)
@ApiTags('metrics')
@ApiBearerAuth()
export class MetricsController {
  constructor(private readonly metricsService: MetricsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new metric' })
  async createMetric(@Body() createMetricDto: CreateMetricDto) {
    return this.metricsService.createMetric(createMetricDto);
  }

  @Post('bulk')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create multiple metrics' })
  async createBulkMetrics(@Body() metrics: CreateMetricDto[]) {
    return this.metricsService.createBulkMetrics(metrics);
  }

  @Get()
  @CacheTTL(300) // Cache for 5 minutes
  @ApiOperation({ summary: 'Query metrics with filters' })
  async queryMetrics(@Query() queryDto: QueryMetricsDto) {
    return this.metricsService.queryMetrics(queryDto);
  }

  @Get('category/:category')
  @CacheTTL(300)
  @ApiOperation({ summary: 'Get metrics by category' })
  async getMetricsByCategory(
    @Param('category') category: MetricCategory,
    @Query('limit') limit?: number,
  ) {
    return this.metricsService.getMetricsByCategory(category, limit);
  }

  @Get('trends/:name')
  @CacheTTL(600) // Cache for 10 minutes
  @ApiOperation({ summary: 'Get metric trends' })
  async getMetricTrends(
    @Param('name') name: string,
    @Query('period') period: AggregationPeriod,
    @Query('days') days?: number,
  ) {
    return this.metricsService.getMetricTrends(name, period, days);
  }

  @Get('dashboard')
  @CacheTTL(180) // Cache for 3 minutes
  @ApiOperation({ summary: 'Get dashboard metrics' })
  async getDashboardMetrics() {
    const [salesMetrics, operationalMetrics, customerMetrics] = await Promise.all([
      this.metricsService.getMetricsByCategory(MetricCategory.SALES, 10),
      this.metricsService.getMetricsByCategory(MetricCategory.OPERATIONAL, 10),
      this.metricsService.getMetricsByCategory(MetricCategory.CUSTOMER, 10),
    ]);

    return {
      sales: salesMetrics,
      operational: operationalMetrics,
      customer: customerMetrics,
    };
  }

  @Get('realtime')
  @ApiOperation({ summary: 'Get real-time metrics' })
  async getRealtimeMetrics() {
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    
    return this.metricsService.queryMetrics({
      startDate: fiveMinutesAgo.toISOString(),
      limit: 100,
      offset: 0,
    });
  }
}