import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import type { FeedbackCategory, FeedbackPriority, FeedbackQuery, FeedbackStatus } from "@/types/feedback";

interface FeedbackFiltersProps {
  filters: FeedbackQuery;
  onChange: (filters: FeedbackQuery) => void;
  onReset: () => void;
}

const categoryOptions: FeedbackCategory[] = ["service", "food_quality", "ambiance", "pricing", "staff", "general"];
const priorityOptions: FeedbackPriority[] = ["low", "medium", "high", "urgent"];
const statusOptions: FeedbackStatus[] = ["open", "in_progress", "resolved", "closed"];

export default function FeedbackFilters({ filters, onChange, onReset }: FeedbackFiltersProps) {
  const handleChange = (next: Partial<FeedbackQuery>) => onChange({ ...filters, ...next, page: 1 });

  return (
    <div className="rounded-xl border bg-white p-4 shadow-sm">
      <div className="grid gap-3 md:grid-cols-4">
        <Input
          placeholder="Search feedback"
          title="Search feedback by subject or message"
          value={filters.search || ""}
          onChange={(event) => handleChange({ search: event.target.value })}
        />

        <Select
          value={filters.category || "all"}
          onValueChange={(value) => handleChange({ category: value === "all" ? undefined : (value as FeedbackCategory) })}
        >
          <SelectTrigger title="Filter by category">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All categories</SelectItem>
            {categoryOptions.map((option) => (
              <SelectItem key={option} value={option}>
                {option.replace("_", " ")}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={filters.priority || "all"}
          onValueChange={(value) => handleChange({ priority: value === "all" ? undefined : (value as FeedbackPriority) })}
        >
          <SelectTrigger title="Filter by priority">
            <SelectValue placeholder="Priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All priority</SelectItem>
            {priorityOptions.map((option) => (
              <SelectItem key={option} value={option}>
                {option}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="flex gap-2">
          <Select
            value={filters.status || "all"}
            onValueChange={(value) => handleChange({ status: value === "all" ? undefined : (value as FeedbackStatus) })}
          >
            <SelectTrigger title="Filter by status">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All status</SelectItem>
              {statusOptions.map((option) => (
                <SelectItem key={option} value={option}>
                  {option.replace("_", " ")}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="ghost" onClick={onReset}>
            Reset
          </Button>
        </div>
      </div>
    </div>
  );
}
