export enum ReviewStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  FLAGGED = 'flagged'
}

export enum ReviewType {
  PRODUCT = 'product',
  SERVICE = 'service',
  OVERALL = 'overall',
  RESTAURANT = 'restaurant'
}

export enum ModerationAction {
  APPROVE = 'approve',
  REJECT = 'reject',
  FLAG = 'flag',
  EDIT = 'edit'
}

export interface Review {
  id: string;
  userId: string;
  orderId?: string;
  menuItemId?: string;
  rating: number;
  content?: string;
  status: ReviewStatus;
  helpfulVotesCount: number;
  totalVotesCount: number;
  isVerified: boolean;
  isAnonymous: boolean;
  moderationNotes?: string;
  createdAt: Date;
  updatedAt: Date;
  user?: {
    id: string;
    name?: string;
    email: string;
  };
  order?: {
    id: string;
    orderNumber: string;
  };
  menuItem?: {
    id: string;
    name: string;
  };
  moderator?: {
    id: string;
    name?: string;
    email: string;
  };
  helpfulVotes?: ReviewHelpfulVote[];
  reports?: ReviewReport[];
  moderationHistory?: ReviewModerationHistory[];
}

export interface ReviewHelpfulVote {
  id: string;
  reviewId: string;
  userId: string;
  isHelpful: boolean;
  createdAt: Date;
  user?: {
    id: string;
    name?: string;
    email: string;
  };
}

export interface ReviewReport {
  id: string;
  reviewId: string;
  userId: string;
  reason: string;
  description?: string;
  status: 'pending' | 'resolved' | 'dismissed';
  createdAt: Date;
  resolvedAt?: Date;
  resolvedBy?: string;
  review?: Review;
  reporter?: {
    id: string;
    name?: string;
    email: string;
  };
  resolver?: {
    id: string;
    name?: string;
    email: string;
  };
}

export interface ReviewModerationHistory {
  id: string;
  reviewId: string;
  moderatorId: string;
  action: ModerationAction;
  reason?: string;
  notes?: string;
  createdAt: Date;
  review?: Review;
  moderator?: {
    id: string;
    name?: string;
    email: string;
  };
}

export interface ReviewAnalytics {
  id: string;
  menuItemId?: string;
  totalReviews: number;
  averageRating: number;
  ratingDistribution: Record<string, number>; // breakdown by rating (1-5 stars)
  helpfulnessScore: number; // average helpfulness
  period: string;
  startDate: Date;
  endDate: Date;
  createdAt: Date;
}

export interface CreateReviewRequest {
  orderId?: string;
  menuItemId?: string;
  rating: number;
  content?: string;
  isAnonymous?: boolean;
}

export interface UpdateReviewRequest {
  rating?: number;
  content?: string;
  status?: ReviewStatus;
  moderationNotes?: string;
}

export interface ReviewQueryParams {
  page?: number;
  limit?: number;
  status?: ReviewStatus;
  rating?: number;
  menuItemId?: string;
  userId?: string;
  orderId?: string;
  startDate?: string;
  endDate?: string;
  search?: string;
  sortBy?: 'createdAt' | 'rating' | 'helpfulVotesCount';
  sortOrder?: 'asc' | 'desc';
}

export interface VoteReviewRequest {
  isHelpful: boolean;
}

export interface ReportReviewRequest {
  reason: string;
  description?: string;
}

export interface ModerateReviewRequest {
  action: ModerationAction;
  reason?: string;
  notes?: string;
}

export interface ReviewStats {
  totalReviews: number;
  averageRating: number;
  ratingDistribution: Record<string, number>;
  statusBreakdown: Record<string, number>;
  recentReviews: Review[];
  moderationStats: {
    pendingCount: number;
    flaggedCount: number;
  };
}
