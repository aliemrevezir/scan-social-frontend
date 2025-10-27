'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import Cookies from 'js-cookie';

import { User, getCurrentUser, isAuthenticated } from '@/lib/api/auth';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (user: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticatedState, setIsAuthenticatedState] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    // Check if user is authenticated on initial load
    const checkUserAuth = () => {
      try {
        const authStatus = isAuthenticated();
        if (authStatus) {
          const currentUser = getCurrentUser();
          setUser(currentUser);
          setIsAuthenticatedState(true);
        } else {
          setUser(null);
          setIsAuthenticatedState(false);
        }
      } catch (error) {
        console.error('Error checking auth status:', error);
        setUser(null);
        setIsAuthenticatedState(false);
      } finally {
        setLoading(false);
      }
    };

    checkUserAuth();
  }, []);

  const login = (userData: User) => {
    // Store user data in localStorage
    localStorage.setItem('user', JSON.stringify(userData));
    // Also store user role separately for easy access
    localStorage.setItem('userRole', userData.type);
    setUser(userData);
    setIsAuthenticatedState(true);
  };

  const logout = () => {
    // Remove user data from localStorage
    localStorage.removeItem('user');
    localStorage.removeItem('userRole');
    localStorage.removeItem('accessToken');
    Cookies.remove('accessToken');
    setUser(null);
    setIsAuthenticatedState(false);
  };

  const value = {
    user,
    isAuthenticated: isAuthenticatedState,
    loading,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
