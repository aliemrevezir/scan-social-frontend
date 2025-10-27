// Example usage of the auth API in a React component
import { useState } from 'react';
import { register, login, logout, getMe, isAuthenticated, getCurrentUser, type RegisterInput } from './auth';

// Example Register Component
export const useRegister = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRegister = async (payload: RegisterInput) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await register(payload);
      // Handle successful registration
      console.log('Registration successful', response.data);
      return response.data;
    } catch (err) {
      // Handle error
      setError('Registration failed');
      console.error('Registration error', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { handleRegister, loading, error };
};

// Example Login Component
export const useLogin = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await login({ email, password });
      // Handle successful login
      console.log('Login successful', response.data);
      // Redirect user or update app state
      return response.data;
    } catch (err) {
      // Handle error
      setError('Login failed');
      console.error('Login error', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { handleLogin, loading, error };
};

// Example Logout Hook
export const useLogout = () => {
  const handleLogout = async () => {
    try {
      await logout();
      // Redirect to login page or update app state
      console.log('Logout successful');
      window.location.href = '/login';
    } catch (err) {
      console.error('Logout error', err);
    }
  };

  return { handleLogout };
};

// Example User Profile Hook
export const useUserProfile = () => {
  type AuthUser = ReturnType<typeof getCurrentUser>;
  const [user, setUser] = useState<AuthUser>(getCurrentUser());
  const [loading, setLoading] = useState(true);

  const fetchUser = async () => {
    if (!isAuthenticated()) {
      setLoading(false);
      return;
    }

    try {
      const response = await getMe();
      setUser((response.data.user as AuthUser) ?? null);
    } catch (err) {
      console.error('Failed to fetch user', err);
    } finally {
      setLoading(false);
    }
  };

  return { user, loading, fetchUser, isAuthenticated: isAuthenticated() };
};