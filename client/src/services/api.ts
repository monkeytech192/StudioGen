// API Configuration for Frontend
// This file handles all API communication with the backend

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  details?: Array<{ field: string; message: string }>;
}

// Token management
let accessToken: string | null = null;
let refreshToken: string | null = null;

const TOKEN_STORAGE_KEY = 'studioGen_tokens';

// Load tokens from localStorage on init
const loadTokens = () => {
  try {
    const stored = localStorage.getItem(TOKEN_STORAGE_KEY);
    if (stored) {
      const tokens = JSON.parse(stored);
      accessToken = tokens.accessToken;
      refreshToken = tokens.refreshToken;
    }
  } catch {
    console.error('Failed to load tokens');
  }
};

// Save tokens to localStorage
const saveTokens = (access: string, refresh: string) => {
  accessToken = access;
  refreshToken = refresh;
  localStorage.setItem(TOKEN_STORAGE_KEY, JSON.stringify({ accessToken: access, refreshToken: refresh }));
};

// Clear tokens
const clearTokens = () => {
  accessToken = null;
  refreshToken = null;
  localStorage.removeItem(TOKEN_STORAGE_KEY);
};

// Get current access token
export const getAccessToken = (): string | null => {
  if (!accessToken) loadTokens();
  return accessToken;
};

// Refresh access token
const refreshAccessToken = async (): Promise<boolean> => {
  if (!refreshToken) {
    loadTokens();
    if (!refreshToken) return false;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });

    if (!response.ok) {
      clearTokens();
      return false;
    }

    const data: ApiResponse<{ accessToken: string; refreshToken: string }> = await response.json();
    
    if (data.success && data.data) {
      saveTokens(data.data.accessToken, data.data.refreshToken);
      return true;
    }

    clearTokens();
    return false;
  } catch {
    clearTokens();
    return false;
  }
};

// Main API fetch function with auto-refresh
export const apiFetch = async <T = unknown>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> => {
  loadTokens();

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  if (accessToken) {
    (headers as Record<string, string>)['Authorization'] = `Bearer ${accessToken}`;
  }

  try {
    let response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    // If token expired, try to refresh
    if (response.status === 401) {
      // Clone response before reading body
      const clonedResponse = response.clone();
      let data: { code?: string } = {};
      
      try {
        data = await clonedResponse.json();
      } catch {
        // Ignore JSON parse errors
      }
      
      if (data.code === 'TOKEN_EXPIRED' && refreshToken) {
        const refreshed = await refreshAccessToken();
        
        if (refreshed) {
          // Retry with new token
          const newAccessToken = getAccessToken();
          (headers as Record<string, string>)['Authorization'] = `Bearer ${newAccessToken}`;
          response = await fetch(`${API_BASE_URL}${endpoint}`, {
            ...options,
            headers,
          });
        } else {
          // Refresh failed, clear tokens and return error
          clearTokens();
          window.dispatchEvent(new CustomEvent('auth:logout'));
          return { success: false, error: 'Session expired. Please login again.' };
        }
      } else {
        // Not a token expiry issue, return the error from original response
        return { success: false, error: data.code || 'Unauthorized' };
      }
    }

    const result: ApiResponse<T> = await response.json();
    return result;
  } catch (error) {
    console.error('API fetch error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Network error',
    };
  }
};

// Initialize on module load
loadTokens();

// Export token utilities
export const tokenUtils = {
  save: saveTokens,
  clear: clearTokens,
  getAccess: getAccessToken,
  load: loadTokens,
};

export default apiFetch;
