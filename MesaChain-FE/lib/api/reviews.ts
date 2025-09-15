import { ReviewSubmission, Feedback } from '@/types/reviews';
import { createApiClient } from './client';

const api = createApiClient();

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
    return api.get('/reviews', { params });
  },

  submitReview: async (review: ReviewSubmission) => {
    const formData = new FormData();
    Object.entries(review).forEach(([key, value]) => {
      if (key === 'mediaFiles' && value) {
        value.forEach((file: File) => {
          formData.append('mediaFiles', file);
        });
      } else {
        formData.append(key, String(value));
      }
    });
    return api.post('/reviews', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  updateReview: async (reviewId: string, review: Partial<ReviewSubmission>) => {
    return api.patch(`/reviews/${reviewId}`, review);
  },

  deleteReview: async (reviewId: string) => {
    return api.delete(`/reviews/${reviewId}`);
  },

  markHelpful: async (reviewId: string) => {
    return api.post(`/reviews/${reviewId}/helpful`);
  },

  // Feedback endpoints
  submitFeedback: async (feedback: Omit<Feedback, 'id' | 'authorId' | 'authorName' | 'createdAt' | 'updatedAt'>) => {
    return api.post('/feedback', feedback);
  },

  getFeedback: async (params: {
    category?: string;
    status?: string;
    page?: number;
    limit?: number;
  }) => {
    return api.get('/feedback', { params });
  },

  respondToFeedback: async (feedbackId: string, content: string) => {
    return api.post(`/feedback/${feedbackId}/responses`, { content });
  },

  updateFeedbackStatus: async (feedbackId: string, status: string) => {
    return api.patch(`/feedback/${feedbackId}`, { status });
  },

  // Review management endpoints
  getReviewStats: async (params?: { itemId?: string; itemType?: string }) => {
    return api.get('/reviews/stats', { params });
  },

  moderateReview: async (reviewId: string, action: 'APPROVE' | 'REJECT', reason?: string) => {
    return api.post(`/reviews/${reviewId}/moderate`, { action, reason });
  },

  reportReview: async (reviewId: string, reason: string) => {
    return api.post(`/reviews/${reviewId}/report`, { reason });
  }
};