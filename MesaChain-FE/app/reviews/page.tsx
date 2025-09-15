import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AdvancedReviewForm } from '@/components/reviews/AdvancedReviewForm';
import { ReviewList } from '@/components/reviews/ReviewList';
import { ReviewSubmission } from '@/types/reviews';
import { reviewsApi } from '@/lib/api/reviews';
// Update the import path to the correct location of use-toast
import { toast } from '@/components/ui/use-toast';

interface ReviewPageProps {
  itemId: string;
  itemType: 'DISH' | 'SERVICE' | 'RESTAURANT';
  className?: string;
}

export default function ReviewPage({
  itemId,
  itemType,
  className,
}: ReviewPageProps) {
  const [activeTab, setActiveTab] = useState('read');

  const handleReviewSubmit = async (review: ReviewSubmission) => {
    try {
      await reviewsApi.submitReview(review);
      toast({
        title: 'Review submitted successfully!'
      });
      setActiveTab('read'); // Switch to reviews list after submission
    } catch (error) {
      toast({
        title: 'Failed to submit review',
        variant: 'destructive',
      });
      throw error; // Re-throw to be handled by the form
    }
  };

  return (
    <div className={className}>
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="read">Read Reviews</TabsTrigger>
          <TabsTrigger value="write">Write a Review</TabsTrigger>
        </TabsList>

        <TabsContent value="read" className="mt-6">
          <ReviewList itemId={itemId} itemType={itemType} />
        </TabsContent>

        <TabsContent value="write" className="mt-6">
          <AdvancedReviewForm
            itemId={itemId}
            itemType={itemType}
            onSubmit={handleReviewSubmit}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}