import { Injectable, Logger } from "@nestjs/common";
import { PrismaService } from "../shared/prisma.service";
import { Cron, CronExpression } from "@nestjs/schedule";
import { ExportService } from "./export/export.service";
import { MetricsCacheService } from "./cache/cache.service";
import { CreateReportDto } from "./dto/create-report.dto";
import { ReportExecutionStatus, ReportFormat } from "./types/enums";

@Injectable()
export class ReportsService {
  private readonly logger = new Logger(ReportsService.name);

  constructor(
    private prisma: PrismaService,
    private exportService: ExportService,
    private cacheService: MetricsCacheService
  ) {}

  async createReport(createReportDto: CreateReportDto, userId?: string) {
    const report = await this.prisma.report.create({
      data: {
        ...createReportDto,
        parameters: createReportDto.parameters || {},
        createdBy: userId || 'system', // Use system as default creator
      },
    });

    this.logger.log(`Created report: ${report.name} (${report.id})`);
    return report;
  }

  async generateReport(reportId: string): Promise<Buffer> {
    const report = await this.prisma.report.findUnique({
      where: { id: reportId },
    });

    if (!report) {
      throw new Error("Report not found");
    }

    if (!report.isActive) {
      throw new Error("Report is not active");
    }

    const execution = await this.prisma.reportExecution.create({
      data: {
        reportId,
        status: ReportExecutionStatus.RUNNING,
        startTime: new Date(),
        parameters: report.parameters,
      },
    });

    try {
      // Use exportReport instead of exportReportByKey
      const buffer = await this.exportService.exportReport(
        [], // Empty data array for now
        report.format as any
      );

      await this.prisma.reportExecution.update({
        where: { id: execution.id },
        data: {
          status: ReportExecutionStatus.COMPLETED,
          endTime: new Date(),
          fileSize: buffer.length,
        },
      });

      this.logger.log(`Generated report: ${report.name} (${reportId})`);
      return buffer;
    } catch (error) {
      await this.prisma.reportExecution.update({
        where: { id: execution.id },
        data: {
          status: ReportExecutionStatus.FAILED,
          endTime: new Date(),
          errorMessage: error.message,
        },
      });

      this.logger.error(
        `Failed to generate report ${reportId}: ${error.message}`
      );
      throw error;
    }
  }

  async getReports(page = 1, limit = 10) {
    const skip = (page - 1) * limit;

    const [reports, total] = await Promise.all([
      this.prisma.report.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          executions: {
            orderBy: { createdAt: "desc" },
            take: 1,
          },
        },
      }),
      this.prisma.report.count(),
    ]);

    return {
      data: reports,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async updateReport(id: string, updateData: Partial<CreateReportDto>) {
    const report = await this.prisma.report.update({
      where: { id },
      data: updateData,
    });

    // Invalidate cache
    await this.cacheService.invalidatePattern(`report:${id}:*`);

    return report;
  }

  async deleteReport(id: string) {
    await this.prisma.report.delete({
      where: { id },
    });

    // Invalidate cache
    await this.cacheService.invalidatePattern(`report:${id}:*`);

    this.logger.log(`Deleted report: ${id}`);
  }

  @Cron(CronExpression.EVERY_HOUR)
  async processScheduledReports() {
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();

    const batchSize = 100;
    let skip = 0;
    let hasMore = true;

    while (hasMore) {
      const scheduledReports = await this.prisma.report.findMany({
        where: {
          isActive: true,
          schedule: { not: null },
        },
        take: batchSize,
        skip,
      });

      hasMore = scheduledReports.length === batchSize;
      skip += batchSize;

      for (const report of scheduledReports) {
        if (this.shouldRunReport(report.schedule, currentHour, currentMinute)) {
          try {
            await this.generateReport(report.id);
            this.logger.log(`Executed scheduled report: ${report.name}`);
          } catch (error) {
            this.logger.error(
              `Failed to execute scheduled report ${report.name}:`,
              error
            );
          }
        }
      }
    }
  }

  private shouldRunReport(
    schedule: string,
    hour: number,
    minute: number
  ): boolean {
    // Simple cron-like scheduling implementation
    // Format: "0 9 * * *" (minute hour day month dayOfWeek)
    const parts = schedule.split(" ");
    if (parts.length !== 5) return false;

    const [scheduleMinute, scheduleHour] = parts;

    const matchesHour = scheduleHour === "*" || parseInt(scheduleHour) === hour;
    const matchesMinute =
      scheduleMinute === "*" || parseInt(scheduleMinute) === minute;

    return matchesHour && matchesMinute;
  }

  async getReportExecutions(reportId: string, page = 1, limit = 10) {
    const skip = (page - 1) * limit;

    const [executions, total] = await Promise.all([
      this.prisma.reportExecution.findMany({
        where: { reportId },
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      this.prisma.reportExecution.count({ where: { reportId } }),
    ]);

    return {
      data: executions,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }
}
