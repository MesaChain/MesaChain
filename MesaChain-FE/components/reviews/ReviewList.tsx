import { useState, useEffect, useCallback } from 'react';
import { Review } from '@/types/reviews';
import { ReviewCard } from './ReviewCard';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { reviewsApi } from '@/lib/api/reviews';
import { Loader2 } from 'lucide-react';
import { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

interface ReviewListProps {
  itemId?: string;
  itemType?: string;
  className?: string;
}

export function ReviewList({ itemId, itemType, className }: ReviewListProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [sortBy, setSortBy] = useState('recent');
  const [filterRating, setFilterRating] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);
  const [filterVerified, setFilterVerified] = useState('all');

  const fetchReviews = useCallback(async (isLoadMore = false, pageOverride?: number) => {
    try {
      setLoading(true);
      setError('');

      const payload = await reviewsApi.getReviews({
        itemId,
        itemType,
        page: isLoadMore ? (pageOverride ?? page) : 1,
        limit: 10,
        sortBy,
        rating: filterRating !== 'all' ? Number(filterRating) : undefined,
        verificationStatus: filterVerified !== 'all' ? filterVerified : undefined,
      });

      // If payload is an array, use it directly; otherwise, try payload.data or payload.reviews
      let newReviews: Review[] = [];
      if (Array.isArray(payload)) {
        newReviews = payload;
      } else if (Array.isArray(payload?.data)) {
        newReviews = payload.data;
      }
      setHasMore(newReviews.length === 10);

      if (isLoadMore) {
        setReviews((prev) => [...prev, ...newReviews]);
      } else {
        setReviews(newReviews);
      }
    } catch (err) {
      setError('Failed to load reviews. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [itemId, itemType, page, sortBy, filterRating, filterVerified]);

  useEffect(() => {
    setPage(1);
    fetchReviews();
  }, [itemId, itemType, sortBy, filterRating, filterVerified, refreshKey, fetchReviews]);

  const handleLoadMore = () => {
    const next = page + 1;
    setPage(next);
    fetchReviews(true, next);
  };

  const handleHelpfulUpdate = () => {
    setRefreshKey((prev) => prev + 1);
  };

  // Fuzzy search and multi-criteria filtering
  const filteredReviews = useMemo(() => {
    let result = reviews;
    if (filterRating !== 'all') {
      result = result.filter((r) => r.rating === Number(filterRating));
    }
    if (filterVerified !== 'all') {
      result = result.filter((r) => r.verificationStatus === filterVerified);
    }
    if (searchQuery.trim()) {
      const query = searchQuery.trim().toLowerCase();
      result = result.filter((r) => {
        // Fuzzy match on content and authorName
        return (
          r.content.toLowerCase().includes(query) ||
          r.authorName.toLowerCase().includes(query)
        );
      });
    }
    // Sorting
    if (sortBy === 'recent') {
      result = [...result].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } else if (sortBy === 'helpful') {
      result = [...result].sort((a, b) => (b.helpfulCount || 0) - (a.helpfulCount || 0));
    } else if (sortBy === 'rating-high') {
      result = [...result].sort((a, b) => b.rating - a.rating);
    } else if (sortBy === 'rating-low') {
      result = [...result].sort((a, b) => a.rating - b.rating);
    }
    return result;
  }, [reviews, filterRating, filterVerified, searchQuery, sortBy]);

  // Analytics: rating distribution
  const ratingDistribution = useMemo(() => {
    const dist: { [key: number]: number } = {};
    reviews.forEach((r) => {
      dist[r.rating] = (dist[r.rating] || 0) + 1;
    });
    return [5, 4, 3, 2, 1].map((star) => ({ star, count: dist[star] || 0 }));
  }, [reviews]);

  return (
    <div className={className}>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
        <div className="flex gap-2 flex-wrap">
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="recent">Most Recent</SelectItem>
              <SelectItem value="helpful">Most Helpful</SelectItem>
              <SelectItem value="rating-high">Highest Rating</SelectItem>
              <SelectItem value="rating-low">Lowest Rating</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filterRating} onValueChange={setFilterRating}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Filter by rating" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Ratings</SelectItem>
              <SelectItem value="5">5 Stars</SelectItem>
              <SelectItem value="4">4 Stars</SelectItem>
              <SelectItem value="3">3 Stars</SelectItem>
              <SelectItem value="2">2 Stars</SelectItem>
              <SelectItem value="1">1 Star</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filterVerified} onValueChange={setFilterVerified}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Verification" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="VERIFIED">Verified</SelectItem>
              <SelectItem value="PENDING">Pending</SelectItem>
              <SelectItem value="UNVERIFIED">Rejected</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="w-full sm:w-auto">
          <Input
            type="search"
            placeholder="Search reviews..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="max-w-xs"
          />
        </div>
      </div>

      {/* Analytics Chart */}
      <div className="mb-6">
        <h4 className="text-sm font-semibold mb-2">Rating Distribution</h4>
        <div className="w-full h-32">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={ratingDistribution} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
              <XAxis dataKey="star" tickFormatter={(v) => `${v}★`} />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="count" fill="#F4A340" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {error ? (
        <div className="text-center text-red-500 py-4">{error}</div>
      ) : (
        <>
          <div className="space-y-4">
            {filteredReviews.map((review) => (
              <ReviewCard
                key={review.id}
                review={review}
                onHelpfulUpdate={handleHelpfulUpdate}
              />
            ))}
          </div>

          {loading && (
            <div className="text-center py-4">
              <Loader2 className="h-6 w-6 animate-spin mx-auto" />
            </div>
          )}

          {!loading && hasMore && (
            <div className="text-center mt-6">
              <Button
                variant="outline"
                onClick={handleLoadMore}
              >
                Load More Reviews
              </Button>
            </div>
          )}

          {!loading && filteredReviews.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No reviews found.
            </div>
          )}
        </>
      )}
    </div>
  );
}