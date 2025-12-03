/**
 * Rate Limiter for API endpoints
 * Implements sliding window rate limiting with in-memory storage
 */

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

interface RateLimitConfig {
  windowMs: number;      // Time window in milliseconds
  maxRequests: number;   // Max requests per window
}

// In-memory store for rate limiting
const rateLimitStore = new Map<string, RateLimitEntry>();

// Default configurations for different endpoints
export const RATE_LIMIT_CONFIGS = {
  // Answer submission - more lenient for exam taking
  answer: { windowMs: 1000, maxRequests: 10 },  // 10 requests per second
  
  // Batch answer - stricter since it's more DB intensive
  batchAnswer: { windowMs: 1000, maxRequests: 5 }, // 5 batch requests per second
  
  // General API calls
  general: { windowMs: 1000, maxRequests: 20 },  // 20 requests per second
  
  // Auth endpoints - stricter to prevent brute force
  auth: { windowMs: 60000, maxRequests: 10 },  // 10 attempts per minute
  
  // Report generation - very strict due to heavy queries
  report: { windowMs: 5000, maxRequests: 2 },  // 2 requests per 5 seconds
} as const;

/**
 * Check if request should be rate limited
 * @param key Unique identifier (usually IP + endpoint or user ID)
 * @param config Rate limit configuration
 * @returns Object with allowed status and remaining requests
 */
export function checkRateLimit(
  key: string, 
  config: RateLimitConfig = RATE_LIMIT_CONFIGS.general
): { allowed: boolean; remaining: number; resetIn: number } {
  const now = Date.now();
  const entry = rateLimitStore.get(key);

  // Clean up old entries periodically
  if (Math.random() < 0.01) { // 1% chance on each request
    cleanupExpiredEntries();
  }

  if (!entry || now > entry.resetTime) {
    // New window
    rateLimitStore.set(key, {
      count: 1,
      resetTime: now + config.windowMs,
    });
    return { 
      allowed: true, 
      remaining: config.maxRequests - 1,
      resetIn: config.windowMs 
    };
  }

  if (entry.count >= config.maxRequests) {
    // Rate limited
    return { 
      allowed: false, 
      remaining: 0,
      resetIn: entry.resetTime - now 
    };
  }

  // Increment counter
  entry.count++;
  return { 
    allowed: true, 
    remaining: config.maxRequests - entry.count,
    resetIn: entry.resetTime - now 
  };
}

/**
 * Clean up expired rate limit entries
 */
function cleanupExpiredEntries(): void {
  const now = Date.now();
  for (const [key, entry] of rateLimitStore.entries()) {
    if (now > entry.resetTime) {
      rateLimitStore.delete(key);
    }
  }
}

/**
 * Generate rate limit key from request
 */
export function getRateLimitKey(
  identifier: string, 
  endpoint: string
): string {
  return `${identifier}:${endpoint}`;
}

/**
 * Get rate limit headers for response
 */
export function getRateLimitHeaders(
  remaining: number,
  resetIn: number,
  limit: number
): Record<string, string> {
  return {
    'X-RateLimit-Limit': String(limit),
    'X-RateLimit-Remaining': String(Math.max(0, remaining)),
    'X-RateLimit-Reset': String(Math.ceil(resetIn / 1000)),
  };
}

/**
 * Rate limit middleware response
 */
export function rateLimitResponse(resetIn: number) {
  return {
    error: 'Too many requests',
    message: 'Rate limit exceeded. Please slow down.',
    retryAfter: Math.ceil(resetIn / 1000),
  };
}
