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
  refreshToken?: string | null;
  user: User;
}

export interface RegisterResponse {
  user: User;
}

const userTypeMap: Record<string, UserType> = {
  BRAND: 'BRAND',
  INFLUENCER: 'INFLUENCER',
  CREATOR: 'INFLUENCER',
};

interface JwtUserPayload {
  sub?: string;
  user_id?: string;
  uuid?: string;
  id?: string;
  email?: string;
  username?: string;
  display_name?: string;
  displayName?: string;
  name?: string;
  type?: string;
  role?: string;
  user_type?: string;
  account_type?: string;
}

const getValueAtPath = (source: Record<string, unknown>, path: string): unknown => {
  return path.split('.').reduce<unknown>((acc, key) => {
    if (acc && typeof acc === 'object' && acc !== null) {
      return (acc as Record<string, unknown>)[key];
    }
    return undefined;
  }, source);
};

const pickString = (source: Record<string, unknown>, paths: string[]): string | undefined => {
  for (const path of paths) {
    const value = getValueAtPath(source, path);
    if (typeof value === 'string' && value.trim() !== '') {
      return value;
    }
  }
  return undefined;
};

const pickObject = (
  source: Record<string, unknown>,
  paths: string[],
): Record<string, unknown> | undefined => {
  for (const path of paths) {
    const value = getValueAtPath(source, path);
    if (value && typeof value === 'object') {
      return value as Record<string, unknown>;
    }
  }
  return undefined;
};

const normalizeUser = (raw: Record<string, unknown> | undefined): User => {
  if (!raw) {
    throw new Error('Authentication payload is missing user data.');
  }

  const idCandidate =
    pickString(raw, ['id', 'uuid', 'user_id', 'pk', 'account_id']) ?? pickString(raw, ['user.id']);
  const emailCandidate = pickString(raw, ['email', 'user.email', 'username', 'user.username']);

  if (!idCandidate || !emailCandidate) {
    throw new Error('Authentication payload is missing required user identifiers.');
  }

  const rawType = pickString(raw, ['type', 'role', 'user_type', 'account_type', 'kind', 'segment']);
  const normalizedType = rawType ? rawType.toUpperCase() : undefined;
  const type: UserType = normalizedType && userTypeMap[normalizedType] ? userTypeMap[normalizedType] : 'BRAND';

  const displayName =
    pickString(raw, ['displayName', 'display_name', 'name', 'full_name', 'user.displayName', 'user.name']) ?? null;

  return {
    id: idCandidate,
    email: emailCandidate,
    type,
    displayName,
  };
};

const normalizeUserFromToken = (accessToken: string): User => {
  const decoded = jwtDecode<JwtUserPayload>(accessToken);
  const raw: Record<string, unknown> = {
    id:
      decoded.user_id ??
      decoded.uuid ??
      decoded.sub ??
      decoded.id ??
      decoded.username ??
      null,
    email: decoded.email ?? decoded.username ?? null,
    display_name: decoded.display_name ?? decoded.displayName ?? decoded.name ?? null,
    type: decoded.type ?? decoded.role ?? decoded.user_type ?? decoded.account_type ?? null,
  };

  return normalizeUser(raw);
};

const normalizeAuthPayload = (payload: unknown): AuthResponse => {
  const source = (payload ?? {}) as Record<string, unknown>;

  const accessToken =
    pickString(source, [
      'accessToken',
      'access_token',
      'access',
      'token',
      'jwt',
      'jwtToken',
      'jwt_token',
      'tokens.accessToken',
      'tokens.access_token',
      'tokens.access',
      'token.accessToken',
      'token.access_token',
      'token.access',
      'data.accessToken',
      'data.access_token',
      'data.access',
      'data.token',
      'data.jwt',
      'data.tokens.accessToken',
      'data.tokens.access_token',
      'data.tokens.access',
      'data.token.accessToken',
      'data.token.access_token',
      'data.token.access',
      'data.data.token.access',
      'data.data.tokens.access',
    ]) ?? undefined;

  if (!accessToken) {
    throw new Error('Authentication payload is missing access token.');
  }

  const refreshToken =
    pickString(source, [
      'refreshToken',
      'refresh_token',
      'refresh',
      'tokens.refreshToken',
      'tokens.refresh_token',
      'tokens.refresh',
      'token.refreshToken',
      'token.refresh_token',
      'token.refresh',
      'data.refreshToken',
      'data.refresh_token',
      'data.refresh',
      'data.tokens.refreshToken',
      'data.tokens.refresh_token',
      'data.tokens.refresh',
      'data.token.refreshToken',
      'data.token.refresh_token',
      'data.token.refresh',
      'data.data.tokens.refresh',
      'data.data.token.refresh',
    ]) ?? null;

  const userSource =
    pickObject(source, ['user', 'account', 'profile']) ??
    pickObject(source, ['data.user', 'data.account', 'data.profile']) ??
    pickObject(source, ['data.data.user']);
  const user = userSource ? normalizeUser(userSource) : normalizeUserFromToken(accessToken);

  return {
    accessToken,
    refreshToken,
    user,
  };
};

const persistAuthArtifacts = (auth: AuthResponse) => {
  if (typeof window === 'undefined') {
    return;
  }

  storeAccessToken(auth.accessToken);
  localStorage.setItem('user', JSON.stringify(auth.user));
  localStorage.setItem('userRole', auth.user.type);

  if (auth.refreshToken) {
    Cookies.set('refreshToken', auth.refreshToken, {
      sameSite: 'lax',
      path: '/',
      expires: 30,
    });
  }
};

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
        const auth = await refresh();

        // Retry the original request
        originalRequest.headers.Authorization = `Bearer ${auth.accessToken}`;
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

export const login = (data: LoginInput): Promise<AxiosResponse<unknown>> => {
  return apiClient.post('/auth/login', data);
};

export const refresh = async (): Promise<AuthResponse> => {
  const response = await apiClient.post('/auth/refresh');
  const auth = normalizeAuthPayload(response.data);
  persistAuthArtifacts(auth);
  return auth;
};

export const logout = async (): Promise<AxiosResponse<{ ok: boolean }>> => {
  try {
    const response = await apiClient.post('/auth/logout');
    
    // Clear tokens from storage
    localStorage.removeItem('accessToken');
    localStorage.removeItem('user');
    Cookies.remove('refreshToken'); // If using cookies for refresh token
    
    // Also remove accessToken cookie
    if (typeof document !== 'undefined') {
      document.cookie = 'accessToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    }
    
    return response;
  } catch (error) {
    // Even if the request fails, clear local tokens
    localStorage.removeItem('accessToken');
    localStorage.removeItem('user');
    Cookies.remove('refreshToken');
    
    // Also remove accessToken cookie
    if (typeof document !== 'undefined') {
      document.cookie = 'accessToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    }
    
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
  if (typeof window === 'undefined') {
    return;
  }

  localStorage.setItem('accessToken', token);

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
      if (typeof document !== 'undefined') {
        document.cookie = 'accessToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
      }
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
  const auth = normalizeAuthPayload(response.data);
  persistAuthArtifacts(auth);
  return auth;
};

export const loginInfluencer = async (credentials: LoginInput): Promise<AuthResponse> => {
  const response = await login(credentials);
  const auth = normalizeAuthPayload(response.data);
  persistAuthArtifacts(auth);
  return auth;
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
