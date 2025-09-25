// Main DataTable component
export { DataTable } from './data-table';

// Sub-components
export { TableHeader } from './data-table-header';
export { TableBody } from './data-table-body';
export { TableRow } from './data-table-row';
export { TableCell } from './data-table-cell';
export { TablePagination } from './data-table-pagination';
export { TableToolbar } from './data-table-toolbar';

// Hooks
export { useTable, usePagination, useTableSelection, useExpandedRows } from './data-table-hooks';

// Types
export type {
  ColumnDefinition,
  DataTableProps,
  SortConfig,
  FilterConfig,
  PaginationConfig,
  SelectionConfig,
  UseTableProps,
  UseTableReturn,
  TableToolbarProps,
  TableHeaderProps,
  TableBodyProps,
  TablePaginationProps,
  TableRowProps,
  TableCellProps,
  TableEventHandlers,
  TableState
} from './data-table-types';

// Utilities
export {
  sortData,
  filterData,
  paginateData,
  searchData,
  getNestedValue,
  compareValues,
  applyFilter,
  getRowKey,
  getVisibleColumns,
  getSortableColumns,
  getFilterableColumns,
  exportToCSV,
  exportToJSON,
  exportToExcel,
  debounce,
  formatCurrency,
  formatDate,
  formatNumber,
  validateSortConfig,
  validateFilters,
  memoize
} from './data-table-utils';
