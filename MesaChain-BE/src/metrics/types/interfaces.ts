export interface TrendAnalysis {
  trend: "increasing" | "decreasing" | "stable";
  changePercentage: number;
  prediction: number;
  confidence: number;
}

export interface AnalyticsResult {
  summary: {
    totalMetrics: number;
    categoriesCount: Record<string, number>;
    averageValue: number;
    topPerformers: any[];
  };
  trends: Record<string, TrendAnalysis>;
  insights: string[];
  recommendations: string[];
}

export interface PredictiveAnalyticsResult {
  metric_name: string;
  prediction_period: number;
  predictions: Array<{
    day: number;
    predicted_value: number;
    confidence: number;
  }>;
  model_info: {
    type: string;
    window_size: number;
    data_points_used: number;
  };
}
