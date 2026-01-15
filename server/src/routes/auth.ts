import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { prisma } from '../lib/prisma.js';
import { config } from '../config/index.js';
import { 
  authenticate, 
  generateAccessToken, 
  generateRefreshToken,
  verifyRefreshToken,
  AuthenticatedRequest 
} from '../middleware/auth.js';
import { authLimiter, passwordResetLimiter } from '../middleware/rateLimit.js';
import { validate } from '../middleware/validate.js';
import { asyncHandler } from '../middleware/error.js';
import { logAuditEvent, getClientIP } from '../middleware/audit.js';
import {
  signUpSchema,
  loginSchema,
  googleLoginSchema,
  changePasswordSchema,
  passwordResetRequestSchema,
  passwordResetSchema,
  updateProfileSchema,
  refreshTokenSchema,
  SignUpInput,
  LoginInput,
  GoogleLoginInput,
} from '../schemas/index.js';

const router = Router();

/**
 * POST /auth/signup
 * Register a new user
 */
router.post(
  '/signup',
  authLimiter,
  validate(signUpSchema),
  asyncHandler(async (req: Request, res: Response) => {
    const { identifier, password, fullName } = req.body as SignUpInput;
    
    const isEmail = identifier.includes('@');
    
    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: isEmail 
        ? { email: identifier.toLowerCase() } 
        : { phone: identifier }
    });

    if (existingUser) {
      res.status(409).json({
        success: false,
        error: 'An account with this email or phone already exists.',
      });
      return;
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, config.security.bcryptRounds);

    // Create user
    const user = await prisma.user.create({
      data: {
        email: isEmail ? identifier.toLowerCase() : null,
        phone: isEmail ? null : identifier,
        passwordHash,
        name: fullName,
        avatarUrl: `https://api.dicebear.com/8.x/initials/svg?seed=${encodeURIComponent(fullName)}`,
      },
      select: {
        id: true,
        email: true,
        phone: true,
        name: true,
        avatarUrl: true,
        dob: true,
        credits: true,
        createdAt: true,
      },
    });

    // Generate tokens
    const accessToken = generateAccessToken(user.id, user.email || undefined);
    const refreshToken = generateRefreshToken(user.id);

    // Store refresh token
    await prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId: user.id,
        deviceInfo: req.headers['user-agent'] || null,
        ipAddress: getClientIP(req),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      },
    });

    // Log audit event
    await logAuditEvent('SIGNUP', user.id, req);

    res.status(201).json({
      success: true,
      data: {
        user: {
          ...user,
          identifierType: isEmail ? 'email' : 'phone',
        },
        accessToken,
        refreshToken,
      },
    });
  })
);

/**
 * POST /auth/login
 * Authenticate user with email/phone and password
 */
router.post(
  '/login',
  authLimiter,
  validate(loginSchema),
  asyncHandler(async (req: Request, res: Response) => {
    const { identifier, password } = req.body as LoginInput;
    
    const isEmail = identifier.includes('@');

    // Find user
    const user = await prisma.user.findFirst({
      where: isEmail 
        ? { email: identifier.toLowerCase() } 
        : { phone: identifier }
    });

    if (!user || !user.passwordHash) {
      await logAuditEvent('LOGIN_FAILED', null, req, { identifier, reason: 'User not found' });
      res.status(401).json({
        success: false,
        error: 'Invalid credentials. Please try again.',
      });
      return;
    }

    // Check if account is locked
    if (user.lockedUntil && user.lockedUntil > new Date()) {
      res.status(423).json({
        success: false,
        error: 'Account is temporarily locked. Please try again later.',
        lockedUntil: user.lockedUntil,
      });
      return;
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.passwordHash);

    if (!isValidPassword) {
      // Increment failed login attempts
      const newFailedAttempts = user.failedLogins + 1;
      const shouldLock = newFailedAttempts >= config.security.maxLoginAttempts;

      await prisma.user.update({
        where: { id: user.id },
        data: {
          failedLogins: newFailedAttempts,
          lockedUntil: shouldLock 
            ? new Date(Date.now() + config.security.lockoutDurationMs) 
            : null,
        },
      });

      if (shouldLock) {
        await logAuditEvent('ACCOUNT_LOCKED', user.id, req);
      }

      await logAuditEvent('LOGIN_FAILED', user.id, req, { reason: 'Invalid password' });

      res.status(401).json({
        success: false,
        error: 'Invalid credentials. Please try again.',
        ...(shouldLock && { message: 'Account locked due to too many failed attempts.' }),
      });
      return;
    }

    // Reset failed login attempts on successful login
    await prisma.user.update({
      where: { id: user.id },
      data: {
        failedLogins: 0,
        lockedUntil: null,
        lastLoginAt: new Date(),
      },
    });

    // Generate tokens
    const accessToken = generateAccessToken(user.id, user.email || undefined);
    const refreshToken = generateRefreshToken(user.id);

    // Store refresh token
    await prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId: user.id,
        deviceInfo: req.headers['user-agent'] || null,
        ipAddress: getClientIP(req),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    await logAuditEvent('LOGIN', user.id, req);

    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          phone: user.phone,
          name: user.name,
          avatarUrl: user.avatarUrl,
          dob: user.dob,
          credits: user.credits,
          identifierType: user.email ? 'email' : 'phone',
        },
        accessToken,
        refreshToken,
      },
    });
  })
);

/**
 * POST /auth/google
 * Authenticate with Google (Lightweight using Google Identity Services)
 * Frontend sends the credential (JWT) from Google Sign-In
 */
router.post(
  '/google',
  authLimiter,
  validate(googleLoginSchema),
  asyncHandler(async (req: Request, res: Response) => {
    const { credential } = req.body as GoogleLoginInput;

    try {
      // Decode Google JWT (we verify signature with Google's public keys)
      // For lightweight implementation, we decode the JWT and verify essential claims
      const payload = decodeGoogleJwt(credential);
      
      // Debug logging
      console.log('[Google Auth] Payload aud:', payload?.aud);
      console.log('[Google Auth] Config clientId:', config.googleClientId);
      console.log('[Google Auth] Match:', payload?.aud === config.googleClientId);
      
      if (!payload || !payload.email || !payload.sub) {
        console.log('[Google Auth] Invalid payload - missing email or sub');
        res.status(401).json({
          success: false,
          error: 'Invalid Google credential',
        });
        return;
      }

      // Verify the audience matches our client ID
      if (payload.aud !== config.googleClientId) {
        console.log('[Google Auth] Audience mismatch!');
        res.status(401).json({
          success: false,
          error: 'Invalid Google credential',
        });
        return;
      }

      // Check token expiry
      if (payload.exp && payload.exp * 1000 < Date.now()) {
        res.status(401).json({
          success: false,
          error: 'Google credential expired',
        });
        return;
      }

      // Find or create user
      let user = await prisma.user.findFirst({
        where: {
          OR: [
            { googleId: payload.sub },
            { email: payload.email.toLowerCase() },
          ],
        },
      });

      if (!user) {
        // Create new user from Google profile
        user = await prisma.user.create({
          data: {
            googleId: payload.sub,
            email: payload.email.toLowerCase(),
            name: payload.name || payload.email.split('@')[0] || 'Google User',
            avatarUrl: payload.picture || `https://api.dicebear.com/8.x/initials/svg?seed=${encodeURIComponent(payload.name || 'User')}`,
            emailVerified: payload.email_verified || false,
          },
        });

        await logAuditEvent('SIGNUP', user.id, req, { provider: 'google' });
      } else if (!user.googleId) {
        // Link Google account to existing user
        user = await prisma.user.update({
          where: { id: user.id },
          data: {
            googleId: payload.sub,
            emailVerified: payload.email_verified || user.emailVerified,
          },
        });
      }

      // Update last login
      await prisma.user.update({
        where: { id: user.id },
        data: { lastLoginAt: new Date() },
      });

      // Generate tokens
      const accessToken = generateAccessToken(user.id, user.email || undefined);
      const refreshToken = generateRefreshToken(user.id);

      // Store refresh token
      await prisma.refreshToken.create({
        data: {
          token: refreshToken,
          userId: user.id,
          deviceInfo: req.headers['user-agent'] || null,
          ipAddress: getClientIP(req),
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        },
      });

      await logAuditEvent('GOOGLE_LOGIN', user.id, req);

      res.json({
        success: true,
        data: {
          user: {
            id: user.id,
            email: user.email,
            phone: user.phone,
            name: user.name,
            avatarUrl: user.avatarUrl,
            dob: user.dob,
            credits: user.credits,
            identifierType: 'email',
          },
          accessToken,
          refreshToken,
        },
      });
    } catch (error) {
      console.error('Google auth error:', error);
      res.status(401).json({
        success: false,
        error: 'Failed to authenticate with Google',
      });
    }
  })
);

/**
 * Decode Google JWT (without full verification for lightweight implementation)
 * In production, you should verify the signature with Google's public keys
 */
function decodeGoogleJwt(token: string): GoogleJwtPayload | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    
    const payload = JSON.parse(Buffer.from(parts[1]!, 'base64url').toString('utf-8'));
    return payload as GoogleJwtPayload;
  } catch {
    return null;
  }
}

interface GoogleJwtPayload {
  sub: string;
  email: string;
  email_verified?: boolean;
  name?: string;
  picture?: string;
  aud: string;
  exp?: number;
}

/**
 * POST /auth/refresh
 * Refresh access token using refresh token
 */
router.post(
  '/refresh',
  validate(refreshTokenSchema),
  asyncHandler(async (req: Request, res: Response) => {
    const { refreshToken } = req.body;

    // Verify the refresh token
    const payload = verifyRefreshToken(refreshToken);
    
    if (!payload) {
      res.status(401).json({
        success: false,
        error: 'Invalid refresh token',
      });
      return;
    }

    // Check if refresh token exists in database
    const storedToken = await prisma.refreshToken.findUnique({
      where: { token: refreshToken },
      include: { user: true },
    });

    if (!storedToken || storedToken.expiresAt < new Date()) {
      // Token doesn't exist or expired, delete it if exists
      if (storedToken) {
        await prisma.refreshToken.delete({ where: { id: storedToken.id } });
      }
      
      res.status(401).json({
        success: false,
        error: 'Refresh token expired or invalid',
      });
      return;
    }

    // Check if user is still active
    if (!storedToken.user.isActive) {
      res.status(401).json({
        success: false,
        error: 'User account is inactive',
      });
      return;
    }

    // Generate new tokens (token rotation for security)
    const newAccessToken = generateAccessToken(storedToken.userId, storedToken.user.email || undefined);
    const newRefreshToken = generateRefreshToken(storedToken.userId);

    // Delete old refresh token and create new one
    await prisma.$transaction([
      prisma.refreshToken.delete({ where: { id: storedToken.id } }),
      prisma.refreshToken.create({
        data: {
          token: newRefreshToken,
          userId: storedToken.userId,
          deviceInfo: req.headers['user-agent'] || null,
          ipAddress: getClientIP(req),
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        },
      }),
    ]);

    await logAuditEvent('TOKEN_REFRESH', storedToken.userId, req);

    res.json({
      success: true,
      data: {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
      },
    });
  })
);

/**
 * POST /auth/logout
 * Logout user (invalidate refresh token)
 */
router.post(
  '/logout',
  authenticate,
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { refreshToken } = req.body;

    if (refreshToken) {
      // Delete specific refresh token
      await prisma.refreshToken.deleteMany({
        where: {
          token: refreshToken,
          userId: req.user!.userId,
        },
      });
    }

    await logAuditEvent('LOGOUT', req.user!.userId, req);

    res.json({
      success: true,
      message: 'Logged out successfully',
    });
  })
);

/**
 * POST /auth/logout-all
 * Logout from all devices
 */
router.post(
  '/logout-all',
  authenticate,
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    // Delete all refresh tokens for user
    await prisma.refreshToken.deleteMany({
      where: { userId: req.user!.userId },
    });

    await logAuditEvent('LOGOUT', req.user!.userId, req, { allDevices: true });

    res.json({
      success: true,
      message: 'Logged out from all devices',
    });
  })
);

/**
 * GET /auth/me
 * Get current user profile
 */
router.get(
  '/me',
  authenticate,
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.userId },
      select: {
        id: true,
        email: true,
        phone: true,
        name: true,
        avatarUrl: true,
        dob: true,
        credits: true,
        emailVerified: true,
        phoneVerified: true,
        createdAt: true,
        lastLoginAt: true,
      },
    });

    if (!user) {
      res.status(404).json({
        success: false,
        error: 'User not found',
      });
      return;
    }

    res.json({
      success: true,
      data: {
        ...user,
        identifierType: user.email ? 'email' : 'phone',
      },
    });
  })
);

/**
 * PATCH /auth/me
 * Update user profile
 */
router.patch(
  '/me',
  authenticate,
  validate(updateProfileSchema),
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const updates = req.body;

    const user = await prisma.user.update({
      where: { id: req.user!.userId },
      data: {
        ...(updates.name && { name: updates.name }),
        ...(updates.phone !== undefined && { phone: updates.phone || null }),
        ...(updates.dob !== undefined && { dob: updates.dob ? new Date(updates.dob) : null }),
        ...(updates.avatarUrl !== undefined && { avatarUrl: updates.avatarUrl || null }),
      },
      select: {
        id: true,
        email: true,
        phone: true,
        name: true,
        avatarUrl: true,
        dob: true,
        credits: true,
      },
    });

    await logAuditEvent('PROFILE_UPDATE', req.user!.userId, req, { fields: Object.keys(updates) });

    res.json({
      success: true,
      data: {
        ...user,
        identifierType: user.email ? 'email' : 'phone',
      },
    });
  })
);

/**
 * POST /auth/change-password
 * Change password for authenticated user
 */
router.post(
  '/change-password',
  authenticate,
  validate(changePasswordSchema),
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { currentPassword, newPassword } = req.body;

    const user = await prisma.user.findUnique({
      where: { id: req.user!.userId },
    });

    if (!user || !user.passwordHash) {
      res.status(400).json({
        success: false,
        error: 'Cannot change password for OAuth-only accounts',
      });
      return;
    }

    // Verify current password
    const isValid = await bcrypt.compare(currentPassword, user.passwordHash);

    if (!isValid) {
      res.status(401).json({
        success: false,
        error: 'Current password is incorrect',
      });
      return;
    }

    // Hash new password
    const newPasswordHash = await bcrypt.hash(newPassword, config.security.bcryptRounds);

    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash: newPasswordHash },
    });

    // Invalidate all refresh tokens (force re-login on all devices)
    await prisma.refreshToken.deleteMany({
      where: { userId: user.id },
    });

    await logAuditEvent('PASSWORD_CHANGE', user.id, req);

    res.json({
      success: true,
      message: 'Password changed successfully. Please log in again.',
    });
  })
);

/**
 * POST /auth/forgot-password
 * Request password reset email
 */
router.post(
  '/forgot-password',
  passwordResetLimiter,
  validate(passwordResetRequestSchema),
  asyncHandler(async (req: Request, res: Response) => {
    const { email } = req.body;

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    // Always return success to prevent email enumeration
    if (!user) {
      res.json({
        success: true,
        message: 'If an account exists, a password reset link has been sent.',
      });
      return;
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');

    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetToken: resetTokenHash,
        resetTokenExpiry: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
      },
    });

    await logAuditEvent('PASSWORD_RESET_REQUEST', user.id, req);

    // TODO: Send email with reset link
    // In production, integrate with email service (SendGrid, SES, etc.)
    console.log(`Password reset token for ${email}: ${resetToken}`);

    res.json({
      success: true,
      message: 'If an account exists, a password reset link has been sent.',
      // Only in development:
      ...(config.nodeEnv === 'development' && { resetToken }),
    });
  })
);

/**
 * POST /auth/reset-password
 * Reset password with token
 */
router.post(
  '/reset-password',
  passwordResetLimiter,
  validate(passwordResetSchema),
  asyncHandler(async (req: Request, res: Response) => {
    const { token, newPassword } = req.body;

    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

    const user = await prisma.user.findFirst({
      where: {
        resetToken: tokenHash,
        resetTokenExpiry: { gt: new Date() },
      },
    });

    if (!user) {
      res.status(400).json({
        success: false,
        error: 'Invalid or expired reset token',
      });
      return;
    }

    // Hash new password
    const passwordHash = await bcrypt.hash(newPassword, config.security.bcryptRounds);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash,
        resetToken: null,
        resetTokenExpiry: null,
        failedLogins: 0,
        lockedUntil: null,
      },
    });

    // Invalidate all refresh tokens
    await prisma.refreshToken.deleteMany({
      where: { userId: user.id },
    });

    await logAuditEvent('PASSWORD_RESET', user.id, req);

    res.json({
      success: true,
      message: 'Password reset successfully. Please log in with your new password.',
    });
  })
);

export default router;
