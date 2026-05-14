import { useState, useMemo } from 'react';

interface UseSimpleDataOptions<T> {
  items: T[];
  pageSize?: number;
}

interface UseSimpleDataResult<T> {
  paginatedItems: T[];
  currentPage: number;
  setCurrentPage: (page: number) => void;
  totalPages: number;
}

export function useSimpleData<T>({ items, pageSize = 20 }: UseSimpleDataOptions<T>): UseSimpleDataResult<T> {
  const [currentPage, setCurrentPage] = useState(1);

  const paginatedItems = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return items.slice(startIndex, endIndex);
  }, [items, currentPage, pageSize]);

  const totalPages = useMemo(() => {
    return Math.ceil(items.length / pageSize);
  }, [items.length, pageSize]);

  return {
    paginatedItems,
    currentPage,
    setCurrentPage,
    totalPages
  };
}
