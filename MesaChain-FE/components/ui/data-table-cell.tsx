import React from 'react';
import { TableCellProps } from './data-table-types';
import { cn } from '@/lib/utils';

export const TableCell = <T = any>({
  value,
  row,
  index,
  column,
  className
}: TableCellProps<T>) => {
  const cellContent = column.render 
    ? column.render(value, row, index)
    : value;

  const alignment = column.align || 'left';
  const alignmentClasses = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right'
  };

  return (
    <td
      className={cn(
        'px-4 py-3 text-sm text-gray-900 whitespace-nowrap',
        alignmentClasses[alignment],
        column.cellClassName,
        className
      )}
      style={{
        width: column.width,
        minWidth: column.minWidth,
        maxWidth: column.maxWidth
      }}
    >
      {cellContent}
    </td>
  );
};
