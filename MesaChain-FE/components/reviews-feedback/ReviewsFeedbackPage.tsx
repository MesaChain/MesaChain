"use client";

import { useEffect, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ReviewsPanel from "@/components/reviews/ReviewsPanel";
import ReviewForm from "@/components/reviews/ReviewForm";
import ReviewsModerationBoard from "@/components/reviews/ReviewsModerationBoard";
import ReviewAnalytics from "@/components/reviews/ReviewAnalytics";
import FeedbackForm from "@/components/feedback/FeedbackForm";
import FeedbackPanel from "@/components/feedback/FeedbackPanel";
import FeedbackAnalytics from "@/components/feedback/FeedbackAnalytics";
import { createReview, fetchReviewStats } from "@/lib/api/reviews";
import { createFeedback, fetchFeedbackAnalytics } from "@/lib/api/feedback";
import { useAuth } from "@/lib/hooks/useAuth";
import { UserRole } from "@/types/auth";
import type { ReviewCreateInput, ReviewStats } from "@/types/reviews";
import type { FeedbackAnalytics as FeedbackAnalyticsType, FeedbackCreateInput } from "@/types/feedback";
import toast from "react-hot-toast";

export default function ReviewsFeedbackPage() {
  const { tokens, hasRole } = useAuth();
  const [reviewStats, setReviewStats] = useState<ReviewStats | null>(null);
  const [feedbackAnalytics, setFeedbackAnalytics] = useState<FeedbackAnalyticsType | null>(null);
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);
  const [isStatsLoading, setIsStatsLoading] = useState(false);

  const isStaff = hasRole(UserRole.ADMIN) || hasRole(UserRole.STAFF);

  useEffect(() => {
    const loadStats = async () => {
      setIsStatsLoading(true);
      try {
        const [reviewStatsRes, feedbackAnalyticsRes] = await Promise.all([
          fetchReviewStats(),
          fetchFeedbackAnalytics(),
        ]);
        setReviewStats(reviewStatsRes);
        setFeedbackAnalytics(feedbackAnalyticsRes);
      } catch (error) {
        // Analytics are optional; fail silently
      } finally {
        setIsStatsLoading(false);
      }
    };
    if (tokens?.accessToken) {
      loadStats();
    }
  }, [tokens?.accessToken]);

  const handleReviewSubmit = async (data: ReviewCreateInput) => {
    if (!tokens?.accessToken) {
      toast.error("Please login to submit a review.");
      return;
    }
    setIsSubmittingReview(true);
    try {
      await createReview(data, tokens.accessToken);
      toast.success("Review submitted. Thanks for sharing!");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to submit review");
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const handleFeedbackSubmit = async (data: FeedbackCreateInput) => {
    if (!tokens?.accessToken) {
      toast.error("Please login to submit feedback.");
      return;
    }
    setIsSubmittingFeedback(true);
    try {
      await createFeedback(data, tokens.accessToken);
      toast.success("Feedback submitted. We'll follow up soon.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to submit feedback");
    } finally {
      setIsSubmittingFeedback(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Reviews & Feedback</h1>
        <p className="text-sm text-gray-500">
          Manage customer reviews, collect feedback, and track sentiment trends.
        </p>
      </div>

      <Tabs defaultValue="reviews">
        <TabsList className="flex flex-wrap gap-2">
          <TabsTrigger value="reviews">Reviews</TabsTrigger>
          <TabsTrigger value="submit-review">Submit review</TabsTrigger>
          <TabsTrigger value="feedback">Feedback</TabsTrigger>
          <TabsTrigger value="submit-feedback">Submit feedback</TabsTrigger>
          {isStaff && <TabsTrigger value="moderation">Moderation</TabsTrigger>}
          {isStaff && <TabsTrigger value="analytics">Analytics</TabsTrigger>}
        </TabsList>

        <TabsContent value="reviews" className="space-y-4 transition-opacity duration-200">
          <ReviewsPanel />
        </TabsContent>

        <TabsContent value="submit-review" className="transition-opacity duration-200">
          <ReviewForm onSubmit={handleReviewSubmit} isSubmitting={isSubmittingReview} />
        </TabsContent>

        <TabsContent value="feedback" className="space-y-4 transition-opacity duration-200">
          <FeedbackPanel />
        </TabsContent>

        <TabsContent value="submit-feedback" className="transition-opacity duration-200">
          <FeedbackForm onSubmit={handleFeedbackSubmit} isSubmitting={isSubmittingFeedback} />
        </TabsContent>

        {isStaff && (
          <TabsContent value="moderation" className="space-y-4 transition-opacity duration-200">
            <ReviewsModerationBoard />
          </TabsContent>
        )}

        {isStaff && (
          <TabsContent value="analytics" className="space-y-4 transition-opacity duration-200">
            <div className="grid gap-6">
              <ReviewAnalytics stats={reviewStats} isLoading={isStatsLoading} />
              <FeedbackAnalytics analytics={feedbackAnalytics} isLoading={isStatsLoading} />
            </div>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}
