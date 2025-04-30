import { Injectable } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";
import { PrismaService } from "../../prisma/prisma.service";
import { AnalyticsService } from "./analytics.service";
import { DataProcessingService } from "./data-processing.service";

@Injectable()
export class ReportingService {
  constructor(
    private prisma: PrismaService,
    private analyticsService: AnalyticsService,
    private dataProcessingService: DataProcessingService
  ) {}

  async generateReport(
    metricIds: string[],
    startTime: Date,
    endTime: Date,
    format: "json" | "csv" | "pdf" = "json"
  ): Promise<any> {
    const metrics = await this.prisma.metric.findMany({
      where: {
        id: {
          in: metricIds,
        },
      },
    });
    const reportData = await this.gatherReportData(metrics, startTime, endTime);
    return this.formatReport(reportData, format);
  }

  private async gatherReportData(
    metrics: any[],
    startTime: Date,
    endTime: Date
  ): Promise<any> {
    const reportData = {
      period: {
        start: startTime,
        end: endTime,
      },
      metrics: await Promise.all(
        metrics.map(async (metric) => {
          const [aggregations, trends] = await Promise.all([
            this.prisma.metricAggregation.findMany({
              where: {
                metricId: metric.id,
                startTime: {
                  gte: startTime,
                  lte: endTime,
                },
              },
              orderBy: {
                startTime: "asc",
              },
            }),
            this.analyticsService.getMetricTrends(
              metric.id,
              startTime,
              endTime,
              "1h"
            ),
          ]);

          return {
            metric: {
              id: metric.id,
              name: metric.name,
              description: metric.description,
              category: metric.category,
              unit: metric.unit,
            },
            aggregations,
            trends,
          };
        })
      ),
    };

    return reportData;
  }

  private formatReport(data: any, format: string): any {
    switch (format) {
      case "csv":
        return this.formatCSV(data);
      case "pdf":
        return this.formatPDF(data);
      default:
        return data;
    }
  }

  private formatCSV(data: any): string {
    const headers = [
      "Metric",
      "Category",
      "Unit",
      "Start Time",
      "End Time",
      "Value",
      "Trend",
    ];
    const rows = [];

    data.metrics.forEach((metricData: any) => {
      metricData.aggregations.forEach((agg: any) => {
        rows.push([
          metricData.metric.name,
          metricData.metric.category,
          metricData.metric.unit,
          agg.startTime,
          agg.endTime,
          agg.avg,
          metricData.trends.trend,
        ]);
      });
    });

    return [headers.join(","), ...rows.map((row: any[]) => row.join(","))].join(
      "\n"
    );
  }

  private formatPDF(data: any): Buffer {
    // Implement PDF generation logic here
    // This is a placeholder that should be replaced with actual PDF generation
    return Buffer.from(JSON.stringify(data));
  }

  @Cron(CronExpression.EVERY_HOUR)
  async generateHourlyReports() {
    const endTime = new Date();
    const startTime = new Date(endTime.getTime() - 60 * 60 * 1000); // 1 hour ago

    const metrics = await this.prisma.metric.findMany();
    await this.generateReport(
      metrics.map((m) => m.id),
      startTime,
      endTime,
      "json"
    );
  }

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async generateDailyReports() {
    const endTime = new Date();
    const startTime = new Date(endTime.getTime() - 24 * 60 * 60 * 1000); // 24 hours ago

    const metrics = await this.prisma.metric.findMany();
    await this.generateReport(
      metrics.map((m) => m.id),
      startTime,
      endTime,
      "pdf"
    );
  }
}
