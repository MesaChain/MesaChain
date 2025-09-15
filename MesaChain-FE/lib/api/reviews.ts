import { ReviewSubmission, Feedback } from '@/types/reviews';

import { createApiClient } from './client';

let api: ReturnType<typeof createApiClient> | null = null;
function getClient() {
  if (!api) {
    api = createApiClient();
  }
  return api;
}

export const reviewsApi = {
  // Review endpoints
  getReviews: async (params: {
    itemId?: string;
    itemType?: string;
    page?: number;
    limit?: number;
    sortBy?: string;
    rating?: number;
    verificationStatus?: string;
  }) => {
    return getClient().get('/reviews', { params });
  },

  submitReview: async (review: ReviewSubmission) => {
    const formData = new FormData();
    Object.entries(review).forEach(([key, value]) => {
      if (value == null) return; // skip null/undefined
      if (key === 'mediaFiles' && Array.isArray(value)) {
        value.forEach((file) => {
          if (file instanceof File) {
            formData.append('mediaFiles', file);
          }
        });
      } else {
        formData.append(key, String(value));
      }
    });
    return getClient().post('/reviews', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  updateReview: async (reviewId: string, review: Partial<ReviewSubmission>) => {
    return getClient().patch(`/reviews/${reviewId}`, review);
  },

  deleteReview: async (reviewId: string) => {
    return getClient().delete(`/reviews/${reviewId}`);
  },

  markHelpful: async (reviewId: string) => {
    return getClient().post(`/reviews/${reviewId}/helpful`);
  },

  // Feedback endpoints
  submitFeedback: async (feedback: Omit<Feedback, 'id' | 'authorId' | 'authorName' | 'createdAt' | 'updatedAt'>) => {
    return getClient().post('/feedback', feedback);
  },

  getFeedback: async (params: {
    category?: string;
    status?: string;
    page?: number;
    limit?: number;
  }) => {
    return getClient().get('/feedback', { params });
  },

  respondToFeedback: async (feedbackId: string, content: string) => {
    return getClient().post(`/feedback/${feedbackId}/responses`, { content });
  },

  updateFeedbackStatus: async (feedbackId: string, status: string) => {
    return getClient().patch(`/feedback/${feedbackId}`, { status });
  },

  // Review management endpoints
  getReviewStats: async (params?: { itemId?: string; itemType?: string }) => {
    return getClient().get('/reviews/stats', { params });
  },

  moderateReview: async (reviewId: string, action: 'APPROVE' | 'REJECT', reason?: string) => {
    return getClient().post(`/reviews/${reviewId}/moderate`, { action, reason });
  },

  reportReview: async (reviewId: string, reason: string) => {
    return getClient().post(`/reviews/${reviewId}/report`, { reason });
  }
};