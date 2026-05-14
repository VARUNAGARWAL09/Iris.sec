/**
 * Performance Optimization Hook
 * =============================
 * Provides debouncing, memoization, lazy loading, and route-based optimizations
 */

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { debounce } from 'lodash';
import { useLocation, useNavigate } from 'react-router-dom';
import React from 'react';

// Performance monitoring
interface PerformanceMetrics {
  renderTime: number;
  cacheHits: number;
  cacheMisses: number;
  lastUpdate: Date;
}

// Generic memoized cache
class MemoizedCache<V> {
  private cache = new Map<string, { value: V; timestamp: number }>();
  private ttl: number;

  constructor(ttl: number = 5 * 60 * 1000) { // 5 minutes default TTL
    this.ttl = ttl;
  }

  get(key: string): V | null {
    const item = this.cache.get(key);
    
    if (!item) return null;
    
    if (Date.now() - item.timestamp > this.ttl) {
      this.cache.delete(key);
      return null;
    }
    
    return item.value;
  }

  set(key: string, value: V): void {
    this.cache.set(key, {
      value,
      timestamp: Date.now(),
    });
  }

  clear(): void {
    this.cache.clear();
  }

  size(): number {
    return this.cache.size;
  }

  cleanup(): number {
    const now = Date.now();
    let cleaned = 0;
    
    for (const [key, item] of this.cache.entries()) {
      if (now - item.timestamp > this.ttl) {
        this.cache.delete(key);
        cleaned++;
      }
    }
    
    return cleaned;
  }
}

// Lazy loading component
export function useLazyLoad<T>(
  loader: () => Promise<T>,
  deps: React.DependencyList = []
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);

  const load = useCallback(async () => {
    if (loaded) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const result = await loader();
      setData(result);
      setLoaded(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [loader, loaded]);

  useEffect(() => {
    load();
  }, deps);

  const reload = useCallback(() => {
    setLoaded(false);
    load();
  }, [load]);

  return { data, loading, error, loaded, reload };
}

// Debounced state updates
export function useDebouncedState<T>(
  initialValue: T,
  delay: number = 300
): [T, T, (value: T) => void] {
  const [value, setValue] = useState<T>(initialValue);
  const [debouncedValue, setDebouncedValue] = useState<T>(initialValue);

  const debouncedSetValue = useMemo(
    () => debounce((newValue: T) => {
      setDebouncedValue(newValue);
    }, delay),
    [delay]
  );

  useEffect(() => {
    debouncedSetValue(value);
  }, [value, debouncedSetValue]);

  useEffect(() => {
    return () => {
      debouncedSetValue.cancel();
    };
  }, [debouncedSetValue]);

  return [value, debouncedValue, setValue];
}

// Performance monitoring hook
export function usePerformanceMonitor() {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    renderTime: 0,
    cacheHits: 0,
    cacheMisses: 0,
    lastUpdate: new Date(),
  });

  const startRender = useRef<number>(Date.now());

  useEffect(() => {
    const renderTime = Date.now() - startRender.current;
    setMetrics(prev => ({
      ...prev,
      renderTime,
      lastUpdate: new Date(),
    }));
  });

  const recordCacheHit = useCallback(() => {
    setMetrics(prev => ({
      ...prev,
      cacheHits: prev.cacheHits + 1,
    }));
  }, []);

  const recordCacheMiss = useCallback(() => {
    setMetrics(prev => ({
      ...prev,
      cacheMisses: prev.cacheMisses + 1,
    }));
  }, []);

  return {
    metrics,
    recordCacheHit,
    recordCacheMiss,
    startRender: () => {
      startRender.current = Date.now();
    },
  };
}

// Memoized data fetching hook
export function useMemoizedFetch<T>(
  fetcher: () => Promise<T>,
  cacheKey: string,
  ttl: number = 5 * 60 * 1000
) {
  const cache = useMemo(() => new MemoizedCache<T>(ttl), [ttl]);
  const { recordCacheHit, recordCacheMiss } = usePerformanceMonitor();
  
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    // Try cache first
    const cached = cache.get(cacheKey);
    if (cached) {
      setData(cached);
      recordCacheHit();
      return cached;
    }

    setLoading(true);
    setError(null);
    recordCacheMiss();

    try {
      const result = await fetcher();
      cache.set(cacheKey, result);
      setData(result);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetcher, cacheKey, cache, recordCacheHit, recordCacheMiss]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const invalidate = useCallback(() => {
    cache.clear();
    return fetchData();
  }, [cache, fetchData]);

  return { data, loading, error, refetch: fetchData, invalidate };
}

// Virtual scrolling hook for large lists
export function useVirtualScrolling<T>(
  items: T[],
  itemHeight: number,
  containerHeight: number
) {
  const [scrollTop, setScrollTop] = useState(0);
  
  const visibleItems = useMemo(() => {
    const startIndex = Math.floor(scrollTop / itemHeight);
    const endIndex = Math.min(
      startIndex + Math.ceil(containerHeight / itemHeight) + 1,
      items.length
    );
    
    return {
      items: items.slice(startIndex, endIndex),
      startIndex,
      endIndex,
      offsetY: startIndex * itemHeight,
    };
  }, [items, scrollTop, itemHeight, containerHeight]);

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  }, []);

  return {
    visibleItems,
    handleScroll,
    totalHeight: items.length * itemHeight,
  };
}

// Batch processing hook
export function useBatchProcessing<T, R>(
  processor: (batch: T[]) => Promise<R[]>,
  batchSize: number = 50,
  delay: number = 100
) {
  const [processing, setProcessing] = useState(false);
  const [processed, setProcessed] = useState(0);
  const [total, setTotal] = useState(0);

  const processBatches = useCallback(async (items: T[]): Promise<R[]> => {
    setProcessing(true);
    setProcessed(0);
    setTotal(items.length);
    
    const results: R[] = [];
    
    for (let i = 0; i < items.length; i += batchSize) {
      const batch = items.slice(i, i + batchSize);
      const batchResults = await processor(batch);
      results.push(...batchResults);
      
      setProcessed(i + batch.length);
      
      // Small delay between batches to prevent overwhelming
      if (i + batchSize < items.length) {
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    
    setProcessing(false);
    return results;
  }, [processor, batchSize, delay]);

  return {
    processBatches,
    processing,
    processed,
    total,
    progress: total > 0 ? processed / total : 0,
  };
}

// Chart optimization hook
export function useChartOptimization() {
  const [chartData, setChartData] = useState<any[]>([]);
  const [maxDataPoints, setMaxDataPoints] = useState(100);

  const optimizeChartData = useCallback((data: any[], maxPoints: number = maxDataPoints) => {
    if (data.length <= maxPoints) return data;
    
    // Sample data points to maintain performance
    const step = Math.ceil(data.length / maxPoints);
    return data.filter((_, index) => index % step === 0);
  }, [maxDataPoints]);

  const updateChartData = useCallback((data: any[]) => {
    const optimized = optimizeChartData(data);
    setChartData(optimized);
  }, [optimizeChartData]);

  return {
    chartData,
    updateChartData,
    optimizeChartData,
    setMaxDataPoints,
  };
}

// Resource monitoring hook
export function useResourceMonitor() {
  const [resources, setResources] = useState({
    memoryUsed: 0,
    memoryTotal: 0,
    cacheSize: 0,
    activeConnections: 0,
  });

  const updateResources = useCallback((updates: Partial<typeof resources>) => {
    setResources(prev => ({ ...prev, ...updates }));
  }, []);

  const clearCache = useCallback(() => {
    // Clear all caches and reset counters
    setResources(prev => ({
      ...prev,
      cacheSize: 0,
      activeConnections: 0,
    }));
  }, []);

  return {
    resources,
    updateResources,
    clearCache,
  };
}

// Export cache instance for global use
export const globalCache = new MemoizedCache<unknown>(10 * 60 * 1000); // 10 minutes

// Performance utilities
export const performanceUtils = {
  // Debounce utility
  debounce: <T extends (...args: any[]) => any>(
    func: T,
    delay: number
  ): ((...args: Parameters<T>) => void) => {
    return debounce(func, delay);
  },
  // Throttle utility
  throttle: <T extends (...args: any[]) => any>(
    func: T,
    delay: number
  ): ((...args: Parameters<T>) => void) => {
    let lastCall = 0;
    return (...args: Parameters<T>) => {
      const now = Date.now();
      if (now - lastCall >= delay) {
        lastCall = now;
        func(...args);
      }
    };
  },
  
  // Memoize utility
  memoize: <T extends (...args: any[]) => any>(func: T): T => {
    const cache = new Map();
    return ((...args: any[]) => {
      const key = JSON.stringify(args);
      if (cache.has(key)) return cache.get(key);
      const result = func(...args);
      cache.set(key, result);
      return result;
    }) as T;
  },
  
  // Performance measurement
  measure: <T>(name: string, fn: () => T): T => {
    const start = performance.now();
    const result = fn();
    const end = performance.now();
    console.log(`[Performance] ${name}: ${end - start}ms`);
    return result;
  },
  
  // Route preloading
  useRoutePreloading: () => {
    const location = useLocation();
    const navigate = useNavigate();
    const preloadedRoutes = useRef(new Set<string>());
    
    useEffect(() => {
      // Preload commonly accessed routes
      const commonRoutes = ['/incidents', '/alerts', '/ml-analysis', '/documentation'];
      commonRoutes.forEach(route => {
        if (!preloadedRoutes.current.has(route)) {
          // Trigger prefetch by creating a temporary link
          const link = document.createElement('link');
          link.rel = 'prefetch';
          link.href = route;
          document.head.appendChild(link);
          preloadedRoutes.current.add(route);
        }
      });
    }, [location.pathname]);
    
    return { preloadedRoutes: preloadedRoutes.current };
  },
  
  };
