import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config/index.js';
import { prisma } from '../lib/prisma.js';

export interface JWTPayload {
  userId: string;
  email?: string;
  type: 'access' | 'refresh';
}

export interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
    email?: string;
  };
}

/**
 * Middleware to authenticate JWT access token
 * Extracts token from Authorization header (Bearer token)
 */
export const authenticate = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader?.startsWith('Bearer ')) {
      res.status(401).json({ 
        success: false, 
        error: 'Access token required' 
      });
      return;
    }

    const token = authHeader.substring(7);
    
    try {
      const decoded = jwt.verify(token, config.jwt.accessSecret) as JWTPayload;
      
      if (decoded.type !== 'access') {
        res.status(401).json({ 
          success: false, 
          error: 'Invalid token type' 
        });
        return;
      }

      // Verify user still exists and is active
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        select: { id: true, isActive: true, email: true }
      });

      if (!user || !user.isActive) {
        res.status(401).json({ 
          success: false, 
          error: 'User not found or inactive' 
        });
        return;
      }

      req.user = {
        userId: decoded.userId,
        email: decoded.email
      };

      next();
    } catch (jwtError) {
      if (jwtError instanceof jwt.TokenExpiredError) {
        res.status(401).json({ 
          success: false, 
          error: 'Token expired',
          code: 'TOKEN_EXPIRED'
        });
        return;
      }
      
      res.status(401).json({ 
        success: false, 
        error: 'Invalid token' 
      });
    }
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Internal server error' 
    });
  }
};

/**
 * Optional authentication - doesn't fail if no token present
 */
export const optionalAuth = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader?.startsWith('Bearer ')) {
    next();
    return;
  }

  await authenticate(req, res, next);
};

/**
 * Generate access token
 */
export const generateAccessToken = (userId: string, email?: string): string => {
  const payload: JWTPayload = {
    userId,
    email,
    type: 'access'
  };

  return jwt.sign(payload, config.jwt.accessSecret, {
    expiresIn: config.jwt.accessExpiresIn as string
  } as jwt.SignOptions);
};

/**
 * Generate refresh token
 */
export const generateRefreshToken = (userId: string): string => {
  const payload: JWTPayload = {
    userId,
    type: 'refresh'
  };

  return jwt.sign(payload, config.jwt.refreshSecret, {
    expiresIn: config.jwt.refreshExpiresIn as string
  } as jwt.SignOptions);
};

/**
 * Verify refresh token
 */
export const verifyRefreshToken = (token: string): JWTPayload | null => {
  try {
    const decoded = jwt.verify(token, config.jwt.refreshSecret) as JWTPayload;
    
    if (decoded.type !== 'refresh') {
      return null;
    }
    
    return decoded;
  } catch {
    return null;
  }
};
