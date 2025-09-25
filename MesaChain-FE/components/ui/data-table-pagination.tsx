import React from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { TablePaginationProps } from './data-table-types';
import { Button } from './button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './select';
import { cn } from '@/lib/utils';

export const TablePagination = ({
  pagination,
  pageSizeOptions,
  onPageChange,
  onPageSizeChange,
  className
}: TablePaginationProps) => {
  const { page, pageSize, total, totalPages } = pagination;

  const endItem = Math.min(page * pageSize, total);
  const startItem = total > 0 ? Math.min((page - 1) * pageSize + 1, endItem) : 0;

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      onPageChange(newPage);
    }
  };

  const handlePageSizeChange = (newPageSize: string) => {
    const parsed = Number.parseInt(newPageSize, 10);
    if (Number.isFinite(parsed) && parsed > 0) {
      onPageSizeChange(parsed);
    }
  };

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      // Show all pages if total is small
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Show first page
      pages.push(1);

      if (page > 3) {
        pages.push('...');
      }

      // Show pages around current page
      const start = Math.max(2, page - 1);
      const end = Math.min(totalPages - 1, page + 1);

      for (let i = start; i <= end; i++) {
        if (i !== 1 && i !== totalPages) {
          pages.push(i);
        }
      }

      if (page < totalPages - 2) {
        pages.push('...');
      }

      // Show last page
      if (totalPages > 1) {
        pages.push(totalPages);
      }
    }

    return pages;
  };

  if (total === 0) {
    return null;
  }

  return (
    <div className={cn('flex items-center justify-between px-4 py-3 bg-background border-t border-border', className)}>
      {/* Page size selector */}
      <div className="flex items-center space-x-2">
        <span className="text-sm text-gray-700">Rows per page:</span>
        <Select value={pageSize.toString()} onValueChange={handlePageSizeChange}>
          <SelectTrigger className="h-8 w-16">
            <SelectValue placeholder="25" />
          </SelectTrigger>
          <SelectContent>
            {pageSizeOptions.map((size) => (
              <SelectItem key={size} value={size.toString()}>
                {size}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Page info */}
      <div className="flex items-center space-x-6">
        <span className="text-sm text-gray-700">
          Showing {startItem} to {endItem} of {total} results
        </span>

        {/* Pagination controls */}
        <div className="flex items-center space-x-1">
          {/* First page */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(1)}
            disabled={page === 1}
            className="h-8 w-8 p-0"
            aria-label="Go to first page"
          >
            <ChevronsLeft className="h-4 w-4" />
          </Button>

          {/* Previous page */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(page - 1)}
            disabled={page === 1}
            className="h-8 w-8 p-0"
            aria-label="Go to previous page"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          {/* Page numbers */}
          <div className="flex items-center space-x-1">
            {getPageNumbers().map((pageNum, index) => (
              <React.Fragment key={index}>
                {pageNum === '...' ? (
                  <span className="px-2 py-1 text-sm text-gray-500">...</span>
                ) : (
                  <Button
                    variant={page === pageNum ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handlePageChange(pageNum as number)}
                    className="h-8 w-8 p-0"
                    aria-label={`Go to page ${pageNum}`}
                    aria-current={page === pageNum ? 'page' : undefined}
                  >
                    {pageNum}
                  </Button>
                )}
              </React.Fragment>
            ))}
          </div>

          {/* Next page */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(page + 1)}
            disabled={page === totalPages}
            className="h-8 w-8 p-0"
            aria-label="Go to next page"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>

          {/* Last page */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(totalPages)}
            disabled={page === totalPages}
            className="h-8 w-8 p-0"
            aria-label="Go to last page"
          >
            <ChevronsRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};
