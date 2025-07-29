// Simple in-memory rate limiting for API endpoints
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
}

export function createRateLimiter(config: RateLimitConfig) {
  return function rateLimit(identifier: string): boolean {
    const now = Date.now();
    const key = identifier;
    const record = rateLimitStore.get(key);

    if (!record || now > record.resetTime) {
      // First request or window expired
      rateLimitStore.set(key, {
        count: 1,
        resetTime: now + config.windowMs
      });
      return true; // Allow request
    }

    if (record.count >= config.maxRequests) {
      return false; // Rate limit exceeded
    }

    // Increment count
    record.count++;
    return true; // Allow request
  };
}

// Clean up expired entries periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, record] of rateLimitStore.entries()) {
    if (now > record.resetTime) {
      rateLimitStore.delete(key);
    }
  }
}, 60000); // Clean up every minute

// Default rate limiter: 100 requests per 15 minutes per IP
export const defaultRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 100
});

// Strict rate limiter: 10 requests per minute per IP
export const strictRateLimiter = createRateLimiter({
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 10
}); 