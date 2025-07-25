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

  constructor(config: Partial<CacheConfig> = {}) {
    this.config = {
      defaultTTL: 5 * 60 * 1000, // 5 minutes
      maxSize: 100,
      enablePersistence: true,
      ...config
    };

    // Load persisted cache on initialization
    if (this.config.enablePersistence && typeof window !== 'undefined') {
      this.loadFromStorage();
    }

    // Clean up expired items periodically
    setInterval(() => this.cleanup(), 60000); // Clean up every minute
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
    
    if (this.config.enablePersistence && typeof window !== 'undefined') {
      localStorage.removeItem('hr-portal-cache');
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
   * Save cache to localStorage
   */
  private saveToStorage(): void {
    try {
      const cacheData = {
        timestamp: Date.now(),
        items: Array.from(this.cache.entries())
      };
      localStorage.setItem('hr-portal-cache', JSON.stringify(cacheData));
    } catch (error) {
      console.warn('Failed to save cache to localStorage:', error);
    }
  }

  /**
   * Load cache from localStorage
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
            // Check if item is still valid
            if (now - item.timestamp <= item.ttl) {
              this.cache.set(key, item);
            }
          }
        }
      }
    } catch (error) {
      console.warn('Failed to load cache from localStorage:', error);
    }
  }
}

// Create singleton instance
const cacheManager = new CacheManager();

// Cache keys for different data types
export const CACHE_KEYS = {
  // Pages
  PAGES: 'pages',
  PAGE_DETAILS: (pageId: string) => `page:${pageId}`,
  
  // Events
  EVENTS: (pageId: string) => `events:${pageId}`,
  EVENT_DETAILS: (eventId: string) => `event:${eventId}`,
  EVENT_APPLICANTS: (eventId: string) => `event-applicants:${eventId}`,
  
  // Opportunities
  OPPORTUNITIES: (pageId: string) => `opportunities:${pageId}`,
  OPPORTUNITY_DETAILS: (opportunityId: string) => `opportunity:${opportunityId}`,
  OPPORTUNITY_APPLICANTS: (opportunityId: string) => `opportunity-applicants:${opportunityId}`,
  
  // Applicants
  APPLICANTS: 'applicants',
  APPLICANT_DETAILS: (applicantId: string) => `applicant:${applicantId}`,
  
  // User data
  USER_PROFILE: (userId: string) => `user:${userId}`,
  USER_PAGES: (userId: string) => `user-pages:${userId}`,
  
  // Payment gateway
  PAYMENT_CONFIG: (eventId: string) => `payment-config:${eventId}`,
} as const;

// Cache invalidation helpers
export const invalidateCache = {
  // Invalidate all page-related cache
  pages: () => {
    cacheManager.invalidatePattern('page:');
    cacheManager.invalidatePattern('events:');
    cacheManager.invalidatePattern('opportunities:');
  },
  
  // Invalidate specific event cache
  event: (eventId: string) => {
    cacheManager.delete(CACHE_KEYS.EVENT_DETAILS(eventId));
    cacheManager.delete(CACHE_KEYS.EVENT_APPLICANTS(eventId));
    cacheManager.delete(CACHE_KEYS.PAYMENT_CONFIG(eventId));
  },
  
  // Invalidate specific opportunity cache
  opportunity: (opportunityId: string) => {
    cacheManager.delete(CACHE_KEYS.OPPORTUNITY_DETAILS(opportunityId));
    cacheManager.delete(CACHE_KEYS.OPPORTUNITY_APPLICANTS(opportunityId));
  },
  
  // Invalidate all applicant cache
  applicants: () => {
    cacheManager.invalidatePattern('applicant:');
    cacheManager.invalidatePattern('event-applicants:');
    cacheManager.invalidatePattern('opportunity-applicants:');
  },
  
  // Invalidate user-related cache
  user: (userId: string) => {
    cacheManager.delete(CACHE_KEYS.USER_PROFILE(userId));
    cacheManager.delete(CACHE_KEYS.USER_PAGES(userId));
  }
};

export default cacheManager; 