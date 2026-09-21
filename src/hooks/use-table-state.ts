'use client';

import { useState, useMemo, useCallback } from 'react';

export type SortOrder = 'asc' | 'desc';

export type SearchExtractor<T> =
  | keyof T
  | ((item: T) => string | number | boolean | null | undefined | Array<string | number>);

export interface UseTableStateOptions<T> {
  data: T[];
  searchFields?: SearchExtractor<T>[];
  initialSearch?: string;
  initialSortKey?: string;
  initialSortOrder?: SortOrder;
  initialPageSize?: number;
  initialFilters?: Record<string, string>;
  filterFn?: (item: T, filters: Record<string, string>) => boolean;
  customSortFn?: (a: T, b: T, sortKey: string, sortOrder: SortOrder) => number;
}

export function useTableState<T>({
  data,
  searchFields,
  initialSearch = '',
  initialSortKey,
  initialSortOrder = 'asc',
  initialPageSize = 10,
  initialFilters = {},
  filterFn,
  customSortFn,
}: UseTableStateOptions<T>) {
  const [search, setSearchState] = useState(initialSearch);
  const [sortKey, setSortKey] = useState<string | undefined>(initialSortKey);
  const [sortOrder, setSortOrder] = useState<SortOrder>(initialSortOrder);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSizeState] = useState(initialPageSize);
  const [filters, setFilters] = useState<Record<string, string>>(initialFilters);

  // Set search and reset to page 1
  const setSearch = useCallback((val: string) => {
    setSearchState(val);
    setPage(1);
  }, []);

  const clearSearch = useCallback(() => {
    setSearchState('');
    setPage(1);
  }, []);

  // Set page size and reset to page 1
  const setPageSize = useCallback((size: number) => {
    setPageSizeState(size);
    setPage(1);
  }, []);

  // Set individual filter and reset to page 1
  const setFilter = useCallback((key: string, value: string) => {
    setFilters((prev) => {
      const next = { ...prev, [key]: value };
      return next;
    });
    setPage(1);
  }, []);

  const resetFilters = useCallback(() => {
    setFilters(initialFilters);
    setPage(1);
  }, [initialFilters]);

  // Toggle or change sort
  const toggleSort = useCallback((key: string) => {
    if (sortKey === key) {
      setSortOrder((currentOrder) => (currentOrder === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortOrder('asc');
    }
  }, [sortKey]);

  const setSort = useCallback((key: string, order: SortOrder) => {
    setSortKey(key);
    setSortOrder(order);
  }, []);

  // Filtered & Searched data
  const filteredData = useMemo(() => {
    let result = [...data];

    // 1. Apply custom or equality filters
    if (filterFn) {
      result = result.filter((item) => filterFn(item, filters));
    } else {
      const activeFilterEntries = Object.entries(filters).filter(
        ([, val]) => val !== '' && val !== 'ALL' && val !== 'all'
      );
      if (activeFilterEntries.length > 0) {
        result = result.filter((item) => {
          return activeFilterEntries.every(([k, v]) => {
            const itemRecord = item as Record<string, unknown>;
            const itemVal = itemRecord[k];
            if (itemVal === undefined || itemVal === null) return false;
            return String(itemVal).toLowerCase() === v.toLowerCase();
          });
        });
      }
    }

    // 2. Apply search with multi-field matching
    const query = search.trim().toLowerCase();
    if (query && searchFields && searchFields.length > 0) {
      const tokens = query.split(/\s+/).filter(Boolean);

      result = result.filter((item) => {
        // Build a combined searchable string for this item
        const fieldStrings: string[] = [];

        for (const field of searchFields) {
          if (typeof field === 'function') {
            const val = field(item);
            if (Array.isArray(val)) {
              fieldStrings.push(...val.map((v) => String(v).toLowerCase()));
            } else if (val !== null && val !== undefined) {
              fieldStrings.push(String(val).toLowerCase());
            }
          } else {
            const itemRecord = item as Record<string, unknown>;
            const val = itemRecord[field as string];
            if (Array.isArray(val)) {
              fieldStrings.push(...val.map((v) => String(v).toLowerCase()));
            } else if (val !== null && val !== undefined) {
              fieldStrings.push(String(val).toLowerCase());
            }
          }
        }

        const combinedText = fieldStrings.join(' ');
        // Normalized version stripping out +256 prefix and punctuation for flexible phone search
        const strippedPhone = combinedText.replace(/[\s+()-]/g, '');

        // Match all tokens
        return tokens.every((token) => {
          const strippedToken = token.replace(/[\s+()-]/g, '');
          return (
            combinedText.includes(token) ||
            (strippedToken.length >= 3 && strippedPhone.includes(strippedToken))
          );
        });
      });
    }

    // 3. Apply sorting
    if (sortKey) {
      if (customSortFn) {
        result.sort((a, b) => customSortFn(a, b, sortKey, sortOrder));
      } else {
        result.sort((a, b) => {
          const aRecord = a as Record<string, unknown>;
          const bRecord = b as Record<string, unknown>;

          // Handle nested keys like "user.name" or "wallet.balance"
          const getVal = (obj: unknown, path: string): unknown => {
            if (!obj || typeof obj !== 'object') return undefined;
            const parts = path.split('.');
            let curr: unknown = obj;
            for (const p of parts) {
              if (!curr || typeof curr !== 'object') return undefined;
              curr = (curr as Record<string, unknown>)[p];
            }
            return curr;
          };

          const aVal = getVal(aRecord, sortKey);
          const bVal = getVal(bRecord, sortKey);

          if (aVal === bVal) return 0;
          if (aVal === null || aVal === undefined) return 1;
          if (bVal === null || bVal === undefined) return -1;

          let comp = 0;
          if (typeof aVal === 'number' && typeof bVal === 'number') {
            comp = aVal - bVal;
          } else if (aVal instanceof Date && bVal instanceof Date) {
            comp = aVal.getTime() - bVal.getTime();
          } else {
            // Check if strings are valid dates
            const aStr = String(aVal);
            const bStr = String(bVal);
            const aDate = Date.parse(aStr);
            const bDate = Date.parse(bStr);

            if (!isNaN(aDate) && !isNaN(bDate) && (aStr.includes('-') || aStr.includes(':'))) {
              comp = aDate - bDate;
            } else {
              comp = aStr.localeCompare(bStr, undefined, { numeric: true, sensitivity: 'base' });
            }
          }

          return sortOrder === 'asc' ? comp : -comp;
        });
      }
    }

    return result;
  }, [data, filterFn, filters, search, searchFields, sortKey, sortOrder, customSortFn]);

  // Total items and pages
  const totalItems = filteredData.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const safePage = Math.min(Math.max(1, page), totalPages);

  // Paginated slice
  const paginatedData = useMemo(() => {
    const start = (safePage - 1) * pageSize;
    return filteredData.slice(start, start + pageSize);
  }, [filteredData, safePage, pageSize]);

  const fromIndex = totalItems === 0 ? 0 : (safePage - 1) * pageSize + 1;
  const toIndex = Math.min(safePage * pageSize, totalItems);

  return {
    // Search
    search,
    setSearch,
    clearSearch,

    // Sort
    sortKey,
    sortOrder,
    toggleSort,
    setSort,

    // Filters
    filters,
    setFilter,
    resetFilters,

    // Pagination
    page: safePage,
    setPage,
    pageSize,
    setPageSize,
    totalPages,
    totalItems,
    fromIndex,
    toIndex,

    // Result sets
    paginatedData,
    filteredData,
  };
}
