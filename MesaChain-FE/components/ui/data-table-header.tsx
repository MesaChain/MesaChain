import React, { useState } from 'react';
import { ArrowUpDown, ArrowUp, ArrowDown, Filter, X } from 'lucide-react';
import { TableHeaderProps } from './data-table-types';
import { Button } from './button';
import { Input } from './input';
import { cn } from '@/lib/utils';

export const TableHeader = <T = any>({
  columns,
  sortConfig,
  filters,
  selectable = false,
  expandable = false,
  onSort,
  onFilter,
  onClearFilter,
  className
}: TableHeaderProps<T>) => {
  const [filterValues, setFilterValues] = useState<Record<string, string>>({});

  const visibleColumns = columns.filter(col => !col.hidden);

  const handleSort = (field: string) => {
    onSort(field);
  };

  const handleFilterChange = (field: string, value: string) => {
    setFilterValues(prev => ({ ...prev, [field]: value }));
    onFilter(field, value, 'contains');
  };

  const handleClearFilter = (field: string) => {
    setFilterValues(prev => ({ ...prev, [field]: '' }));
    onClearFilter(field);
  };

  const getSortIcon = (field: string) => {
    if (sortConfig?.field !== field) {
      return <ArrowUpDown className="h-4 w-4 text-gray-400" />;
    }
    return sortConfig.direction === 'asc' 
      ? <ArrowUp className="h-4 w-4 text-blue-600" />
      : <ArrowDown className="h-4 w-4 text-blue-600" />;
  };

  const getFilterValue = (field: string) => {
    const filter = filters.find(f => f.field === field);
    return filterValues[field] || filter?.value || '';
  };

  const hasFilter = (field: string) => {
    return filters.some(f => f.field === field && f.value);
  };

  return (
    <thead className="bg-gray-50">
      <tr role="row">
        {/* Selection header */}
        {selectable && (
          <th className="px-4 py-3 w-12">
            <input
              type="checkbox"
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              aria-label="Select all rows"
            />
          </th>
        )}

        {/* Expand header */}
        {expandable && (
          <th className="px-4 py-3 w-12">
            <span className="sr-only">Expand</span>
          </th>
        )}

        {/* Column headers */}
        {visibleColumns.map((column) => {
          const isSortable = column.sortable !== false;
          const isFilterable = column.filterable !== false;
          const alignment = column.align || 'left';
          const alignmentClasses = {
            left: 'text-left',
            center: 'text-center',
            right: 'text-right'
          };

          return (
            <th
              key={column.key}
              className={cn(
                'px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider',
                alignmentClasses[alignment],
                isSortable && 'cursor-pointer hover:bg-gray-100',
                column.headerClassName,
                className
              )}
              style={{
                width: column.width,
                minWidth: column.minWidth,
                maxWidth: column.maxWidth
              }}
              onClick={() => isSortable && handleSort(column.key)}
              role="columnheader"
              tabIndex={isSortable ? 0 : undefined}
              onKeyDown={(e) => {
                if (isSortable && (e.key === 'Enter' || e.key === ' ')) {
                  e.preventDefault();
                  handleSort(column.key);
                }
              }}
              aria-sort={
                sortConfig?.field === column.key
                  ? sortConfig.direction === 'asc' ? 'ascending' : 'descending'
                  : 'none'
              }
            >
              <div className="flex items-center gap-2">
                <span className="flex-1">
                  {typeof column.header === 'string' ? column.header : column.header}
                </span>
                {isSortable && (
                  <span className="flex-shrink-0">
                    {getSortIcon(column.key)}
                  </span>
                )}
              </div>
            </th>
          );
        })}
      </tr>

      {/* Filter row */}
      {(filters.length > 0 || visibleColumns.some(col => col.filterable !== false)) && (
        <tr role="row">
          {/* Empty cells for selection and expand columns */}
          {selectable && <td className="px-4 py-2"></td>}
          {expandable && <td className="px-4 py-2"></td>}

          {/* Filter inputs */}
          {visibleColumns.map((column) => {
            const isFilterable = column.filterable !== false;
            const filterValue = getFilterValue(column.key);
            const hasActiveFilter = hasFilter(column.key);

            return (
              <td key={`filter-${column.key}`} className="px-4 py-2">
                {isFilterable ? (
                  <div className="relative">
                    <Input
                      type="text"
                      placeholder={`Filter ${typeof column.header === 'string' ? column.header : column.key}`}
                      value={filterValue}
                      onChange={(e) => handleFilterChange(column.key, e.target.value)}
                      className={cn(
                        'h-8 text-xs',
                        hasActiveFilter && 'border-blue-500 bg-blue-50'
                      )}
                      aria-label={`Filter by ${typeof column.header === 'string' ? column.header : column.key}`}
                    />
                    {hasActiveFilter && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleClearFilter(column.key)}
                        className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6 p-0"
                        aria-label={`Clear filter for ${typeof column.header === 'string' ? column.header : column.key}`}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                ) : (
                  <div className="h-8"></div>
                )}
              </td>
            );
          })}
        </tr>
      )}
    </thead>
  );
};
