import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ChartDataService } from '../services/chart-data.service';
import { AnalyticsQueryDto } from '../dto/analytics.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { UserRole } from '../../interfaces/user.interface';

@Controller('charts')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ChartController {
  constructor(private readonly chartDataService: ChartDataService) {}

  @Get('category-distribution')
  @Roles(UserRole.ADMIN, UserRole.MODERATOR, UserRole.STAFF)
  async getCategoryDistributionChart(@Query() query: AnalyticsQueryDto) {
    const startDate = query.startDate ? new Date(query.startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const endDate = query.endDate ? new Date(query.endDate) : new Date();
    
    return await this.chartDataService.getCategoryDistributionChart(startDate, endDate);
  }

  @Get('priority-distribution')
  @Roles(UserRole.ADMIN, UserRole.MODERATOR, UserRole.STAFF)
  async getPriorityDistributionChart(@Query() query: AnalyticsQueryDto) {
    const startDate = query.startDate ? new Date(query.startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const endDate = query.endDate ? new Date(query.endDate) : new Date();
    
    return await this.chartDataService.getPriorityDistributionChart(startDate, endDate);
  }

  @Get('status-distribution')
  @Roles(UserRole.ADMIN, UserRole.MODERATOR, UserRole.STAFF)
  async getStatusDistributionChart(@Query() query: AnalyticsQueryDto) {
    const startDate = query.startDate ? new Date(query.startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const endDate = query.endDate ? new Date(query.endDate) : new Date();
    
    return await this.chartDataService.getStatusDistributionChart(startDate, endDate);
  }

  @Get('trend')
  @Roles(UserRole.ADMIN, UserRole.MODERATOR, UserRole.STAFF)
  async getTrendChart(@Query() query: AnalyticsQueryDto) {
    const startDate = query.startDate ? new Date(query.startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const endDate = query.endDate ? new Date(query.endDate) : new Date();
    const period = (query.period as 'day' | 'week' | 'month') || 'day';
    
    return await this.chartDataService.getTrendChart(startDate, endDate, period);
  }

  @Get('moderation-effectiveness')
  @Roles(UserRole.ADMIN, UserRole.MODERATOR)
  async getModerationEffectivenessChart(@Query() query: AnalyticsQueryDto) {
    const startDate = query.startDate ? new Date(query.startDate) : new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const endDate = query.endDate ? new Date(query.endDate) : new Date();
    
    return await this.chartDataService.getModerationEffectivenessChart(startDate, endDate);
  }

  @Get('resolution-time')
  @Roles(UserRole.ADMIN, UserRole.MODERATOR, UserRole.STAFF)
  async getResolutionTimeChart(@Query() query: AnalyticsQueryDto) {
    const startDate = query.startDate ? new Date(query.startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const endDate = query.endDate ? new Date(query.endDate) : new Date();
    
    return await this.chartDataService.getResolutionTimeChart(startDate, endDate);
  }

  @Get('satisfaction-trend')
  @Roles(UserRole.ADMIN, UserRole.MODERATOR, UserRole.STAFF)
  async getSatisfactionTrendChart(@Query() query: AnalyticsQueryDto) {
    const startDate = query.startDate ? new Date(query.startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const endDate = query.endDate ? new Date(query.endDate) : new Date();
    
    return await this.chartDataService.getSatisfactionTrendChart(startDate, endDate);
  }

  @Get('dashboard-charts')
  @Roles(UserRole.ADMIN, UserRole.MODERATOR, UserRole.STAFF)
  async getDashboardCharts(@Query() query: AnalyticsQueryDto) {
    const startDate = query.startDate ? new Date(query.startDate) : new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const endDate = query.endDate ? new Date(query.endDate) : new Date();
    const period = (query.period as 'day' | 'week' | 'month') || 'day';

    const [
      categoryDistribution,
      priorityDistribution,
      statusDistribution,
      trendChart,
      moderationEffectiveness,
      resolutionTime,
      satisfactionTrend
    ] = await Promise.all([
      this.chartDataService.getCategoryDistributionChart(startDate, endDate),
      this.chartDataService.getPriorityDistributionChart(startDate, endDate),
      this.chartDataService.getStatusDistributionChart(startDate, endDate),
      this.chartDataService.getTrendChart(startDate, endDate, period),
      this.chartDataService.getModerationEffectivenessChart(startDate, endDate),
      this.chartDataService.getResolutionTimeChart(startDate, endDate),
      this.chartDataService.getSatisfactionTrendChart(startDate, endDate)
    ]);

    return {
      categoryDistribution,
      priorityDistribution,
      statusDistribution,
      trendChart,
      moderationEffectiveness,
      resolutionTime,
      satisfactionTrend,
      timeframe: {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        period
      }
    };
  }
}

