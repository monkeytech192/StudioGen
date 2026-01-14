import { User } from '../types';
import apiFetch, { tokenUtils } from './api';

const SESSION_KEY = 'studioGenUser';

interface AuthResponse {
  user: User & { id: string; credits: number };
  accessToken: string;
  refreshToken: string;
}

/**
 * Sign up a new user
 */
export const signUp = async (identifier: string, password: string, fullName?: string): Promise<User> => {
  const response = await apiFetch<AuthResponse>('/auth/signup', {
    method: 'POST',
    body: JSON.stringify({ identifier, password, fullName: fullName || '' }),
  });

  if (!response.success || !response.data) {
    throw new Error(response.error || 'Sign up failed');
  }

  const { user, accessToken, refreshToken } = response.data;
  
  // Save tokens
  tokenUtils.save(accessToken, refreshToken);
  
  // Save user to localStorage for quick access
  const userForStorage: User = {
    name: user.name,
    email: user.email || '',
    phone: user.phone || '',
    avatarUrl: user.avatarUrl,
    dob: user.dob || '',
    identifierType: user.identifierType,
  };
  
  localStorage.setItem(SESSION_KEY, JSON.stringify(userForStorage));
  
  return userForStorage;
};

/**
 * Login with email/phone and password
 */
export const login = async (identifier: string, password: string): Promise<User> => {
  const response = await apiFetch<AuthResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ identifier, password }),
  });

  if (!response.success || !response.data) {
    throw new Error(response.error || 'Invalid credentials');
  }

  const { user, accessToken, refreshToken } = response.data;
  
  tokenUtils.save(accessToken, refreshToken);
  
  const userForStorage: User = {
    name: user.name,
    email: user.email || '',
    phone: user.phone || '',
    avatarUrl: user.avatarUrl,
    dob: user.dob || '',
    identifierType: user.identifierType,
  };
  
  localStorage.setItem(SESSION_KEY, JSON.stringify(userForStorage));
  
  return userForStorage;
};

/**
 * Login with Google
 * Uses Google Identity Services (lightweight, no heavy SDK)
 */
export const googleLogin = async (credential?: string): Promise<User> => {
  // If credential provided (from Google Sign-In button), use it
  if (credential) {
    const response = await apiFetch<AuthResponse>('/auth/google', {
      method: 'POST',
      body: JSON.stringify({ credential }),
    });

    if (!response.success || !response.data) {
      throw new Error(response.error || 'Google login failed');
    }

    const { user, accessToken, refreshToken } = response.data;
    
    tokenUtils.save(accessToken, refreshToken);
    
    const userForStorage: User = {
      name: user.name,
      email: user.email || '',
      phone: user.phone || '',
      avatarUrl: user.avatarUrl,
      dob: user.dob || '',
      identifierType: 'email',
    };
    
    localStorage.setItem(SESSION_KEY, JSON.stringify(userForStorage));
    
    return userForStorage;
  }

  // Trigger Google Sign-In popup
  return new Promise((resolve, reject) => {
    // Check if Google Sign-In is loaded
    if (typeof google === 'undefined' || !google.accounts) {
      reject(new Error('Google Sign-In not loaded'));
      return;
    }

    google.accounts.id.prompt((notification: { isNotDisplayed: () => boolean; isSkippedMoment: () => boolean }) => {
      if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
        reject(new Error('Google Sign-In cancelled'));
      }
    });
  });
};

/**
 * Initialize Google Sign-In
 * Call this once on app load
 */
export const initGoogleSignIn = (clientId: string, onSuccess: (user: User) => void): void => {
  if (typeof google === 'undefined') {
    console.warn('Google Sign-In SDK not loaded');
    return;
  }

  google.accounts.id.initialize({
    client_id: clientId,
    callback: async (response: { credential: string }) => {
      try {
        const user = await googleLogin(response.credential);
        onSuccess(user);
      } catch (error) {
        console.error('Google login failed:', error);
      }
    },
    auto_select: false,
    cancel_on_tap_outside: true,
  });
};

/**
 * Logout current user
 */
export const logout = async (): Promise<void> => {
  try {
    const refreshToken = localStorage.getItem('studioGen_tokens');
    const tokens = refreshToken ? JSON.parse(refreshToken) : null;
    
    await apiFetch('/auth/logout', {
      method: 'POST',
      body: JSON.stringify({ refreshToken: tokens?.refreshToken }),
    });
  } catch {
    // Ignore errors during logout
  } finally {
    tokenUtils.clear();
    localStorage.removeItem(SESSION_KEY);
  }
};

/**
 * Get current user from localStorage
 */
export const getCurrentUser = (): User | null => {
  const userJson = localStorage.getItem(SESSION_KEY);
  if (!userJson) {
    return null;
  }
  try {
    return JSON.parse(userJson) as User;
  } catch {
    return null;
  }
};

/**
 * Update user profile
 */
export const updateUser = async (updatedUser: User): Promise<User> => {
  const response = await apiFetch<User>('/auth/me', {
    method: 'PATCH',
    body: JSON.stringify({
      name: updatedUser.name,
      phone: updatedUser.phone,
      dob: updatedUser.dob,
      avatarUrl: updatedUser.avatarUrl,
    }),
  });

  if (!response.success || !response.data) {
    throw new Error(response.error || 'Update failed');
  }

  const user: User = {
    name: response.data.name,
    email: response.data.email || '',
    phone: response.data.phone || '',
    avatarUrl: response.data.avatarUrl,
    dob: response.data.dob || '',
    identifierType: response.data.identifierType,
  };

  localStorage.setItem(SESSION_KEY, JSON.stringify(user));
  
  return user;
};

/**
 * Change password
 */
export const changePassword = async (_email: string, oldPassword: string, newPassword: string): Promise<void> => {
  const response = await apiFetch('/auth/change-password', {
    method: 'POST',
    body: JSON.stringify({
      currentPassword: oldPassword,
      newPassword,
    }),
  });

  if (!response.success) {
    throw new Error(response.error || 'Password change failed');
  }

  // Password changed, tokens are invalidated, need to re-login
  tokenUtils.clear();
};

/**
 * Send password reset email
 */
export const sendPasswordResetEmail = async (email: string): Promise<void> => {
  const response = await apiFetch('/auth/forgot-password', {
    method: 'POST',
    body: JSON.stringify({ email }),
  });

  if (!response.success) {
    throw new Error(response.error || 'Failed to send reset email');
  }
};

// Declare Google types for TypeScript
declare const google: {
  accounts: {
    id: {
      initialize: (config: {
        client_id: string;
        callback: (response: { credential: string }) => void;
        auto_select?: boolean;
        cancel_on_tap_outside?: boolean;
      }) => void;
      prompt: (callback?: (notification: { isNotDisplayed: () => boolean; isSkippedMoment: () => boolean }) => void) => void;
      renderButton: (parent: HTMLElement, options: object) => void;
    };
  };
};
