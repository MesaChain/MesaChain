import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ReviewRating from "./ReviewRating";
import type { ReviewStats } from "@/types/reviews";

interface ReviewAnalyticsProps {
  stats: ReviewStats | null;
  isLoading?: boolean;
}

export default function ReviewAnalytics({ stats, isLoading }: ReviewAnalyticsProps) {
  if (isLoading) {
    return <div className="text-sm text-gray-500">Loading review analytics...</div>;
  }

  if (!stats) {
    return <div className="text-sm text-gray-500">No review analytics available.</div>;
  }

  const distribution = Object.entries(stats.ratingDistribution || {}).sort((a, b) => Number(b[0]) - Number(a[0]));

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Overview</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">Total reviews</span>
            <span className="text-sm font-semibold">{stats.totalReviews}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">Average rating</span>
            <ReviewRating rating={stats.averageRating} />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">Helpfulness score</span>
            <span className="text-sm font-semibold">{stats.helpfulnessScore.toFixed(2)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">Pending</span>
            <span className="text-sm font-semibold">{stats.pendingReviews}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">Flagged</span>
            <span className="text-sm font-semibold">{stats.flaggedReviews}</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Rating distribution</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {distribution.length === 0 && (
            <p className="text-sm text-gray-500">No ratings yet.</p>
          )}
          {distribution.map(([rating, count]) => (
            <div key={rating} className="flex items-center justify-between text-sm">
              <span>{rating} stars</span>
              <span className="font-semibold">{count}</span>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
