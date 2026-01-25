"use client";

import { useEffect, useMemo, useState } from "react";
import type {
  UseTableOptions,
  UseTableResult,
  SortRule,
  FilterState,
  PageState,
  PaginationMode,
} from "./types";

const DEFAULT_PAGE_SIZE = 20;

export function useTable<T = any>(options: UseTableOptions<T>): UseTableResult<T> {
  const {
    tableId,
    data,
    fetchUrl,
    fetchData,
    serverSide = false,
    pagination = true,
    paginationMode = "standard",
    initialPageSize = DEFAULT_PAGE_SIZE,
    pageSizeOptions = [10, 20, 50, 100],
    initialSortBy = [],
    initialFilters = {},
    selectable = false,
    getRowId = (row, index) => String(index),
    enableVirtualization = false,
    virtualizationRowHeight = 40,
    groupByKey: initialGroupBy = null,
  } = options;

  const [resolvedData, setResolvedData] = useState<T[]>(
    Array.isArray(data) ? data : [],
  );
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const [page, setPage] = useState<PageState>({
    pageIndex: 0,
    pageSize: initialPageSize,
  });

  const [sortBy, setSortBy] = useState<SortRule[]>(initialSortBy);
  const [filters, setFilters] = useState<FilterState>(initialFilters);
  const [globalSearch, setGlobalSearch] = useState("");
  const [selectedRowIds, setSelectedRowIds] = useState<Set<string>>(
    new Set(),
  );
  const [groupByKey, setGroupByKey] = useState<string | null>(initialGroupBy);
  const [total, setTotal] = useState<number>(0);

  // persistence
  const storageKey = tableId ? `datatable:${tableId}` : null;
  const [persisted, setPersisted] = useState(false);

  useEffect(() => {
    if (!storageKey) return;
    try {
      const raw = localStorage.getItem(storageKey);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (parsed.pageSize) {
        setPage((prev) => ({ ...prev, pageSize: parsed.pageSize }));
      }
      if (parsed.sortBy) setSortBy(parsed.sortBy);
      if (parsed.filters) setFilters(parsed.filters);
      if (parsed.groupByKey) setGroupByKey(parsed.groupByKey);
      setPersisted(true);
    } catch {
      // ignore parse errors
    }
  }, [storageKey]);

  useEffect(() => {
    if (!storageKey) return;
    const payload = {
      pageSize: page.pageSize,
      sortBy,
      filters,
      groupByKey,
    };
    localStorage.setItem(storageKey, JSON.stringify(payload));
  }, [storageKey, page.pageSize, sortBy, filters, groupByKey]);

  // server-side data loader
  const loadServerData = async () => {
    if (!serverSide) return;
    setLoading(true);
    setError(null);
    try {
      const params = {
        page: page.pageIndex,
        pageSize: page.pageSize,
        sort: sortBy,
        filters,
        search: globalSearch,
      };

      let result: { rows: T[]; total: number };
      if (fetchData) {
        result = await fetchData(params);
      } else if (fetchUrl) {
        const query = new URLSearchParams({
          page: String(params.page),
          pageSize: String(params.pageSize),
          search: params.search,
        });
        const res = await fetch(`${fetchUrl}?${query.toString()}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sort: params.sort,
            filters: params.filters,
          }),
        });
        if (!res.ok) throw new Error("Failed to load data");
        result = await res.json();
      } else {
        throw new Error(
          "serverSide is true but no fetchUrl or fetchData handler was provided",
        );
      }

      setResolvedData(result.rows);
      setTotal(result.total);
    } catch (e: any) {
      setError(e?.message ?? "Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  // resolve data (client or server)
  useEffect(() => {
    if (serverSide) {
      loadServerData();
      return;
    }

    if (Array.isArray(data)) {
      setResolvedData(data);
      setTotal(data.length);
      return;
    }

    if (data && typeof (data as any).then === "function") {
      setLoading(true);
      (data as Promise<T[]>)
        .then((rows) => {
          setResolvedData(rows);
          setTotal(rows.length);
        })
        .catch((e) => setError(e?.message ?? "Failed to load data"))
        .finally(() => setLoading(false));
    }
  }, [
    serverSide,
    data,
    page.pageIndex,
    page.pageSize,
    JSON.stringify(sortBy),
    JSON.stringify(filters),
    globalSearch,
  ]);

  // client-side derived rows
  const clientProcessed = useMemo(() => {
    if (serverSide) return { allRows: resolvedData, pageRows: resolvedData };

    let rows = [...resolvedData];

    // global search (simple string contains across values)
    if (globalSearch) {
      const search = globalSearch.toLowerCase();
      rows = rows.filter((row) =>
        Object.values(row as any).some((val) =>
          String(val).toLowerCase().includes(search),
        ),
      );
    }

    // column filters
    Object.entries(filters).forEach(([key, value]) => {
      if (value === undefined || value === null || value === "") return;
      rows = rows.filter((row: any) =>
        String(row[key] ?? "").includes(String(value)),
      );
    });

    // multi-column sort
    if (sortBy.length) {
      rows.sort((a: any, b: any) => {
        for (const rule of sortBy) {
          const av = a[rule.key];
          const bv = b[rule.key];
          if (av === bv) continue;
          if (av == null) return 1;
          if (bv == null) return -1;
          if (av < bv) return rule.direction === "asc" ? -1 : 1;
          if (av > bv) return rule.direction === "asc" ? 1 : -1;
        }
        return 0;
      });
    }

    const allRows = rows;
    let pageRows = rows;
    if (pagination) {
      const start = page.pageIndex * page.pageSize;
      pageRows = rows.slice(start, start + page.pageSize);
    }

    return { allRows, pageRows };
  }, [
    resolvedData,
    serverSide,
    globalSearch,
    filters,
    sortBy,
    pagination,
    page.pageIndex,
    page.pageSize,
  ]);

  const allRows = clientProcessed.allRows;
  const rows = serverSide ? resolvedData : clientProcessed.pageRows;

  useEffect(() => {
    if (!serverSide) setTotal(allRows.length);
  }, [serverSide, allRows.length]);

  const pageCount = pagination
    ? Math.max(1, Math.ceil(total / page.pageSize))
    : 1;

  const setPageIndex = (index: number) => {
    const clamped = Math.max(0, Math.min(index, pageCount - 1));
    setPage((prev) => ({ ...prev, pageIndex: clamped }));
  };

  const setPageSize = (size: number) => {
    setPage({ pageIndex: 0, pageSize: size });
  };

  const nextPage = () => setPageIndex(page.pageIndex + 1);
  const prevPage = () => setPageIndex(page.pageIndex - 1);

  const toggleColumnSort = (key: string, multi = false) => {
    setSortBy((prev) => {
      const existing = prev.find((r) => r.key === key);
      let next = multi ? prev.filter((r) => r.key !== key) : [];

      if (!existing) {
        next.push({ key, direction: "asc" });
      } else if (existing.direction === "asc") {
        next.push({ key, direction: "desc" });
      } else {
        // remove sort for this column
      }

      return next;
    });
  };

  const setFilter = (key: string, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPage((prev) => ({ ...prev, pageIndex: 0 }));
  };

  const clearFilters = () => {
    setFilters({});
    setPage((prev) => ({ ...prev, pageIndex: 0 }));
  };

  const toggleRowSelected = (id: string) => {
    setSelectedRowIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleAllCurrentPage = () => {
    const currentIds = rows.map(getRowId);
    setSelectedRowIds((prev) => {
      const next = new Set(prev);
      const allSelected = currentIds.every((id) => next.has(id));
      if (allSelected) {
        currentIds.forEach((id) => next.delete(id));
      } else {
        currentIds.forEach((id) => next.add(id));
      }
      return next;
    });
  };

  const clearSelection = () => setSelectedRowIds(new Set());

  const groupedRows = useMemo(() => {
    if (!groupByKey) return null;
    const map = new Map<string, T[]>();
    rows.forEach((row: any) => {
      const group = String(row[groupByKey as keyof T] ?? "Other");
      if (!map.has(group)) map.set(group, []);
      map.get(group)!.push(row);
    });
    return Array.from(map.entries()).map(([group, rs]) => ({ group, rows: rs }));
  }, [rows, groupByKey]);

  const exportCSV = (fileName = "export.csv") => {
    const toExport = allRows;
    if (!toExport.length) return;
    const headers = Object.keys(toExport[0] as any);
    const lines = [
      headers.join(","),
      ...toExport.map((row: any) =>
        headers.map((h) => JSON.stringify(row[h] ?? "")).join(","),
      ),
    ];
    const blob = new Blob([lines.join("\n")], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportJSON = (fileName = "export.json") => {
    const blob = new Blob([JSON.stringify(allRows)], {
      type: "application/json;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    a.click();
    URL.revokeObjectURL(url);
  };

  return {
    rows,
    allRows,
    loading,
    error,
    page,
    total,
    pageCount,
    setPageIndex,
    setPageSize,
    nextPage,
    prevPage,
    sortBy,
    setSortBy,
    toggleColumnSort,
    filters,
    setFilter,
    clearFilters,
    globalSearch,
    setGlobalSearch,
    selectedRowIds,
    toggleRowSelected,
    toggleAllCurrentPage,
    clearSelection,
    groupByKey,
    setGroupByKey,
    groupedRows,
    exportCSV,
    exportJSON,
    paginationMode,
    persisted,
  };
}
