import { apiFetch } from "./client";
import type {
  Review,
  ReviewCreateInput,
  ReviewListResponse,
  ReviewModerationInput,
  ReviewQuery,
  ReviewReportInput,
  ReviewStats,
  ReviewVoteInput,
} from "@/types/reviews";

const mockReviews: Review[] = [
  {
    id: "r-1",
    userId: "u-1",
    userName: "Aisha Bello",
    menuItemId: "menu-1",
    menuItemName: "Classic Burger",
    rating: 4.5,
    content: "Great burger, juicy patty and fast service.",
    status: "approved",
    helpfulVotesCount: 12,
    totalVotesCount: 14,
    isVerified: true,
    isAnonymous: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
    media: ["/charlesdeluvio-edBR3b2JAuA-unsplash.jpg"],
  },
  {
    id: "r-2",
    userId: "u-2",
    userName: "Diego Santos",
    menuItemId: "menu-2",
    menuItemName: "Margherita Pizza",
    rating: 5,
    content: "Perfect crust and fresh basil. Loved it!",
    status: "approved",
    helpfulVotesCount: 9,
    totalVotesCount: 10,
    isVerified: true,
    isAnonymous: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 20).toISOString(),
    media: ["/tobi-4DJ6m_1V71o-unsplash.jpg"],
  },
  {
    id: "r-3",
    userId: "u-3",
    userName: "Anonymous",
    rating: 3,
    content: "Service was a bit slow but the food was good.",
    status: "pending",
    helpfulVotesCount: 2,
    totalVotesCount: 5,
    isVerified: false,
    isAnonymous: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 36).toISOString(),
  },
];

export const fetchReviews = async (query: ReviewQuery = {}): Promise<ReviewListResponse> => {
  try {
    const response = await apiFetch<any>("/reviews", { query });
    if (response?.data) {
      return response as ReviewListResponse;
    }
    if (response?.reviews) {
      return {
        data: response.reviews,
        total: response.total ?? response.reviews.length,
        page: response.page ?? 1,
        limit: response.limit ?? response.reviews.length,
      };
    }
    return { data: [], total: 0, page: 1, limit: query.limit ?? 10 };
  } catch {
    const page = query.page ?? 1;
    const limit = query.limit ?? 6;
    return {
      data: mockReviews.slice(0, limit),
      total: mockReviews.length,
      page,
      limit,
    };
  }
};

export const fetchReviewStats = () =>
  apiFetch<ReviewStats>("/reviews/stats");

export const createReview = (payload: ReviewCreateInput, token: string) =>
  apiFetch<Review>("/reviews", {
    method: "POST",
    token,
    body: JSON.stringify(payload),
  });

export const updateReview = (reviewId: string, payload: Partial<ReviewCreateInput>, token: string) =>
  apiFetch<Review>(`/reviews/${reviewId}`, {
    method: "PATCH",
    token,
    body: JSON.stringify(payload),
  });

export const voteReview = (reviewId: string, payload: ReviewVoteInput, token: string) =>
  apiFetch<Review>(`/reviews/${reviewId}/vote`, {
    method: "POST",
    token,
    body: JSON.stringify(payload),
  });

export const reportReview = (reviewId: string, payload: ReviewReportInput, token: string) =>
  apiFetch<void>(`/reviews/${reviewId}/report`, {
    method: "POST",
    token,
    body: JSON.stringify(payload),
  });

export const moderateReview = (reviewId: string, payload: ReviewModerationInput, token: string) =>
  apiFetch<Review>(`/reviews/${reviewId}/moderate`, {
    method: "POST",
    token,
    body: JSON.stringify(payload),
  });
