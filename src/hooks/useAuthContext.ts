import { useContext } from "react";
import { AuthContext } from "../contexts/auth.context";
// AuthContextType now sourced from shared types barrel
import type { AuthContextType } from "../shared/types";

/**
 * Custom hook to use the Auth context
 * Provides access to authentication state and functions
 */
export const useAuthContext = (): AuthContextType => {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error("useAuthContext must be used within an AuthProvider");
  }

  return context;
};

/**
 * Hook to check if user is authenticated
 */
export const useIsAuthenticated = (): boolean => {
  const { isAuthenticated } = useAuthContext();
  return isAuthenticated;
};

/**
 * Hook to get current user
 */
export const useCurrentUser = () => {
  const { user, loading } = useAuthContext();
  return { user, loading };
};

/**
 * Hook to get auth error state
 */
export const useAuthError = () => {
  const { error } = useAuthContext();
  return error;
};

export default useAuthContext;
