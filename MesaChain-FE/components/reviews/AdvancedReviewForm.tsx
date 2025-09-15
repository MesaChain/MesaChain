import Image from 'next/image';
"use client";
import { useState, useEffect, useCallback, useMemo } from 'react';
import { useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
// import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import StarRating from './StarRating';
import { MediaUploader } from './MediaUploader';
import { ReviewSubmission } from '@/types/reviews';

const reviewSchema = z.object({
  rating: z.number().min(1, 'Please select a rating').max(5),
  content: z
    .string()
    .min(10, 'Review must be at least 10 characters')
    .max(1000, 'Review must not exceed 1000 characters'),
  mediaFiles: z.array(z.instanceof(File)).optional(),
});

type ReviewFormData = z.infer<typeof reviewSchema>;

interface AdvancedReviewFormProps {
  itemId: string;
  itemType: 'DISH' | 'SERVICE' | 'RESTAURANT';
  onSubmit: (review: ReviewSubmission) => Promise<void>;
  className?: string;
}

export function AdvancedReviewForm({
  itemId,
  itemType,
  onSubmit,
  className,
}: AdvancedReviewFormProps) {
  // Ref to track programmatic form mutations
  const isMutatingRef = useRef<boolean>(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const draftKey = useMemo(() => `review-draft-${itemId}`, [itemId]);

  const form = useForm<ReviewFormData>({
    resolver: zodResolver(reviewSchema),
    defaultValues: {
      rating: 0,
      content: '',
      mediaFiles: [],
    },
  });

  // Load draft on mount
  useEffect(() => {
    const savedDraft = localStorage.getItem(draftKey);
    if (savedDraft) {
      let parsed: { rating?: unknown; content?: unknown } | null = null;
      try {
        parsed = JSON.parse(savedDraft);
      } catch (e) {
        localStorage.removeItem(draftKey);
        return;
      }
      const isValid = parsed && typeof parsed === 'object'
        && typeof parsed.rating === 'number'
        && typeof parsed.content === 'string';
      if (isValid && parsed !== null) {
        isMutatingRef.current = true;
        const { rating, content } = parsed as { rating: number; content: string };
        form.reset({ rating, content, mediaFiles: [] });
        isMutatingRef.current = false;
      } else {
        localStorage.removeItem(draftKey);
      }
    }
  }, [draftKey, form]);

  // Save draft when form changes
  const saveDraft = useCallback((data: Partial<ReviewFormData>) => {
    if (isMutatingRef.current) return;
    localStorage.setItem(draftKey, JSON.stringify({
      rating: data.rating,
      content: data.content,
    }));
  }, [draftKey]);

  useEffect(() => {
    const subscription = form.watch((data) => {
      if (isMutatingRef.current) return;
      // Ensure mediaFiles is File[] (no undefined)
      const filteredMediaFiles = Array.isArray(data.mediaFiles)
        ? data.mediaFiles.filter((file): file is File => !!file)
        : undefined;
      saveDraft({
        ...data,
        mediaFiles: filteredMediaFiles,
      });
    });
    return () => subscription.unsubscribe();
  }, [form, saveDraft]);

  const clearDraft = () => {
    localStorage.removeItem(draftKey);
  };

  const onSubmitForm = async (data: ReviewFormData) => {
    try {
      isMutatingRef.current = true;
      await onSubmit({
        ...data,
        itemId,
        itemType,
      });
      clearDraft();
      form.reset();
      isMutatingRef.current = false;
    } catch (error) {
      isMutatingRef.current = false;
      // Parent handles the error (toast). Avoid rethrow to prevent unhandled rejections.
      return;
    }
  };

  // Memoize preview URLs for mediaFiles
  const previewUrls = useMemo(() => {
    const mediaFiles = form.watch('mediaFiles') ?? [];
    return mediaFiles.map(file => URL.createObjectURL(file));
  }, [form]);

  // Cleanup object URLs when mediaFiles change or component unmounts
  useEffect(() => {
    return () => {
      previewUrls.forEach(url => URL.revokeObjectURL(url));
    };
  }, [previewUrls]);

  const PreviewDialog = () => (
    <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Review Preview</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <StarRating value={form.getValues('rating')} />
            <span className="text-sm text-gray-500">
              {new Date().toLocaleDateString()}
            </span>
          </div>
          <p className="whitespace-pre-wrap">{form.getValues('content')}</p>
          {previewUrls.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {previewUrls.map((url, index) => (
                <div
                  key={index}
                  className="relative aspect-square rounded-lg overflow-hidden"
                >
                  <Image
                    src={url}
                    alt={`Preview ${index + 1}`}
                    className="object-cover w-full h-full"
                    unoptimized
                    width={100}
                    height={100}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );

  return (
    <>
      <form onSubmit={form.handleSubmit(onSubmitForm)} className={className}>
        <Card className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium mb-1">Your Rating</label>
            <StarRating
              value={form.watch('rating')}
              onChange={value => form.setValue('rating', value)}
              size="lg"
              interactive
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Your Review</label>
            <Textarea
              placeholder="Share your experience..."
              className="min-h-[120px] resize-none"
              maxLength={1000}
              {...form.register('content')}
            />
            <div className="flex justify-end">
              <span className="text-sm text-gray-500">
                {form.watch('content').length}/1000
              </span>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Add Photos</label>
            <MediaUploader
              files={form.watch('mediaFiles') || []}
              onFilesChange={files => form.setValue('mediaFiles', files)}
            />
          </div>
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsPreviewOpen(true)}
              className="sm:flex-1"
            >
              Preview Review
            </Button>
            <Button
              type="submit"
              className="sm:flex-1"
              disabled={form.formState.isSubmitting}
            >
              {form.formState.isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                'Submit Review'
              )}
            </Button>
          </div>
        </Card>
      </form>
      <PreviewDialog />
    </>
  );
}