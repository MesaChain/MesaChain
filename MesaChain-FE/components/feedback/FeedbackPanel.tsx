"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import FeedbackCard from "./FeedbackCard";
import FeedbackFilters from "./FeedbackFilters";
import ReviewPagination from "../reviews/ReviewPagination";
import { Skeleton } from "@/components/ui/skeleton";
import { addFeedbackResponse, fetchFeedback } from "@/lib/api/feedback";
import { useAuth } from "@/lib/hooks/useAuth";
import { UserRole } from "@/types/auth";
import { useDebounce } from "@/lib/hooks/use-debounce";
import { useReviewsFeedbackStream } from "@/lib/hooks/useReviewsFeedbackStream";
import type { FeedbackItem, FeedbackQuery } from "@/types/feedback";

const defaultFilters: FeedbackQuery = {
  page: 1,
  limit: 6,
};

export default function FeedbackPanel() {
  const { tokens, user, hasRole } = useAuth();
  const [filters, setFilters] = useState<FeedbackQuery>(defaultFilters);
  const [items, setItems] = useState<FeedbackItem[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const debouncedSearch = useDebounce(filters.search || "", 400);

  const query = useMemo(() => ({ ...filters, search: debouncedSearch }), [filters, debouncedSearch]);

  const loadFeedback = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetchFeedback(query);
      setItems(response.data);
      setTotal(response.total);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to load feedback");
    } finally {
      setIsLoading(false);
    }
  }, [query]);

  useEffect(() => {
    loadFeedback();
  }, [loadFeedback]);

  useReviewsFeedbackStream(tokens?.accessToken, {
    onEvent: (event, payload) => {
      if (event === "new-feedback") {
        setItems((prev) => [payload, ...prev].slice(0, filters.limit || 6));
        setTotal((prev) => prev + 1);
      }
      if (event === "feedback-updated") {
        setItems((prev) => prev.map((item) => (item.id === payload.id ? { ...item, ...payload } : item)));
      }
      if (event === "feedback-response" && payload?.feedbackId) {
        setItems((prev) =>
          prev.map((item) =>
            item.id === payload.feedbackId
              ? { ...item, responses: [...(item.responses || []), payload.response] }
              : item
          )
        );
      }
    },
  });

  const handleRespond = async (id: string, message: string) => {
    if (!tokens?.accessToken) {
      toast.error("Please login to respond.");
      return;
    }
    try {
      await addFeedbackResponse(id, { message }, tokens.accessToken);
      toast.success("Response sent.");
      loadFeedback();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to send response");
    }
  };

  const safeItems = Array.isArray(items) ? items : [];
  const isStaff = hasRole(UserRole.ADMIN) || hasRole(UserRole.STAFF);
  const scopedItems = isStaff
    ? safeItems
    : user?.id
      ? safeItems.filter((item) => item.userId === user.id)
      : safeItems;

  return (
    <div className="space-y-4">
      <FeedbackFilters filters={filters} onChange={setFilters} onReset={() => setFilters(defaultFilters)} />

      {isLoading ? (
        <div className="grid gap-4 lg:grid-cols-2">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={`feedback-skeleton-${index}`} className="rounded-xl border bg-white p-5 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-5 w-20" />
              </div>
              <Skeleton className="h-14 w-full" />
              <div className="flex gap-2">
                <Skeleton className="h-5 w-16" />
                <Skeleton className="h-5 w-16" />
                <Skeleton className="h-5 w-16" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {scopedItems.map((item) => (
            <FeedbackCard key={item.id} feedback={item} onRespond={handleRespond} />
          ))}
          {scopedItems.length === 0 && (
            <div className="rounded-xl border bg-white p-6 text-sm text-gray-500">No feedback entries found.</div>
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
