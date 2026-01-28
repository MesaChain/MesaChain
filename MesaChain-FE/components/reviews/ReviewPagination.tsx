import { Button } from "@/components/ui/button";

interface ReviewPaginationProps {
  page: number;
  total: number;
  limit: number;
  onPageChange: (page: number) => void;
}

export default function ReviewPagination({ page, total, limit, onPageChange }: ReviewPaginationProps) {
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const canPrev = page > 1;
  const canNext = page < totalPages;

  return (
    <div className="flex items-center justify-between gap-3">
      <p className="text-sm text-gray-500">
        Page {page} of {totalPages} ({total} reviews)
      </p>
      <div className="flex gap-2">
        <Button variant="outline" size="sm" disabled={!canPrev} onClick={() => onPageChange(page - 1)}>
          Prev
        </Button>
        <Button variant="outline" size="sm" disabled={!canNext} onClick={() => onPageChange(page + 1)}>
          Next
        </Button>
      </div>
    </div>
  );
}
