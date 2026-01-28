"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import ReviewCard from "./ReviewCard";
import ReviewFilters from "./ReviewFilters";
import ReviewPagination from "./ReviewPagination";
import { Skeleton } from "@/components/ui/skeleton";
import { fetchReviews, reportReview, voteReview } from "@/lib/api/reviews";
import { useDebounce } from "@/lib/hooks/use-debounce";
import { useAuth } from "@/lib/hooks/useAuth";
import { useReviewsFeedbackStream } from "@/lib/hooks/useReviewsFeedbackStream";
import type { Review, ReviewQuery } from "@/types/reviews";

const defaultFilters: ReviewQuery = {
  page: 1,
  limit: 6,
  sortBy: "createdAt",
  sortOrder: "desc",
};

export default function ReviewsPanel() {
  const { tokens } = useAuth();
  const [filters, setFilters] = useState<ReviewQuery>(defaultFilters);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const debouncedSearch = useDebounce(filters.search || "", 400);

  const query = useMemo(() => ({ ...filters, search: debouncedSearch }), [filters, debouncedSearch]);

  const loadReviews = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetchReviews(query);
      setReviews(response.data);
      setTotal(response.total);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to load reviews");
    } finally {
      setIsLoading(false);
    }
  }, [query]);

  useEffect(() => {
    loadReviews();
  }, [loadReviews]);

  useReviewsFeedbackStream(tokens?.accessToken, {
    onEvent: (event, payload) => {
      if (event === "new-review") {
        setReviews((prev) => [payload, ...prev].slice(0, filters.limit || 6));
        setTotal((prev) => prev + 1);
      }
      if (event === "review-updated" || event === "review-moderated") {
        setReviews((prev) => prev.map((review) => (review.id === payload.id ? payload : review)));
      }
    },
  });

  const handleVote = async (id: string, isHelpful: boolean) => {
    if (!tokens?.accessToken) {
      toast.error("Please login to vote.");
      return;
    }
    try {
      const updated = await voteReview(id, { isHelpful }, tokens.accessToken);
      setReviews((prev) => prev.map((review) => (review.id === id ? updated : review)));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to vote");
    }
  };

  const handleReport = async (id: string, reason: string, description?: string) => {
    if (!tokens?.accessToken) {
      toast.error("Please login to report.");
      return;
    }
    if (!reason.trim()) {
      toast.error("Please provide a reason.");
      return;
    }
    try {
      await reportReview(id, { reason, description }, tokens.accessToken);
      toast.success("Report submitted. Thank you.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to report review");
    }
  };

  return (
    <div className="space-y-4">
      <ReviewFilters
        filters={filters}
        onChange={setFilters}
        onReset={() => setFilters(defaultFilters)}
      />

      {isLoading ? (
        <div className="grid gap-4 lg:grid-cols-2">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={`review-skeleton-${index}`} className="rounded-xl border bg-white p-5 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-20" />
                </div>
                <Skeleton className="h-5 w-24" />
              </div>
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-16 w-full" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {reviews.map((review) => (
            <ReviewCard key={review.id} review={review} onVote={handleVote} onReport={handleReport} />
          ))}
          {reviews.length === 0 && (
            <div className="rounded-xl border bg-white p-6 text-sm text-gray-500">No reviews found.</div>
          )}
        </div>
      )}

      <ReviewPagination
        page={filters.page || 1}
        total={total}
        limit={filters.limit || 6}
        onPageChange={(page) => setFilters((prev) => ({ ...prev, page }))}
      />
    </div>
  );
}
