// backend/src/middleware/rateLimiting.ts
import rateLimit from 'express-rate-limit';

export class RateLimitConfig {
  // General API rate limit
  public static general = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: {
      success: false,
      message: 'Too many requests from this IP, please try again later',
    },
    standardHeaders: true,
    legacyHeaders: false,
  });

  // Stricter rate limit for auth endpoints
  public static auth = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // limit each IP to 5 auth requests per windowMs
    message: {
      success: false,
      message: 'Too many authentication attempts, please try again later',
    },
    standardHeaders: true,
    legacyHeaders: false,
  });

  // Very strict rate limit for signup
  public static signup = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 3, // limit each IP to 3 signup attempts per hour
    message: {
      success: false,
      message: 'Too many signup attempts, please try again later',
    },
    standardHeaders: true,
    legacyHeaders: false,
  });
}