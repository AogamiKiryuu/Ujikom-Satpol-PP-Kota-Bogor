/**
 * In-Memory Cache Layer
 * Reduces database load by caching frequently accessed data
 */

interface CacheEntry<T> {
  data: T;
  expiry: number;
  hits: number;
}

interface CacheConfig {
  defaultTTL: number;    // Default time-to-live in milliseconds
  maxSize: number;       // Maximum cache entries
  cleanupInterval: number; // Cleanup interval in milliseconds
}

class MemoryCache {
  private cache = new Map<string, CacheEntry<unknown>>();
  private config: CacheConfig;
  private cleanupTimer: NodeJS.Timeout | null = null;

  constructor(config: Partial<CacheConfig> = {}) {
    this.config = {
      defaultTTL: config.defaultTTL ?? 60000,        // 1 minute default
      maxSize: config.maxSize ?? 1000,
      cleanupInterval: config.cleanupInterval ?? 30000, // 30 seconds
    };

    this.startCleanup();
  }

  /**
   * Get cached value
   */
  get<T>(key: string): T | null {
    const entry = this.cache.get(key) as CacheEntry<T> | undefined;
    
    if (!entry) {
      return null;
    }

    if (Date.now() > entry.expiry) {
      this.cache.delete(key);
      return null;
    }

    entry.hits++;
    return entry.data;
  }

  /**
   * Set cached value
   */
  set<T>(key: string, data: T, ttl?: number): void {
    // Evict if cache is full
    if (this.cache.size >= this.config.maxSize) {
      this.evictLeastUsed();
    }

    this.cache.set(key, {
      data,
      expiry: Date.now() + (ttl ?? this.config.defaultTTL),
      hits: 0,
    });
  }

  /**
   * Get or set with factory function
   */
  async getOrSet<T>(
    key: string,
    factory: () => Promise<T>,
    ttl?: number
  ): Promise<T> {
    const cached = this.get<T>(key);
    if (cached !== null) {
      return cached;
    }

    const data = await factory();
    this.set(key, data, ttl);
    return data;
  }

  /**
   * Delete cached value
   */
  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  /**
   * Delete by pattern (prefix matching)
   */
  deleteByPattern(pattern: string): number {
    let deleted = 0;
    for (const key of this.cache.keys()) {
      if (key.startsWith(pattern)) {
        this.cache.delete(key);
        deleted++;
      }
    }
    return deleted;
  }

  /**
   * Clear all cache
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Get cache statistics
   */
  getStats() {
    let totalHits = 0;
    let expired = 0;
    const now = Date.now();

    for (const entry of this.cache.values()) {
      totalHits += entry.hits;
      if (now > entry.expiry) expired++;
    }

    return {
      size: this.cache.size,
      maxSize: this.config.maxSize,
      totalHits,
      expiredEntries: expired,
    };
  }

  /**
   * Evict least used entries
   */
  private evictLeastUsed(): void {
    const entries = Array.from(this.cache.entries())
      .sort((a, b) => a[1].hits - b[1].hits);
    
    // Remove bottom 10%
    const toRemove = Math.ceil(entries.length * 0.1);
    for (let i = 0; i < toRemove; i++) {
      this.cache.delete(entries[i][0]);
    }
  }

  /**
   * Start cleanup timer
   */
  private startCleanup(): void {
    this.cleanupTimer = setInterval(() => {
      const now = Date.now();
      for (const [key, entry] of this.cache.entries()) {
        if (now > entry.expiry) {
          this.cache.delete(key);
        }
      }
    }, this.config.cleanupInterval);

    // Don't prevent process exit
    if (this.cleanupTimer.unref) {
      this.cleanupTimer.unref();
    }
  }

  /**
   * Stop cleanup timer
   */
  destroy(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
      this.cleanupTimer = null;
    }
    this.cache.clear();
  }
}

// Singleton cache instances for different purposes
export const examCache = new MemoryCache({
  defaultTTL: 300000,    // 5 minutes for exam data
  maxSize: 500,
});

export const questionCache = new MemoryCache({
  defaultTTL: 600000,    // 10 minutes for questions
  maxSize: 2000,
});

export const userCache = new MemoryCache({
  defaultTTL: 120000,    // 2 minutes for user data
  maxSize: 1000,
});

export const statsCache = new MemoryCache({
  defaultTTL: 30000,     // 30 seconds for stats
  maxSize: 100,
});

// Cache key generators
export const CacheKeys = {
  exam: (examId: string) => `exam:${examId}`,
  examQuestions: (examId: string) => `exam:${examId}:questions`,
  userExamResult: (userId: string, examId: string) => `result:${userId}:${examId}`,
  userAnswers: (userId: string, examId: string) => `answers:${userId}:${examId}`,
  dashboardStats: () => 'stats:dashboard',
  userStats: (userId: string) => `stats:user:${userId}`,
  examParticipants: (examId: string) => `exam:${examId}:participants`,
};

// Invalidation helpers
export const invalidateExam = (examId: string) => {
  examCache.delete(CacheKeys.exam(examId));
  questionCache.deleteByPattern(`exam:${examId}`);
  statsCache.deleteByPattern('stats:');
};

export const invalidateUserResult = (userId: string, examId: string) => {
  examCache.delete(CacheKeys.userExamResult(userId, examId));
  examCache.deleteByPattern(`answers:${userId}`);
  statsCache.delete(CacheKeys.userStats(userId));
  statsCache.delete(CacheKeys.dashboardStats());
};
