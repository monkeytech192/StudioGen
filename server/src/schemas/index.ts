import { z } from 'zod';
import { config } from '../config/index.js';

// Custom password validation
const passwordSchema = z
  .string()
  .min(config.security.passwordMinLength, `Password must be at least ${config.security.passwordMinLength} characters`)
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number');

// Email validation
const emailSchema = z.string().email('Invalid email address').toLowerCase().trim();

// Phone validation (Vietnam format)
const phoneSchema = z
  .string()
  .regex(/^(0|\+84)[0-9]{9,10}$/, 'Invalid phone number format');

// Sign Up Schema
export const signUpSchema = z.object({
  identifier: z.union([emailSchema, phoneSchema]),
  password: passwordSchema,
  fullName: z.string().min(2, 'Name must be at least 2 characters').max(100),
});

export type SignUpInput = z.infer<typeof signUpSchema>;

// Login Schema
export const loginSchema = z.object({
  identifier: z.string().min(1, 'Email or phone is required'),
  password: z.string().min(1, 'Password is required'),
});

export type LoginInput = z.infer<typeof loginSchema>;

// Google Login Schema
export const googleLoginSchema = z.object({
  credential: z.string().min(1, 'Google credential is required'),
});

export type GoogleLoginInput = z.infer<typeof googleLoginSchema>;

// Password Change Schema
export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: passwordSchema,
}).refine((data) => data.currentPassword !== data.newPassword, {
  message: 'New password must be different from current password',
  path: ['newPassword'],
});

export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;

// Password Reset Request Schema
export const passwordResetRequestSchema = z.object({
  email: emailSchema,
});

export type PasswordResetRequestInput = z.infer<typeof passwordResetRequestSchema>;

// Password Reset Schema
export const passwordResetSchema = z.object({
  token: z.string().min(1, 'Reset token is required'),
  newPassword: passwordSchema,
});

export type PasswordResetInput = z.infer<typeof passwordResetSchema>;

// Update Profile Schema
export const updateProfileSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  phone: phoneSchema.optional().or(z.literal('')),
  dob: z.string().datetime().optional().or(z.literal('')),
  avatarUrl: z.string().url().optional().or(z.literal('')),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;

// Refresh Token Schema
export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required'),
});

export type RefreshTokenInput = z.infer<typeof refreshTokenSchema>;

// Project Schemas
export const createProjectSchema = z.object({
  name: z.string().min(1, 'Project name is required').max(100),
});

export type CreateProjectInput = z.infer<typeof createProjectSchema>;

export const updateProjectSchema = z.object({
  name: z.string().min(1).max(100).optional(),
});

export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;

// Project Image Schema
export const addImageSchema = z.object({
  imageUrl: z.string().min(1, 'Image URL or data is required'),
  prompt: z.string().max(1000).optional().default(''),
  settings: z.record(z.unknown()).optional(),
});

export type AddImageInput = z.infer<typeof addImageSchema>;

// Generation Schema (for Gemini proxy)
export const generateImageSchema = z.object({
  base64ImageData: z.string().min(1, 'Image data is required'),
  mimeType: z.string().min(1, 'MIME type is required'),
  prompt: z.string().min(1, 'Prompt is required').max(1000),
  industry: z.object({
    id: z.string(),
    name: z.string(),
  }),
  quality: z.object({
    id: z.string(),
    name: z.string(),
    description: z.string(),
  }),
  format: z.object({
    id: z.enum(['banner', 'poster', 'square']),
    name: z.string(),
    className: z.string(),
    value: z.enum(['16:9', '9:16', '1:1']),
  }),
  background: z.object({
    id: z.string(),
    name: z.string(),
    prompt: z.string(),
    previewClass: z.string(),
  }),
});

export type GenerateImageInput = z.infer<typeof generateImageSchema>;

export const removeBackgroundSchema = z.object({
  base64ImageData: z.string().min(1, 'Image data is required'),
  mimeType: z.string().min(1, 'MIME type is required'),
});

export type RemoveBackgroundInput = z.infer<typeof removeBackgroundSchema>;

export const generateUnifiedBgSchema = z.object({
  settings: z.object({
    logo: z.string().nullable(),
    industry: z.object({ id: z.string(), name: z.string() }),
    model: z.object({ id: z.string(), name: z.string(), prompt: z.string() }),
    colors: z.object({ primary: z.string(), secondary: z.string() }),
    prompt: z.string(),
  }),
});

export type GenerateUnifiedBgInput = z.infer<typeof generateUnifiedBgSchema>;

export const suggestColorsSchema = z.object({
  base64ImageData: z.string().min(1, 'Image data is required'),
  mimeType: z.string().min(1, 'MIME type is required'),
});

export type SuggestColorsInput = z.infer<typeof suggestColorsSchema>;
