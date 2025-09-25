import React from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { TableRowProps } from './data-table-types';
import { TableCell } from './data-table-cell';
import { Button } from './button';
import { cn } from '@/lib/utils';

export const TableRow = <T = any>({
  row,
  index,
  columns,
  selectable = false,
  expandable = false,
  isSelected = false,
  isExpanded = false,
  onSelect,
  onClick,
  onExpand,
  className
}: TableRowProps<T>) => {
  const visibleColumns = columns.filter(col => !col.hidden);

  const handleRowClick = (e: React.MouseEvent) => {
    // Don't trigger row click if clicking on checkbox or expand button
    const target = e.target as HTMLElement;
    if (
      target.closest('input[type="checkbox"], button, [role="button"], a, [data-expand]')
    ) {
      return;
    }
    onClick?.();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    const target = e.target as HTMLElement;
    if (target.closest('input[type="checkbox"], button, [role="button"], a, [data-expand]')) {
      return;
    }
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onClick?.();
    }
  };

  return (
    <tr
      className={cn(
        'border-b border-gray-200 transition-colors',
        isSelected && 'bg-blue-50',
        onClick && 'cursor-pointer hover:bg-gray-50',
        className
      )}
      onClick={handleRowClick}
      onKeyDown={handleKeyDown}
      tabIndex={onClick ? 0 : undefined}
      role="row"
      aria-selected={isSelected}
      aria-expanded={expandable ? isExpanded : undefined}
    >
      {/* Selection checkbox */}
      {selectable && (
        <td className="px-4 py-3 w-12">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={onSelect}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            aria-label={`Select row ${index + 1}`}
          />
        </td>
      )}

      {/* Expand button */}
      {expandable && (
        <td className="px-4 py-3 w-12">
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onExpand?.();
            }}
            data-expand
            className="h-6 w-6 p-0"
            aria-label={isExpanded ? 'Collapse row' : 'Expand row'}
          >
            {isExpanded ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </Button>
        </td>
      )}

      {/* Data cells */}
      {visibleColumns.map((column) => (
        <TableCell
          key={column.key}
          value={getNestedValue(row, column.key)}
          row={row}
          index={index}
          column={column}
        />
      ))}
    </tr>
  );
};

// Helper function to get nested values
const getNestedValue = (obj: any, path: string): any => {
  return path.split('.').reduce((current, key) => {
    return current?.[key];
  }, obj);
};
