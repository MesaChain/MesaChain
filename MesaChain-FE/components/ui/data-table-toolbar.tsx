import React from 'react';
import { Search, Download, MoreHorizontal, Trash2, Edit, Copy } from 'lucide-react';
import { TableToolbarProps } from './data-table-types';
import { Button } from './button';
import { Input } from './input';
import { Badge } from './badge';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from './dropdown-menu';
import { cn } from '@/lib/utils';

export const TableToolbar = <T = any>({
  searchValue,
  onSearchChange,
  selectedRows,
  onBulkAction,
  bulkActions = [],
  exportable = false,
  exportFormats = ['csv', 'json'],
  onExport,
  className
}: TableToolbarProps<T>) => {
  const hasSelection = selectedRows.length > 0;

  const defaultBulkActions = [
    {
      label: 'Delete Selected',
      action: 'delete',
      icon: <Trash2 className="h-4 w-4" />,
      variant: 'destructive' as const
    },
    {
      label: 'Edit Selected',
      action: 'edit',
      icon: <Edit className="h-4 w-4" />,
      variant: 'outline' as const
    },
    {
      label: 'Copy Selected',
      action: 'copy',
      icon: <Copy className="h-4 w-4" />,
      variant: 'outline' as const
    }
  ];

  const allBulkActions = [...defaultBulkActions, ...bulkActions];

  const handleBulkAction = (action: string) => {
    onBulkAction?.(action, selectedRows);
  };

  const handleExport = (format: string) => {
    onExport?.(format);
  };

  return (
    <div className={cn('flex items-center justify-between px-4 py-3 bg-white border-b border-gray-200', className)}>
      {/* Search */}
      <div className="flex items-center space-x-4 flex-1">
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Search..."
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10 pr-4"
            aria-label="Search table data"
          />
          {searchValue && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <Badge variant="secondary" className="text-xs">
                {searchValue.length > 0 ? 'Filtered' : ''}
              </Badge>
            </div>
          )}
        </div>

        {/* Selection info */}
        {hasSelection && (
          <div className="flex items-center space-x-2">
            <Badge variant="default" className="text-xs">
              {selectedRows.length} selected
            </Badge>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center space-x-2">
        {/* Bulk actions */}
        {hasSelection && allBulkActions.length > 0 && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <MoreHorizontal className="h-4 w-4 mr-2" />
                Actions
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {allBulkActions.map((action, index) => (
                <React.Fragment key={action.action}>
                  {index > 0 && <DropdownMenuSeparator />}
                  <DropdownMenuItem
                    onClick={() => handleBulkAction(action.action)}
                    className={cn(
                      action.variant === 'destructive' && 'text-red-600 focus:text-red-600'
                    )}
                  >
                    {action.icon}
                    <span className="ml-2">{action.label}</span>
                  </DropdownMenuItem>
                </React.Fragment>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        )}

        {/* Export */}
        {exportable && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {exportFormats.includes('csv') && (
                <DropdownMenuItem onClick={() => handleExport('csv')}>
                  Export as CSV
                </DropdownMenuItem>
              )}
              {exportFormats.includes('json') && (
                <DropdownMenuItem onClick={() => handleExport('json')}>
                  Export as JSON
                </DropdownMenuItem>
              )}
              {exportFormats.includes('excel') && (
                <DropdownMenuItem onClick={() => handleExport('excel')}>
                  Export as Excel
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </div>
  );
};
