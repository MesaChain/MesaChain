import { Injectable, Logger } from "@nestjs/common";
import { PrismaService } from "../shared/prisma.service";
import { CreateMetricDto } from "./dto/create-metric.dto";
import { QueryMetricsDto } from "./dto/query-metrics.dto";
import { MetricCategory, AggregationPeriod } from "./types/enums";
import { Prisma } from "@prisma/client";
import { Cron, CronExpression } from "@nestjs/schedule";

@Injectable()
export class MetricsService {
  private readonly logger = new Logger(MetricsService.name);

  constructor(private prisma: PrismaService) {}

  async createMetric(createMetricDto: CreateMetricDto) {
    try {
      const metric = await this.prisma.metric.create({
        data: {
          ...createMetricDto,
          category: createMetricDto.category as any,
          timestamp: createMetricDto.timestamp
            ? new Date(createMetricDto.timestamp)
            : new Date(),
        },
      });

      if (
        this.isCriticalMetric(createMetricDto.category, createMetricDto.name)
      ) {
        await this.triggerRealTimeAggregation(metric.id);
      }

      return metric;
    } catch (error) {
      this.logger.error(
        `Failed to create metric: ${error.message}`,
        error.stack
      );
      throw error;
    }
  }

  async createBulkMetrics(metrics: CreateMetricDto[]) {
    try {
      const result = await this.prisma.metric.createMany({
        data: metrics.map((metric) => ({
          ...metric,
          category: metric.category as any,
          timestamp: metric.timestamp ? new Date(metric.timestamp) : new Date(),
        })),
        skipDuplicates: true,
      });

      this.logger.log(`Created ${result.count} metrics in bulk`);
      return result;
    } catch (error) {
      this.logger.error(
        `Failed to create bulk metrics: ${error.message}`,
        error.stack
      );
      throw error;
    }
  }

  async queryMetrics(queryDto: QueryMetricsDto) {
    const where: any = {};

    if (queryDto.category) {
      where.category = queryDto.category;
    }

    if (queryDto.name) {
      where.name = { contains: queryDto.name, mode: "insensitive" };
    }

    if (queryDto.source) {
      where.source = queryDto.source;
    }

    if (queryDto.startDate || queryDto.endDate) {
      where.timestamp = {};
      if (queryDto.startDate) {
        where.timestamp.gte = new Date(queryDto.startDate);
      }
      if (queryDto.endDate) {
        where.timestamp.lte = new Date(queryDto.endDate);
      }
    }

    if (queryDto.tags && queryDto.tags.length > 0) {
      where.metadata = {
        path: ["tags"],
        array_contains: queryDto.tags, // For PostgreSQL JSON array containment
        // OR use this for exact match:
        // equals: queryDto.tags,
      };
    }

    const [metrics, total] = await Promise.all([
      this.prisma.metric.findMany({
        where,
        orderBy: { timestamp: "desc" },
        take: queryDto.limit,
        skip: queryDto.offset,
        include: queryDto.aggregation
          ? {
              aggregations: {
                where: { period: queryDto.aggregation as any },
                orderBy: { startTime: "desc" },
                take: 1,
              },
            }
          : undefined,
      }),
      this.prisma.metric.count({ where }),
    ]);

    return {
      data: metrics,
      total,
      limit: queryDto.limit,
      offset: queryDto.offset,
    };
  }

  async getMetricsByCategory(category: MetricCategory, limit = 100) {
    return this.prisma.metric.findMany({
      where: { category: category as any },
      orderBy: { timestamp: "desc" },
      take: limit,
    });
  }

  async getMetricTrends(name: string, period: AggregationPeriod, days = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    return this.prisma.metricAggregation.findMany({
      where: {
        metric: { name },
        period,
        startTime: { gte: startDate },
      },
      orderBy: { startTime: "asc" },
      include: { metric: true },
    });
  }

  private isCriticalMetric(category: MetricCategory, name: string): boolean {
    const criticalMetrics = {
      [MetricCategory.SALES]: ["total_revenue", "order_count"],
      [MetricCategory.OPERATIONAL]: ["system_errors", "response_time"],
      [MetricCategory.FINANCIAL]: ["payment_failures", "transaction_volume"],
    };

    return criticalMetrics[category]?.includes(name) || false;
  }

  private async triggerRealTimeAggregation(metricId: string) {
    this.logger.log(`Triggering real-time aggregation for metric: ${metricId}`);
  }

  // @Cron(CronExpression.EVERY_DAY_AT_2AM)
  async cleanupOldMetrics() {
    const retentionDays = 365;
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

    try {
      const result = await this.prisma.metric.deleteMany({
        where: {
          timestamp: { lt: cutoffDate },
          category: { notIn: [MetricCategory.FINANCIAL] },
        },
      });

      this.logger.log(`Cleaned up ${result.count} old metrics`);
    } catch (error) {
      this.logger.error(
        `Failed to cleanup old metrics: ${error.message}`,
        error.stack
      );
    }
  }
}
