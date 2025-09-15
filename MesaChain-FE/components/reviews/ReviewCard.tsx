import { useState } from 'react';
import Image from 'next/image';
import { format } from 'date-fns';
import { ThumbsUp, Flag } from 'lucide-react';
import { Review } from '@/types/reviews';
import StarRating from './StarRating';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { reviewsApi } from '@/lib/api/reviews';

interface ReviewCardProps {
  review: Review;
  onHelpfulUpdate?: () => void;
}

export function ReviewCard({ review, onHelpfulUpdate }: ReviewCardProps) {
  const [isReportDialogOpen, setIsReportDialogOpen] = useState(false);
  const [isImageDialogOpen, setIsImageDialogOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState('');

  const handleMarkHelpful = async () => {
    try {
      await reviewsApi.markHelpful(review.id);
      onHelpfulUpdate?.();
    } catch (error) {
      console.error('Failed to mark review as helpful:', error);
    }
  };

  const openImageDialog = (imageUrl: string) => {
    setSelectedImage(imageUrl);
    setIsImageDialogOpen(true);
  };

  return (
    <div className="p-4 border rounded-lg space-y-3 bg-white shadow-sm">
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <StarRating value={review.rating} size="sm" />
            <span className="text-sm text-gray-500">
              {format(new Date(review.createdAt), 'MMM d, yyyy')}
            </span>
          </div>
          <h4 className="font-medium">{review.authorName}</h4>
        </div>
        <Badge
          variant={
            review.verificationStatus === 'VERIFIED'
              ? 'secondary'
              : review.verificationStatus === 'PENDING'
              ? 'default'
              : 'outline'
          }
        >
          {review.verificationStatus.toLowerCase()}
        </Badge>
      </div>

      <p className="text-gray-700">{review.content}</p>

      {review.mediaUrls && review.mediaUrls.length > 0 && (
        <div className="flex gap-2 overflow-x-auto py-2">
          {review.mediaUrls.map((url, index) => (
            <button
              key={index}
              onClick={() => openImageDialog(url)}
              className="relative h-20 w-20 rounded-md overflow-hidden flex-shrink-0"
            >
              <Image
                src={url}
                alt={`Review image ${index + 1}`}
                fill
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between pt-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleMarkHelpful}
          className="text-gray-600 hover:text-gray-900"
        >
          <ThumbsUp className="w-4 h-4 mr-1" />
          Helpful ({review.helpfulCount})
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsReportDialogOpen(true)}
          className="text-gray-600 hover:text-red-600"
        >
          <Flag className="w-4 h-4 mr-1" />
          Report
        </Button>
      </div>

      <Dialog open={isImageDialogOpen} onOpenChange={setIsImageDialogOpen}>
        <DialogContent className="max-w-3xl">
          <div className="relative w-full aspect-video">
            <Image
              src={selectedImage}
              alt="Review image"
              fill
              className="object-contain"
            />
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isReportDialogOpen} onOpenChange={setIsReportDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Report Review</DialogTitle>
          </DialogHeader>
          {/* Report form will be implemented here */}
        </DialogContent>
      </Dialog>
    </div>
  );
}