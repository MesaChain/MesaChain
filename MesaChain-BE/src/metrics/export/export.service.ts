import { Injectable, Logger } from '@nestjs/common';
import { ReportFormat } from '../types/enums';
import * as ExcelJS from 'exceljs';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class ExportService {
  private readonly logger = new Logger(ExportService.name);

  constructor(private prisma: PrismaService) {}

  async exportReport(reportId: string, format: ReportFormat): Promise<Buffer> {
    const report = await this.prisma.report.findUnique({
      where: { id: reportId },
      include: {
        executions: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    });

    if (!report) {
      throw new Error('Report not found');
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

  private async executeReportQuery(query: string, parameters: any): Promise<any[]> {
    // Execute the report query with parameters
    // This is a simplified implementation - you'd want proper query building
    return this.prisma.$queryRawUnsafe(query, ...Object.values(parameters || {}));
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
      const rows = data.map(row => columns.map(col => row[col]));
      
      (doc as any).autoTable({
        head: [columns],
        body: rows,
        startY: 40,
        styles: { fontSize: 8 },
        headStyles: { fillColor: [66, 139, 202] },
      });
    }
    
    return Buffer.from(doc.output('arraybuffer'));
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
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF428BCA' },
      };
      
      // Add data
      data.forEach(row => {
        worksheet.addRow(columns.map(col => row[col]));
      });
      
      // Auto-fit columns
      worksheet.columns.forEach(column => {
        column.width = 15;
      });
    }
    
    return Buffer.from(await workbook.xlsx.writeBuffer());
  }

  private async generateCSV(data: any[]): Promise<Buffer> {
    if (data.length === 0) {
      return Buffer.from('');
    }
    
    const columns = Object.keys(data[0]);
    const header = columns.join(',');
    const rows = data.map(row => 
      columns.map(col => {
        const value = row[col];
        return typeof value === 'string' && value.includes(',') 
          ? `"${value}"` 
          : value;
      }).join(',')
    );
    
    const csv = [header, ...rows].join('\n');
    return Buffer.from(csv);
  }
}