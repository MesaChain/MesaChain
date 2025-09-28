import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../shared/prisma.service';
import { ExtendedPrismaClient } from '../../types/prisma-client-extended';

export interface AnalyticsTimeframe {
  startDate: Date;
  endDate: Date;
  period: 'hour' | 'day' | 'week' | 'month' | 'quarter' | 'year';
}

export interface FeedbackAnalytics {
  overview: {
    totalFeedback: number;
    openFeedback: number;
    resolvedFeedback: number;
    closedFeedback: number;
    averageResolutionTime: number;
    satisfactionScore: number;
  };
  trends: {
    daily: Array<{ date: string; count: number; resolved: number }>;
    weekly: Array<{ week: string; count: number; resolved: number }>;
    monthly: Array<{ month: string; count: number; resolved: number }>;
  };
  categories: Array<{
    category: string;
    count: number;
    percentage: number;
    avgResolutionTime: number;
  }>;
  priorities: Array<{
    priority: string;
    count: number;
    percentage: number;
    avgResolutionTime: number;
  }>;
  moderation: {
    totalModerated: number;
    approved: number;
    flagged: number;
    autoApproved: number;
    toxicityLevels: Array<{ level: string; count: number; percentage: number }>;
    spamDetected: number;
    spamPercentage: number;
  };
  performance: {
    avgResponseTime: number;
    resolutionRate: number;
    escalationRate: number;
    userSatisfaction: number;
  };
  insights: string[];
  recommendations: string[];
}

export interface ModerationAnalytics {
  totalAnalyzed: number;
  approvalRate: number;
  flagRate: number;
  toxicityBreakdown: {
    low: number;
    medium: number;
    high: number;
  };
  spamBreakdown: {
    detected: number;
    falsePositives: number;
    accuracy: number;
  };
  categoryAccuracy: Array<{
    category: string;
    correct: number;
    total: number;
    accuracy: number;
  }>;
  sentimentAnalysis: {
    positive: number;
    neutral: number;
    negative: number;
    avgScore: number;
  };
  confidenceDistribution: {
    high: number;
    medium: number;
    low: number;
  };
}

@Injectable()
export class AnalyticsService {
  private readonly logger = new Logger(AnalyticsService.name);

  constructor(private readonly prisma: PrismaService) {}

  private get prismaClient(): ExtendedPrismaClient {
    return this.prisma as unknown as ExtendedPrismaClient;
  }

  async getFeedbackAnalytics(timeframe: AnalyticsTimeframe): Promise<FeedbackAnalytics> {
    try {
      const { startDate, endDate, period } = timeframe;

      // Overview metrics
      const overview = await this.getOverviewMetrics(startDate, endDate);
      
      // Trend analysis
      const trends = await this.getTrendAnalysis(startDate, endDate, period);
      
      // Category breakdown
      const categories = await this.getCategoryBreakdown(startDate, endDate);
      
      // Priority breakdown
      const priorities = await this.getPriorityBreakdown(startDate, endDate);
      
      // Moderation metrics
      const moderation = await this.getModerationMetrics(startDate, endDate);
      
      // Performance metrics
      const performance = await this.getPerformanceMetrics(startDate, endDate);
      
      // Generate insights and recommendations
      const insights = this.generateInsights(overview, trends, categories, priorities, moderation, performance);
      const recommendations = this.generateRecommendations(overview, trends, categories, priorities, moderation, performance);

      return {
        overview,
        trends,
        categories,
        priorities,
        moderation,
        performance,
        insights,
        recommendations
      };
    } catch (error) {
      this.logger.error('Error generating feedback analytics:', error);
      throw error;
    }
  }

  async getModerationAnalytics(timeframe: AnalyticsTimeframe): Promise<ModerationAnalytics> {
    try {
      const { startDate, endDate } = timeframe;

      // Get moderation data from flagged feedback
      const flaggedFeedback = await this.prismaClient.feedback.findMany({
        where: {
          createdAt: {
            gte: startDate,
            lte: endDate
          },
          status: 'flagged'
        },
        select: {
          id: true,
          category: true,
          priority: true,
          notes: true,
          createdAt: true,
          updatedAt: true
        }
      });

      const totalAnalyzed = await this.prismaClient.feedback.count({
        where: {
          createdAt: {
            gte: startDate,
            lte: endDate
          }
        }
      });

      const approved = totalAnalyzed - flaggedFeedback.length;
      const approvalRate = totalAnalyzed > 0 ? (approved / totalAnalyzed) * 100 : 0;
      const flagRate = totalAnalyzed > 0 ? (flaggedFeedback.length / totalAnalyzed) * 100 : 0;

      // Analyze toxicity levels from notes
      const toxicityBreakdown = this.analyzeToxicityLevels(flaggedFeedback);
      
      // Analyze spam detection
      const spamBreakdown = this.analyzeSpamDetection(flaggedFeedback);
      
      // Category accuracy analysis
      const categoryAccuracy = await this.analyzeCategoryAccuracy(flaggedFeedback);
      
      // Sentiment analysis (mock data for now)
      const sentimentAnalysis = {
        positive: Math.floor(approved * 0.6),
        neutral: Math.floor(approved * 0.3),
        negative: Math.floor(approved * 0.1),
        avgScore: 0.4
      };

      // Confidence distribution (mock data)
      const confidenceDistribution = {
        high: Math.floor(totalAnalyzed * 0.7),
        medium: Math.floor(totalAnalyzed * 0.25),
        low: Math.floor(totalAnalyzed * 0.05)
      };

      return {
        totalAnalyzed,
        approvalRate,
        flagRate,
        toxicityBreakdown,
        spamBreakdown,
        categoryAccuracy,
        sentimentAnalysis,
        confidenceDistribution
      };
    } catch (error) {
      this.logger.error('Error generating moderation analytics:', error);
      throw error;
    }
  }

  private async getOverviewMetrics(startDate: Date, endDate: Date) {
    const [
      totalFeedback,
      openFeedback,
      resolvedFeedback,
      closedFeedback
    ] = await Promise.all([
      this.prismaClient.feedback.count({
        where: {
          createdAt: { gte: startDate, lte: endDate }
        }
      }),
      this.prismaClient.feedback.count({
        where: {
          createdAt: { gte: startDate, lte: endDate },
          status: 'open'
        }
      }),
      this.prismaClient.feedback.count({
        where: {
          createdAt: { gte: startDate, lte: endDate },
          status: 'resolved'
        }
      }),
      this.prismaClient.feedback.count({
        where: {
          createdAt: { gte: startDate, lte: endDate },
          status: 'closed'
        }
      })
    ]);

    // Calculate average resolution time
    const resolvedFeedbackWithTimes = await this.prismaClient.feedback.findMany({
      where: {
        createdAt: { gte: startDate, lte: endDate },
        status: { in: ['resolved', 'closed'] }
      },
      select: {
        createdAt: true,
        updatedAt: true
      }
    });

    const avgResolutionTime = resolvedFeedbackWithTimes.length > 0
      ? resolvedFeedbackWithTimes.reduce((sum, feedback) => {
          const resolutionTime = feedback.updatedAt.getTime() - feedback.createdAt.getTime();
          return sum + resolutionTime;
        }, 0) / resolvedFeedbackWithTimes.length / (1000 * 60 * 60 * 24) // Convert to days
      : 0;

    // Mock satisfaction score (would come from user ratings)
    const satisfactionScore = 4.2;

    return {
      totalFeedback,
      openFeedback,
      resolvedFeedback,
      closedFeedback,
      averageResolutionTime: Math.round(avgResolutionTime * 10) / 10,
      satisfactionScore
    };
  }

  private async getTrendAnalysis(startDate: Date, endDate: Date, period: string) {
    const feedback = await this.prismaClient.feedback.findMany({
      where: {
        createdAt: { gte: startDate, lte: endDate }
      },
      select: {
        createdAt: true,
        status: true
      },
      orderBy: { createdAt: 'asc' }
    });

    // Group by period
    const grouped = this.groupByPeriod(feedback, period);
    
    return {
      daily: grouped.daily,
      weekly: grouped.weekly,
      monthly: grouped.monthly
    };
  }

  private async getCategoryBreakdown(startDate: Date, endDate: Date) {
    const categories = await this.prismaClient.feedback.groupBy({
      by: ['category'],
      where: {
        createdAt: { gte: startDate, lte: endDate }
      },
      _count: { category: true }
    });

    const total = categories.reduce((sum, cat) => sum + cat._count.category, 0);

    return categories.map(cat => ({
      category: cat.category,
      count: cat._count.category,
      percentage: total > 0 ? Math.round((cat._count.category / total) * 100 * 10) / 10 : 0,
      avgResolutionTime: Math.random() * 5 + 1 // Mock data
    }));
  }

  private async getPriorityBreakdown(startDate: Date, endDate: Date) {
    const priorities = await this.prismaClient.feedback.groupBy({
      by: ['priority'],
      where: {
        createdAt: { gte: startDate, lte: endDate }
      },
      _count: { priority: true }
    });

    const total = priorities.reduce((sum, pri) => sum + pri._count.priority, 0);

    return priorities.map(pri => ({
      priority: pri.priority,
      count: pri._count.priority,
      percentage: total > 0 ? Math.round((pri._count.priority / total) * 100 * 10) / 10 : 0,
      avgResolutionTime: Math.random() * 3 + 0.5 // Mock data
    }));
  }

  private async getModerationMetrics(startDate: Date, endDate: Date) {
    const totalModerated = await this.prismaClient.feedback.count({
      where: {
        createdAt: { gte: startDate, lte: endDate }
      }
    });

    const flagged = await this.prismaClient.feedback.count({
      where: {
        createdAt: { gte: startDate, lte: endDate },
        status: 'flagged'
      }
    });

    const approved = totalModerated - flagged;
    const autoApproved = Math.floor(approved * 0.8); // Mock data

    // Mock toxicity levels
    const toxicityLevels = [
      { level: 'low', count: Math.floor(flagged * 0.6), percentage: 60 },
      { level: 'medium', count: Math.floor(flagged * 0.3), percentage: 30 },
      { level: 'high', count: Math.floor(flagged * 0.1), percentage: 10 }
    ];

    const spamDetected = Math.floor(flagged * 0.4);
    const spamPercentage = totalModerated > 0 ? Math.round((spamDetected / totalModerated) * 100 * 10) / 10 : 0;

    return {
      totalModerated,
      approved,
      flagged,
      autoApproved,
      toxicityLevels,
      spamDetected,
      spamPercentage
    };
  }

  private async getPerformanceMetrics(startDate: Date, endDate: Date) {
    // Mock performance metrics
    return {
      avgResponseTime: 2.5, // hours
      resolutionRate: 85.2, // percentage
      escalationRate: 12.8, // percentage
      userSatisfaction: 4.2 // out of 5
    };
  }

  private groupByPeriod(feedback: any[], period: string) {
    // Mock implementation - would group by actual time periods
    const daily = Array.from({ length: 7 }, (_, i) => ({
      date: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      count: Math.floor(Math.random() * 20) + 5,
      resolved: Math.floor(Math.random() * 15) + 3
    })).reverse();

    const weekly = Array.from({ length: 4 }, (_, i) => ({
      week: `Week ${i + 1}`,
      count: Math.floor(Math.random() * 100) + 20,
      resolved: Math.floor(Math.random() * 80) + 15
    }));

    const monthly = Array.from({ length: 6 }, (_, i) => ({
      month: new Date(Date.now() - i * 30 * 24 * 60 * 60 * 1000).toISOString().substring(0, 7),
      count: Math.floor(Math.random() * 500) + 100,
      resolved: Math.floor(Math.random() * 400) + 80
    })).reverse();

    return { daily, weekly, monthly };
  }

  private analyzeToxicityLevels(flaggedFeedback: any[]) {
    // Mock analysis based on flagged feedback
    const low = Math.floor(flaggedFeedback.length * 0.6);
    const medium = Math.floor(flaggedFeedback.length * 0.3);
    const high = flaggedFeedback.length - low - medium;

    return { low, medium, high };
  }

  private analyzeSpamDetection(flaggedFeedback: any[]) {
    const detected = Math.floor(flaggedFeedback.length * 0.4);
    const falsePositives = Math.floor(detected * 0.1);
    const accuracy = detected > 0 ? Math.round(((detected - falsePositives) / detected) * 100 * 10) / 10 : 100;

    return { detected, falsePositives, accuracy };
  }

  private async analyzeCategoryAccuracy(flaggedFeedback: any[]) {
    // Mock category accuracy analysis
    const categories = ['BUG_REPORT', 'FEATURE_REQUEST', 'COMPLAINT', 'COMPLIMENT', 'GENERAL'];
    
    return categories.map(category => ({
      category,
      correct: Math.floor(Math.random() * 20) + 10,
      total: Math.floor(Math.random() * 30) + 15,
      accuracy: Math.round(Math.random() * 30 + 70 * 10) / 10
    }));
  }

  private generateInsights(overview: any, trends: any, categories: any, priorities: any, moderation: any, performance: any): string[] {
    const insights: string[] = [];

    // Resolution insights
    if (overview.averageResolutionTime < 2) {
      insights.push('Excellent resolution time - feedback is being addressed quickly');
    } else if (overview.averageResolutionTime > 7) {
      insights.push('Resolution time is high - consider increasing support capacity');
    }

    // Trend insights
    const recentTrend = trends.daily.slice(-3);
    const isIncreasing = recentTrend.every((day: any, i: number) => 
      i === 0 || day.count >= recentTrend[i - 1].count
    );
    
    if (isIncreasing) {
      insights.push('Feedback volume is increasing - monitor for potential issues');
    }

    // Category insights
    const topCategory = categories[0];
    if (topCategory && topCategory.percentage > 40) {
      insights.push(`${topCategory.category} represents ${topCategory.percentage}% of feedback - focus area for improvement`);
    }

    // Moderation insights
    if (moderation.flagRate > 20) {
      insights.push('High flag rate detected - review moderation thresholds');
    }

    // Performance insights
    if (performance.resolutionRate < 80) {
      insights.push('Resolution rate below target - investigate bottlenecks');
    }

    return insights;
  }

  private generateRecommendations(overview: any, trends: any, categories: any, priorities: any, moderation: any, performance: any): string[] {
    const recommendations: string[] = [];

    // Resolution recommendations
    if (overview.averageResolutionTime > 5) {
      recommendations.push('Implement automated responses for common feedback types');
      recommendations.push('Add more support staff during peak hours');
    }

    // Category recommendations
    const bugReports = categories.find((cat: any) => cat.category === 'BUG_REPORT');
    if (bugReports && bugReports.percentage > 30) {
      recommendations.push('Prioritize bug fixes and quality assurance processes');
    }

    // Priority recommendations
    const urgentCount = priorities.find((pri: any) => pri.priority === 'urgent')?.count || 0;
    if (urgentCount > 10) {
      recommendations.push('Review urgent feedback patterns and implement preventive measures');
    }

    // Moderation recommendations
    if (moderation.spamPercentage > 15) {
      recommendations.push('Enhance spam detection algorithms');
    }

    // Performance recommendations
    if (performance.userSatisfaction < 4.0) {
      recommendations.push('Improve response quality and follow-up processes');
    }

    return recommendations;
  }

  async getRealTimeMetrics(): Promise<any> {
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    const [
      recentFeedback,
      recentResolved,
      activeModerators
    ] = await Promise.all([
      this.prismaClient.feedback.count({
        where: { createdAt: { gte: oneHourAgo } }
      }),
      this.prismaClient.feedback.count({
        where: { 
          updatedAt: { gte: oneHourAgo },
          status: { in: ['resolved', 'closed'] }
        }
      }),
      // Mock active moderators count
      Promise.resolve(3)
    ]);

    return {
      recentFeedback,
      recentResolved,
      activeModerators,
      timestamp: now.toISOString()
    };
  }
}

