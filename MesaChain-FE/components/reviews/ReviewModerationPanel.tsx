"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import ReviewRating from "./ReviewRating";
import type { Review } from "@/types/reviews";

interface ModerationPanelProps {
  review: Review;
  onModerate: (reviewId: string, action: "approve" | "reject" | "flag", reason?: string, notes?: string) => void;
  isSubmitting?: boolean;
}

export default function ReviewModerationPanel({ review, onModerate, isSubmitting }: ModerationPanelProps) {
  const [action, setAction] = useState<"approve" | "reject" | "flag">("approve");
  const [reason, setReason] = useState("");
  const [notes, setNotes] = useState("");

  return (
    <div className="rounded-xl border bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-gray-900">{review.userName || "Customer"}</p>
          <p className="text-xs text-gray-500">{new Date(review.createdAt).toLocaleString()}</p>
        </div>
        <ReviewRating rating={review.rating} />
      </div>
      <p className="mt-3 text-sm text-gray-700">{review.content || "No written feedback."}</p>

      <div className="mt-4 grid gap-3 md:grid-cols-3">
        <Select value={action} onValueChange={(value) => setAction(value as "approve" | "reject" | "flag")}>
          <SelectTrigger>
            <SelectValue placeholder="Action" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="approve">Approve</SelectItem>
            <SelectItem value="reject">Reject</SelectItem>
            <SelectItem value="flag">Flag</SelectItem>
          </SelectContent>
        </Select>

        <Textarea
          placeholder="Reason (visible to staff)"
          value={reason}
          onChange={(event) => setReason(event.target.value)}
        />

        <Textarea
          placeholder="Response / notes"
          value={notes}
          onChange={(event) => setNotes(event.target.value)}
        />
      </div>

      <div className="mt-3 flex justify-end">
        <Button
          onClick={() => onModerate(review.id, action, reason, notes)}
          disabled={isSubmitting}
        >
          {isSubmitting ? "Saving..." : "Apply moderation"}
        </Button>
      </div>
    </div>
  );
}
