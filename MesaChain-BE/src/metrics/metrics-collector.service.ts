import { Injectable, Logger } from "@nestjs/common";
import { PrismaService } from "../shared/prisma.service";
import { MetricCategory } from "./types/enums";
import { MetricsService } from "./metrics.service";
import { Cron, CronExpression } from "@nestjs/schedule";

@Injectable()
export class MetricsCollectorService {
  private readonly logger = new Logger(MetricsCollectorService.name);
  private isCollecting = false;

  constructor(private metricsService: MetricsService) {}

  async collectSalesMetrics() {
    // Implementation for collecting sales metrics
    this.logger.log("Collecting sales metrics...");
  }

  async collectOperationalMetrics() {
    // Implementation for collecting operational metrics
    this.logger.log("Collecting operational metrics...");
  }

  @Cron(CronExpression.EVERY_5_MINUTES)
  async collectRealTimeMetrics() {
    if (this.isCollecting) {
      this.logger.warn("Metrics collection already in progress, skipping...");
      return;
    }

    this.isCollecting = true;
    try {
      await Promise.all([
        this.collectSalesMetrics(),
        this.collectOperationalMetrics(),
      ]);
    } catch (error) {
      this.logger.error(
        `Failed to collect real-time metrics: ${error.message}`
      );
    } finally {
      this.isCollecting = false;
    }
  }
}
