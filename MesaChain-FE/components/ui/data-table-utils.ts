import { ColumnDefinition, FilterConfig, SortConfig } from './data-table-types';

/**
 * Utility functions for DataTable component
 */

// Sorting utilities
export const sortData = <T>(data: T[], sortConfig: SortConfig | null): T[] => {
  if (!sortConfig) return data;

  return [...data].sort((a, b) => {
    const aValue = getNestedValue(a, sortConfig.field);
    const bValue = getNestedValue(b, sortConfig.field);

    if (aValue === bValue) return 0;
    if (aValue === null || aValue === undefined) return 1;
    if (bValue === null || bValue === undefined) return -1;

    const comparison = compareValues(aValue, bValue);
    return sortConfig.direction === 'asc' ? comparison : -comparison;
  });
};

// Filtering utilities
export const filterData = <T>(data: T[], filters: FilterConfig[]): T[] => {
  if (filters.length === 0) return data;

  return data.filter(row => {
    return filters.every(filter => {
      const value = getNestedValue(row, filter.field);
      return applyFilter(value, filter.value, filter.operator || 'contains');
    });
  });
};

// Pagination utilities
export const paginateData = <T>(
  data: T[],
  page: number,
  pageSize: number
): { paginatedData: T[]; totalPages: number } => {
  const startIndex = (page - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedData = data.slice(startIndex, endIndex);
  const totalPages = Math.ceil(data.length / pageSize);

  return { paginatedData, totalPages };
};

// Search utilities
export const searchData = <T>(
  data: T[],
  searchTerm: string,
  searchFields: string[]
): T[] => {
  if (!searchTerm.trim()) return data;

  const term = searchTerm.toLowerCase();
  return data.filter(row => {
    return searchFields.some(field => {
      const value = getNestedValue(row, field);
      return String(value).toLowerCase().includes(term);
    });
  });
};

// Helper functions
export const getNestedValue = (obj: any, path: string): any => {
  return path.split('.').reduce((current, key) => {
    return current?.[key];
  }, obj);
};

export const compareValues = (a: any, b: any): number => {
  if (typeof a === 'number' && typeof b === 'number') {
    return a - b;
  }
  if (a instanceof Date && b instanceof Date) {
    return a.getTime() - b.getTime();
  }
  return String(a).localeCompare(String(b));
};

export const applyFilter = (
  value: any,
  filterValue: any,
  operator: FilterConfig['operator']
): boolean => {
  const stringValue = String(value).toLowerCase();
  const stringFilterValue = String(filterValue).toLowerCase();

  switch (operator) {
    case 'equals':
      return value === filterValue;
    case 'contains':
      return stringValue.includes(stringFilterValue);
    case 'startsWith':
      return stringValue.startsWith(stringFilterValue);
    case 'endsWith':
      return stringValue.endsWith(stringFilterValue);
    case 'gt':
      return Number(value) > Number(filterValue);
    case 'lt':
      return Number(value) < Number(filterValue);
    case 'gte':
      return Number(value) >= Number(filterValue);
    case 'lte':
      return Number(value) <= Number(filterValue);
    case 'in':
      return Array.isArray(filterValue) && filterValue.includes(value);
    case 'notIn':
      return Array.isArray(filterValue) && !filterValue.includes(value);
    default:
      return stringValue.includes(stringFilterValue);
  }
};

// Row key utilities
export const getRowKey = <T>(
  row: T,
  index: number,
  rowKey?: string | ((row: T) => string)
): string => {
  if (typeof rowKey === 'function') {
    return rowKey(row);
  }
  if (typeof rowKey === 'string') {
    return getNestedValue(row, rowKey) || String(index);
  }
  return String(index);
};

// Column utilities
export const getVisibleColumns = <T>(columns: ColumnDefinition<T>[]): ColumnDefinition<T>[] => {
  return columns.filter(col => !col.hidden);
};

export const getSortableColumns = <T>(columns: ColumnDefinition<T>[]): ColumnDefinition<T>[] => {
  return columns.filter(col => col.sortable !== false);
};

export const getFilterableColumns = <T>(columns: ColumnDefinition<T>[]): ColumnDefinition<T>[] => {
  return columns.filter(col => col.filterable !== false);
};

// Export utilities
export const exportToCSV = <T>(
  data: T[],
  columns: ColumnDefinition<T>[],
  filename: string = 'export.csv'
): void => {
  const visibleColumns = getVisibleColumns(columns);
  const headers = visibleColumns.map(col => 
    typeof col.header === 'string' ? col.header : col.key
  );

  const csvContent = [
    headers.join(','),
    ...data.map(row => 
      visibleColumns.map(col => {
        const value = getNestedValue(row, col.key);
        const cellValue = col.render ? col.render(value, row, 0) : value;
        // Escape CSV values
        const stringValue = String(cellValue || '');
        return stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')
          ? `"${stringValue.replace(/"/g, '""')}"`
          : stringValue;
      }).join(',')
    )
  ].join('\n');

  downloadFile(csvContent, filename, 'text/csv');
};

export const exportToJSON = <T>(
  data: T[],
  filename: string = 'export.json'
): void => {
  const jsonContent = JSON.stringify(data, null, 2);
  downloadFile(jsonContent, filename, 'application/json');
};

export const exportToExcel = <T>(
  data: T[],
  columns: ColumnDefinition<T>[],
  filename: string = 'export.xlsx'
): void => {
  // This would require a library like xlsx
  // For now, we'll export as CSV with .xlsx extension
  exportToCSV(data, columns, filename.replace('.xlsx', '.csv'));
};

const downloadFile = (content: string, filename: string, mimeType: string): void => {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

// Debounce utility
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

// Format utilities
export const formatCurrency = (value: number, currency: string = 'USD'): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(value);
};

export const formatDate = (value: Date | string, format: string = 'short'): string => {
  const date = typeof value === 'string' ? new Date(value) : value;
  return new Intl.DateTimeFormat('en-US', {
    dateStyle: format as any,
  }).format(date);
};

export const formatNumber = (value: number, options?: Intl.NumberFormatOptions): string => {
  return new Intl.NumberFormat('en-US', options).format(value);
};

// Validation utilities
export const validateSortConfig = (sortConfig: SortConfig | null, columns: ColumnDefinition[]): boolean => {
  if (!sortConfig) return true;
  return columns.some(col => col.key === sortConfig.field && col.sortable !== false);
};

export const validateFilters = (filters: FilterConfig[], columns: ColumnDefinition[]): FilterConfig[] => {
  return filters.filter(filter => 
    columns.some(col => col.key === filter.field && col.filterable !== false)
  );
};

// Performance utilities
export const memoize = <T extends (...args: any[]) => any>(fn: T): T => {
  const cache = new Map();
  return ((...args: Parameters<T>) => {
    const key = JSON.stringify(args);
    if (cache.has(key)) {
      return cache.get(key);
    }
    const result = fn(...args);
    cache.set(key, result);
    return result;
  }) as T;
};
