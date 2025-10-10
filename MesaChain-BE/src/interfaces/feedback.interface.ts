export enum FeedbackStatus {
  OPEN = 'OPEN',
  IN_PROGRESS = 'IN_PROGRESS',
  RESOLVED = 'RESOLVED',
  CLOSED = 'CLOSED',
  ESCALATED = 'ESCALATED'
}

export enum FeedbackPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  URGENT = 'URGENT'
}

export enum FeedbackCategory {
  GENERAL = 'GENERAL',
  FOOD_QUALITY = 'FOOD_QUALITY',
  SERVICE = 'SERVICE',
  AMBIANCE = 'AMBIANCE',
  PRICING = 'PRICING',
  CLEANLINESS = 'CLEANLINESS',
  STAFF = 'STAFF',
  TECHNICAL = 'TECHNICAL',
  BILLING = 'BILLING',
  OTHER = 'OTHER'
}

export interface Feedback {
  id: string;
  userId?: string;
  orderId?: string;
  category: FeedbackCategory;
  priority: FeedbackPriority;
  status: FeedbackStatus;
  subject: string;
  message: string;
  isAnonymous: boolean;
  contactEmail?: string;
  contactPhone?: string;
  ipAddress?: string;
  userAgent?: string;
  metadata?: any;
  assignedTo?: string;
  createdAt: Date;
  updatedAt: Date;
  resolvedAt?: Date;
  closedAt?: Date;
  user?: {
    id: string;
    name?: string;
    email: string;
  };
  order?: {
    id: string;
    orderNumber: string;
  };
  assignee?: {
    id: string;
    name?: string;
    email: string;
  };
  responses?: FeedbackResponse[];
  history?: FeedbackHistory[];
}

export interface FeedbackResponse {
  id: string;
  feedbackId: string;
  userId: string;
  message: string;
  isInternal: boolean;
  createdAt: Date;
  user?: {
    id: string;
    name?: string;
    email: string;
  };
}

export interface FeedbackHistory {
  id: string;
  feedbackId: string;
  action: string;
  oldValue?: string;
  newValue?: string;
  changedBy: string;
  notes?: string;
  createdAt: Date;
  user?: {
    id: string;
    name?: string;
    email: string;
  };
}

export interface FeedbackAnalytics {
  id: string;
  period: string; // daily, weekly, monthly
  startDate: Date;
  endDate: Date;
  totalFeedback: number;
  categoryBreakdown: Record<string, number>; // breakdown by feedback category
  priorityBreakdown: Record<string, number>; // breakdown by priority
  statusBreakdown: Record<string, number>; // breakdown by status
  averageResolutionTime: number; // in hours
  createdAt: Date;
}

export interface CreateFeedbackRequest {
  orderId?: string;
  category: FeedbackCategory;
  priority?: FeedbackPriority;
  subject: string;
  message: string;
  isAnonymous?: boolean;
  contactEmail?: string;
  contactPhone?: string;
}

export interface UpdateFeedbackRequest {
  category?: FeedbackCategory;
  priority?: FeedbackPriority;
  status?: FeedbackStatus;
  subject?: string;
  message?: string;
  assignedTo?: string;
}

export interface FeedbackQueryParams {
  page?: number;
  limit?: number;
  status?: FeedbackStatus;
  category?: FeedbackCategory;
  priority?: FeedbackPriority;
  assignedTo?: string;
  userId?: string;
  orderId?: string;
  startDate?: string;
  endDate?: string;
  search?: string;
  sortBy?: 'createdAt' | 'priority' | 'status';
  sortOrder?: 'asc' | 'desc';
}

export interface CreateFeedbackResponseRequest {
  message: string;
  isInternal?: boolean;
}

export interface FeedbackStats {
  totalFeedback: number;
  openFeedback: number;
  inProgressFeedback: number;
  resolvedFeedback: number;
  closedFeedback: number;
  escalatedFeedback: number;
  averageResolutionTime: number;
  categoryBreakdown: Record<string, number>;
  priorityBreakdown: Record<string, number>;
  recentFeedback: Feedback[];
}



