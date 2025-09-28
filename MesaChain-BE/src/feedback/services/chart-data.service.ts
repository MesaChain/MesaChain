import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../shared/prisma.service';
import { ExtendedPrismaClient } from '../../types/prisma-client-extended';

export interface ChartData {
  labels: string[];
  datasets: Array<{
    label: string;
    data: number[];
    backgroundColor?: string | string[];
    borderColor?: string | string[];
    borderWidth?: number;
  }>;
}

export interface TimeSeriesData {
  labels: string[];
  datasets: Array<{
    label: string;
    data: number[];
    borderColor: string;
    backgroundColor: string;
    fill?: boolean;
    tension?: number;
    yAxisID?: string;
  }>;
}

@Injectable()
export class ChartDataService {
  constructor(private readonly prisma: PrismaService) {}

  private get prismaClient(): ExtendedPrismaClient {
    return this.prisma as unknown as ExtendedPrismaClient;
  }

  async getCategoryDistributionChart(startDate: Date, endDate: Date): Promise<ChartData> {
    const categories = await this.prismaClient.feedback.groupBy({
      by: ['category'],
      where: {
        createdAt: { gte: startDate, lte: endDate }
      },
      _count: { category: true }
    });

    const colors = [
      '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF',
      '#FF9F40', '#FF6384', '#C9CBCF', '#4BC0C0', '#FF6384'
    ];

    return {
      labels: categories.map(cat => this.formatCategoryLabel(cat.category)),
      datasets: [{
        label: 'Feedback by Category',
        data: categories.map(cat => cat._count.category),
        backgroundColor: colors.slice(0, categories.length),
        borderColor: colors.slice(0, categories.length),
        borderWidth: 1
      }]
    };
  }

  async getPriorityDistributionChart(startDate: Date, endDate: Date): Promise<ChartData> {
    const priorities = await this.prismaClient.feedback.groupBy({
      by: ['priority'],
      where: {
        createdAt: { gte: startDate, lte: endDate }
      },
      _count: { priority: true }
    });

    const priorityColors = {
      'urgent': '#FF4444',
      'high': '#FF8800',
      'medium': '#FFBB00',
      'low': '#00BB00'
    };

    return {
      labels: priorities.map(pri => this.formatPriorityLabel(pri.priority)),
      datasets: [{
        label: 'Feedback by Priority',
        data: priorities.map(pri => pri._count.priority),
        backgroundColor: priorities.map(pri => priorityColors[pri.priority as keyof typeof priorityColors] || '#CCCCCC'),
        borderColor: priorities.map(pri => priorityColors[pri.priority as keyof typeof priorityColors] || '#CCCCCC'),
        borderWidth: 1
      }]
    };
  }

  async getStatusDistributionChart(startDate: Date, endDate: Date): Promise<ChartData> {
    const statuses = await this.prismaClient.feedback.groupBy({
      by: ['status'],
      where: {
        createdAt: { gte: startDate, lte: endDate }
      },
      _count: { status: true }
    });

    const statusColors = {
      'open': '#FF6384',
      'in_progress': '#36A2EB',
      'resolved': '#4BC0C0',
      'closed': '#9966FF',
      'flagged': '#FFCE56'
    };

    return {
      labels: statuses.map(status => this.formatStatusLabel(status.status)),
      datasets: [{
        label: 'Feedback by Status',
        data: statuses.map(status => status._count.status),
        backgroundColor: statuses.map(status => statusColors[status.status as keyof typeof statusColors] || '#CCCCCC'),
        borderColor: statuses.map(status => statusColors[status.status as keyof typeof statusColors] || '#CCCCCC'),
        borderWidth: 1
      }]
    };
  }

  async getTrendChart(startDate: Date, endDate: Date, period: 'day' | 'week' | 'month'): Promise<TimeSeriesData> {
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

    const groupedData = this.groupFeedbackByPeriod(feedback, period);
    
    return {
      labels: groupedData.labels,
      datasets: [
        {
          label: 'Total Feedback',
          data: groupedData.total,
          borderColor: '#36A2EB',
          backgroundColor: 'rgba(54, 162, 235, 0.1)',
          fill: true,
          tension: 0.4
        },
        {
          label: 'Resolved',
          data: groupedData.resolved,
          borderColor: '#4BC0C0',
          backgroundColor: 'rgba(75, 192, 192, 0.1)',
          fill: false,
          tension: 0.4
        },
        {
          label: 'Open',
          data: groupedData.open,
          borderColor: '#FF6384',
          backgroundColor: 'rgba(255, 99, 132, 0.1)',
          fill: false,
          tension: 0.4
        }
      ]
    };
  }

  async getModerationEffectivenessChart(startDate: Date, endDate: Date): Promise<ChartData> {
    const total = await this.prismaClient.feedback.count({
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

    const approved = total - flagged;

    return {
      labels: ['Approved', 'Flagged'],
      datasets: [{
        label: 'Moderation Results',
        data: [approved, flagged],
        backgroundColor: ['#4BC0C0', '#FF6384'],
        borderColor: ['#4BC0C0', '#FF6384'],
        borderWidth: 1
      }]
    };
  }

  async getResolutionTimeChart(startDate: Date, endDate: Date): Promise<ChartData> {
    const resolvedFeedback = await this.prismaClient.feedback.findMany({
      where: {
        createdAt: { gte: startDate, lte: endDate },
        status: { in: ['resolved', 'closed'] }
      },
      select: {
        createdAt: true,
        updatedAt: true,
        priority: true
      }
    });

    // Group by resolution time ranges
    const timeRanges = [
      { label: '< 1 day', min: 0, max: 1 },
      { label: '1-3 days', min: 1, max: 3 },
      { label: '3-7 days', min: 3, max: 7 },
      { label: '1-2 weeks', min: 7, max: 14 },
      { label: '> 2 weeks', min: 14, max: Infinity }
    ];

    const data = timeRanges.map(range => {
      return resolvedFeedback.filter(feedback => {
        const resolutionTime = (feedback.updatedAt.getTime() - feedback.createdAt.getTime()) / (1000 * 60 * 60 * 24);
        return resolutionTime >= range.min && resolutionTime < range.max;
      }).length;
    });

    return {
      labels: timeRanges.map(range => range.label),
      datasets: [{
        label: 'Resolution Time Distribution',
        data,
        backgroundColor: [
          '#4BC0C0',
          '#36A2EB',
          '#FFCE56',
          '#FF8800',
          '#FF4444'
        ],
        borderColor: [
          '#4BC0C0',
          '#36A2EB',
          '#FFCE56',
          '#FF8800',
          '#FF4444'
        ],
        borderWidth: 1
      }]
    };
  }

  async getSatisfactionTrendChart(startDate: Date, endDate: Date): Promise<TimeSeriesData> {
    // Mock satisfaction data - in real implementation, this would come from user ratings
    const days = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    const labels = Array.from({ length: days }, (_, i) => {
      const date = new Date(startDate.getTime() + i * 24 * 60 * 60 * 1000);
      return date.toISOString().split('T')[0];
    });

    const satisfactionData = labels.map(() => Math.random() * 2 + 3); // Random between 3-5
    const responseTimeData = labels.map(() => Math.random() * 2 + 1); // Random between 1-3 hours

    return {
      labels,
      datasets: [
        {
          label: 'Satisfaction Score',
          data: satisfactionData,
          borderColor: '#4BC0C0',
          backgroundColor: 'rgba(75, 192, 192, 0.1)',
          fill: false,
          tension: 0.4,
          yAxisID: 'y'
        },
        {
          label: 'Response Time (hours)',
          data: responseTimeData,
          borderColor: '#FF6384',
          backgroundColor: 'rgba(255, 99, 132, 0.1)',
          fill: false,
          tension: 0.4,
          yAxisID: 'y1'
        }
      ]
    };
  }

  private groupFeedbackByPeriod(feedback: any[], period: 'day' | 'week' | 'month') {
    const groups: Record<string, { total: number; resolved: number; open: number }> = {};

    feedback.forEach(item => {
      let key: string;
      const date = new Date(item.createdAt);

      switch (period) {
        case 'day':
          key = date.toISOString().split('T')[0];
          break;
        case 'week':
          const weekStart = new Date(date);
          weekStart.setDate(date.getDate() - date.getDay());
          key = weekStart.toISOString().split('T')[0];
          break;
        case 'month':
          key = date.toISOString().substring(0, 7);
          break;
        default:
          key = date.toISOString().split('T')[0];
      }

      if (!groups[key]) {
        groups[key] = { total: 0, resolved: 0, open: 0 };
      }

      groups[key].total++;
      if (item.status === 'resolved' || item.status === 'closed') {
        groups[key].resolved++;
      } else if (item.status === 'open' || item.status === 'in_progress') {
        groups[key].open++;
      }
    });

    const sortedKeys = Object.keys(groups).sort();
    
    return {
      labels: sortedKeys,
      total: sortedKeys.map(key => groups[key].total),
      resolved: sortedKeys.map(key => groups[key].resolved),
      open: sortedKeys.map(key => groups[key].open)
    };
  }

  private formatCategoryLabel(category: string): string {
    const labels: Record<string, string> = {
      'BUG_REPORT': 'Bug Report',
      'FEATURE_REQUEST': 'Feature Request',
      'COMPLAINT': 'Complaint',
      'COMPLIMENT': 'Compliment',
      'GENERAL': 'General'
    };
    return labels[category] || category;
  }

  private formatPriorityLabel(priority: string): string {
    const labels: Record<string, string> = {
      'urgent': 'Urgent',
      'high': 'High',
      'medium': 'Medium',
      'low': 'Low'
    };
    return labels[priority] || priority;
  }

  private formatStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      'open': 'Open',
      'in_progress': 'In Progress',
      'resolved': 'Resolved',
      'closed': 'Closed',
      'flagged': 'Flagged'
    };
    return labels[status] || status;
  }
}
