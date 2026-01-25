"use client";

import { useEffect, useMemo, useState } from "react";
import { useTable } from "./useTable";
import type { DataTableProps } from "./types";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function DataTable<T = any>(props: DataTableProps<T>) {
  const {
    columns,
    renderRowActions,
    renderExpandedRow,
    emptyState,
    loading: loadingOverride,
    errorMessage,
    onSortChange,
    onFilterChange,
    onPageChange,
    onRowSelect,
    ...options
  } = props;

  const table = useTable<T>({ columns, ...options });

  const {
    rows,
    allRows,
    page,
    pageCount,
    setPageIndex,
    setPageSize,
    nextPage,
    prevPage,
    sortBy,
    toggleColumnSort,
    filters,
    setFilter,
    globalSearch,
    setGlobalSearch,
    loading,
    error,
    selectedRowIds,
    toggleRowSelected,
    toggleAllCurrentPage,
    groupedRows,
    paginationMode,
  } = table;

  const isLoading = loadingOverride ?? loading;
  const errorText = errorMessage ?? error;

  // event emissions
  useEffect(() => {
    onSortChange?.(sortBy);
  }, [JSON.stringify(sortBy)]);

  useEffect(() => {
    onFilterChange?.(filters);
  }, [JSON.stringify(filters)]);

  useEffect(() => {
    onPageChange?.(page);
  }, [page.pageIndex, page.pageSize]);

  useEffect(() => {
    onRowSelect?.(Array.from(selectedRowIds));
  }, [selectedRowIds.size]);

  // debounced global search
  const [searchInput, setSearchInput] = useState(globalSearch);
  useEffect(() => {
    const id = setTimeout(() => setGlobalSearch(searchInput), 250);
    return () => clearTimeout(id);
  }, [searchInput, setGlobalSearch]);

  const headerSortDir = (key: string) =>
    sortBy.find((r) => r.key === key)?.direction ?? null;

  const hasSelection = selectedRowIds.size > 0;

  // for load-more mode (client-side only), we show cumulative rows
  const displayRows = useMemo(() => {
    if (paginationMode !== "load-more" || options.serverSide) return rows;
    const count = (page.pageIndex + 1) * page.pageSize;
    return allRows.slice(0, count);
  }, [paginationMode, options.serverSide, rows, allRows, page.pageIndex, page.pageSize]);

  const TableBodyContent = () => {
    if (isLoading) {
      return (
        <tr>
          <td colSpan={columns.length + (options.selectable ? 1 : 0) + (renderRowActions ? 1 : 0)} className="p-4">
            <div className="space-y-2">
              <div className="h-6 bg-gray-100 animate-pulse rounded" />
              <div className="h-6 bg-gray-100 animate-pulse rounded" />
              <div className="h-6 bg-gray-100 animate-pulse rounded" />
            </div>
          </td>
        </tr>
      );
    }

    if (errorText) {
      return (
        <tr>
          <td
            colSpan={
              columns.length + (options.selectable ? 1 : 0) + (renderRowActions ? 1 : 0)
            }
            className="p-4 text-red-600"
          >
            {errorText}
          </td>
        </tr>
      );
    }

    if (!displayRows.length) {
      return (
        <tr>
          <td
            colSpan={
              columns.length + (options.selectable ? 1 : 0) + (renderRowActions ? 1 : 0)
            }
            className="p-4 text-center text-sm text-gray-500"
          >
            {emptyState ?? "No data available."}
          </td>
        </tr>
      );
    }

    const renderRow = (row: T, rowIndex: number) => {
      const getRowId = options.getRowId ?? ((r: T, i: number) => String(i));
      const id = getRowId(row, rowIndex);
      const isSelected = selectedRowIds.has(id);

      const [expanded, setExpanded] = useState(false);

      return (
        <>
          <tr
            key={id}
            className={cn(
              "hover:bg-gray-50 transition-colors",
              isSelected && "bg-gray-100",
            )}
          >
            {options.selectable && (
              <td className="px-3 py-2">
                <input
                  type="checkbox"
                  aria-label="Select row"
                  checked={isSelected}
                  onChange={() => toggleRowSelected(id)}
                />
              </td>
            )}

            {columns.map((col) => {
              const content = col.render
                ? col.render(row, rowIndex)
                : (row as any)[col.key as keyof T];

              return (
                <td
                  key={String(col.key)}
                  className="px-4 py-2 text-sm text-gray-900"
                  style={{ width: col.width }}
                >
                  {content}
                </td>
              );
            })}

            {renderRowActions && (
              <td className="px-3 py-2 text-right">
                {renderRowActions(row)}
              </td>
            )}

            {renderExpandedRow && (
              <td className="px-3 py-2">
                <button
                  type="button"
                  className="text-xs text-gray-500 underline"
                  onClick={() => setExpanded((v) => !v)}
                >
                  {expanded ? "Hide" : "Details"}
                </button>
              </td>
            )}
          </tr>

          {renderExpandedRow && expanded && (
            <tr>
              <td
                colSpan={
                  columns.length +
                  (options.selectable ? 1 : 0) +
                  (renderRowActions ? 1 : 0)
                }
                className="px-4 py-3 bg-gray-50"
              >
                {renderExpandedRow(row)}
              </td>
            </tr>
          )}
        </>
      );
    };

    if (groupedRows) {
      return (
        <>
          {groupedRows.map((group) => (
            <>
              <tr key={group.group} className="bg-gray-100">
                <td
                  colSpan={
                    columns.length +
                    (options.selectable ? 1 : 0) +
                    (renderRowActions ? 1 : 0)
                  }
                  className="px-4 py-2 text-xs font-semibold text-gray-700 uppercase"
                >
                  {group.group} ({group.rows.length})
                </td>
              </tr>
              {group.rows.map((row, idx) => renderRow(row, idx))}
            </>
          ))}
        </>
      );
    }

    return <>{displayRows.map((row, idx) => renderRow(row, idx))}</>;
  };

  return (
    <div className="flex flex-col gap-3" role="grid" aria-rowcount={rows.length}>
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-center justify-between">
        <div className="flex items-center gap-2">
          <Input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search..."
            className="w-64"
            aria-label="Search table"
          />
        </div>
        <div className="flex items-center gap-2">
          {hasSelection && (
            <span className="text-xs text-gray-600">
              {selectedRowIds.size} selected
            </span>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.exportCSV()}
          >
            Export CSV
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.exportJSON()}
          >
            Export JSON
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {options.selectable && (
                <th className="px-3 py-3">
                  <input
                    type="checkbox"
                    aria-label="Select all rows on page"
                    onChange={toggleAllCurrentPage}
                  />
                </th>
              )}

              {columns.map((col) => {
                const sortDir = headerSortDir(String(col.key));
                const sortable = col.sortable;
                return (
                  <th
                    key={String(col.key)}
                    scope="col"
                    className={cn(
                      "px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider select-none",
                      sortable && "cursor-pointer",
                    )}
                    onClick={(e) => {
                      if (!sortable) return;
                      const multi = e.shiftKey;
                      toggleColumnSort(String(col.key), multi);
                    }}
                    aria-sort={
                      !sortable || !sortDir
                        ? "none"
                        : sortDir === "asc"
                        ? "ascending"
                        : "descending"
                    }
                  >
                    <span className="inline-flex items-center gap-1">
                      {col.header}
                      {sortDir && (
                        <span aria-hidden>{sortDir === "asc" ? "↑" : "↓"}</span>
                      )}
                    </span>
                  </th>
                );
              })}

              {renderRowActions && (
                <th className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              )}
            </tr>

            {/* Filter row */}
            <tr>
              {options.selectable && <th />}
              {columns.map((col) => (
                <th key={String(col.key)} className="px-4 py-2">
                  {col.filterable && (
                    <>
                      {col.FilterComponent ? (
                        <col.FilterComponent
                          value={filters[col.key as string]}
                          onChange={(val) => setFilter(col.key as string, val)}
                        />
                      ) : (
                        <Input
                          value={filters[col.key as string] ?? ""}
                          onChange={(e) =>
                            setFilter(col.key as string, e.target.value)
                          }
                          className="h-8 text-xs"
                          placeholder="Filter..."
                        />
                      )}
                    </>
                  )}
                </th>
              ))}
              {renderRowActions && <th />}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            <TableBodyContent />
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {options.pagination !== false && paginationMode === "standard" && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-sm">
          <div className="flex items-center gap-2">
            <span>
              Page {page.pageIndex + 1} of {pageCount}
            </span>
            <select
              className="border rounded px-2 py-1 text-xs"
              value={page.pageSize}
              onChange={(e) => setPageSize(Number(e.target.value))}
            >
              {(options.pageSizeOptions ?? [10, 20, 50, 100]).map((size) => (
                <option key={size} value={size}>
                  {size} / page
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={prevPage}
              disabled={page.pageIndex === 0}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={nextPage}
              disabled={page.pageIndex >= pageCount - 1}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {options.pagination !== false && paginationMode === "load-more" && !options.serverSide && (
        <div className="flex items-center justify-center mt-2">
          {displayRows.length < allRows.length && (
            <Button variant="outline" size="sm" onClick={nextPage}>
              Load more
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
