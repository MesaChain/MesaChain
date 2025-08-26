import { Injectable, Logger, BadRequestException } from "@nestjs/common";
import { ReportFormat } from "../types/enums";
import * as ExcelJS from "exceljs";
import jsPDF from "jspdf";
import "jspdf-autotable";
import { PrismaService } from "../../prisma/prisma.service";
import { Prisma } from "@prisma/client";

@Injectable()
export class ExportService {
  private readonly logger = new Logger(ExportService.name);

  // Whitelist of allowed report queries for security
  private readonly allowedQueries = new Map<string, string>([
    [
      "user_metrics",
      "SELECT * FROM metrics WHERE category = $1 AND timestamp >= $2",
    ],
    [
      "reservation_stats",
      "SELECT COUNT(*) as count, status FROM reservations WHERE created_at >= $1 GROUP BY status",
    ],
    [
      "order_summary",
      "SELECT COUNT(*) as orders, SUM(total) as revenue FROM orders WHERE created_at >= $1",
    ],
    [
      "table_utilization",
      "SELECT t.name, COUNT(r.id) as reservations FROM tables t LEFT JOIN reservations r ON t.id = r.table_id WHERE r.created_at >= $1 GROUP BY t.id, t.name",
    ],
  ]);

  constructor(private prisma: PrismaService) {}

  async exportReport(reportId: string, format: ReportFormat): Promise<Buffer> {
    const report = await this.prisma.report.findUnique({
      where: { id: reportId },
      include: {
        executions: {
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
    });

    if (!report) {
      throw new Error("Report not found");
    }

    const data = await this.executeReportQuery(report.query, report.parameters);

    switch (format) {
      case ReportFormat.PDF:
        return this.generatePDF(report.name, data);
      case ReportFormat.EXCEL:
        return this.generateExcel(report.name, data);
      case ReportFormat.CSV:
        return this.generateCSV(data);
      case ReportFormat.JSON:
        return Buffer.from(JSON.stringify(data, null, 2));
      default:
        throw new Error(`Unsupported format: ${format}`);
    }
  }

  private async executeReportQuery(
    queryKey: string,
    parameters: any
  ): Promise<any[]> {
    try {
      const allowedQuery = this.allowedQueries.get(queryKey);
      if (!allowedQuery) {
        throw new BadRequestException(`Invalid query key: ${queryKey}`);
      }

      const paramValues = Object.values(parameters || {});
      if (paramValues.some((param) => param == null)) {
        throw new BadRequestException("All query parameters must be provided");
      }

      // Use $queryRawUnsafe instead of Prisma.sql
      const queryResult = await this.prisma.$queryRawUnsafe(
        allowedQuery,
        ...paramValues
      );

      this.logger.debug(
        `Executed report query: ${queryKey} with ${paramValues.length} parameters`
      );
      return queryResult as any[];
    } catch (error) {
      this.logger.error(`Query execution failed for ${queryKey}:`, error);
      throw new Error("Failed to execute report query");
    }
  }

  private async executeCustomQuery(
    query: string,
    parameters: any[]
  ): Promise<any[]> {
    try {
      const sanitizedQuery = this.sanitizeQuery(query);

      const customResult = await this.prisma.$queryRawUnsafe(
        sanitizedQuery,
        ...parameters
      );

      return customResult as any[];
    } catch (error) {
      this.logger.error("Custom query execution failed:", error);
      throw new Error("Failed to execute custom query");
    }
  }

  private sanitizeQuery(query: string): string {
    // Basic query sanitization
    const forbidden = [
      "DROP",
      "DELETE",
      "UPDATE",
      "INSERT",
      "ALTER",
      "CREATE",
      "TRUNCATE",
    ];
    const upperQuery = query.toUpperCase();

    for (const keyword of forbidden) {
      if (upperQuery.includes(keyword)) {
        throw new BadRequestException(`Forbidden SQL keyword: ${keyword}`);
      }
    }

    return query;
  }

  private async generateCSV(data: any[]): Promise<Buffer> {
    if (data.length === 0) {
      return Buffer.from("");
    }

    const columns = Object.keys(data[0]);
    const header = columns.map((col) => this.escapeCsvValue(col)).join(",");

    const rows = data.map((row) =>
      columns
        .map((col) => {
          const value = row[col];
          return this.escapeCsvValue(value);
        })
        .join(",")
    );

    const csv = [header, ...rows].join("\n");
    return Buffer.from(csv, "utf8");
  }

  private escapeCsvValue(value: any): string {
    // Handle null/undefined
    if (value == null) return "";

    // Convert to string
    const strValue = String(value);

    // Check for special characters that need escaping
    if (
      strValue.includes('"') ||
      strValue.includes(",") ||
      strValue.includes("\n") ||
      strValue.includes("\r")
    ) {
      // Escape quotes by doubling them and wrap in quotes
      return `"${strValue.replace(/"/g, '""')}"`;
    }

    return strValue;
  }

  private async generatePDF(title: string, data: any[]): Promise<Buffer> {
    const doc = new jsPDF();

    // Add title
    doc.setFontSize(16);
    doc.text(title, 20, 20);

    // Add timestamp
    doc.setFontSize(10);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 20, 30);

    if (data.length > 0) {
      const columns = Object.keys(data[0]);
      const rows = data.map((row) => columns.map((col) => row[col]));

      (doc as any).autoTable({
        head: [columns],
        body: rows,
        startY: 40,
        styles: { fontSize: 8 },
        headStyles: { fillColor: [66, 139, 202] },
      });
    }

    return Buffer.from(doc.output("arraybuffer"));
  }

  private async generateExcel(title: string, data: any[]): Promise<Buffer> {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet(title);

    // Add title
    worksheet.addRow([title]);
    worksheet.addRow([`Generated: ${new Date().toLocaleString()}`]);
    worksheet.addRow([]); // Empty row

    if (data.length > 0) {
      const columns = Object.keys(data[0]);

      // Add headers
      const headerRow = worksheet.addRow(columns);
      headerRow.font = { bold: true };
      headerRow.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FF428BCA" },
      };

      // Add data
      data.forEach((row) => {
        worksheet.addRow(columns.map((col) => row[col]));
      });

      // Auto-fit columns
      worksheet.columns.forEach((column) => {
        column.width = 15;
      });
    }

    return Buffer.from(await workbook.xlsx.writeBuffer());
  }
}
