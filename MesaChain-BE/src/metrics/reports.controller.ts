import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('reports')
@UseGuards(JwtAuthGuard)
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Post()
  async createReport(@Body() createReportDto: any) {
    return this.reportsService.createReport(createReportDto);
  }

  @Post(':id/generate')
  async generateReport(@Param('id') id: string) {
    return this.reportsService.generateReport(id);
  }
}