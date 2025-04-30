import { Module } from "@nestjs/common";
import { MetricsController } from "./metrics.controller";
import { MetricsService } from "./metrics.service";
import { DataProcessingService } from "./services/data-processing.service";
import { AnalyticsService } from "./services/analytics.service";
import { ReportingService } from "./services/reporting.service";
import { CacheModule } from "@nestjs/cache-manager";

@Module({
  imports: [
    CacheModule.register({
      ttl: 3600, // 1 hour
    }),
  ],
  controllers: [MetricsController],
  providers: [
    MetricsService,
    DataProcessingService,
    AnalyticsService,
    ReportingService,
  ],
  exports: [MetricsService],
})
export class MetricsModule {}
