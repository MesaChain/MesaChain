import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { Cache } from "cache-manager";

@Injectable()
export class AnalyticsService {
  constructor(
    private prisma: PrismaService,
    private cacheManager: Cache
  ) {}

  async getMetricTrends(
    metricId: string,
    startTime: Date,
    endTime: Date,
    interval: string
  ): Promise<any> {
    const cacheKey = `trends:${metricId}:${startTime.toISOString()}:${endTime.toISOString()}:${interval}`;
    const cachedResult = await this.cacheManager.get(cacheKey);
    if (cachedResult) {
      return cachedResult;
    }

    const aggregations = await this.prisma.metricAggregation.findMany({
      where: {
        metricId,
        interval,
        startTime: {
          gte: startTime,
          lte: endTime,
        },
      },
      orderBy: {
        startTime: "asc",
      },
    });

    const result = this.calculateTrends(aggregations);
    await this.cacheManager.set(cacheKey, result, 3600); // Cache for 1 hour
    return result;
  }

  private calculateTrends(aggregations: any[]): any {
    if (aggregations.length < 2) {
      return {
        trend: "insufficient_data",
        percentageChange: 0,
        volatility: 0,
      };
    }

    const firstValue = aggregations[0].avg;
    const lastValue = aggregations[aggregations.length - 1].avg;
    const percentageChange = ((lastValue - firstValue) / firstValue) * 100;

    const values = aggregations.map((a) => a.avg);
    const volatility = this.calculateVolatility(values);

    return {
      trend:
        percentageChange > 0 ? "up" : percentageChange < 0 ? "down" : "stable",
      percentageChange,
      volatility,
    };
  }

  private calculateVolatility(values: number[]): number {
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const squaredDiffs = values.map((v) => Math.pow(v - mean, 2));
    const variance = squaredDiffs.reduce((a, b) => a + b, 0) / values.length;
    return Math.sqrt(variance);
  }

  async getMetricCorrelations(
    metricIds: string[],
    startTime: Date,
    endTime: Date
  ): Promise<any> {
    const cacheKey = `correlations:${metricIds.join(",")}:${startTime.toISOString()}:${endTime.toISOString()}`;
    const cachedResult = await this.cacheManager.get(cacheKey);
    if (cachedResult) {
      return cachedResult;
    }

    const correlations = await this.calculateCorrelations(
      metricIds,
      startTime,
      endTime
    );
    await this.cacheManager.set(cacheKey, correlations, 3600);
    return correlations;
  }

  private async calculateCorrelations(
    metricIds: string[],
    startTime: Date,
    endTime: Date
  ): Promise<any> {
    const correlations: any = {};

    for (let i = 0; i < metricIds.length; i++) {
      for (let j = i + 1; j < metricIds.length; j++) {
        const [data1, data2] = await Promise.all([
          this.getMetricData(metricIds[i], startTime, endTime),
          this.getMetricData(metricIds[j], startTime, endTime),
        ]);

        const correlation = this.calculatePearsonCorrelation(data1, data2);
        correlations[`${metricIds[i]}_${metricIds[j]}`] = correlation;
      }
    }

    return correlations;
  }

  private async getMetricData(
    metricId: string,
    startTime: Date,
    endTime: Date
  ): Promise<number[]> {
    const data = await this.prisma.timeSeriesData.findMany({
      where: {
        metricId,
        timestamp: {
          gte: startTime,
          lte: endTime,
        },
      },
      orderBy: {
        timestamp: "asc",
      },
    });

    return data.map((d) => d.value);
  }

  private calculatePearsonCorrelation(
    data1: number[],
    data2: number[]
  ): number {
    const n = Math.min(data1.length, data2.length);
    if (n < 2) return 0;

    const mean1 = data1.reduce((a, b) => a + b, 0) / n;
    const mean2 = data2.reduce((a, b) => a + b, 0) / n;

    const variance1 = data1.reduce((a, b) => a + Math.pow(b - mean1, 2), 0);
    const variance2 = data2.reduce((a, b) => a + Math.pow(b - mean2, 2), 0);

    const covariance = data1.reduce((a, b, i) => {
      return a + (b - mean1) * (data2[i] - mean2);
    }, 0);

    return covariance / Math.sqrt(variance1 * variance2);
  }
}
