import React from 'react';
import { TableBodyProps } from './data-table-types';
import { TableRow } from './data-table-row';
import { getRowKey } from './data-table-utils';
import { cn } from '@/lib/utils';

export const TableBody = <T = any>({
  data,
  columns,
  loading = false,
  selectable = false,
  expandable = false,
  selection,
  expandedRows,
  onRowSelect,
  onRowClick,
  onRowExpand,
  rowKey,
  emptyState,
  loadingState,
  className
}: TableBodyProps<T>) => {
  const visibleColumns = columns.filter(col => !col.hidden);

  if (loading) {
    return (
      <tbody className={cn('bg-white', className)}>
        <tr>
          <td 
            colSpan={visibleColumns.length + (selectable ? 1 : 0) + (expandable ? 1 : 0)}
            className="px-4 py-8 text-center text-gray-500"
          >
            {loadingState || (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                <span className="ml-2">Loading...</span>
              </div>
            )}
          </td>
        </tr>
      </tbody>
    );
  }

  if (data.length === 0) {
    return (
      <tbody className={cn('bg-white', className)}>
        <tr>
          <td 
            colSpan={visibleColumns.length + (selectable ? 1 : 0) + (expandable ? 1 : 0)}
            className="px-4 py-8 text-center text-gray-500"
          >
            {emptyState || (
              <div className="flex flex-col items-center justify-center py-8">
                <div className="text-gray-400 mb-2">
                  <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <p className="text-lg font-medium text-gray-900">No data available</p>
                <p className="text-sm text-gray-500">There are no records to display.</p>
              </div>
            )}
          </td>
        </tr>
      </tbody>
    );
  }

  return (
    <tbody className={cn('bg-white divide-y divide-gray-200', className)} role="rowgroup">
      {data.map((row, index) => {
        const key = getRowKey(row, index, rowKey);
        const isSelected = selection.selectedRowIds.has(key);
        const isExpanded = expandedRows.has(key);

        return (
          <TableRow
            key={key}
            row={row}
            index={index}
            columns={visibleColumns}
            selectable={selectable}
            expandable={expandable}
            isSelected={isSelected}
            isExpanded={isExpanded}
            onSelect={() => onRowSelect(row)}
            onClick={() => onRowClick?.(row, index)}
            onExpand={() => onRowExpand?.(row, index)}
          />
        );
      })}
    </tbody>
  );
};
