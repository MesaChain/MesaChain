export type ReviewStatus = "pending" | "approved" | "rejected" | "flagged";

export type ReviewSortBy = "createdAt" | "rating" | "helpfulVotesCount";

export type ReviewSortOrder = "asc" | "desc";

export interface ReviewUser {
  id: string;
  name: string;
  role?: string;
}

export interface Review {
  id: string;
  userId: string;
  userName: string;
  menuItemId?: string;
  menuItemName?: string;
  orderId?: string;
  rating: number;
  content?: string;
  status: ReviewStatus;
  helpfulVotesCount: number;
  totalVotesCount: number;
  isVerified: boolean;
  isAnonymous: boolean;
  createdAt: string;
  updatedAt?: string;
  media?: string[];
}

export interface ReviewListResponse {
  data: Review[];
  total: number;
  page: number;
  limit: number;
}

export interface ReviewQuery {
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
  sortBy?: ReviewSortBy;
  sortOrder?: ReviewSortOrder;
}

export interface ReviewCreateInput {
  rating: number;
  content?: string;
  menuItemId?: string;
  orderId?: string;
  isAnonymous?: boolean;
}

export interface ReviewVoteInput {
  isHelpful: boolean;
}

export interface ReviewReportInput {
  reason: string;
  description?: string;
}

export interface ReviewModerationInput {
  action: "approve" | "reject" | "flag";
  reason?: string;
  notes?: string;
}

export interface ReviewStats {
  averageRating: number;
  totalReviews: number;
  ratingDistribution: Record<number, number>;
  helpfulnessScore: number;
  pendingReviews: number;
  flaggedReviews: number;
}
