import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class MetricsService {
  constructor(private prisma: PrismaService) {}

  async createMetric(data: {
    name: string;
    description: string;
    category: string;
    metadata: Record<string, any>;
    unit: string;
    dataType: string;
  }) {
    return await this.prisma.metric.create({
      data,
    });
  }

  async recordTimeSeriesData(data: {
    metricId: string;
    timestamp: Date;
    value: number;
    tags?: Record<string, any>;
  }) {
    return await this.prisma.timeSeriesData.create({
      data,
    });
  }

  async getMetricsByTimeRange(
    metricId: string,
    startTime: Date,
    endTime: Date
  ) {
    return await this.prisma.timeSeriesData.findMany({
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
  }

  async createAggregation(data: {
    metricId: string;
    startTime: Date;
    endTime: Date;
    interval: string;
    min: number;
    max: number;
    avg: number;
    sum: number;
    count: number;
    tags?: Record<string, any>;
  }) {
    return await this.prisma.metricAggregation.create({
      data,
    });
  }

  async getAggregations(
    metricId: string,
    interval: string,
    startTime: Date,
    endTime: Date
  ) {
    return await this.prisma.metricAggregation.findMany({
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
  }

  async searchMetrics(query: string) {
    return await this.prisma.metric.findMany({
      where: {
        OR: [
          {
            name: {
              contains: query,
              mode: "insensitive",
            },
          },
          {
            description: {
              contains: query,
              mode: "insensitive",
            },
          },
        ],
      },
    });
  }
}
