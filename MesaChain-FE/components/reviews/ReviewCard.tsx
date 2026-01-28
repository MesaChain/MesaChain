"use client";

import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import ReviewRating from "./ReviewRating";
import type { Review } from "@/types/reviews";

interface ReviewCardProps {
  review: Review;
  onVote?: (id: string, isHelpful: boolean) => void;
  onReport?: (id: string, reason: string, description?: string) => Promise<void> | void;
  showActions?: boolean;
}

const statusLabel: Record<Review["status"], string> = {
  pending: "Pending",
  approved: "Approved",
  rejected: "Rejected",
  flagged: "Flagged",
};

export default function ReviewCard({ review, onVote, onReport, showActions = true }: ReviewCardProps) {
  const [reportReason, setReportReason] = useState("");
  const [reportDescription, setReportDescription] = useState("");

  const authorLabel = useMemo(() => {
    if (review.isAnonymous) return "Anonymous";
    return review.userName || "Customer";
  }, [review]);

  return (
    <div className="rounded-xl border bg-white p-5 shadow-sm transition-transform duration-200 hover:-translate-y-0.5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-gray-900">{authorLabel}</p>
          <p className="text-xs text-gray-500">{new Date(review.createdAt).toLocaleDateString()}</p>
        </div>
        <div className="flex items-center gap-2">
          {review.isVerified && <Badge variant="secondary">Verified</Badge>}
          <Badge variant={review.status === "approved" ? "default" : review.status === "flagged" ? "destructive" : "outline"}>
            {statusLabel[review.status]}
          </Badge>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between">
        <ReviewRating rating={review.rating} />
        <span className="text-xs text-gray-500">
          Helpful {review.helpfulVotesCount}/{review.totalVotesCount}
        </span>
      </div>

      {review.content && <p className="mt-3 text-sm text-gray-700">{review.content}</p>}

      {review.media && review.media.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {review.media.map((media, index) => (
            <div key={`${media}-${index}`} className="h-16 w-16 overflow-hidden rounded-md border bg-gray-50">
              <img src={media} alt="Review media" className="h-full w-full object-cover" />
            </div>
          ))}
        </div>
      )}

      {showActions && (
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <Button variant="outline" size="sm" title="Mark this review as helpful" onClick={() => onVote?.(review.id, true)}>
            Helpful
          </Button>
          <Button variant="ghost" size="sm" title="Mark this review as not helpful" onClick={() => onVote?.(review.id, false)}>
            Not helpful
          </Button>
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="ghost" size="sm" title="Report this review">
                Report
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Report review</DialogTitle>
                <DialogDescription>
                  Help us understand what is wrong with this review.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-3">
                <Input
                  placeholder="Reason (e.g. spam, abusive, off-topic)"
                  value={reportReason}
                  onChange={(event) => setReportReason(event.target.value)}
                />
                <Textarea
                  placeholder="Additional details (optional)"
                  value={reportDescription}
                  onChange={(event) => setReportDescription(event.target.value)}
                />
              </div>
              <DialogFooter>
                <Button
                  onClick={async () => {
                    await onReport?.(review.id, reportReason, reportDescription);
                    setReportReason("");
                    setReportDescription("");
                  }}
                >
                  Submit report
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      )}
    </div>
  );
}
