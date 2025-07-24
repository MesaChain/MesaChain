import { Module } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { ThrottlerModule } from '@nestjs/throttler';
import { ScheduleModule } from '@nestjs/schedule';
import { PrismaModule } from '../prisma/prisma.module';

// Controllers
import { MetricsController } from './metrics.controller';
import { ReportsController } from './reports.controller';
import { AnalyticsController } from './analytics.controller';

// Services
import { MetricsService } from './metrics.service';
import { MetricsCollectorService } from './metrics-collector.service';
import { MetricsAggregationService } from './metrics-aggregation.service';
import { ReportsService } from './reports.service';
import { AnalyticsService } from './analytics.service';
import { ExportService } from './export/export.service';
import { MetricsCacheService } from './cache/cache.service';

@Module({
  imports: [
    PrismaModule,
    ScheduleModule.forRoot(),
    CacheModule.register({
      ttl: 300, // 5 minutes default
      max: 1000, // Maximum number of items in cache
    }),
    ThrottlerModule.forRoot([
      {
        ttl: 60000, // 1 minute
        limit: 100, // 100 requests per minute
      },
    ]),
  ],
  controllers: [MetricsController, ReportsController, AnalyticsController],
  providers: [
    MetricsService,
    MetricsCollectorService,
    MetricsAggregationService,
    ReportsService,
    AnalyticsService,
    ExportService,
    MetricsCacheService,
  ],
  exports: [MetricsService, MetricsCollectorService, MetricsCacheService],
})
export class MetricsModule {}