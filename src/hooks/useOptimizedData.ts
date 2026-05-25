import { useMemo, useCallback, useState, useEffect, useRef } from 'react';

interface UseOptimizedDataOptions<T> {
  items: T[];
  searchFields: (keyof T)[];
  filterFn?: (item: T, filters: Record<string, any>) => boolean;
  sortFn?: (a: T, b: T) => number;
  pageSize?: number;
  initialFilters?: Record<string, any>;
}

interface UseOptimizedDataResult<T> {
  filteredItems: T[];
  paginatedItems: T[];
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  filters: Record<string, any>;
  setFilter: (key: string, value: any) => void;
  sortOrder: 'asc' | 'desc';
  setSortOrder: (order: 'asc' | 'desc') => void;
  currentPage: number;
  setCurrentPage: (page: number) => void;
  totalPages: number;
  loading: boolean;
  debouncedSearchTerm: string;
}

export function useOptimizedData<T>({
  items,
  searchFields,
  filterFn,
  sortFn,
  pageSize = 50,
  initialFilters
}: UseOptimizedDataOptions<T>): UseOptimizedDataResult<T> {
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [filters, setFilters] = useState<Record<string, any>>(initialFilters || {});
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      setCurrentPage(1); // Reset to first page when searching
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Memoized search function
  const searchItems = useCallback((items: T[], term: string) => {
    if (!term.trim()) return items;
    
    const lowerTerm = term.toLowerCase();
    return items.filter(item => {
      return searchFields.some(field => {
        const value = item[field];
        return typeof value === 'string' && value.toLowerCase().includes(lowerTerm);
      });
    });
  }, [searchFields]);

  // Memoized filter function
  const filterItems = useCallback((items: T[], filters: Record<string, any>) => {
    if (!filterFn) return items;
    return items.filter(item => filterFn(item, filters));
  }, [filterFn]);

  // Memoized sort function
  const sortItems = useCallback((items: T[], order: 'asc' | 'desc') => {
    if (!sortFn) return items;
    return [...items].sort((a, b) => {
      const result = sortFn(a, b);
      return order === 'desc' ? -result : result;
    });
  }, [sortFn]);

  // Memoized filtered and sorted items
  const filteredItems = useMemo(() => {
    let result = items;
    
    // Apply search
    result = searchItems(result, debouncedSearchTerm);
    
    // Apply filters
    result = filterItems(result, filters);
    
    // Apply sorting
    result = sortItems(result, sortOrder);
    
    return result;
  }, [items, debouncedSearchTerm, filters, sortOrder, searchItems, filterItems, sortItems]);

  // Update loading state based on data processing
  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => {
      setLoading(false);
    }, 100);
    
    return () => clearTimeout(timer);
  }, [items, debouncedSearchTerm, filters, sortOrder]);

  // Memoized paginated items
  const paginatedItems = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return filteredItems.slice(startIndex, endIndex);
  }, [filteredItems, currentPage, pageSize]);

  // Memoized total pages
  const totalPages = useMemo(() => {
    return Math.ceil(filteredItems.length / pageSize);
  }, [filteredItems.length, pageSize]);

  // Update filter function
  const setFilter = useCallback((key: string, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1); // Reset to first page when filtering
  }, []);

  return {
    filteredItems,
    paginatedItems,
    searchTerm,
    setSearchTerm,
    filters,
    setFilter,
    sortOrder,
    setSortOrder,
    currentPage,
    setCurrentPage,
    totalPages,
    loading,
    debouncedSearchTerm
  };
}

// Virtual scrolling hook for large lists
export function useVirtualScroll<T>({
  items,
  itemHeight = 60,
  containerHeight = 400,
  overscan = 5
}: {
  items: T[];
  itemHeight?: number;
  containerHeight?: number;
  overscan?: number;
}) {
  const [scrollTop, setScrollTop] = useState(0);

  const visibleRange = useMemo(() => {
    const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
    const endIndex = Math.min(
      items.length - 1,
      Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan
    );
    return { startIndex, endIndex };
  }, [scrollTop, itemHeight, containerHeight, overscan, items.length]);

  const visibleItems = useMemo(() => {
    return items.slice(visibleRange.startIndex, visibleRange.endIndex + 1);
  }, [items, visibleRange.startIndex, visibleRange.endIndex]);

  const totalHeight = items.length * itemHeight;

  return {
    visibleItems,
    totalHeight,
    startIndex: visibleRange.startIndex,
    endIndex: visibleRange.endIndex,
    setScrollTop
  };
}

// Performance monitoring hook
export function usePerformanceMonitor(componentName: string) {
  const renderStartTime = useRef(performance.now());
  const lastRenderTime = useRef(0);

  useEffect(() => {
    const renderEndTime = performance.now();
    const renderTime = renderEndTime - renderStartTime.current;
    lastRenderTime.current = renderTime;

    if (renderTime > 16) { // Log slow renders (> 16ms for 60fps)
      console.warn(`[Performance] ${componentName} slow render: ${renderTime.toFixed(2)}ms`);
    }

    renderStartTime.current = performance.now();
  });

  return {
    lastRenderTime: lastRenderTime.current,
    isSlowRender: lastRenderTime.current > 16
  };
}
