import { AxiosResponse } from 'axios';
import Cookies from 'js-cookie';
import { jwtDecode } from 'jwt-decode';
import { createApiClient } from './client';

// Define types based on the backend schemas
export type UserType = 'BRAND' | 'INFLUENCER';

export type RegisterInput =
  | {
      email: string;
      password: string;
      type: 'BRAND';
      displayName?: string;
    }
  | {
      email: string;
      password: string;
      type: 'INFLUENCER';
      displayName: string;
    };

export interface LoginInput {
  email: string;
  password: string;
}

export interface User {
  id: string;
  email: string;
  type: UserType;
  displayName: string | null;
}

export interface AuthResponse {
  accessToken: string;
  user: User;
}

export interface RegisterResponse {
  user: User;
}

// Create axios instance with default config
const apiClient = createApiClient();

// Add a request interceptor to automatically attach the access token
apiClient.interceptors.request.use(
  (config) => {
    let token = localStorage.getItem('accessToken');
    
    // If no token in localStorage, check cookie
    if (!token) {
      const cookieToken = getCookie('accessToken');
      if (cookieToken) {
        token = cookieToken;
        // Sync cookie token to localStorage
        localStorage.setItem('accessToken', token);
      }
    }
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle token refresh
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Don't retry on login or refresh endpoints to avoid infinite loops
    const isAuthEndpoint = originalRequest.url?.includes('/auth/login') ||
                           originalRequest.url?.includes('/auth/refresh');

    // If error is 401, we haven't already tried to refresh, and it's not an auth endpoint
    if (error.response?.status === 401 && !originalRequest._retry && !isAuthEndpoint) {
      originalRequest._retry = true;

      try {
        // Try to refresh the token
        const response = await refresh();
        const { accessToken } = response.data;

        // Store the new access token using our utility function
        storeAccessToken(accessToken);

        // Retry the original request
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        // If refresh fails, redirect to login
        logout();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// Auth API functions
export const register = async (data: RegisterInput): Promise<AxiosResponse<RegisterResponse>> => {
  // Map frontend data to backend schema
  const payload = {
    email: data.email,
    password: data.password,
    type: data.type,
    ...(data.type === 'BRAND' && { displayName: data.displayName }),
    ...(data.type === 'INFLUENCER' && { displayName: data.displayName }),
  };

  const response = await apiClient.post('/auth/register', payload);
  
  // Store user data in localStorage
  if (response.data.user) {
    localStorage.setItem('user', JSON.stringify(response.data.user));
  }
  
  return response;
};

export const login = async (data: LoginInput): Promise<AxiosResponse<AuthResponse>> => {
  const response = await apiClient.post('/auth/login', data);
  
  // Store user data in localStorage
  if (response.data.accessToken) {
    storeAccessToken(response.data.accessToken);
  }
  
  if (response.data.user) {
    localStorage.setItem('user', JSON.stringify(response.data.user));
  }
  
  return response;
};

export const refresh = async (): Promise<AxiosResponse<AuthResponse>> => {
  const response = await apiClient.post('/auth/refresh');
  
  // Store the new access token
  if (response.data.accessToken) {
    storeAccessToken(response.data.accessToken);
  }
  
  // Store user data in localStorage
  if (response.data.user) {
    localStorage.setItem('user', JSON.stringify(response.data.user));
  }
  
  return response;
};

export const logout = async (): Promise<AxiosResponse<{ ok: boolean }>> => {
  try {
    const response = await apiClient.post('/auth/logout');
    
    // Clear tokens from storage
    localStorage.removeItem('accessToken');
    localStorage.removeItem('user');
    Cookies.remove('refreshToken'); // If using cookies for refresh token
    
    // Also remove accessToken cookie
    document.cookie = 'accessToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    
    return response;
  } catch (error) {
    // Even if the request fails, clear local tokens
    localStorage.removeItem('accessToken');
    localStorage.removeItem('user');
    Cookies.remove('refreshToken');
    
    // Also remove accessToken cookie
    document.cookie = 'accessToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    
    throw error;
  }
};

export const getMe = async (): Promise<AxiosResponse<{ user: User }>> => {
  const response = await apiClient.get('/auth/me');
  
  // Store user data in localStorage
  if (response.data.user) {
    localStorage.setItem('user', JSON.stringify(response.data.user));
  }
  
  return response;
};

// Utility functions
export const storeAccessToken = (token: string) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('accessToken', token);
  }

  Cookies.set('accessToken', token, {
    sameSite: 'lax',
    path: '/',
    expires: 30,
  });
};

export const isAuthenticated = (): boolean => {
  const token = localStorage.getItem('accessToken');
  if (!token) {
    // Check cookie as fallback
    const cookieToken = getCookie('accessToken');
    if (cookieToken) {
      localStorage.setItem('accessToken', cookieToken);
      return isValidToken(cookieToken);
    }
    return false;
  }
  
  return isValidToken(token);
};

// Helper function to validate token
const isValidToken = (token: string): boolean => {
  try {
    const decoded: { exp: number } = jwtDecode(token);
    const currentTime = Date.now() / 1000;
    return decoded.exp > currentTime;
  } catch {
    return false;
  }
};

// Helper function to get cookie value by name
const getCookie = (name: string): string | undefined => {
  if (typeof document === 'undefined') return undefined;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) {
    return parts.pop()?.split(';').shift();
  }
  return undefined;
};

// Updated getCurrentUser to read from localStorage
export const getCurrentUser = (): User | null => {
  // First check if we have a user in localStorage
  const userString = localStorage.getItem('user');
  if (userString) {
    try {
      return JSON.parse(userString);
    } catch {
      // If parsing fails, remove the invalid data
      localStorage.removeItem('user');
    }
  }
  
  // Fallback to token decoding (existing behavior)
  const token = localStorage.getItem('accessToken');
  if (!token) {
    // Check cookie as fallback
    const cookieToken = getCookie('accessToken');
    if (!cookieToken) return null;
    localStorage.setItem('accessToken', cookieToken);
  }
  
  try {
    const decoded: User & { exp: number } = jwtDecode(token || getCookie('accessToken')!);
    const currentTime = Date.now() / 1000;
    if (decoded.exp <= currentTime) {
      // Token expired
      localStorage.removeItem('accessToken');
      localStorage.removeItem('user');
      document.cookie = 'accessToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
      return null;
    }
    
    return {
      id: decoded.id,
      email: decoded.email,
      type: decoded.type,
      displayName: decoded.displayName,
    };
  } catch {
    return null;
  }
};

export const loginBrand = async (credentials: LoginInput): Promise<AuthResponse> => {
  const response = await login(credentials);
  
  // Store user data in localStorage
  if (response.data.user) {
    localStorage.setItem('user', JSON.stringify(response.data.user));
  }
  
  return response.data;
};

export const loginInfluencer = async (credentials: LoginInput): Promise<AuthResponse> => {
  const response = await login(credentials);
  
  // Store user data in localStorage
  if (response.data.user) {
    localStorage.setItem('user', JSON.stringify(response.data.user));
  }
  
  return response.data;
};

export const devDefaults = () => ({
  brand: {
    email: process.env.NEXT_PUBLIC_DEV_BRAND_EMAIL ?? 'brand@scansocial.dev',
    password: process.env.NEXT_PUBLIC_DEV_BRAND_PASSWORD ?? 'password123',
  },
  influencer: {
    email: process.env.NEXT_PUBLIC_DEV_INFLUENCER_EMAIL ?? 'creator@scansocial.dev',
    password: process.env.NEXT_PUBLIC_DEV_INFLUENCER_PASSWORD ?? 'password123',
  },
});
