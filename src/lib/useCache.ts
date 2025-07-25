import { useState, useEffect, useCallback } from 'react';
import cacheManager, { CACHE_KEYS, invalidateCache } from './cacheManager';

interface UseCacheOptions {
  ttl?: number; // Time to live in milliseconds
  dependencies?: unknown[]; // React dependencies for refetching
  enabled?: boolean; // Whether to enable caching
}

/**
 * Custom hook for using cache manager with React components
 */
export function useCache<T>(
  key: string,
  fetcher: () => Promise<T>,
  options: UseCacheOptions = {}
): {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  invalidate: () => void;
} {
  const { ttl, dependencies = [], enabled = true } = options;
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!enabled) return;

    setLoading(true);
    setError(null);

    try {
      // Check cache first
      const cachedData = cacheManager.get<T>(key);
      if (cachedData) {
        setData(cachedData);
        setLoading(false);
        return;
      }

      // Fetch fresh data
      const freshData = await fetcher();
      
      // Cache the data
      cacheManager.set(key, freshData, ttl);
      
      setData(freshData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, [key, fetcher, ttl, enabled]);

  const refetch = useCallback(async () => {
    // Remove from cache to force fresh fetch
    cacheManager.delete(key);
    await fetchData();
  }, [key, fetchData]);

  const invalidate = useCallback(() => {
    cacheManager.delete(key);
    setData(null);
  }, [key]);

  // Initial fetch
  useEffect(() => {
    fetchData();
  }, [fetchData, ...dependencies]);

  return {
    data,
    loading,
    error,
    refetch,
    invalidate
  };
}

/**
 * Hook for managing API calls with cache
 */
export function useApiCache<T>(
  key: string,
  apiCall: () => Promise<T>,
  options: UseCacheOptions = {}
) {
  return useCache(key, apiCall, options);
}

/**
 * Hook for managing pages data with cache
 */
export function usePagesCache() {
  return useCache(
    CACHE_KEYS.PAGES,
    async () => {
      const response = await fetch('/api/pages');
      const data = await response.json();
      if (!data.success) throw new Error(data.message);
      return data.pages;
    },
    { ttl: 10 * 60 * 1000 } // 10 minutes
  );
}

/**
 * Hook for managing events data with cache
 */
export function useEventsCache(pageId: string) {
  return useCache(
    CACHE_KEYS.EVENTS(pageId),
    async () => {
      const response = await fetch(`/api/events?pageId=${pageId}`);
      const data = await response.json();
      if (!data.success) throw new Error(data.message);
      return data.events;
    },
    { 
      ttl: 5 * 60 * 1000, // 5 minutes
      dependencies: [pageId]
    }
  );
}

/**
 * Hook for managing opportunities data with cache
 */
export function useOpportunitiesCache(pageId: string) {
  return useCache(
    CACHE_KEYS.OPPORTUNITIES(pageId),
    async () => {
      const response = await fetch(`/api/opportunities?pageId=${pageId}`);
      const data = await response.json();
      if (!data.success) throw new Error(data.message);
      return data.opportunities;
    },
    { 
      ttl: 5 * 60 * 1000, // 5 minutes
      dependencies: [pageId]
    }
  );
}

/**
 * Hook for managing applicants data with cache
 */
export function useApplicantsCache() {
  return useCache(
    CACHE_KEYS.APPLICANTS,
    async () => {
      const response = await fetch('/api/opportunities/applicants');
      const data = await response.json();
      if (!data.success) throw new Error(data.message);
      return data.applicants;
    },
    { ttl: 3 * 60 * 1000 } // 3 minutes
  );
}

/**
 * Hook for managing event details with cache
 */
export function useEventDetailsCache(eventId: string) {
  return useCache(
    CACHE_KEYS.EVENT_DETAILS(eventId),
    async () => {
      const response = await fetch(`/api/events/${eventId}`);
      const data = await response.json();
      if (!data.success) throw new Error(data.message);
      return data.data;
    },
    { 
      ttl: 5 * 60 * 1000, // 5 minutes
      dependencies: [eventId]
    }
  );
}

/**
 * Hook for managing opportunity details with cache
 */
export function useOpportunityDetailsCache(opportunityId: string) {
  return useCache(
    CACHE_KEYS.OPPORTUNITY_DETAILS(opportunityId),
    async () => {
      const response = await fetch(`/api/opportunities/${opportunityId}`);
      const data = await response.json();
      if (!data.success) throw new Error(data.message);
      return data.data;
    },
    { 
      ttl: 5 * 60 * 1000, // 5 minutes
      dependencies: [opportunityId]
    }
  );
}

// Export cache utilities
export { cacheManager, CACHE_KEYS, invalidateCache }; 