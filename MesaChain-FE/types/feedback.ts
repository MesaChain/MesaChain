export type FeedbackCategory =
  | "service"
  | "food_quality"
  | "ambiance"
  | "pricing"
  | "staff"
  | "general";

export type FeedbackPriority = "low" | "medium" | "high" | "urgent";

export type FeedbackStatus = "open" | "in_progress" | "resolved" | "closed";

export interface FeedbackResponse {
  id: string;
  message: string;
  createdAt: string;
  responderName?: string;
  isInternal?: boolean;
}

export interface FeedbackHistoryEntry {
  id: string;
  field: string;
  oldValue?: string;
  newValue?: string;
  changedBy?: string;
  createdAt: string;
}

export interface FeedbackItem {
  id: string;
  userId: string;
  category: FeedbackCategory;
  priority: FeedbackPriority;
  status: FeedbackStatus;
  subject: string;
  message: string;
  attachments?: string;
  isAnonymous?: boolean;
  contactEmail?: string;
  contactPhone?: string;
  createdAt: string;
  updatedAt?: string;
  responses?: FeedbackResponse[];
  history?: FeedbackHistoryEntry[];
}

export interface FeedbackListResponse {
  data: FeedbackItem[];
  total: number;
  page: number;
  limit: number;
}

export interface FeedbackQuery {
  page?: number;
  limit?: number;
  category?: FeedbackCategory;
  priority?: FeedbackPriority;
  status?: FeedbackStatus;
  search?: string;
}

export interface FeedbackCreateInput {
  category: FeedbackCategory;
  priority: FeedbackPriority;
  subject: string;
  message: string;
  attachments?: string;
  isAnonymous?: boolean;
  contactEmail?: string;
  contactPhone?: string;
  orderId?: string;
}

export interface FeedbackUpdateInput {
  status?: FeedbackStatus;
  priority?: FeedbackPriority;
  category?: FeedbackCategory;
  subject?: string;
  message?: string;
}

export interface FeedbackResponseInput {
  message: string;
  isInternal?: boolean;
}

export interface FeedbackStats {
  totalFeedback: number;
  openFeedback: number;
  resolvedFeedback: number;
  closedFeedback: number;
  averageResolutionTime: number;
  satisfactionScore: number;
}

export interface FeedbackAnalytics {
  overview: FeedbackStats;
  categories: Array<{ category: FeedbackCategory; count: number; avgResolutionTime: number }>;
  priorities: Array<{ priority: FeedbackPriority; count: number; avgResolutionTime: number }>;
}
