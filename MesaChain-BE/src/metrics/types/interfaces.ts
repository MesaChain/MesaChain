export interface TrendAnalysis {
  trend: 'up' | 'down' | 'stable';
  percentageChange: number;
  changePercentage: number;
  period: string;
  prediction?: number;
  confidence?: number;
}

export interface AnalyticsResult {
  total: number;
  average: number;
  min: number;
  max: number;
  trend: TrendAnalysis;
  trends?: Record<string, TrendAnalysis>;
  summary?: any;
  insights?: string[];
  recommendations?: string[];
  data: any[];
}