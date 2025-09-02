/**
 * Cache Manager for HR Portal
 * Provides centralized cache management with TTL, invalidation, and persistence
 */

interface CacheItem<T> {
  data: T;
  timestamp: number;
  ttl: number; // Time to live in milliseconds
}

interface CacheConfig {
  defaultTTL: number; // Default TTL in milliseconds (5 minutes)
  maxSize: number; // Maximum number of items in cache
  enablePersistence: boolean; // Whether to persist cache to localStorage
}

class CacheManager {
  private cache = new Map<string, CacheItem<any>>();
  private config: CacheConfig;
  private currentUserId: string | null = null;

  constructor(config: Partial<CacheConfig> = {}) {
    this.config = {
      defaultTTL: 5 * 60 * 1000, // 5 minutes
      maxSize: 100,
      enablePersistence: true,
      ...config
    };

    // Don't load persisted cache on initialization - wait for user context
    // Clean up expired items periodically
    setInterval(() => this.cleanup(), 60000); // Clean up every minute
  }

  /**
   * Set current user context for cache isolation
   */
  setUserContext(userId: string | null): void {
    if (this.currentUserId !== userId) {
      // User changed - clear existing cache
      this.cache.clear();
      this.currentUserId = userId;
      
      // Load cache for new user if available
      if (userId && this.config.enablePersistence && typeof window !== 'undefined') {
        this.loadFromStorage();
      }
    }
  }

  /**
   * Set a value in cache
   */
  set<T>(key: string, data: T, ttl?: number): void {
    const item: CacheItem<T> = {
      data,
      timestamp: Date.now(),
      ttl: ttl || this.config.defaultTTL
    };

    // Remove oldest items if cache is full
    if (this.cache.size >= this.config.maxSize) {
      const oldestKey = this.cache.keys().next().value;
      this.cache.delete(oldestKey);
    }

    this.cache.set(key, item);

    // Persist to localStorage if enabled
    if (this.config.enablePersistence && typeof window !== 'undefined') {
      this.saveToStorage();
    }
  }

  /**
   * Get a value from cache
   */
  get<T>(key: string): T | null {
    const item = this.cache.get(key);
    
    if (!item) {
      return null;
    }

    // Check if item has expired
    if (Date.now() - item.timestamp > item.ttl) {
      this.cache.delete(key);
      return null;
    }

    return item.data;
  }

  /**
   * Check if a key exists and is not expired
   */
  has(key: string): boolean {
    return this.get(key) !== null;
  }

  /**
   * Remove a specific key from cache
   */
  delete(key: string): boolean {
    const deleted = this.cache.delete(key);
    
    if (deleted && this.config.enablePersistence && typeof window !== 'undefined') {
      this.saveToStorage();
    }
    
    return deleted;
  }

  /**
   * Clear all cache
   */
  clear(): void {
    this.cache.clear();
    this.currentUserId = null;
    
    if (this.config.enablePersistence && typeof window !== 'undefined') {
      localStorage.removeItem('hr-portal-cache');
      // Also clear session storage items
      sessionStorage.removeItem('cachedPages');
      sessionStorage.removeItem('cachedPagesTime');
    }
  }

  /**
   * Invalidate cache by pattern (useful for related data)
   */
  invalidatePattern(pattern: string): void {
    const keysToDelete: string[] = [];
    
    for (const key of this.cache.keys()) {
      if (key.includes(pattern)) {
        keysToDelete.push(key);
      }
    }
    
    keysToDelete.forEach(key => this.delete(key));
  }

  /**
   * Get cache statistics
   */
  getStats() {
    return {
      size: this.cache.size,
      maxSize: this.config.maxSize,
      keys: Array.from(this.cache.keys())
    };
  }

  /**
   * Clean up expired items
   */
  private cleanup(): void {
    const now = Date.now();
    const keysToDelete: string[] = [];
    
    for (const [key, item] of this.cache.entries()) {
      if (now - item.timestamp > item.ttl) {
        keysToDelete.push(key);
      }
    }
    
    keysToDelete.forEach(key => this.cache.delete(key));
    
    if (keysToDelete.length > 0 && this.config.enablePersistence && typeof window !== 'undefined') {
      this.saveToStorage();
    }
  }

  /**
   * Save cache to localStorage with user isolation
   */
  private saveToStorage(): void {
    try {
      const cacheData = {
        timestamp: Date.now(),
        items: Array.from(this.cache.entries())
      };
      localStorage.setItem('hr-portal-cache', JSON.stringify(cacheData));
    } catch {
      // Failed to save cache to localStorage
    }
  }

  /**
   * Load cache from localStorage with user validation
   */
  private loadFromStorage(): void {
    try {
      const cacheData = localStorage.getItem('hr-portal-cache');
      if (cacheData) {
        const parsed = JSON.parse(cacheData);
        const now = Date.now();
        
        // Only load if cache is not too old (24 hours)
        if (now - parsed.timestamp < 24 * 60 * 60 * 1000) {
          for (const [key, item] of parsed.items) {
            // Only load cache items that belong to the current user
            if (this.currentUserId && key.startsWith(`user:${this.currentUserId}:`)) {
              // Check if item is still valid
              if (now - item.timestamp <= item.ttl) {
                this.cache.set(key, item);
              }
            }
          }
        }
      }
    } catch {
      // Failed to load cache from localStorage
    }
  }
}

// Create singleton instance
const cacheManager = new CacheManager();

// Cache keys for different data types with user isolation
export const CACHE_KEYS = {
  // Pages - user-specific
  PAGES: (userId: string) => `user:${userId}:pages`,
  PAGE_DETAILS: (userId: string, pageId: string) => `user:${userId}:page:${pageId}`,
  
  // Events - user-specific
  EVENTS: (userId: string, pageId: string) => `user:${userId}:events:${pageId}`,
  EVENT_DETAILS: (userId: string, eventId: string) => `user:${userId}:event:${eventId}`,
  EVENT_APPLICANTS: (userId: string, eventId: string) => `user:${userId}:event-applicants:${eventId}`,
  
  // Opportunities - user-specific
  OPPORTUNITIES: (userId: string, pageId: string) => `user:${userId}:opportunities:${pageId}`,
  OPPORTUNITY_DETAILS: (userId: string, opportunityId: string) => `user:${userId}:opportunity:${opportunityId}`,
  OPPORTUNITY_APPLICANTS: (userId: string, opportunityId: string) => `user:${userId}:opportunity-applicants:${opportunityId}`,
  
  // Applicants - user-specific
  APPLICANTS: (userId: string) => `user:${userId}:applicants`,
  APPLICANT_DETAILS: (userId: string, applicantId: string) => `user:${userId}:applicant:${applicantId}`,
  
  // User data
  USER_PROFILE: (userId: string) => `user:${userId}:profile`,
  USER_PAGES: (userId: string) => `user:${userId}:user-pages`,
  
  // Payment gateway - user-specific
  PAYMENT_CONFIG: (userId: string, eventId: string) => `user:${userId}:payment-config:${eventId}`,
} as const;

// Cache invalidation helpers with user isolation
export const invalidateCache = {
  // Invalidate all cache for a specific user
  userAll: (userId: string) => {
    cacheManager.invalidatePattern(`user:${userId}:`);
  },
  
  // Invalidate all page-related cache for a user
  pages: (userId: string) => {
    cacheManager.invalidatePattern(`user:${userId}:page:`);
    cacheManager.invalidatePattern(`user:${userId}:events:`);
    cacheManager.invalidatePattern(`user:${userId}:opportunities:`);
  },
  
  // Invalidate specific event cache for a user
  event: (userId: string, eventId: string) => {
    cacheManager.delete(CACHE_KEYS.EVENT_DETAILS(userId, eventId));
    cacheManager.delete(CACHE_KEYS.EVENT_APPLICANTS(userId, eventId));
    cacheManager.delete(CACHE_KEYS.PAYMENT_CONFIG(userId, eventId));
  },
  
  // Invalidate specific opportunity cache for a user
  opportunity: (userId: string, opportunityId: string) => {
    cacheManager.delete(CACHE_KEYS.OPPORTUNITY_DETAILS(userId, opportunityId));
    cacheManager.delete(CACHE_KEYS.OPPORTUNITY_APPLICANTS(userId, opportunityId));
  },
  
  // Invalidate all applicant cache for a user
  applicants: (userId: string) => {
    cacheManager.invalidatePattern(`user:${userId}:applicant:`);
    cacheManager.invalidatePattern(`user:${userId}:event-applicants:`);
    cacheManager.invalidatePattern(`user:${userId}:opportunity-applicants:`);
  },
  
  // Invalidate user-related cache
  user: (userId: string) => {
    cacheManager.delete(CACHE_KEYS.USER_PROFILE(userId));
    cacheManager.delete(CACHE_KEYS.USER_PAGES(userId));
  },
  
  // Clear all cache (for logout)
  all: () => {
    cacheManager.clear();
  }
};

export default cacheManager;