import { useState, useEffect, useMemo, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  UseTableProps, 
  UseTableReturn, 
  SortConfig, 
  FilterConfig, 
  PaginationConfig, 
  SelectionConfig 
} from './data-table-types';
import { 
  sortData, 
  filterData, 
  paginateData, 
  searchData, 
  getRowKey, 
  debounce 
} from './data-table-utils';

/**
 * Custom hook for managing table state and operations
 */
export const useTable = <T = any>({
  data,
  columns,
  serverSide = false,
  pagination = true,
  selectable = false,
  expandable = false,
  initialSort,
  initialFilters = [],
  pageSizeOptions = [10, 25, 50, 100],
  defaultPageSize = 25,
  rowKey = 'id'
}: UseTableProps<T>): UseTableReturn<T> => {
  // State management
  const [sortConfig, setSortConfig] = useState<SortConfig | null>(initialSort || null);
  const [filters, setFilters] = useState<FilterConfig[]>(initialFilters);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(defaultPageSize);
  const [selectedRows, setSelectedRows] = useState<T[]>([]);
  const [selectedRowIds, setSelectedRowIds] = useState<Set<string>>(new Set());
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  // Handle data fetching for server-side mode
  const { data: serverData, isLoading, error, refetch } = useQuery({
    queryKey: ['table-data', sortConfig, filters, currentPage, pageSize],
    queryFn: async () => {
      if (typeof data === 'function') {
        return await data();
      }
      return data;
    },
    enabled: serverSide,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Get the actual data to work with
  const rawData = useMemo(() => {
    if (serverSide) {
      return serverData || [];
    }
    if (Array.isArray(data)) {
      return data;
    }
    return [];
  }, [data, serverData, serverSide]);

  // Process data with sorting, filtering, and searching
  const processedData = useMemo(() => {
    let result = [...rawData];

    // Apply search
    if (searchTerm.trim()) {
      const searchFields = columns.map(col => col.key);
      result = searchData(result, searchTerm, searchFields);
    }

    // Apply filters
    if (filters.length > 0) {
      result = filterData(result, filters);
    }

    // Apply sorting
    if (sortConfig) {
      result = sortData(result, sortConfig);
    }

    return result;
  }, [rawData, searchTerm, filters, sortConfig, columns]);

  // Calculate pagination
  const paginationConfig: PaginationConfig = useMemo(() => {
    if (!pagination) {
      return {
        page: 1,
        pageSize: processedData.length,
        total: processedData.length,
        totalPages: 1
      };
    }

    const total = processedData.length;
    const totalPages = Math.ceil(total / pageSize);
    
    return {
      page: currentPage,
      pageSize,
      total,
      totalPages
    };
  }, [processedData.length, currentPage, pageSize, pagination]);

  // Get paginated data
  const paginatedData = useMemo(() => {
    if (!pagination) {
      return processedData;
    }
    
    const { paginatedData: result } = paginateData(processedData, currentPage, pageSize);
    return result;
  }, [processedData, currentPage, pageSize, pagination]);

  // Selection state
  const selection: SelectionConfig<T> = useMemo(() => {
    const isAllSelected = selectedRows.length === paginatedData.length && paginatedData.length > 0;
    const isIndeterminate = selectedRows.length > 0 && selectedRows.length < paginatedData.length;

    return {
      selectedRows,
      selectedRowIds,
      isAllSelected,
      isIndeterminate
    };
  }, [selectedRows, selectedRowIds, paginatedData]);

  // Debounced search
  const debouncedSetSearchTerm = useCallback(
    debounce((term: string) => {
      setSearchTerm(term);
      setCurrentPage(1); // Reset to first page when searching
    }, 300),
    []
  );

  // Event handlers
  const setSort = useCallback((field: string) => {
    setSortConfig(prev => {
      if (!prev || prev.field !== field) {
        return { field, direction: 'asc' };
      }
      if (prev.direction === 'asc') {
        return { field, direction: 'desc' };
      }
      return null; // Clear sorting
    });
    setCurrentPage(1); // Reset to first page when sorting
  }, []);

  const setFilter = useCallback((field: string, value: any, operator: FilterConfig['operator'] = 'contains') => {
    setFilters(prev => {
      const existingFilterIndex = prev.findIndex(f => f.field === field);
      const newFilter = { field, value, operator };

      if (existingFilterIndex >= 0) {
        if (value === null || value === undefined || value === '') {
          // Remove filter if value is empty
          return prev.filter(f => f.field !== field);
        }
        // Update existing filter
        const newFilters = [...prev];
        newFilters[existingFilterIndex] = newFilter;
        return newFilters;
      } else {
        // Add new filter
        if (value === null || value === undefined || value === '') {
          return prev; // Don't add empty filters
        }
        return [...prev, newFilter];
      }
    });
    setCurrentPage(1); // Reset to first page when filtering
  }, []);

  const clearFilters = useCallback(() => {
    setFilters([]);
    setCurrentPage(1);
  }, []);

  const setPage = useCallback((page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, paginationConfig.totalPages)));
  }, [paginationConfig.totalPages]);

  const handlePageSizeChange = useCallback((newPageSize: number) => {
    setPageSize(newPageSize);
    setCurrentPage(1); // Reset to first page when changing page size
  }, []);

  const toggleRowSelection = useCallback((row: T) => {
    const key = getRowKey(row, 0, rowKey);
    
    setSelectedRows(prev => {
      const isSelected = selectedRowIds.has(key);
      if (isSelected) {
        return prev.filter(r => getRowKey(r, 0, rowKey) !== key);
      } else {
        return [...prev, row];
      }
    });

    setSelectedRowIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(key)) {
        newSet.delete(key);
      } else {
        newSet.add(key);
      }
      return newSet;
    });
  }, [selectedRowIds, rowKey]);

  const toggleAllSelection = useCallback(() => {
    if (selection.isAllSelected) {
      setSelectedRows([]);
      setSelectedRowIds(new Set());
    } else {
      setSelectedRows([...paginatedData]);
      setSelectedRowIds(new Set(paginatedData.map((row, index) => getRowKey(row, index, rowKey))));
    }
  }, [selection.isAllSelected, paginatedData, rowKey]);

  const clearSelection = useCallback(() => {
    setSelectedRows([]);
    setSelectedRowIds(new Set());
  }, []);

  const refresh = useCallback(() => {
    if (serverSide) {
      refetch();
    }
  }, [serverSide, refetch]);

  // Reset selection when data changes
  useEffect(() => {
    if (selectable) {
      clearSelection();
    }
  }, [rawData, clearSelection, selectable]);

  return {
    processedData: paginatedData,
    sortConfig,
    filters,
    pagination: paginationConfig,
    selection,
    loading: isLoading,
    error: error?.message || null,
    setSort,
    setFilter,
    clearFilters,
    setPage,
    setPageSize: handlePageSizeChange,
    toggleRowSelection,
    toggleAllSelection,
    clearSelection,
    refresh,
    // Additional methods for search
    searchTerm,
    setSearchTerm: debouncedSetSearchTerm,
    expandedRows,
    setExpandedRows
  };
};

/**
 * Hook for managing pagination state
 */
export const usePagination = (initialPage: number = 1, initialPageSize: number = 25) => {
  const [page, setPage] = useState(initialPage);
  const [pageSize, setPageSize] = useState(initialPageSize);

  const reset = useCallback(() => {
    setPage(initialPage);
    setPageSize(initialPageSize);
  }, [initialPage, initialPageSize]);

  return {
    page,
    pageSize,
    setPage,
    setPageSize,
    reset
  };
};

/**
 * Hook for managing row selection
 */
export const useTableSelection = <T = any>(data: T[], rowKey?: string | ((row: T) => string)) => {
  const [selectedRows, setSelectedRows] = useState<T[]>([]);
  const [selectedRowIds, setSelectedRowIds] = useState<Set<string>>(new Set());

  const toggleRow = useCallback((row: T) => {
    const key = getRowKey(row, 0, rowKey);
    
    setSelectedRows(prev => {
      const isSelected = selectedRowIds.has(key);
      if (isSelected) {
        return prev.filter(r => getRowKey(r, 0, rowKey) !== key);
      } else {
        return [...prev, row];
      }
    });

    setSelectedRowIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(key)) {
        newSet.delete(key);
      } else {
        newSet.add(key);
      }
      return newSet;
    });
  }, [selectedRowIds, rowKey]);

  const toggleAll = useCallback(() => {
    if (selectedRows.length === data.length && data.length > 0) {
      setSelectedRows([]);
      setSelectedRowIds(new Set());
    } else {
      setSelectedRows([...data]);
      setSelectedRowIds(new Set(data.map((row, index) => getRowKey(row, index, rowKey))));
    }
  }, [selectedRows.length, data, rowKey]);

  const clearSelection = useCallback(() => {
    setSelectedRows([]);
    setSelectedRowIds(new Set());
  }, []);

  const isSelected = useCallback((row: T) => {
    const key = getRowKey(row, 0, rowKey);
    return selectedRowIds.has(key);
  }, [selectedRowIds, rowKey]);

  const isAllSelected = selectedRows.length === data.length && data.length > 0;
  const isIndeterminate = selectedRows.length > 0 && selectedRows.length < data.length;

  return {
    selectedRows,
    selectedRowIds,
    isAllSelected,
    isIndeterminate,
    toggleRow,
    toggleAll,
    clearSelection,
    isSelected
  };
};

/**
 * Hook for managing expanded rows
 */
export const useExpandedRows = <T = any>(rowKey?: string | ((row: T) => string)) => {
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  const toggleRow = useCallback((row: T) => {
    const key = getRowKey(row, 0, rowKey);
    setExpandedRows(prev => {
      const newSet = new Set(prev);
      if (newSet.has(key)) {
        newSet.delete(key);
      } else {
        newSet.add(key);
      }
      return newSet;
    });
  }, [rowKey]);

  const isExpanded = useCallback((row: T) => {
    const key = getRowKey(row, 0, rowKey);
    return expandedRows.has(key);
  }, [expandedRows, rowKey]);

  const expandAll = useCallback((data: T[]) => {
    const allKeys = new Set(data.map((row, index) => getRowKey(row, index, rowKey)));
    setExpandedRows(allKeys);
  }, [rowKey]);

  const collapseAll = useCallback(() => {
    setExpandedRows(new Set());
  }, []);

  return {
    expandedRows,
    toggleRow,
    isExpanded,
    expandAll,
    collapseAll
  };
};
