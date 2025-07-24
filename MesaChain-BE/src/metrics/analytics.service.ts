import { Injectable, Logger } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { MetricCategory, AggregationPeriod } from "./types/enums";
import { TrendAnalysis, AnalyticsResult } from "./types/interfaces";  // Import from interfaces
import { MetricsCacheService } from "./cache/cache.service";


@Injectable()
export class AnalyticsService {
  private readonly logger = new Logger(AnalyticsService.name);

  constructor(
    private prisma: PrismaService,
    private cacheService: MetricsCacheService
  ) {}

  async getAnalytics(
    period: AggregationPeriod = AggregationPeriod.DAILY
  ): Promise<AnalyticsResult> {
    const cacheKey = this.cacheService.generateCacheKey("analytics", period);
    const cached = await this.cacheService.get<AnalyticsResult>(cacheKey);

    if (cached) {
      return cached;
    }

    const result = await this.generateAnalytics(period);
    await this.cacheService.set(cacheKey, result, 600); // Cache for 10 minutes

    return result;
  }

  private async generateAnalytics(
    period: AggregationPeriod
  ): Promise<AnalyticsResult> {
    const [summary, trends] = await Promise.all([
      this.generateSummary(),
      this.generateTrendAnalysis(period),
    ]);

    const insights = this.generateInsights(summary, trends);
    const recommendations = this.generateRecommendations(summary, trends);

    return {
      summary,
      trends,
      insights,
      recommendations,
    };
  }

  private async generateSummary() {
    const totalMetrics = await this.prisma.metric.count();

    const categoriesCount = await this.prisma.metric
      .groupBy({
        by: ["category"],
        _count: { category: true },
      })
      .then((results) =>
        results.reduce(
          (acc, item) => {
            acc[item.category] = item._count.category;
            return acc;
          },
          {} as Record<MetricCategory, number>
        )
      );

    const averageValue = await this.prisma.metric
      .aggregate({
        _avg: { value: true },
      })
      .then((result) => result._avg.value || 0);

    const topPerformers = await this.prisma.metric.findMany({
      orderBy: { value: "desc" },
      take: 10,
      select: {
        name: true,
        value: true,
        category: true,
        timestamp: true,
      },
    });

    return {
      totalMetrics,
      categoriesCount,
      averageValue,
      topPerformers,
    };
  }

  private async generateTrendAnalysis(
    period: AggregationPeriod
  ): Promise<Record<string, TrendAnalysis>> {
    const uniqueMetrics = await this.prisma.metric.findMany({
      select: { name: true },
      distinct: ["name"],
    });

    const trends: Record<string, TrendAnalysis> = {};

    for (const metric of uniqueMetrics) {
      const aggregations = await this.prisma.metricAggregation.findMany({
        where: {
          metric: { name: metric.name },
          period,
        },
        orderBy: { startTime: "desc" },
        take: 10,
      });

      if (aggregations.length >= 3) {
        trends[metric.name] = this.calculateTrend(aggregations);
      }
    }

    return trends;
  }

  private calculateTrend(aggregations: any[]): TrendAnalysis {
    const values = aggregations.map((a) => a.avg).reverse();
    const n = values.length;

    // Simple linear regression for trend calculation
    const sumX = (n * (n + 1)) / 2;
    const sumY = values.reduce((a, b) => a + b, 0);
    const sumXY = values.reduce((sum, y, i) => sum + (i + 1) * y, 0);
    const sumX2 = (n * (n + 1) * (2 * n + 1)) / 6;

    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;

    const changePercentage =
      values.length > 1
        ? values[0] !== 0
          ? ((values[values.length - 1] - values[0]) / values[0]) * 100
          : 0
        : 0;

    const prediction = slope * (n + 1) + intercept;
    const confidence = this.calculateConfidence(values, slope, intercept);

    let trend: "increasing" | "decreasing" | "stable";
    if (Math.abs(slope) < 0.01) {
      trend = "stable";
    } else {
      trend = slope > 0 ? "increasing" : "decreasing";
    }

    return {
      trend,
      changePercentage: Math.round(changePercentage * 100) / 100,
      prediction: Math.round(prediction * 100) / 100,
      confidence: Math.round(confidence * 100) / 100,
    };
  }

  private calculateConfidence(
    values: number[],
    slope: number,
    intercept: number
  ): number {
    const predictions = values.map((_, i) => slope * (i + 1) + intercept);
    const errors = values.map((actual, i) => Math.abs(actual - predictions[i]));
    const meanError = errors.reduce((a, b) => a + b, 0) / errors.length;
    const meanValue = values.reduce((a, b) => a + b, 0) / values.length;

    return meanValue !== 0
      ? Math.max(0, Math.min(1, 1 - meanError / meanValue))
      : 0;
  }

  private generateInsights(
    summary: any,
    trends: Record<string, TrendAnalysis>
  ): string[] {
    const insights: string[] = [];

    // Category insights
    const topCategory = Object.entries(summary.categoriesCount).sort(
      ([, a], [, b]) => (b as number) - (a as number)
    )[0];
    if (topCategory) {
      insights.push(
        `${topCategory[0]} metrics represent the largest category with ${topCategory[1]} entries`
      );
    } else {
      insights.push("No category data available yet");
    }

    // Trend insights
    const increasingTrends = Object.entries(trends).filter(
      ([, trend]) => trend.trend === "increasing"
    ).length;
    const decreasingTrends = Object.entries(trends).filter(
      ([, trend]) => trend.trend === "decreasing"
    ).length;

    if (increasingTrends > decreasingTrends) {
      insights.push(
        `Overall positive trend detected: ${increasingTrends} metrics showing growth`
      );
    } else if (decreasingTrends > increasingTrends) {
      insights.push(
        `Attention needed: ${decreasingTrends} metrics showing decline`
      );
    }

    return insights;
  }

  private generateRecommendations(
    summary: any,
    trends: Record<string, TrendAnalysis>
  ): string[] {
    const recommendations: string[] = [];

    // Performance recommendations
    const strongDeclines = Object.entries(trends).filter(
      ([, trend]) =>
        trend.trend === "decreasing" && trend.changePercentage < -20
    );

    if (strongDeclines.length > 0) {
      recommendations.push(
        `Investigate declining metrics: ${strongDeclines.map(([name]) => name).join(", ")}`
      );
    }

    // Data collection recommendations
    if (summary.totalMetrics < 1000) {
      recommendations.push(
        "Consider increasing data collection frequency for better insights"
      );
    }

    return recommendations;
  }

  async getPredictiveAnalytics(
    metricName: string,
    days: number = 30
  ): Promise<any> {
    const cacheKey = this.cacheService.generateCacheKey(
      "predictive",
      metricName,
      days.toString()
    );
    const cached = await this.cacheService.get(cacheKey);

    if (cached) {
      return cached;
    }

    const historicalData = await this.prisma.metricAggregation.findMany({
      where: {
        metric: { name: metricName },
        period: AggregationPeriod.DAILY,
      },
      orderBy: { startTime: "desc" },
      take: 90, // Use 90 days of data for prediction
    });

    const prediction = this.generatePrediction(historicalData, days);
    await this.cacheService.set(cacheKey, prediction, 3600); // Cache for 1 hour

    return prediction;
  }

  private generatePrediction(historicalData: any[], days: number): any {
    if (historicalData.length < 7) {
      return { error: "Insufficient data for prediction" };
    }

    const values = historicalData.map((d) => d.avg).reverse();
    const predictions = [];

    // Simple moving average prediction
    const windowSize = Math.min(7, values.length);
    const lastValues = values.slice(-windowSize);
    const average = lastValues.reduce((a, b) => a + b, 0) / lastValues.length;

    // Calculate trend
    const recentTrend =
      values.length > 1
        ? values[values.length - 2] !== 0
          ? (values[values.length - 1] - values[values.length - 2]) /
            values[values.length - 2]
          : 0
        : 0;

    for (let i = 1; i <= days; i++) {
      const trendAdjustment = average * recentTrend * (i / days);
      predictions.push({
        day: i,
        predicted_value: Math.round((average + trendAdjustment) * 100) / 100,
        confidence: Math.max(0.1, 0.9 - (i / days) * 0.5), // Decreasing confidence over time
      });
    }

    return {
      metric_name: historicalData[0]?.metric?.name,
      prediction_period: days,
      predictions,
      model_info: {
        type: "moving_average_with_trend",
        window_size: windowSize,
        data_points_used: values.length,
      },
    };
  }

  async getTrends(
    category?: MetricCategory,  // Changed from string to MetricCategory
    period: AggregationPeriod = AggregationPeriod.DAILY
  ): Promise<Record<string, TrendAnalysis>> {
    const cacheKey = this.cacheService.generateCacheKey(
      "trends",
      category || "all",
      period
    );
    const cached =
      await this.cacheService.get<Record<string, TrendAnalysis>>(cacheKey);

    if (cached) {
      return cached;
    }

    const whereClause = category ? { category } : {};
    const uniqueMetrics = await this.prisma.metric.findMany({
      where: whereClause,
      select: { name: true },
      distinct: ["name"],
    });

    const trends: Record<string, TrendAnalysis> = {};

    for (const metric of uniqueMetrics) {
      const aggregations = await this.prisma.metricAggregation.findMany({
        where: {
          metric: { name: metric.name },
          period,
        },
        orderBy: { startTime: "desc" },
        take: 10,
      });

      if (aggregations.length >= 3) {
        trends[metric.name] = this.calculateTrend(aggregations);
      }
    }

    await this.cacheService.set(cacheKey, trends, 300); // Cache for 5 minutes
    return trends;
  }
}
