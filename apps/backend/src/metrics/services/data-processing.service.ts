import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";

@Injectable()
export class DataProcessingService {
  constructor(private prisma: PrismaService) {}

  async processTimeSeriesData(
    metricId: string,
    startTime: Date,
    endTime: Date,
    interval: string
  ): Promise<void> {
    const timeSeriesData = await this.prisma.timeSeriesData.findMany({
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

    const aggregations = this.calculateAggregations(timeSeriesData, interval);
    await this.saveAggregations(aggregations);
  }

  private calculateAggregations(
    timeSeriesData: any[],
    interval: string
  ): any[] {
    const aggregations: any[] = [];
    let currentInterval: any[] = [];
    let intervalStart = timeSeriesData[0]?.timestamp;

    for (const data of timeSeriesData) {
      if (this.isNewInterval(data.timestamp, intervalStart, interval)) {
        if (currentInterval.length > 0) {
          aggregations.push(
            this.createAggregation(currentInterval, intervalStart)
          );
        }
        currentInterval = [data];
        intervalStart = data.timestamp;
      } else {
        currentInterval.push(data);
      }
    }

    if (currentInterval.length > 0) {
      aggregations.push(this.createAggregation(currentInterval, intervalStart));
    }

    return aggregations;
  }

  private createAggregation(intervalData: any[], startTime: Date): any {
    const values = intervalData.map((d) => d.value);
    return {
      metricId: intervalData[0].metricId,
      startTime,
      endTime: intervalData[intervalData.length - 1].timestamp,
      interval: this.calculateInterval(
        startTime,
        intervalData[intervalData.length - 1].timestamp
      ),
      min: Math.min(...values),
      max: Math.max(...values),
      avg: values.reduce((a, b) => a + b, 0) / values.length,
      sum: values.reduce((a, b) => a + b, 0),
      count: values.length,
      tags: intervalData[0].tags,
    };
  }

  private isNewInterval(
    currentTime: Date,
    intervalStart: Date,
    interval: string
  ): boolean {
    const intervalMs = this.parseInterval(interval);
    return currentTime.getTime() - intervalStart.getTime() >= intervalMs;
  }

  private parseInterval(interval: string): number {
    const value = parseInt(interval);
    if (interval.endsWith("m")) return value * 60 * 1000;
    if (interval.endsWith("h")) return value * 60 * 60 * 1000;
    if (interval.endsWith("d")) return value * 24 * 60 * 60 * 1000;
    return value * 1000;
  }

  private calculateInterval(startTime: Date, endTime: Date): string {
    const diffMs = endTime.getTime() - startTime.getTime();
    const diffMinutes = Math.floor(diffMs / (60 * 1000));
    if (diffMinutes < 60) return `${diffMinutes}m`;
    if (diffMinutes < 24 * 60) return `${Math.floor(diffMinutes / 60)}h`;
    return `${Math.floor(diffMinutes / (24 * 60))}d`;
  }

  private async saveAggregations(aggregations: any[]): Promise<void> {
    await this.prisma.metricAggregation.createMany({
      data: aggregations,
    });
  }
}
