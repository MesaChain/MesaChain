import { apiFetch } from "./client";
import type {
  FeedbackAnalytics,
  FeedbackCreateInput,
  FeedbackItem,
  FeedbackListResponse,
  FeedbackQuery,
  FeedbackResponse,
  FeedbackResponseInput,
  FeedbackStats,
  FeedbackUpdateInput,
} from "@/types/feedback";

const mockFeedback: FeedbackItem[] = [
  {
    id: "f-1",
    userId: "u-1",
    category: "service",
    priority: "medium",
    status: "in_progress",
    subject: "Friendly staff",
    message: "The waiter was very attentive and helpful.",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(),
    responses: [
      {
        id: "fr-1",
        message: "Thank you for the kind words! We shared with the team.",
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
        responderName: "Support",
      },
    ],
    history: [
      {
        id: "fh-1",
        field: "status",
        oldValue: "open",
        newValue: "in_progress",
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
      },
    ],
  },
  {
    id: "f-2",
    userId: "u-2",
    category: "food_quality",
    priority: "high",
    status: "open",
    subject: "Soup was cold",
    message: "The soup arrived lukewarm. Please check the kitchen flow.",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 18).toISOString(),
  },
  {
    id: "f-3",
    userId: "u-3",
    category: "pricing",
    priority: "low",
    status: "resolved",
    subject: "Menu clarity",
    message: "Would love clearer portion sizes on the menu.",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 30).toISOString(),
    responses: [
      {
        id: "fr-2",
        message: "Thanks! We are updating menu descriptions this week.",
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 20).toISOString(),
        responderName: "Support",
      },
    ],
  },
];

export const fetchFeedback = async (query: FeedbackQuery = {}): Promise<FeedbackListResponse> => {
  try {
    const response = await apiFetch<any>("/feedback", { query });
    if (response?.data) {
      return response as FeedbackListResponse;
    }
    if (response?.feedback) {
      return {
        data: response.feedback,
        total: response.total ?? response.feedback.length,
        page: response.page ?? 1,
        limit: response.limit ?? response.feedback.length,
      };
    }
    return { data: [], total: 0, page: 1, limit: query.limit ?? 10 };
  } catch {
    const page = query.page ?? 1;
    const limit = query.limit ?? 6;
    return {
      data: mockFeedback.slice(0, limit),
      total: mockFeedback.length,
      page,
      limit,
    };
  }
};

export const fetchFeedbackStats = () =>
  apiFetch<FeedbackStats>("/feedback/stats");

export const createFeedback = (payload: FeedbackCreateInput, token: string) =>
  apiFetch<FeedbackItem>("/feedback", {
    method: "POST",
    token,
    body: JSON.stringify(payload),
  });

export const updateFeedback = (id: string, payload: FeedbackUpdateInput, token: string) =>
  apiFetch<FeedbackItem>(`/feedback/${id}`, {
    method: "PATCH",
    token,
    body: JSON.stringify(payload),
  });

export const addFeedbackResponse = (id: string, payload: FeedbackResponseInput, token: string) =>
  apiFetch<FeedbackResponse>(`/feedback/${id}/responses`, {
    method: "POST",
    token,
    body: JSON.stringify(payload),
  });

export const fetchFeedbackAnalytics = () =>
  apiFetch<FeedbackAnalytics>("/analytics/feedback");
