import { Request, Response, NextFunction } from 'express';
import { prisma } from '../lib/prisma.js';

export type AuditAction = 
  | 'LOGIN'
  | 'LOGIN_FAILED'
  | 'LOGOUT'
  | 'SIGNUP'
  | 'PASSWORD_CHANGE'
  | 'PASSWORD_RESET_REQUEST'
  | 'PASSWORD_RESET'
  | 'PROFILE_UPDATE'
  | 'GOOGLE_LOGIN'
  | 'TOKEN_REFRESH'
  | 'ACCOUNT_LOCKED'
  | 'ACCOUNT_UNLOCKED';

/**
 * Log security-relevant actions to the audit log
 */
export const logAuditEvent = async (
  action: AuditAction,
  userId: string | null,
  req: Request,
  details?: Record<string, unknown>
): Promise<void> => {
  try {
    await prisma.auditLog.create({
      data: {
        userId,
        action,
        details: details as object | undefined,
        ipAddress: getClientIP(req),
        userAgent: req.headers['user-agent'] || null,
      },
    });
  } catch (error) {
    // Don't fail the request if audit logging fails
    console.error('Failed to log audit event:', error);
  }
};

/**
 * Get client IP address
 */
export const getClientIP = (req: Request): string => {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string') {
    return forwarded.split(',')[0]?.trim() || 'unknown';
  }
  return req.socket.remoteAddress || 'unknown';
};

/**
 * Middleware to add audit logging helper to request
 */
export const auditMiddleware = (
  req: Request,
  _res: Response,
  next: NextFunction
): void => {
  // Add audit helper to request if needed
  next();
};
