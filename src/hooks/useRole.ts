import { useAuth } from '@/lib/auth-context';
import { UserType } from '@/lib/api/auth';

/**
 * Custom hook for detecting and managing user roles
 * Integrates with the existing auth system to provide role-based functionality
 */
export function useRole() {
  const { user, isAuthenticated, loading } = useAuth();

  /**
   * Get the current user's role
   * @returns UserType | null - The user's role or null if not authenticated
   */
  const role: UserType | null = user?.type || null;

  /**
   * Check if the current user is a brand
   * @returns boolean - True if user is a brand, false otherwise
   */
  const isBrand = role === 'BRAND';

  /**
   * Check if the current user is an influencer
   * @returns boolean - True if user is an influencer, false otherwise
   */
  const isInfluencer = role === 'INFLUENCER';

  /**
   * Check if the user has a specific role
   * @param targetRole - The role to check against
   * @returns boolean - True if user has the target role, false otherwise
   */
  const hasRole = (targetRole: UserType): boolean => {
    return role === targetRole;
  };

  /**
   * Check if the user is authenticated and has any role
   * @returns boolean - True if user is authenticated with a role, false otherwise
   */
  const hasAnyRole = (): boolean => {
    return isAuthenticated && role !== null;
  };

  return {
    role,
    isBrand,
    isInfluencer,
    hasRole,
    hasAnyRole,
    isAuthenticated,
    loading,
    user,
  };
}

export default useRole;