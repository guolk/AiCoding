import { useState, useCallback } from 'react';
import type { PaginationState } from '@/types';

interface UsePaginationOptions {
  initialPage?: number;
  initialPageSize?: number;
  onPageChange?: (page: number, pageSize: number) => void;
}

interface UsePaginationReturn extends PaginationState {
  setPage: (page: number) => void;
  setPageSize: (pageSize: number) => void;
  setTotal: (total: number) => void;
  nextPage: () => void;
  prevPage: () => void;
  goToFirstPage: () => void;
  goToLastPage: () => void;
  canGoNext: boolean;
  canGoPrev: boolean;
  pages: number[];
}

export function usePagination(options: UsePaginationOptions = {}): UsePaginationReturn {
  const {
    initialPage = 1,
    initialPageSize = 10,
    onPageChange,
  } = options;

  const [page, setPageState] = useState(initialPage);
  const [pageSize, setPageSizeState] = useState(initialPageSize);
  const [total, setTotal] = useState(0);

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  const canGoNext = page < totalPages;
  const canGoPrev = page > 1;

  const getVisiblePages = useCallback(() => {
    const delta = 2;
    const range: number[] = [];
    
    for (
      let i = Math.max(2, page - delta);
      i <= Math.min(totalPages - 1, page + delta);
      i++
    ) {
      range.push(i);
    }

    if (page - delta > 2) {
      range.unshift(-1);
    }

    if (page + delta < totalPages - 1) {
      range.push(-1);
    }

    if (totalPages > 1) {
      range.unshift(1);
    }

    if (totalPages > 1) {
      range.push(totalPages);
    }

    return range;
  }, [page, totalPages]);

  const pages = getVisiblePages();

  const setPage = useCallback(
    (newPage: number) => {
      if (newPage >= 1 && newPage <= totalPages) {
        setPageState(newPage);
        onPageChange?.(newPage, pageSize);
      }
    },
    [totalPages, pageSize, onPageChange]
  );

  const setPageSize = useCallback(
    (newPageSize: number) => {
      setPageSizeState(newPageSize);
      setPageState(1);
      onPageChange?.(1, newPageSize);
    },
    [onPageChange]
  );

  const nextPage = useCallback(() => {
    if (canGoNext) {
      setPage(page + 1);
    }
  }, [canGoNext, page, setPage]);

  const prevPage = useCallback(() => {
    if (canGoPrev) {
      setPage(page - 1);
    }
  }, [canGoPrev, page, setPage]);

  const goToFirstPage = useCallback(() => {
    setPage(1);
  }, [setPage]);

  const goToLastPage = useCallback(() => {
    setPage(totalPages);
  }, [totalPages, setPage]);

  return {
    page,
    pageSize,
    total,
    totalPages,
    setPage,
    setPageSize,
    setTotal,
    nextPage,
    prevPage,
    goToFirstPage,
    goToLastPage,
    canGoNext,
    canGoPrev,
    pages,
  };
}
