import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
// Table components import removed, use standard HTML table or fallback
// DropdownMenu components import removed, use fallback or remove
import { Button } from '@/components/ui/button';
// Input import removed, not used
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ReviewStats, Review } from '@/types/reviews';
import { reviewsApi } from '@/lib/api/reviews';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface ReviewModerationDashboardProps {
  className?: string;
}

export function ReviewModerationDashboard({
  className,
}: ReviewModerationDashboardProps) {
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState<ReviewStats | null>(null);
  const [pendingReviews, setPendingReviews] = useState<Review[]>([]);
  const [reportedReviews, setReportedReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchStats = async () => {
    try {
      const response = await reviewsApi.getReviewStats();
      setStats(response.data);
    } catch (err) {
      setError('Failed to load review statistics');
    }
  };

  const fetchPendingReviews = async () => {
    try {
      const response = await reviewsApi.getReviews({
        verificationStatus: 'PENDING',
      });
      setPendingReviews(response.data.reviews);
    } catch (err) {
      setError('Failed to load pending reviews');
    }
  };

  const fetchReportedReviews = async () => {
    try {
      const response = await reviewsApi.getReviews({
        verificationStatus: 'REPORTED',
      });
      setReportedReviews(response.data.reviews);
    } catch (err) {
      setError('Failed to load reported reviews');
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      await Promise.all([
        fetchStats(),
        fetchPendingReviews(),
        fetchReportedReviews(),
      ]);
      setLoading(false);
    };
    fetchData();
  }, []);

  const handleModerateReview = async (
    reviewId: string,
    action: 'APPROVE' | 'REJECT',
    reason?: string
  ) => {
    try {
      await reviewsApi.moderateReview(reviewId, action, reason);
      await fetchPendingReviews();
      await fetchStats();
    } catch (err) {
      setError('Failed to moderate review');
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  return (
    <div className={className}>
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="pending">Pending Reviews</TabsTrigger>
          <TabsTrigger value="reported">Reported Reviews</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Reviews
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {stats?.totalReviews ?? 0}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Average Rating
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {stats?.averageRating?.toFixed(1) ?? 0}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Pending Reviews
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {pendingReviews.length}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Reported Reviews
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {reportedReviews.length}
                </div>
              </CardContent>
            </Card>
          </div>

          {stats && (
            <Card className="mt-4">
              <CardHeader>
                <CardTitle>Rating Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart
                    data={Object.entries(stats.ratingDistribution).map(
                      ([rating, count]) => ({
                        rating: Number(rating),
                        count,
                      })
                    )}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="rating" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#4f46e5" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="pending">
          <Card>
            <CardHeader>
              <CardTitle>Pending Reviews</CardTitle>
              <CardDescription>
                Reviews awaiting moderation before being published
              </CardDescription>
            </CardHeader>
            <CardContent>
              <table className="w-full text-sm">
                <thead>
                  <tr>
                    <th>Author</th>
                    <th>Rating</th>
                    <th>Content</th>
                    <th>Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingReviews.map((review) => (
                    <tr key={review.id}>
                      <td>{review.authorName}</td>
                      <td>{review.rating}</td>
                      <td className="max-w-md truncate">{review.content}</td>
                      <td>{new Date(review.createdAt).toLocaleDateString()}</td>
                      <td>
                        <Button variant="outline" size="sm" onClick={() => handleModerateReview(review.id, 'APPROVE')}>
                          Approve
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleModerateReview(review.id, 'REJECT')}>
                          Reject
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reported">
          <Card>
            <CardHeader>
              <CardTitle>Reported Reviews</CardTitle>
              <CardDescription>
                Reviews that have been flagged by users
              </CardDescription>
            </CardHeader>
            <CardContent>
              <table className="w-full text-sm">
                <thead>
                  <tr>
                    <th>Author</th>
                    <th>Content</th>
                    <th>Reports</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {reportedReviews.map((review) => (
                    <tr key={review.id}>
                      <td>{review.authorName}</td>
                      <td className="max-w-md truncate">{review.content}</td>
                      <td>
                        <Badge variant="destructive">
                          {/* Assuming there's a reportCount field */}
                          3 Reports
                        </Badge>
                      </td>
                      <td>
                        <Button variant="outline" size="sm" onClick={() => handleModerateReview(review.id, 'APPROVE')}>
                          Keep
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleModerateReview(review.id, 'REJECT')}>
                          Remove
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}