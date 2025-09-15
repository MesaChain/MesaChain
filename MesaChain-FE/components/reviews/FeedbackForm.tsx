import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
// Replace with correct form components if available, otherwise remove and use local implementation or fallback
// import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { toast } from '../ui/use-toast';
import { reviewsApi } from '@/lib/api/reviews';

const feedbackSchema = z.object({
  category: z.enum(['GENERAL', 'SERVICE', 'FOOD', 'CLEANLINESS', 'OTHER']),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']),
  title: z.string().min(5, 'Title must be at least 5 characters').max(100),
  description: z.string().min(20, 'Description must be at least 20 characters').max(2000),
});

type FeedbackFormData = z.infer<typeof feedbackSchema>;

interface FeedbackFormProps {
  onSubmitSuccess?: () => void;
  className?: string;
}

export function FeedbackForm({ onSubmitSuccess, className }: FeedbackFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<FeedbackFormData>({
    resolver: zodResolver(feedbackSchema),
    defaultValues: {
      category: 'GENERAL',
      priority: 'MEDIUM',
      title: '',
      description: '',
    },
  });

  const onSubmit = async (data: FeedbackFormData) => {
    try {
      setIsSubmitting(true);
      await reviewsApi.submitFeedback({ ...data, status: 'SUBMITTED' });
      toast({
        title: 'Feedback submitted successfully',
        description: 'Thank you for your feedback. We will review it shortly.',
      });
      form.reset();
      onSubmitSuccess?.();
    } catch (error) {
      toast({
        title: 'Error submitting feedback',
        description: 'Please try again later.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

// ...existing code...
    <form onSubmit={form.handleSubmit(onSubmit)} className={className}>
      <Card className="p-6 space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium mb-1">Category</label>
            <Select
              onValueChange={value => form.setValue('category', value as FeedbackFormData['category'])}
              defaultValue={form.getValues('category')}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="GENERAL">General</SelectItem>
                <SelectItem value="SERVICE">Service</SelectItem>
                <SelectItem value="FOOD">Food</SelectItem>
                <SelectItem value="CLEANLINESS">Cleanliness</SelectItem>
                <SelectItem value="OTHER">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Priority</label>
            <Select
              onValueChange={value => form.setValue('priority', value as FeedbackFormData['priority'])}
              defaultValue={form.getValues('priority')}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="LOW">Low</SelectItem>
                <SelectItem value="MEDIUM">Medium</SelectItem>
                <SelectItem value="HIGH">High</SelectItem>
                <SelectItem value="URGENT">Urgent</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Title</label>
          <Input
            placeholder="Brief summary of your feedback"
            {...form.register('title')}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Description</label>
          <Textarea
            placeholder="Detailed description of your feedback..."
            className="min-h-[120px]"
            {...form.register('description')}
          />
          <div className="flex justify-end">
            <span className="text-sm text-gray-500">
              {form.watch('description').length}/2000
            </span>
          </div>
        </div>
        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Submitting...
            </>
          ) : (
            'Submit Feedback'
          )}
        </Button>
      </Card>
    </form>
}