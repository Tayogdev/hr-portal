import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
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
  const { data: session } = useSession();
  const userId = session?.user?.id;
  
  return useCache(
    userId ? CACHE_KEYS.PAGES(userId) : 'no-user-pages',
    async () => {
      if (!userId) throw new Error('User not authenticated');
      const response = await fetch('/api/pages');
      const data = await response.json();
      if (!data.success) throw new Error(data.message);
      return data.pages;
    },
    { 
      ttl: 10 * 60 * 1000, // 10 minutes
      enabled: !!userId,
      dependencies: [userId]
    }
  );
}

/**
 * Hook for managing events data with cache
 */
export function useEventsCache(pageId: string) {
  const { data: session } = useSession();
  const userId = session?.user?.id;
  
  return useCache(
    userId ? CACHE_KEYS.EVENTS(userId, pageId) : 'no-user-events',
    async () => {
      if (!userId) throw new Error('User not authenticated');
      const response = await fetch(`/api/events?pageId=${pageId}`);
      const data = await response.json();
      if (!data.success) throw new Error(data.message);
      return data.events;
    },
    { 
      ttl: 5 * 60 * 1000, // 5 minutes
      enabled: !!userId && !!pageId,
      dependencies: [userId, pageId]
    }
  );
}

/**
 * Hook for managing opportunities data with cache
 */
export function useOpportunitiesCache(pageId: string) {
  const { data: session } = useSession();
  const userId = session?.user?.id;
  
  return useCache(
    userId ? CACHE_KEYS.OPPORTUNITIES(userId, pageId) : 'no-user-opportunities',
    async () => {
      if (!userId) throw new Error('User not authenticated');
      const response = await fetch(`/api/opportunities?pageId=${pageId}`);
      const data = await response.json();
      if (!data.success) throw new Error(data.message);
      return data.opportunities;
    },
    { 
      ttl: 5 * 60 * 1000, // 5 minutes
      enabled: !!userId && !!pageId,
      dependencies: [userId, pageId]
    }
  );
}

/**
 * Hook for managing applicants data with cache
 */
export function useApplicantsCache() {
  const { data: session } = useSession();
  const userId = session?.user?.id;
  
  return useCache(
    userId ? CACHE_KEYS.APPLICANTS(userId) : 'no-user-applicants',
    async () => {
      if (!userId) throw new Error('User not authenticated');
      const response = await fetch('/api/opportunities/applicants');
      const data = await response.json();
      if (!data.success) throw new Error(data.message);
      return data.applicants;
    },
    { 
      ttl: 3 * 60 * 1000, // 3 minutes
      enabled: !!userId,
      dependencies: [userId]
    }
  );
}

/**
 * Hook for managing event details with cache
 */
export function useEventDetailsCache(eventId: string) {
  const { data: session } = useSession();
  const userId = session?.user?.id;
  
  return useCache(
    userId ? CACHE_KEYS.EVENT_DETAILS(userId, eventId) : 'no-user-event-details',
    async () => {
      if (!userId) throw new Error('User not authenticated');
      const response = await fetch(`/api/events/${eventId}`);
      const data = await response.json();
      if (!data.success) throw new Error(data.message);
      return data.data;
    },
    { 
      ttl: 5 * 60 * 1000, // 5 minutes
      enabled: !!userId && !!eventId,
      dependencies: [userId, eventId]
    }
  );
}

/**
 * Hook for managing opportunity details with cache
 */
export function useOpportunityDetailsCache(opportunityId: string) {
  const { data: session } = useSession();
  const userId = session?.user?.id;
  
  return useCache(
    userId ? CACHE_KEYS.OPPORTUNITY_DETAILS(userId, opportunityId) : 'no-user-opportunity-details',
    async () => {
      if (!userId) throw new Error('User not authenticated');
      const response = await fetch(`/api/opportunities/${opportunityId}`);
      const data = await response.json();
      if (!data.success) throw new Error(data.message);
      return data.data;
    },
    { 
      ttl: 5 * 60 * 1000, // 5 minutes
      enabled: !!userId && !!opportunityId,
      dependencies: [userId, opportunityId]
    }
  );
}

// Export cache utilities
export { cacheManager, CACHE_KEYS, invalidateCache };