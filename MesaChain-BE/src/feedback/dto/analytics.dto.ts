import { IsOptional, IsEnum, IsDateString, IsString } from 'class-validator';
import { Transform } from 'class-transformer';

export enum AnalyticsPeriod {
  HOUR = 'hour',
  DAY = 'day',
  WEEK = 'week',
  MONTH = 'month',
  QUARTER = 'quarter',
  YEAR = 'year'
}

export class AnalyticsQueryDto {
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsEnum(AnalyticsPeriod)
  period?: AnalyticsPeriod = AnalyticsPeriod.DAY;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsString()
  priority?: string;
}

export class FeedbackAnalyticsDto {
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

export class ModerationAnalyticsDto {
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

export class RealTimeMetricsDto {
  recentFeedback: number;
  recentResolved: number;
  activeModerators: number;
  timestamp: string;
}

