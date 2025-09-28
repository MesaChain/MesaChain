import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AnalyticsService } from '../services/analytics.service';
import { AnalyticsQueryDto, FeedbackAnalyticsDto, ModerationAnalyticsDto, RealTimeMetricsDto } from '../dto/analytics.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { UserRole } from '../../interfaces/user.interface';

@Controller('analytics')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('feedback')
  @Roles(UserRole.ADMIN, UserRole.MODERATOR, UserRole.STAFF)
  async getFeedbackAnalytics(@Query() query: AnalyticsQueryDto): Promise<FeedbackAnalyticsDto> {
    const startDate = query.startDate ? new Date(query.startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const endDate = query.endDate ? new Date(query.endDate) : new Date();
    
    return await this.analyticsService.getFeedbackAnalytics({
      startDate,
      endDate,
      period: query.period || 'day'
    });
  }

  @Get('moderation')
  @Roles(UserRole.ADMIN, UserRole.MODERATOR)
  async getModerationAnalytics(@Query() query: AnalyticsQueryDto): Promise<ModerationAnalyticsDto> {
    const startDate = query.startDate ? new Date(query.startDate) : new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const endDate = query.endDate ? new Date(query.endDate) : new Date();
    
    return await this.analyticsService.getModerationAnalytics({
      startDate,
      endDate,
      period: query.period || 'day'
    });
  }

  @Get('realtime')
  @Roles(UserRole.ADMIN, UserRole.MODERATOR, UserRole.STAFF)
  async getRealTimeMetrics(): Promise<RealTimeMetricsDto> {
    return await this.analyticsService.getRealTimeMetrics();
  }

  @Get('dashboard')
  @Roles(UserRole.ADMIN, UserRole.MODERATOR, UserRole.STAFF)
  async getDashboardData(@Query() query: AnalyticsQueryDto) {
    const startDate = query.startDate ? new Date(query.startDate) : new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const endDate = query.endDate ? new Date(query.endDate) : new Date();
    
    const [feedbackAnalytics, moderationAnalytics, realTimeMetrics] = await Promise.all([
      this.analyticsService.getFeedbackAnalytics({
        startDate,
        endDate,
        period: query.period || 'day'
      }),
      this.analyticsService.getModerationAnalytics({
        startDate,
        endDate,
        period: query.period || 'day'
      }),
      this.analyticsService.getRealTimeMetrics()
    ]);

    return {
      feedback: feedbackAnalytics,
      moderation: moderationAnalytics,
      realTime: realTimeMetrics,
      timeframe: {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        period: query.period || 'day'
      }
    };
  }

  @Get('export')
  @Roles(UserRole.ADMIN, UserRole.MODERATOR)
  async exportAnalytics(@Query() query: AnalyticsQueryDto) {
    const startDate = query.startDate ? new Date(query.startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const endDate = query.endDate ? new Date(query.endDate) : new Date();
    
    const analytics = await this.analyticsService.getFeedbackAnalytics({
      startDate,
      endDate,
      period: query.period || 'day'
    });

    // Generate CSV format
    const csvData = this.generateCSV(analytics);
    
    return {
      data: csvData,
      filename: `feedback-analytics-${startDate.toISOString().split('T')[0]}-to-${endDate.toISOString().split('T')[0]}.csv`,
      contentType: 'text/csv'
    };
  }

  private generateCSV(analytics: FeedbackAnalyticsDto): string {
    const headers = [
      'Metric',
      'Value',
      'Category',
      'Priority',
      'Resolution Time',
      'Satisfaction Score'
    ];

    const rows = [
      ['Total Feedback', analytics.overview.totalFeedback, '', '', '', ''],
      ['Open Feedback', analytics.overview.openFeedback, '', '', '', ''],
      ['Resolved Feedback', analytics.overview.resolvedFeedback, '', '', '', ''],
      ['Closed Feedback', analytics.overview.closedFeedback, '', '', '', ''],
      ['Avg Resolution Time', analytics.overview.averageResolutionTime, '', '', '', ''],
      ['Satisfaction Score', analytics.overview.satisfactionScore, '', '', '', ''],
      ['', '', '', '', '', ''],
      ['Category Breakdown', '', '', '', '', ''],
      ...analytics.categories.map(cat => [
        '',
        cat.count,
        cat.category,
        '',
        cat.avgResolutionTime,
        ''
      ]),
      ['', '', '', '', '', ''],
      ['Priority Breakdown', '', '', '', '', ''],
      ...analytics.priorities.map(pri => [
        '',
        pri.count,
        '',
        pri.priority,
        pri.avgResolutionTime,
        ''
      ])
    ];

    const csvContent = [headers, ...rows]
      .map(row =>
        row
          .map(cell => {
            const normalized = cell ?? '';
            const text = String(normalized).replace(/"/g, '""');
            return `"${text}"`;
          })
          .join(',')
      )
      .join('\n');

    return csvContent;
  }
}

