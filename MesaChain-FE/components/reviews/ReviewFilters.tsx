import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import type { ReviewQuery, ReviewSortBy, ReviewSortOrder, ReviewStatus } from "@/types/reviews";

interface ReviewFiltersProps {
  filters: ReviewQuery;
  onChange: (filters: ReviewQuery) => void;
  onReset: () => void;
}

const ratingOptions = ["1", "2", "3", "4", "5"];
const statusOptions: ReviewStatus[] = ["pending", "approved", "rejected", "flagged"];
const sortOptions: { label: string; value: ReviewSortBy }[] = [
  { label: "Newest", value: "createdAt" },
  { label: "Rating", value: "rating" },
  { label: "Helpful votes", value: "helpfulVotesCount" },
];

export default function ReviewFilters({ filters, onChange, onReset }: ReviewFiltersProps) {
  const handleChange = (next: Partial<ReviewQuery>) => onChange({ ...filters, ...next, page: 1 });

  return (
    <div className="rounded-xl border bg-white p-4 shadow-sm">
      <div className="grid gap-3 md:grid-cols-4">
        <Input
          placeholder="Search reviews"
          title="Search reviews by content"
          value={filters.search || ""}
          onChange={(event) => handleChange({ search: event.target.value })}
        />

        <Select
          value={filters.rating ? String(filters.rating) : "all"}
          onValueChange={(value) => handleChange({ rating: value === "all" ? undefined : Number(value) })}
        >
          <SelectTrigger title="Filter by rating">
            <SelectValue placeholder="Rating" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All ratings</SelectItem>
            {ratingOptions.map((option) => (
              <SelectItem key={option} value={option}>
                {option} stars
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={filters.status || "all"}
          onValueChange={(value) => handleChange({ status: value === "all" ? undefined : (value as ReviewStatus) })}
        >
          <SelectTrigger title="Filter by status">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All status</SelectItem>
            {statusOptions.map((option) => (
              <SelectItem key={option} value={option}>
                {option}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="flex gap-2">
          <Select
            value={filters.sortBy || "createdAt"}
            onValueChange={(value) => handleChange({ sortBy: value as ReviewSortBy })}
          >
          <SelectTrigger title="Sort reviews">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              {sortOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            onClick={() =>
              handleChange({
                sortOrder: (filters.sortOrder || "desc") === "desc" ? "asc" : ("desc" as ReviewSortOrder),
              })
            }
          >
            {filters.sortOrder === "asc" ? "Asc" : "Desc"}
          </Button>
          <Button variant="ghost" onClick={onReset}>
            Reset
          </Button>
        </div>
      </div>
    </div>
  );
}
