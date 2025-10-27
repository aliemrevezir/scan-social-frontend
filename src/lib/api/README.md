# API Client Documentation

This directory contains API client functions for interacting with the backend services.

## Structure

- `client.ts` - Shared axios instance configuration
- `auth.ts` - Authentication related API functions
- `index.ts` - Export file for easy imports

## Auth API

The auth module provides functions for user authentication:

### Types

```typescript
type UserType = 'BRAND' | 'INFLUENCER';

interface RegisterInput {
  email: string;
  password: string;
  type: UserType;
  displayName?: string;
}

interface LoginInput {
  email: string;
  password: string;
}

interface User {
  id: string;
  email: string;
  type: UserType;
  displayName: string | null;
}
```

### Functions

- `register(data: RegisterInput)` - Register a new user
- `login(data: LoginInput)` - Login with email and password
- `refresh()` - Refresh the access token
- `logout()` - Logout and clear tokens
- `getMe()` - Get current user information
- `isAuthenticated()` - Check if user is authenticated
- `getCurrentUser()` - Get current user data from token

### Usage

```typescript
import { login, logout, getMe } from '@/lib/api/auth';

// Login
const response = await login({ email: 'user@example.com', password: 'password' });

// Get user info
const userResponse = await getMe();

// Logout
await logout();
```