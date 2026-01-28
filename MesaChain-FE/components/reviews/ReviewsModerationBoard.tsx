"use client";

import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import ReviewModerationPanel from "./ReviewModerationPanel";
import { fetchReviews, moderateReview } from "@/lib/api/reviews";
import { useAuth } from "@/lib/hooks/useAuth";
import type { Review } from "@/types/reviews";

export default function ReviewsModerationBoard() {
  const { tokens } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const loadReviews = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetchReviews({ status: "pending", limit: 10 });
      const flagged = await fetchReviews({ status: "flagged", limit: 10 });
      setReviews([...response.data, ...flagged.data]);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to load moderation queue");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadReviews();
  }, [loadReviews]);

  const handleModerate = async (reviewId: string, action: "approve" | "reject" | "flag", reason?: string, notes?: string) => {
    if (!tokens?.accessToken) {
      toast.error("Please login to moderate reviews.");
      return;
    }
    try {
      await moderateReview(reviewId, { action, reason, notes }, tokens.accessToken);
      toast.success("Moderation saved.");
      setReviews((prev) => prev.filter((review) => review.id !== reviewId));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to update review");
    }
  };

  if (isLoading) {
    return <div className="text-sm text-gray-500">Loading moderation queue...</div>;
  }

  return (
    <div className="space-y-4">
      {reviews.map((review) => (
        <ReviewModerationPanel key={review.id} review={review} onModerate={handleModerate} />
      ))}
      {reviews.length === 0 && (
        <div className="rounded-xl border bg-white p-6 text-sm text-gray-500">No reviews awaiting moderation.</div>
      )}
    </div>
  );
}
