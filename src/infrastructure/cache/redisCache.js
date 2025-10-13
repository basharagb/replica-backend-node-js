// ==============================
// 🚀 High-Performance Redis Cache Layer
// ==============================
import { logger } from '../config/logger.js';

// ==============================
// 📦 In-Memory Cache (Fallback when Redis unavailable)
// ==============================
class InMemoryCache {
  constructor() {
    this.cache = new Map();
    this.ttlMap = new Map();
    this.maxSize = 1000; // Maximum cache entries
    
    // Cleanup expired entries every 5 minutes
    setInterval(() => this.cleanup(), 5 * 60 * 1000);
  }

  set(key, value, ttlSeconds = 300) {
    // Remove oldest entries if cache is full
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      this.delete(firstKey);
    }

    this.cache.set(key, value);
    this.ttlMap.set(key, Date.now() + (ttlSeconds * 1000));
    
    logger.debug(`📦 Cache SET: ${key} (TTL: ${ttlSeconds}s)`);
  }

  get(key) {
    const ttl = this.ttlMap.get(key);
    
    if (!ttl || Date.now() > ttl) {
      this.delete(key);
      return null;
    }

    const value = this.cache.get(key);
    logger.debug(`📦 Cache HIT: ${key}`);
    return value;
  }

  delete(key) {
    this.cache.delete(key);
    this.ttlMap.delete(key);
    logger.debug(`📦 Cache DELETE: ${key}`);
  }

  clear() {
    this.cache.clear();
    this.ttlMap.clear();
    logger.info('📦 Cache cleared');
  }

  cleanup() {
    const now = Date.now();
    let cleaned = 0;

    for (const [key, ttl] of this.ttlMap.entries()) {
      if (now > ttl) {
        this.delete(key);
        cleaned++;
      }
    }

    if (cleaned > 0) {
      logger.info(`🧹 Cache cleanup: ${cleaned} expired entries removed`);
    }
  }

  getStats() {
    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      memoryUsage: process.memoryUsage()
    };
  }
}

// ==============================
// 🚀 Cache Instance
// ==============================
const cache = new InMemoryCache();

// ==============================
// 🎯 Cache Key Generators
// ==============================
export const CacheKeys = {
  // Silo-related cache keys
  SILOS_ALL: 'silos:all',
  SILO_BY_ID: (id) => `silo:${id}`,
  SILO_CABLES: (siloId) => `silo:${siloId}:cables`,
  
  // Reading-related cache keys
  READINGS_LATEST: (type, id) => `readings:latest:${type}:${id}`,
  READINGS_MAX: (type, id) => `readings:max:${type}:${id}`,
  READINGS_AVG: (type, id) => `readings:avg:${type}:${id}`,
  
  // Alert-related cache keys
  ALERTS_ACTIVE: 'alerts:active',
  
  // User-related cache keys
  USER_PROFILE: (userId) => `user:${userId}:profile`,
  
  // System cache keys
  HEALTH_CHECK: 'system:health',
  DB_STATS: 'system:db:stats'
};

// ==============================
// 🚀 High-Level Cache Operations
// ==============================
export const CacheService = {
  // ⚡ Get with automatic JSON parsing
  async get(key) {
    try {
      const value = cache.get(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      logger.error(`❌ Cache GET error for key ${key}:`, error);
      return null;
    }
  },

  // ⚡ Set with automatic JSON stringification
  async set(key, value, ttlSeconds = 300) {
    try {
      const serialized = JSON.stringify(value);
      cache.set(key, serialized, ttlSeconds);
      return true;
    } catch (error) {
      logger.error(`❌ Cache SET error for key ${key}:`, error);
      return false;
    }
  },

  // ⚡ Delete cache entry
  async delete(key) {
    try {
      cache.delete(key);
      return true;
    } catch (error) {
      logger.error(`❌ Cache DELETE error for key ${key}:`, error);
      return false;
    }
  },

  // ⚡ Clear all cache
  async clear() {
    try {
      cache.clear();
      logger.info('🧹 All cache cleared');
      return true;
    } catch (error) {
      logger.error('❌ Cache CLEAR error:', error);
      return false;
    }
  },

  // 📊 Get cache statistics
  getStats() {
    return cache.getStats();
  },

  // 🎯 Cache with function execution (memoization)
  async memoize(key, asyncFunction, ttlSeconds = 300) {
    // Try to get from cache first
    let cached = await this.get(key);
    if (cached !== null) {
      logger.debug(`⚡ Cache HIT for memoized function: ${key}`);
      return cached;
    }

    // Execute function and cache result
    try {
      logger.debug(`🔄 Cache MISS, executing function: ${key}`);
      const result = await asyncFunction();
      await this.set(key, result, ttlSeconds);
      return result;
    } catch (error) {
      logger.error(`❌ Memoized function error for key ${key}:`, error);
      throw error;
    }
  },

  // 🔥 Batch operations
  async mget(keys) {
    const results = {};
    for (const key of keys) {
      results[key] = await this.get(key);
    }
    return results;
  },

  async mset(keyValuePairs, ttlSeconds = 300) {
    const results = {};
    for (const [key, value] of Object.entries(keyValuePairs)) {
      results[key] = await this.set(key, value, ttlSeconds);
    }
    return results;
  }
};

// ==============================
// 🎯 Smart Cache Invalidation
// ==============================
export const CacheInvalidation = {
  // Invalidate silo-related cache
  async invalidateSilo(siloId) {
    const keys = [
      CacheKeys.SILOS_ALL,
      CacheKeys.SILO_BY_ID(siloId),
      CacheKeys.SILO_CABLES(siloId)
    ];
    
    for (const key of keys) {
      await CacheService.delete(key);
    }
    
    logger.info(`🧹 Invalidated silo cache for ID: ${siloId}`);
  },

  // Invalidate reading-related cache
  async invalidateReadings(type, id) {
    const keys = [
      CacheKeys.READINGS_LATEST(type, id),
      CacheKeys.READINGS_MAX(type, id),
      CacheKeys.READINGS_AVG(type, id)
    ];
    
    for (const key of keys) {
      await CacheService.delete(key);
    }
    
    logger.info(`🧹 Invalidated readings cache for ${type}:${id}`);
  },

  // Invalidate all alerts cache
  async invalidateAlerts() {
    await CacheService.delete(CacheKeys.ALERTS_ACTIVE);
    logger.info('🧹 Invalidated alerts cache');
  },

  // Invalidate user cache
  async invalidateUser(userId) {
    await CacheService.delete(CacheKeys.USER_PROFILE(userId));
    logger.info(`🧹 Invalidated user cache for ID: ${userId}`);
  }
};

// ==============================
// 📊 Cache Middleware for Express
// ==============================
export const cacheMiddleware = (ttlSeconds = 300) => {
  return async (req, res, next) => {
    // Generate cache key from request
    const cacheKey = `api:${req.method}:${req.originalUrl}`;
    
    try {
      // Try to get cached response
      const cached = await CacheService.get(cacheKey);
      if (cached) {
        logger.debug(`⚡ API Cache HIT: ${cacheKey}`);
        return res.json(cached);
      }

      // Store original json method
      const originalJson = res.json;
      
      // Override json method to cache response
      res.json = function(data) {
        // Cache successful responses only
        if (res.statusCode >= 200 && res.statusCode < 300) {
          CacheService.set(cacheKey, data, ttlSeconds);
          logger.debug(`📦 API Cache SET: ${cacheKey}`);
        }
        
        // Call original json method
        return originalJson.call(this, data);
      };

      next();
    } catch (error) {
      logger.error(`❌ Cache middleware error: ${error.message}`);
      next(); // Continue without caching on error
    }
  };
};

// ==============================
// 🚀 Export Cache Service
// ==============================
export default CacheService;

// ==============================
// 📊 Cache Statistics Endpoint
// ==============================
export const getCacheHealth = () => {
  const stats = CacheService.getStats();
  return {
    type: 'in-memory',
    healthy: true,
    stats,
    performance: {
      hitRate: 'N/A (not tracked in simple implementation)',
      avgResponseTime: 'N/A'
    }
  };
};
