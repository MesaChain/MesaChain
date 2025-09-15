import { useState } from 'react';
import { format } from 'date-fns';
import {
  AlertCircle,
  Clock,
  CheckCircle2,
  MessageSquare,
  RefreshCw,
} from 'lucide-react';
import { Feedback } from '@/types/reviews';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
// Removed ScrollArea import, component does not exist
import { cn } from '@/lib/utils';
import { reviewsApi } from '@/lib/api/reviews';

interface FeedbackTrackingProps {
  feedback: Feedback;
  onUpdate?: () => void;
  className?: string;
}

const priorityColors = {
  LOW: 'bg-gray-500',
  MEDIUM: 'bg-blue-500',
  HIGH: 'bg-orange-500',
  URGENT: 'bg-red-500',
};

const statusIcons = {
  SUBMITTED: Clock,
  IN_REVIEW: RefreshCw,
  RESPONDED: MessageSquare,
  RESOLVED: CheckCircle2,
};

export function FeedbackTracking({
  feedback,
  onUpdate,
  className,
}: FeedbackTrackingProps) {
  const [newResponse, setNewResponse] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const StatusIcon = statusIcons[feedback.status] || AlertCircle;

  const handleSubmitResponse = async () => {
    if (!newResponse.trim()) return;

    try {
      setIsSubmitting(true);
      setError('');
      await reviewsApi.respondToFeedback(feedback.id, newResponse);
      setNewResponse('');
      onUpdate?.();
    } catch (err) {
      setError('Failed to submit response. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className={cn('w-full', className)}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-xl font-semibold">{feedback.title}</CardTitle>
            <CardDescription className="mt-1">
              Submitted by {feedback.authorName} on{' '}
              {format(new Date(feedback.createdAt), 'MMM d, yyyy')}
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Badge
              variant="outline"
              className={cn(
                'px-2 py-1 capitalize',
                priorityColors[feedback.priority]
              )}
            >
              {feedback.priority.toLowerCase()}
            </Badge>
            <Badge variant="secondary" className="capitalize">
              {feedback.category.toLowerCase()}
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="flex items-center gap-2 text-sm">
          <StatusIcon className="h-4 w-4" />
          <span className="capitalize">{feedback.status.toLowerCase()}</span>
        </div>

        <div className="border rounded-lg p-4 bg-muted/10">
          <p className="whitespace-pre-wrap">{feedback.description}</p>
        </div>

        {feedback.responses && feedback.responses.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-medium">Responses</h4>
            <div className="h-[200px] rounded-md border p-4 overflow-y-auto">
              <div className="space-y-4">
                {feedback.responses.map((response) => (
                  <div key={response.id} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">{response.responderName}</span>
                      <span className="text-gray-500">
                        {format(new Date(response.createdAt), 'MMM d, yyyy h:mm a')}
                      </span>
                    </div>
                    <p className="text-sm whitespace-pre-wrap">{response.content}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {feedback.status !== 'RESOLVED' && (
          <div className="space-y-2">
            <Textarea
              placeholder="Add a response..."
              value={newResponse}
              onChange={(e) => setNewResponse(e.target.value)}
              className="min-h-[100px]"
            />
            {error && (
              <p className="text-sm text-red-500">{error}</p>
            )}
          </div>
        )}
      </CardContent>

      {feedback.status !== 'RESOLVED' && (
        <CardFooter className="flex justify-between">
          <Button
            variant="outline"
            onClick={() =>
              reviewsApi
                .updateFeedbackStatus(feedback.id, 'RESOLVED')
                .then(onUpdate)
            }
          >
            Mark as Resolved
          </Button>
          <Button
            onClick={handleSubmitResponse}
            disabled={!newResponse.trim() || isSubmitting}
          >
            {isSubmitting ? 'Sending...' : 'Send Response'}
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}