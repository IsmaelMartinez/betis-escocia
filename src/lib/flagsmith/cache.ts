/**
 * Flagsmith Local Cache Implementation
 * 
 * This file implements local caching for Flagsmith flag values to improve performance
 * and reduce API calls. Cache entries have a configurable TTL (Time To Live).
 */

import { FlagsmithCache, FlagsmithCacheEntry, FlagsmithFeatureName } from './types';

class FlagsmithCacheManager {
  private cache: FlagsmithCache = {};
  private defaultTTL: number = 60000; // 1 minute default TTL
  private cleanupInterval: NodeJS.Timeout | null = null;
  private hitCount: number = 0;
  private missCount: number = 0;

  constructor(defaultTTL: number = 60000) {
    this.defaultTTL = defaultTTL;
    this.startCleanupInterval();
  }

  /**
   * Get a flag value from cache
   */
  get(flagName: FlagsmithFeatureName): boolean | null {
    const entry = this.cache[flagName];
    
    if (!entry) {
      this.missCount++;
      return null;
    }

    // Check if entry has expired
    if (Date.now() - entry.timestamp > entry.ttl) {
      delete this.cache[flagName];
      this.missCount++;
      return null;
    }

    this.hitCount++;
    return entry.value;
  }

  /**
   * Set a flag value in cache
   */
  set(flagName: FlagsmithFeatureName, value: boolean, ttl?: number): void {
    const entryTTL = ttl || this.defaultTTL;
    
    this.cache[flagName] = {
      value,
      timestamp: Date.now(),
      ttl: entryTTL
    };
  }

  /**
   * Remove a specific flag from cache
   */
  delete(flagName: FlagsmithFeatureName): void {
    delete this.cache[flagName];
  }

  /**
   * Clear all cache entries
   */
  clear(): void {
    this.cache = {};
    this.hitCount = 0;
    this.missCount = 0;
  }

  /**
   * Get cache statistics
   */
  getStats() {
    const totalRequests = this.hitCount + this.missCount;
    const hitRate = totalRequests > 0 ? (this.hitCount / totalRequests) * 100 : 0;
    
    return {
      hitCount: this.hitCount,
      missCount: this.missCount,
      hitRate: Math.round(hitRate * 100) / 100, // Round to 2 decimal places
      cacheSize: Object.keys(this.cache).length,
      totalRequests
    };
  }

  /**
   * Check if a flag is cached and valid
   */
  has(flagName: FlagsmithFeatureName): boolean {
    const entry = this.cache[flagName];
    if (!entry) return false;
    
    // Check if entry has expired
    if (Date.now() - entry.timestamp > entry.ttl) {
      delete this.cache[flagName];
      return false;
    }
    
    return true;
  }

  /**
   * Get all cached flag names
   */
  getKeys(): string[] {
    return Object.keys(this.cache);
  }

  /**
   * Clean up expired cache entries
   */
  private cleanup(): void {
    const now = Date.now();
    const expiredKeys: string[] = [];

    for (const [key, entry] of Object.entries(this.cache)) {
      if (now - entry.timestamp > entry.ttl) {
        expiredKeys.push(key);
      }
    }

    expiredKeys.forEach(key => delete this.cache[key]);
    
    // Log cleanup if there were expired entries
    if (expiredKeys.length > 0) {
      console.debug(`[Flagsmith Cache] Cleaned up ${expiredKeys.length} expired entries`);
    }
  }

  /**
   * Start automatic cleanup of expired entries
   */
  private startCleanupInterval(): void {
    // Run cleanup every 5 minutes
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, 300000);
  }

  /**
   * Stop automatic cleanup
   */
  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
    this.clear();
  }

  /**
   * Update TTL for existing cache entry
   */
  updateTTL(flagName: FlagsmithFeatureName, newTTL: number): boolean {
    const entry = this.cache[flagName];
    if (!entry) return false;
    
    entry.ttl = newTTL;
    entry.timestamp = Date.now(); // Reset timestamp for new TTL
    return true;
  }

  /**
   * Get cache entry info (for debugging)
   */
  getEntryInfo(flagName: FlagsmithFeatureName): FlagsmithCacheEntry | null {
    const entry = this.cache[flagName];
    if (!entry) return null;
    
    return {
      ...entry,
      // Add remaining TTL
      remainingTTL: Math.max(0, entry.ttl - (Date.now() - entry.timestamp))
    } as FlagsmithCacheEntry & { remainingTTL: number };
  }
}

// Global cache instance
let globalCacheInstance: FlagsmithCacheManager | null = null;

/**
 * Get the global cache instance
 */
export function getCache(ttl?: number): FlagsmithCacheManager {
  if (!globalCacheInstance) {
    globalCacheInstance = new FlagsmithCacheManager(ttl);
  }
  return globalCacheInstance;
}

/**
 * Reset the global cache instance (useful for testing)
 */
export function resetCache(): void {
  if (globalCacheInstance) {
    globalCacheInstance.destroy();
    globalCacheInstance = null;
  }
}

/**
 * Cache decorator for flag evaluation functions
 */
export function withCache<T extends (...args: unknown[]) => Promise<boolean>>(
  fn: T,
  getCacheKey: (...args: Parameters<T>) => FlagsmithFeatureName,
  ttl?: number
): T {
  return (async (...args: Parameters<T>) => {
    const cache = getCache();
    const cacheKey = getCacheKey(...args);
    
    // Try to get from cache first
    const cachedValue = cache.get(cacheKey);
    if (cachedValue !== null) {
      return cachedValue;
    }
    
    // If not in cache, execute the function
    const result = await fn(...args);
    
    // Cache the result
    cache.set(cacheKey, result, ttl);
    
    return result;
  }) as T;
}

export { FlagsmithCacheManager };
