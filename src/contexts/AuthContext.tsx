/* eslint-disable react-refresh/only-export-components */
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

import type { User, AuthContextType } from "./auth.types";
import type {
  ConfirmRegisterRequest,
  LoginRequest,
  UpdateUserRequest,
} from "../shared/types/backend-api.types";
import type { RegisterFormData } from "../shared/types/auth.types";

import { authService } from "../services/authService";
import { convertRegisterFormToRequest } from "../shared/utils/registerFormHelpers";

// ==============================
// Context + Hook
// ==============================

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuthContext = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuthContext must be used within <AuthProvider>");
  }
  return ctx;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

// LocalStorage key for persisting token
const TOKEN_KEY = "auth_token";

// ==============================
// Provider
// ==============================

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load token from localStorage on mount and try to fetch profile
  useEffect(() => {
    const savedToken = localStorage.getItem(TOKEN_KEY);
    if (savedToken) {
      setToken(savedToken);
      authService.setAuthToken(savedToken);
      loadUserProfile();
    }
  }, []);

  const loadUserProfile = useCallback(async () => {
    try {
      const response = await authService.getUserProfile();
      if (response.status && response.data) {
        const userData: User = {
          id: response.data.user_id.toString(),
          email: response.data.email,
          name: response.data.name,
          phone: response.data.phone,
        };
        setUser(userData);
      }
    } catch (err) {
      console.error("Failed to load user profile:", err);
      // If profile load fails, clear auth state
      logout();
    }
  }, []);

  const register = useCallback(async (userData: RegisterFormData) => {
    setLoading(true);
    setError(null);
    try {
      const requestData = convertRegisterFormToRequest(userData);
      const response = await authService.register(requestData);
      if (response.status) {
        return { success: true, message: response.errorMessage };
      }
      throw new Error(response.errorMessage);
    } catch (err: unknown) {
      const errorMessage = (err as Error).message || "Registration failed";
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  const confirmRegister = useCallback(
    async (confirmData: ConfirmRegisterRequest) => {
      setLoading(true);
      setError(null);
      try {
        const response = await authService.confirmRegister(confirmData);
        if (response.status && response.data) {
          return {
            success: true,
            message: response.errorMessage,
            data: response.data,
          };
        }
        throw new Error(response.errorMessage);
      } catch (err: unknown) {
        const errorMessage =
          (err as Error).message || "Registration confirmation failed";
        setError(errorMessage);
        return { success: false, error: errorMessage };
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const login = useCallback(async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      const credentials: LoginRequest = { email, password };
      const response = await authService.login(credentials);

      if (response.status && response.data) {
        const {
          token: authToken,
          user_id,
          name,
          email: userEmail,
        } = response.data;

        // Save token
        setToken(authToken);
        localStorage.setItem(TOKEN_KEY, authToken);
        authService.setAuthToken(authToken);

        // Set user data
        const userData: User = {
          id: user_id.toString(),
          email: userEmail,
          name,
        };
        setUser(userData);

        return { success: true };
      }
      throw new Error(response.errorMessage || "Invalid response format");
    } catch (err: unknown) {
      const errorMessage = (err as Error).message || "Login failed";
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  const updateProfile = useCallback(async (updateData: UpdateUserRequest) => {
    setLoading(true);
    setError(null);
    try {
      const response = await authService.updateUserProfile(updateData);
      if (response.status && response.data) {
        const userData: User = {
          id: response.data.user_id.toString(),
          email: response.data.email,
          name: response.data.name,
          phone: response.data.phone,
        };
        setUser(userData);
        return { success: true, message: response.errorMessage };
      }
      throw new Error(response.errorMessage);
    } catch (err: unknown) {
      const errorMessage = (err as Error).message || "Profile update failed";
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  const resetPassword = useCallback(async (email: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await authService.resetPassword(email);
      if (response.status) {
        return { success: true, message: response.errorMessage };
      }
      throw new Error(response.errorMessage);
    } catch (err: unknown) {
      const errorMessage = (err as Error).message || "Reset password failed";
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  const confirmResetPassword = useCallback(
    async (data: { email: string; new_password: string; otp: string }) => {
      setLoading(true);
      setError(null);
      try {
        const response = await authService.confirmResetPassword(data);
        if (response.status) {
          return { success: true, message: response.errorMessage };
        }
        throw new Error(response.errorMessage);
      } catch (err: unknown) {
        const errorMessage =
          (err as Error).message || "Reset password confirmation failed";
        setError(errorMessage);
        return { success: false, error: errorMessage };
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const logout = useCallback(async () => {
    // Prevent multiple logout calls
    if (loading) return;

    setLoading(true);
    try {
      if (token) {
        await authService.logout();
      }
    } catch (err) {
      console.error("Logout API call failed:", err);
    } finally {
      // Clear local state regardless of API result
      setToken(null);
      setUser(null);
      setError(null);
      localStorage.removeItem(TOKEN_KEY);
      authService.removeAuthToken();
      setLoading(false);
    }
  }, [token, loading]);

  const value: AuthContextType = {
    token,
    user,
    loading,
    error,
    isAuthenticated: !!token && !!user,
    // actions
    login,
    logout,
    register,
    confirmRegister,
    updateProfile,
    resetPassword,
    confirmResetPassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Re-export context for advanced use-cases (optional)
export { AuthContext };
