import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AggregationPeriod } from './types/enums';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class MetricsAggregationService {
  private readonly logger = new Logger(MetricsAggregationService.name);

  constructor(private prisma: PrismaService) {}

  async aggregateMetrics(period: AggregationPeriod) {
    this.logger.log(`Aggregating metrics for period: ${period}`);
    
    try {
      const { startTime, endTime } = this.getPeriodRange(period);
      
      // Get all unique metric names for the period
      const uniqueMetrics = await this.prisma.metric.findMany({
        where: {
          timestamp: {
            gte: startTime,
            lt: endTime,
          },
        },
        select: {
          name: true,
          category: true,
        },
        distinct: ['name'],
      });

      for (const metricInfo of uniqueMetrics) {
        await this.aggregateMetricByName(metricInfo.name, period, startTime, endTime);
      }

      this.logger.log(`Completed aggregation for ${uniqueMetrics.length} metrics in period ${period}`);
    } catch (error) {
      this.logger.error(`Failed to aggregate metrics for period ${period}: ${error.message}`);
    }
  }

  private async aggregateMetricByName(
    metricName: string,
    period: AggregationPeriod,
    startTime: Date,
    endTime: Date
  ) {
    try {
      // Check if aggregation already exists
      const existingAggregation = await this.prisma.metricAggregation.findFirst({
        where: {
          metric: { name: metricName },
          period,
          startTime,
          endTime,
        },
      });

      if (existingAggregation) {
        this.logger.debug(`Aggregation already exists for ${metricName} in period ${period}`);
        return;
      }

      // Get all metrics for this name in the time period
      const metrics = await this.prisma.metric.findMany({
        where: {
          name: metricName,
          timestamp: {
            gte: startTime,
            lt: endTime,
          },
        },
        orderBy: { timestamp: 'asc' },
      });

      if (metrics.length === 0) {
        return;
      }

      // Calculate aggregations
      const values = metrics.map(m => m.value);
      const sum = values.reduce((a, b) => a + b, 0);
      const count = values.length;
      const avg = sum / count;
      const min = Math.min(...values);
      const max = Math.max(...values);
      
      // Calculate standard deviation
      const variance = values.reduce((acc, val) => acc + Math.pow(val - avg, 2), 0) / count;
      const stdDev = Math.sqrt(variance);

      // Create aggregation record
      await this.prisma.metricAggregation.create({
        data: {
          metricId: metrics[0].id, // Use first metric's ID for reference
          period,
          startTime,
          endTime,
          value: avg, // Use average as the main value
          count,
          min,
          max,
          avg,
          sum,
          stdDev,
        },
      });

      this.logger.debug(`Created aggregation for ${metricName}: count=${count}, avg=${avg.toFixed(2)}, min=${min}, max=${max}`);
    } catch (error) {
      this.logger.error(`Failed to aggregate metric ${metricName}: ${error.message}`);
    }
  }

  private getPeriodRange(period: AggregationPeriod): { startTime: Date; endTime: Date } {
    const now = new Date();
    let startTime: Date;
    let endTime: Date;

    switch (period) {
      case AggregationPeriod.HOURLY:
        startTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours() - 1);
        endTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours());
        break;

      case AggregationPeriod.DAILY:
        startTime = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
        endTime = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        break;

      case AggregationPeriod.WEEKLY:
        const dayOfWeek = now.getDay();
        startTime = new Date(now.getFullYear(), now.getMonth(), now.getDate() - dayOfWeek - 7);
        endTime = new Date(now.getFullYear(), now.getMonth(), now.getDate() - dayOfWeek);
        break;

      case AggregationPeriod.MONTHLY:
        startTime = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        endTime = new Date(now.getFullYear(), now.getMonth(), 1);
        break;

      case AggregationPeriod.QUARTERLY:
        const quarter = Math.floor(now.getMonth() / 3);
        startTime = new Date(now.getFullYear(), (quarter - 1) * 3, 1);
        endTime = new Date(now.getFullYear(), quarter * 3, 1);
        break;

      case AggregationPeriod.YEARLY:
        startTime = new Date(now.getFullYear() - 1, 0, 1);
        endTime = new Date(now.getFullYear(), 0, 1);
        break;

      default:
        throw new Error(`Unsupported aggregation period: ${period}`);
    }

    return { startTime, endTime };
  }

  @Cron(CronExpression.EVERY_HOUR)
  async hourlyAggregation() {
    await this.aggregateMetrics(AggregationPeriod.HOURLY);
  }

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async dailyAggregation() {
    await this.aggregateMetrics(AggregationPeriod.DAILY);
  }

  @Cron('0 0 * * 1') // Every Monday at midnight
  async weeklyAggregation() {
    await this.aggregateMetrics(AggregationPeriod.WEEKLY);
  }

  @Cron('0 0 1 * *') // First day of every month at midnight
  async monthlyAggregation() {
    await this.aggregateMetrics(AggregationPeriod.MONTHLY);
  }

  @Cron('0 0 1 1,4,7,10 *') // First day of quarters
  async quarterlyAggregation() {
    await this.aggregateMetrics(AggregationPeriod.QUARTERLY);
  }

  @Cron('0 0 1 1 *') // January 1st at midnight
  async yearlyAggregation() {
    await this.aggregateMetrics(AggregationPeriod.YEARLY);
  }

  // Manual aggregation for specific periods
  async aggregateForDateRange(
    metricName: string,
    period: AggregationPeriod,
    startDate: Date,
    endDate: Date
  ) {
    try {
      await this.aggregateMetricByName(metricName, period, startDate, endDate);
      this.logger.log(`Manual aggregation completed for ${metricName} from ${startDate} to ${endDate}`);
    } catch (error) {
      this.logger.error(`Manual aggregation failed: ${error.message}`);
      throw error;
    }
  }

  // Clean up old aggregations based on retention policy
  @Cron('0 2 * * *') // Daily at 2 AM
  async cleanupOldAggregations() {
    try {
      const retentionPeriods = {
        [AggregationPeriod.HOURLY]: 30, // Keep 30 days
        [AggregationPeriod.DAILY]: 365, // Keep 1 year
        [AggregationPeriod.WEEKLY]: 730, // Keep 2 years
        [AggregationPeriod.MONTHLY]: 1095, // Keep 3 years
        [AggregationPeriod.QUARTERLY]: 1825, // Keep 5 years
        [AggregationPeriod.YEARLY]: 3650, // Keep 10 years
      };

      for (const [period, days] of Object.entries(retentionPeriods)) {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - days);

        const deleted = await this.prisma.metricAggregation.deleteMany({
          where: {
            period: period as AggregationPeriod,
            createdAt: { lt: cutoffDate },
          },
        });

        if (deleted.count > 0) {
          this.logger.log(`Cleaned up ${deleted.count} old ${period} aggregations`);
        }
      }
    } catch (error) {
      this.logger.error(`Failed to cleanup old aggregations: ${error.message}`);
    }
  }
}