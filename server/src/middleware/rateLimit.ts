import rateLimit from 'express-rate-limit';
import { config } from '../config/index.js';

/**
 * General API rate limiter
 */
export const generalLimiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.maxRequests,
  message: {
    success: false,
    error: 'Too many requests, please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Strict rate limiter for authentication endpoints
 * Prevents brute force attacks
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 attempts per window
  message: {
    success: false,
    error: 'Too many authentication attempts, please try again in 15 minutes.',
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // Don't count successful logins
});

/**
 * Very strict limiter for password reset
 */
export const passwordResetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // 3 attempts per hour
  message: {
    success: false,
    error: 'Too many password reset requests, please try again in an hour.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Rate limiter for AI generation endpoints (expensive operations)
 */
export const generationLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 5, // 5 generations per minute
  message: {
    success: false,
    error: 'Generation rate limit exceeded. Please wait a moment.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});
