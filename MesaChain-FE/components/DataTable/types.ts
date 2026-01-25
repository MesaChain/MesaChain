import type { ReactNode, ComponentType } from "react";

export type SortDirection = "asc" | "desc";

export type ColumnKey<T> = keyof T | string;

export interface ColumnDefinition<T = any> {
  key: ColumnKey<T>;
  header: ReactNode;
  render?: (row: T, rowIndex: number) => ReactNode;
  accessor?: (row: T) => any;
  sortable?: boolean;
  filterable?: boolean;
  filterType?: "text" | "number" | "date" | "select" | "custom";
  filterOptions?: { label: string; value: any }[];
  FilterComponent?: ComponentType<{
    value: any;
    onChange: (val: any) => void;
  }>;
  width?: string | number;
  minWidth?: number;
  maxWidth?: number;
  enableResize?: boolean;
  enableReorder?: boolean;
  groupBy?: boolean;
}

export interface SortRule {
  key: string;
  direction: SortDirection;
}

export type FilterState = Record<string, any>;

export interface PageState {
  pageIndex: number;
  pageSize: number;
}

export type PaginationMode = "standard" | "load-more";

export interface UseTableOptions<T = any> {
  tableId?: string;
  data?: T[] | Promise<T[]>;
  fetchUrl?: string;
  fetchData?: (params: {
    page: number;
    pageSize: number;
    sort: SortRule[];
    filters: FilterState;
    search: string;
  }) => Promise<{ rows: T[]; total: number }>;
  columns: ColumnDefinition<T>[];
  serverSide?: boolean;
  pagination?: boolean;
  paginationMode?: PaginationMode;
  initialPageSize?: number;
  pageSizeOptions?: number[];
  initialSortBy?: SortRule[];
  initialFilters?: FilterState;
  selectable?: boolean;
  getRowId?: (row: T, index: number) => string;
  enableVirtualization?: boolean;
  virtualizationRowHeight?: number;
  groupByKey?: string | null;
}

export interface UseTableResult<T = any> {
  rows: T[];
  allRows: T[];
  loading: boolean;
  error: string | null;

  page: PageState;
  total: number;
  pageCount: number;
  setPageIndex: (index: number) => void;
  setPageSize: (size: number) => void;
  nextPage: () => void;
  prevPage: () => void;

  sortBy: SortRule[];
  setSortBy: (rules: SortRule[]) => void;
  toggleColumnSort: (key: string, multi?: boolean) => void;

  filters: FilterState;
  setFilter: (key: string, value: any) => void;
  clearFilters: () => void;

  globalSearch: string;
  setGlobalSearch: (value: string) => void;

  selectedRowIds: Set<string>;
  toggleRowSelected: (id: string) => void;
  toggleAllCurrentPage: () => void;
  clearSelection: () => void;

  groupByKey: string | null;
  setGroupByKey: (key: string | null) => void;
  groupedRows: { group: string; rows: T[] }[] | null;

  exportCSV: (fileName?: string) => void;
  exportJSON: (fileName?: string) => void;

  paginationMode: PaginationMode;
  persisted: boolean;
}

export interface DataTableEvents<T = any> {
  onSortChange?: (sort: SortRule[]) => void;
  onFilterChange?: (filters: FilterState) => void;
  onPageChange?: (page: PageState) => void;
  onRowSelect?: (selectedIds: string[]) => void;
}

export interface DataTableProps<T = any>
  extends Omit<UseTableOptions<T>, "columns">,
    DataTableEvents<T> {
  columns: ColumnDefinition<T>[];
  renderRowActions?: (row: T) => ReactNode;
  renderExpandedRow?: (row: T) => ReactNode;
  emptyState?: ReactNode;
  loading?: boolean;
  errorMessage?: string | null;
}
