/**
 * Lightweight performance utilities for HR Portal
 */

// Simple debounce function
export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

// Simple cache manager
export class CacheManager {
  private cache = new Map<string, { data: unknown; timestamp: number; ttl: number }>();
  
  set(key: string, data: unknown, ttl: number = 300000): void {
    this.cache.set(key, { data, timestamp: Date.now(), ttl });
  }
  
  get(key: string): unknown | null {
    const item = this.cache.get(key);
    if (!item) return null;
    
    if (Date.now() - item.timestamp > item.ttl) {
      this.cache.delete(key);
      return null;
    }
    
    return item.data;
  }
  
  clear(): void {
    this.cache.clear();
  }
}

// API call optimizer to prevent duplicates
export const apiCallOptimizer = {
  pendingCalls: new Map<string, Promise<unknown>>(),
  
  async call<T>(key: string, apiCall: () => Promise<T>): Promise<T> {
    if (this.pendingCalls.has(key)) {
      return this.pendingCalls.get(key) as Promise<T>;
    }
    
    const promise = apiCall();
    this.pendingCalls.set(key, promise);
    
    try {
      return await promise;
    } finally {
      this.pendingCalls.delete(key);
    }
  },
  
  clear(): void {
    this.pendingCalls.clear();
  }
};

// Export singleton instances
export const cacheManager = new CacheManager();
