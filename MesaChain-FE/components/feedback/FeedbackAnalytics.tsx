import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { FeedbackAnalytics as FeedbackAnalyticsType } from "@/types/feedback";

interface FeedbackAnalyticsProps {
  analytics: FeedbackAnalyticsType | null;
  isLoading?: boolean;
}

export default function FeedbackAnalytics({ analytics, isLoading }: FeedbackAnalyticsProps) {
  if (isLoading) {
    return <div className="text-sm text-gray-500">Loading feedback analytics...</div>;
  }

  if (!analytics) {
    return <div className="text-sm text-gray-500">No analytics available.</div>;
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Feedback overview</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">Total feedback</span>
            <span className="text-sm font-semibold">{analytics.overview.totalFeedback}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">Open</span>
            <span className="text-sm font-semibold">{analytics.overview.openFeedback}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">Resolved</span>
            <span className="text-sm font-semibold">{analytics.overview.resolvedFeedback}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">Closed</span>
            <span className="text-sm font-semibold">{analytics.overview.closedFeedback}</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Category breakdown</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {analytics.categories.map((category) => (
            <div key={category.category} className="flex items-center justify-between text-sm">
              <span>{category.category.replace("_", " ")}</span>
              <span className="font-semibold">{category.count}</span>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Priority mix</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {analytics.priorities.map((priority) => (
            <div key={priority.priority} className="flex items-center justify-between text-sm">
              <span>{priority.priority}</span>
              <span className="font-semibold">{priority.count}</span>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
