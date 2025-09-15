export interface Review {
  id: string;
  rating: number;
  content: string;
  authorId: string;
  authorName: string;
  itemId: string;
  itemType: 'DISH' | 'SERVICE' | 'RESTAURANT';
  mediaUrls?: string[];
  helpfulCount: number;
  verificationStatus: 'VERIFIED' | 'PENDING' | 'UNVERIFIED';
  createdAt: string;
  updatedAt: string;
}

export interface ReviewSubmission {
  rating: number;
  content: string;
  itemId: string;
  itemType: 'DISH' | 'SERVICE' | 'RESTAURANT';
  mediaFiles?: File[];
}

export interface Feedback {
  id: string;
  category: 'GENERAL' | 'SERVICE' | 'FOOD' | 'CLEANLINESS' | 'OTHER';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  status: 'SUBMITTED' | 'IN_REVIEW' | 'RESPONDED' | 'RESOLVED';
  title: string;
  description: string;
  authorId: string;
  authorName: string;
  responses?: FeedbackResponse[];
  createdAt: string;
  updatedAt: string;
}

export interface FeedbackResponse {
  id: string;
  feedbackId: string;
  content: string;
  responderId: string;
  responderName: string;
  createdAt: string;
}

export interface ReviewStats {
  averageRating: number;
  totalReviews: number;
  ratingDistribution: {
    [key: number]: number;
  };
  verifiedCount: number;
}