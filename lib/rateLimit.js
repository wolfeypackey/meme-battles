/**
 * Simple in-memory rate limiter
 * For production with multiple instances, use Redis (Upstash) or Vercel Edge Config
 */

const rateStore = new Map();

// Clean up old entries every 10 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, data] of rateStore.entries()) {
    if (now - data.resetAt > 0) {
      rateStore.delete(key);
    }
  }
}, 10 * 60 * 1000);

/**
 * Rate limit middleware
 * @param {Object} options
 * @param {number} options.maxRequests - Max requests per window
 * @param {number} options.windowMs - Window duration in milliseconds
 * @param {string} options.keyPrefix - Prefix for rate limit key
 * @returns {Function} Middleware function
 */
export function createRateLimiter(options = {}) {
  const {
    maxRequests = 10,
    windowMs = 60 * 1000, // 1 minute default
    keyPrefix = 'global',
  } = options;

  return function rateLimit(req) {
    // Get identifier (IP + wallet if available)
    const ip = req.headers['x-forwarded-for'] || req.headers['x-real-ip'] || 'unknown';
    const wallet = req.headers.authorization?.split(' ')[1]?.slice(0, 10) || 'anon';
    const identifier = `${keyPrefix}:${ip}:${wallet}`;

    const now = Date.now();
    const data = rateStore.get(identifier);

    if (!data || now > data.resetAt) {
      // Start new window
      rateStore.set(identifier, {
        count: 1,
        resetAt: now + windowMs,
      });
      return { success: true, remaining: maxRequests - 1 };
    }

    if (data.count >= maxRequests) {
      // Rate limit exceeded
      return {
        success: false,
        remaining: 0,
        resetAt: data.resetAt,
        retryAfter: Math.ceil((data.resetAt - now) / 1000),
      };
    }

    // Increment counter
    data.count++;
    return { success: true, remaining: maxRequests - data.count };
  };
}

// Pre-configured rate limiters for different endpoints
export const authRateLimit = createRateLimiter({
  maxRequests: 5,
  windowMs: 5 * 60 * 1000, // 5 requests per 5 minutes
  keyPrefix: 'auth',
});

export const predictionRateLimit = createRateLimiter({
  maxRequests: 30,
  windowMs: 60 * 1000, // 30 predictions per minute
  keyPrefix: 'prediction',
});

export const apiRateLimit = createRateLimiter({
  maxRequests: 100,
  windowMs: 60 * 1000, // 100 requests per minute
  keyPrefix: 'api',
});

export const memeRateLimit = createRateLimiter({
  maxRequests: 5,
  windowMs: 60 * 1000, // 5 memes per minute
  keyPrefix: 'meme',
});

/**
 * Apply rate limit to API route
 */
export function withRateLimit(handler, limiter) {
  return async (req, res) => {
    const result = limiter(req);

    // Set rate limit headers
    res.setHeader('X-RateLimit-Limit', result.remaining !== undefined ? result.remaining + result.count : 'N/A');
    res.setHeader('X-RateLimit-Remaining', result.remaining || 0);

    if (!result.success) {
      res.setHeader('Retry-After', result.retryAfter);
      return res.status(429).json({
        error: 'Too many requests',
        retryAfter: result.retryAfter,
        message: `Rate limit exceeded. Try again in ${result.retryAfter} seconds.`,
      });
    }

    return handler(req, res);
  };
}
