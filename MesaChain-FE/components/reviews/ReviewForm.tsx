"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import RatingInput from "./RatingInput";
import ReviewCard from "./ReviewCard";
import type { ReviewCreateInput, Review } from "@/types/reviews";

interface ReviewFormProps {
  onSubmit: (data: ReviewCreateInput) => Promise<void>;
  isSubmitting?: boolean;
}

const draftKey = "review-draft";

export default function ReviewForm({ onSubmit, isSubmitting }: ReviewFormProps) {
  const [rating, setRating] = useState(5);
  const [content, setContent] = useState("");
  const [menuItemId, setMenuItemId] = useState("");
  const [orderId, setOrderId] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [mediaFiles, setMediaFiles] = useState<File[]>([]);

  useEffect(() => {
    const draft = localStorage.getItem(draftKey);
    if (!draft) return;
    try {
      const parsed = JSON.parse(draft);
      setRating(parsed.rating ?? 5);
      setContent(parsed.content ?? "");
      setMenuItemId(parsed.menuItemId ?? "");
      setOrderId(parsed.orderId ?? "");
      setIsAnonymous(parsed.isAnonymous ?? false);
    } catch {
      localStorage.removeItem(draftKey);
    }
  }, []);

  const previewMedia = useMemo(() => mediaFiles.map((file) => URL.createObjectURL(file)), [mediaFiles]);

  useEffect(() => {
    return () => {
      previewMedia.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [previewMedia]);

  const handleSaveDraft = () => {
    localStorage.setItem(
      draftKey,
      JSON.stringify({ rating, content, menuItemId, orderId, isAnonymous })
    );
  };

  const handleClearDraft = () => {
    localStorage.removeItem(draftKey);
    setRating(5);
    setContent("");
    setMenuItemId("");
    setOrderId("");
    setIsAnonymous(false);
    setMediaFiles([]);
  };

  const handleSubmit = async () => {
    await onSubmit({
      rating,
      content,
      menuItemId: menuItemId || undefined,
      orderId: orderId || undefined,
      isAnonymous,
    });
    handleClearDraft();
  };

  const previewReview: Review = {
    id: "preview",
    userId: "preview",
    userName: isAnonymous ? "Anonymous" : "You",
    menuItemId: menuItemId || undefined,
    orderId: orderId || undefined,
    rating,
    content,
    status: "pending",
    helpfulVotesCount: 0,
    totalVotesCount: 0,
    isVerified: false,
    isAnonymous,
    createdAt: new Date().toISOString(),
    media: previewMedia,
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[2fr,1fr]">
      <div className="rounded-xl border bg-white p-6 shadow-sm space-y-5">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Submit a review</h3>
          <p className="text-sm text-gray-500">Share your experience to help other customers.</p>
        </div>

        <div className="space-y-3">
          <Label>Rating</Label>
          <RatingInput value={rating} onChange={setRating} />
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="menuItemId">Menu item ID (optional)</Label>
            <Input id="menuItemId" value={menuItemId} onChange={(e) => setMenuItemId(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="orderId">Order ID (optional)</Label>
            <Input id="orderId" value={orderId} onChange={(e) => setOrderId(e.target.value)} />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="content">Review</Label>
          <Textarea
            id="content"
            value={content}
            onChange={(event) => setContent(event.target.value)}
            maxLength={2000}
            placeholder="Tell us what you loved or what could be improved..."
          />
          <div className="text-xs text-gray-500">{content.length} / 2000</div>
          <p className="text-xs text-gray-400">Tip: mention the dish, service, and timing.</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="media">Upload photos (preview only)</Label>
          <Input
            id="media"
            type="file"
            multiple
            accept="image/*"
            onChange={(event) => setMediaFiles(Array.from(event.target.files || []))}
          />
          <p className="text-xs text-gray-500">Uploads stay local until the API supports media storage.</p>
        </div>

        <label className="flex items-center gap-2 text-sm text-gray-700">
          <input
            type="checkbox"
            checked={isAnonymous}
            onChange={(event) => setIsAnonymous(event.target.checked)}
          />
          Submit anonymously
        </label>

        <div className="flex flex-wrap gap-2">
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? "Submitting..." : "Submit review"}
          </Button>
          <Button variant="outline" onClick={handleSaveDraft}>
            Save draft
          </Button>
          <Button variant="ghost" onClick={handleClearDraft}>
            Clear
          </Button>
        </div>
      </div>

      <div className="space-y-3">
        <h4 className="text-sm font-semibold text-gray-600 uppercase">Preview</h4>
        <ReviewCard review={previewReview} showActions={false} />
      </div>
    </div>
  );
}
