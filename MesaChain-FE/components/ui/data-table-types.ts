import React from 'react';

export interface ColumnDefinition<T = any> {
  key: string;
  header: string | React.ReactNode;
  render?: (value: any, row: T, index: number) => React.ReactNode;
  sortable?: boolean;
  filterable?: boolean;
  width?: string | number;
  minWidth?: number;
  maxWidth?: number;
  align?: 'left' | 'center' | 'right';
  className?: string;
  headerClassName?: string;
  cellClassName?: string;
  hidden?: boolean;
  resizable?: boolean;
  fixed?: 'left' | 'right';
}

export interface SortConfig {
  field: string;
  direction: 'asc' | 'desc';
}

export interface FilterConfig {
  field: string;
  value: any;
  operator?: 'equals' | 'contains' | 'startsWith' | 'endsWith' | 'gt' | 'lt' | 'gte' | 'lte' | 'in' | 'notIn';
}

export interface PaginationConfig {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface SelectionConfig<T = any> {
  selectedRows: T[];
  selectedRowIds: Set<string>;
  isAllSelected: boolean;
  isIndeterminate: boolean;
}

export interface DataTableProps<T = any> {
  data: 
    | T[] 
    | Promise<T[]>
    | ((params: {
        sort?: SortConfig | null;
        filters?: FilterConfig[];
        page?: number;
        pageSize?: number;
      }) => Promise<T[] | { data: T[]; total?: number }>);
  columns: ColumnDefinition<T>[];
  pagination?: boolean;
  serverSide?: boolean;
  selectable?: boolean;
  expandable?: boolean;
  loading?: boolean;
  error?: string | null;
  onSortChange?: (sort: SortConfig | null) => void;
  onFilterChange?: (filters: FilterConfig[]) => void;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  onRowSelect?: (selectedRows: T[]) => void;
  onRowClick?: (row: T, index: number) => void;
  onRowExpand?: (row: T, index: number) => void;
  className?: string;
  emptyState?: React.ReactNode;
  loadingState?: React.ReactNode;
  errorState?: React.ReactNode;
  rowKey?: string | ((row: T) => string);
  initialSort?: SortConfig;
  initialFilters?: FilterConfig[];
  pageSizeOptions?: number[];
  defaultPageSize?: number;
  maxHeight?: string | number;
  stickyHeader?: boolean;
  striped?: boolean;
  hoverable?: boolean;
  exportable?: boolean;
  exportFormats?: ('csv' | 'json' | 'excel')[];
  onExport?: (format: string, data: T[]) => void;
  bulkActions?: Array<{
    label: string;
    action: string;
    icon?: React.ReactNode;
    variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  }>;
  onBulkAction?: (action: string, rows: T[]) => void;
}

export interface UseTableProps<T = any> {
  data: 
    | T[] 
    | Promise<T[]>
    | ((params: {
        sort?: SortConfig | null;
        filters?: FilterConfig[];
        page?: number;
        pageSize?: number;
      }) => Promise<T[] | { data: T[]; total?: number }>);
  columns: ColumnDefinition<T>[];
  serverSide?: boolean;
  pagination?: boolean;
  selectable?: boolean;
  expandable?: boolean;
  initialSort?: SortConfig;
  initialFilters?: FilterConfig[];
  pageSizeOptions?: number[];
  defaultPageSize?: number;
  rowKey?: string | ((row: T) => string);
}

export interface UseTableReturn<T = any> {
  processedData: T[];
  sortConfig: SortConfig | null;
  filters: FilterConfig[];
  pagination: PaginationConfig;
  selection: SelectionConfig<T>;
  loading: boolean;
  error: string | null;
  setSort: (field: string) => void;
  setFilter: (field: string, value: any, operator?: FilterConfig['operator']) => void;
  clearFilters: () => void;
  setPage: (page: number) => void;
  setPageSize: (pageSize: number) => void;
  toggleRowSelection: (row: T) => void;
  toggleAllSelection: () => void;
  clearSelection: () => void;
  refresh: () => void;
  // added by hook implementation
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  expandedRows: Set<string>;
  setExpandedRows: React.Dispatch<React.SetStateAction<Set<string>>>;
}

export interface TableToolbarProps<T = any> {
  searchValue: string;
  onSearchChange: (value: string) => void;
  selectedRows: T[];
  onBulkAction?: (action: string, rows: T[]) => void;
  bulkActions?: Array<{
    label: string;
    action: string;
    icon?: React.ReactNode;
    variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  }>;
  exportable?: boolean;
  exportFormats?: ('csv' | 'json' | 'excel')[];
  onExport?: (format: string) => void;
  className?: string;
}

export interface TableHeaderProps<T = any> {
  columns: ColumnDefinition<T>[];
  sortConfig: SortConfig | null;
  filters: FilterConfig[];
  selectable?: boolean;
  expandable?: boolean;
  onSort: (field: string) => void;
  onFilter: (field: string, value: any, operator?: FilterConfig['operator']) => void;
  onClearFilter: (field: string) => void;
  className?: string;
}

export interface TableBodyProps<T = any> {
  data: T[];
  columns: ColumnDefinition<T>[];
  loading?: boolean;
  selectable?: boolean;
  expandable?: boolean;
  selection: SelectionConfig<T>;
  expandedRows: Set<string>;
  onRowSelect: (row: T) => void;
  onRowClick?: (row: T, index: number) => void;
  onRowExpand?: (row: T, index: number) => void;
  rowKey: string | ((row: T) => string);
  emptyState?: React.ReactNode;
  loadingState?: React.ReactNode;
  className?: string;
}

export interface TablePaginationProps {
  pagination: PaginationConfig;
  pageSizeOptions: number[];
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  className?: string;
}

export interface TableRowProps<T = any> {
  row: T;
  index: number;
  columns: ColumnDefinition<T>[];
  selectable?: boolean;
  expandable?: boolean;
  isSelected: boolean;
  isExpanded: boolean;
  onSelect: () => void;
  onClick?: () => void;
  onExpand?: () => void;
  className?: string;
}

export interface TableCellProps<T = any> {
  value: any;
  row: T;
  index: number;
  column: ColumnDefinition<T>;
  className?: string;
}

// Utility types
export type TableEventHandlers<T = any> = {
  onSortChange?: (sort: SortConfig | null) => void;
  onFilterChange?: (filters: FilterConfig[]) => void;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  onRowSelect?: (selectedRows: T[]) => void;
  onRowClick?: (row: T, index: number) => void;
  onRowExpand?: (row: T, index: number) => void;
  onExport?: (format: string, data: T[]) => void;
};

export type TableState<T = any> = {
  data: T[];
  sortConfig: SortConfig | null;
  filters: FilterConfig[];
  pagination: PaginationConfig;
  selection: SelectionConfig<T>;
  expandedRows: Set<string>;
  loading: boolean;
  error: string | null;
};
