import { Injectable, Logger } from '@nestjs/common';
import { ReportFormat } from '../types/enums';

@Injectable()
export class ExportService {
  private readonly logger = new Logger(ExportService.name);

  async exportToFormat(data: any[], format: ReportFormat): Promise<Buffer> {
    switch (format) {
      case ReportFormat.JSON:
        return this.exportToJson(data);
      case ReportFormat.CSV:
        return this.exportToCsv(data);
      default:
        throw new Error(`Unsupported export format: ${format}`);
    }
  }

  private async exportToJson(data: any[]): Promise<Buffer> {
    return Buffer.from(JSON.stringify(data, null, 2));
  }

  private async exportToCsv(data: any[]): Promise<Buffer> {
    if (data.length === 0) return Buffer.from('');
    
    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(','),
      ...data.map(row => headers.map(header => row[header] || '').join(','))
    ].join('\n');
    
    return Buffer.from(csvContent);
  }

  async exportReport(data: any[], format: ReportFormat): Promise<Buffer> {
    return this.exportToFormat(data, format);
  }
}