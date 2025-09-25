import React, { useMemo } from 'react';
import { DataTableProps } from './data-table-types';
import { useTable } from './data-table-hooks';
import { TableHeader } from './data-table-header';
import { TableBody } from './data-table-body';
import { TablePagination } from './data-table-pagination';
import { TableToolbar } from './data-table-toolbar';
import { exportToCSV, exportToJSON, exportToExcel, getRowKey } from './data-table-utils';
import { cn } from '@/lib/utils';

export const DataTable = <T extends Record<string, any>>({
  data,
  columns,
  pagination = true,
  serverSide = false,
  selectable = false,
  expandable = false,
  loading = false,
  error = null,
  onSortChange,
  onFilterChange,
  onPageChange,
  onPageSizeChange,
  onRowSelect,
  onRowClick,
  onRowExpand,
  className,
  emptyState,
  loadingState,
  errorState,
  rowKey = 'id',
  initialSort,
  initialFilters = [],
  pageSizeOptions = [10, 25, 50, 100],
  defaultPageSize = 25,
  maxHeight,
  stickyHeader = false,
  striped = false,
  hoverable = true,
  exportable = false,
  exportFormats = ['csv', 'json'],
  onExport,
  bulkActions,
  onBulkAction,
  ...props
}: DataTableProps<T>) => {
  const {
    processedData,
    sortConfig,
    filters,
    pagination: paginationConfig,
    selection,
    loading: internalLoading,
    error: internalError,
    setSort,
    setFilter,
    clearFilters,
    setPage,
    setPageSize,
    toggleRowSelection,
    toggleAllSelection,
    clearSelection,
    refresh,
    searchTerm,
    setSearchTerm,
    expandedRows,
    setExpandedRows
  } = useTable({
    data,
    columns,
    serverSide,
    pagination,
    selectable,
    expandable,
    initialSort,
    initialFilters,
    pageSizeOptions,
    defaultPageSize,
    rowKey
  });

  // Use external loading/error states if provided
  const isLoading = loading !== undefined ? loading : internalLoading;
  const tableError = error !== null ? error : internalError;

  // Handle external event callbacks
  const handleSort = (field: string) => {
    setSort(field);
    onSortChange?.(sortConfig || { field, direction: 'asc' });
  };

  const handleFilter = (field: string, value: any, operator?: any) => {
    setFilter(field, value, operator);
    const updatedFilters = filters.filter(f => f.field !== field);
    if (value !== null && value !== undefined && value !== '') {
      updatedFilters.push({ field, value, operator });
    }
    onFilterChange?.(updatedFilters);
  };

  const handleClearFilter = (field: string) => {
    setFilter(field, '');
    const updatedFilters = filters.filter(f => f.field !== field);
    onFilterChange?.(updatedFilters);
  };

  const handlePageChange = (page: number) => {
    setPage(page);
    onPageChange?.(page);
  };

  const handlePageSizeChange = (pageSize: number) => {
    setPageSize(pageSize);
    onPageSizeChange?.(pageSize);
  };

  const handleRowSelect = (row: T) => {
    toggleRowSelection(row);
    // Update external selection callback
    const newSelection = selection.selectedRowIds.has(getRowKey(row, 0, rowKey))
      ? selection.selectedRows.filter(r => getRowKey(r, 0, rowKey) !== getRowKey(row, 0, rowKey))
      : [...selection.selectedRows, row];
    onRowSelect?.(newSelection);
  };

  const handleRowExpand = (row: T, index: number) => {
    const key = getRowKey(row, index, rowKey);
    setExpandedRows(prev => {
      const newSet = new Set(prev);
      if (newSet.has(key)) {
        newSet.delete(key);
      } else {
        newSet.add(key);
      }
      return newSet;
    });
    onRowExpand?.(row, index);
  };

  const handleExport = (format: string) => {
    if (onExport) {
      onExport(format, processedData);
    } else {
      // Default export behavior
      const timestamp = new Date().toISOString().split('T')[0];
      const filename = `export-${timestamp}`;
      
      switch (format) {
        case 'csv':
          exportToCSV(processedData, columns, `${filename}.csv`);
          break;
        case 'json':
          exportToJSON(processedData, `${filename}.json`);
          break;
        case 'excel':
          exportToExcel(processedData, columns, `${filename}.xlsx`);
          break;
      }
    }
  };

  const handleBulkAction = (action: string, rows: T[]) => {
    if (onBulkAction) {
      onBulkAction(action, rows);
    } else {
      // Default bulk actions
      switch (action) {
        case 'delete':
          console.log('Delete selected rows:', rows);
          break;
        case 'edit':
          console.log('Edit selected rows:', rows);
          break;
        case 'copy':
          console.log('Copy selected rows:', rows);
          break;
        default:
          console.log('Custom bulk action:', action, rows);
      }
    }
  };

  // Error state
  if (tableError) {
    return (
      <div className={cn('rounded-lg border border-red-200 bg-red-50 p-4', className)}>
        {errorState || (
          <div className="text-center">
            <div className="text-red-600 mb-2">
              <svg className="w-8 h-8 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 19.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-red-900 mb-1">Error loading data</h3>
            <p className="text-sm text-red-700 mb-3">{tableError}</p>
            <button
              onClick={refresh}
              className="text-sm text-red-600 hover:text-red-800 underline"
            >
              Try again
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={cn('bg-white rounded-lg border border-gray-200 shadow-sm', className)}>
      {/* Toolbar */}
      <TableToolbar
        searchValue={searchTerm}
        onSearchChange={setSearchTerm}
        selectedRows={selection.selectedRows}
        onBulkAction={handleBulkAction}
        bulkActions={bulkActions}
        exportable={exportable}
        exportFormats={exportFormats}
        onExport={handleExport}
      />

      {/* Table */}
      <div 
        className={cn('overflow-auto', stickyHeader && 'max-h-96')}
        style={{ maxHeight }}
      >
        <table 
          className={cn(
            'min-w-full divide-y divide-gray-200',
            striped && 'table-striped',
            hoverable && 'table-hover'
          )}
          role="table"
          aria-label="Data table"
        >
          <TableHeader
            columns={columns}
            sortConfig={sortConfig}
            filters={filters}
            selectable={selectable}
            expandable={expandable}
            onSort={handleSort}
            onFilter={handleFilter}
            onClearFilter={handleClearFilter}
          />
          <TableBody
            data={processedData}
            columns={columns}
            loading={isLoading}
            selectable={selectable}
            expandable={expandable}
            selection={selection}
            expandedRows={expandedRows}
            onRowSelect={handleRowSelect}
            onRowClick={onRowClick}
            onRowExpand={handleRowExpand}
            rowKey={rowKey}
            emptyState={emptyState}
            loadingState={loadingState}
          />
        </table>
      </div>

      {/* Pagination */}
      {pagination && paginationConfig.totalPages > 1 && (
        <TablePagination
          pagination={paginationConfig}
          pageSizeOptions={pageSizeOptions}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
        />
      )}
    </div>
  );
};
