import React, { useState, useCallback, useEffect } from "react";
import { AuthContext } from "./auth.context";
import type { User, AuthContextType } from "./auth.types";
import { authService } from "../services/authService";
import { convertRegisterFormToRequest } from "../utils/registerFormHelpers";
import type {
  ConfirmRegisterRequest,
  LoginRequest,
  UpdateUserRequest,
} from "../shared/types/backend-api.types";
import type { RegisterFormData } from "../shared/types/auth.types";

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load token from localStorage on mount
  useEffect(() => {
    const savedToken = localStorage.getItem("auth_token");
    if (savedToken) {
      setToken(savedToken);
      authService.setAuthToken(savedToken);
      // Try to load user profile
      loadUserProfile();
    }
  }, []);

  const loadUserProfile = useCallback(async () => {
    try {
      const response = await authService.getUserProfile();
      if (response.status && response.data) {
        const userData: User = {
          email: response.data.email,
          name: response.data.name,
          id: response.data.user_id.toString(),
          phone: response.data.phone,
        };
        setUser(userData);
      }
    } catch (error) {
      console.error("Failed to load user profile:", error);
      // If profile load fails, clear auth state
      logout();
    }
  }, []);

  const register = useCallback(async (userData: RegisterFormData) => {
    setLoading(true);
    setError(null);
    try {
      // Convert form data to API request format
      const requestData = convertRegisterFormToRequest(userData);
      const response = await authService.register(requestData);
      if (response.status) {
        return { success: true, message: response.errorMessage };
      } else {
        throw new Error(response.errorMessage);
      }
    } catch (error: unknown) {
      const errorMessage = (error as Error).message || "Registration failed";
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
          console.log("✅ Registration confirmed successfully");

          return {
            success: true,
            message: response.errorMessage,
            data: response.data,
          };
        } else {
          throw new Error(response.errorMessage);
        }
      } catch (error: unknown) {
        const errorMessage =
          (error as Error).message || "Registration confirmation failed";
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

      console.log("🔍 Login response received:", response);

      if (response.status && response.data) {
        const {
          token: authToken,
          user_id,
          name,
          email: userEmail,
        } = response.data;

        console.log("✅ Login successful, setting auth state");

        // Save token
        setToken(authToken);
        localStorage.setItem("auth_token", authToken);

        // Set user data
        const userData: User = {
          id: user_id.toString(),
          email: userEmail,
          name,
        };
        setUser(userData);

        return { success: true };
      } else {
        console.log("❌ Login response missing status or data:", {
          status: response.status,
          data: response.data,
        });
        throw new Error(response.errorMessage || "Invalid response format");
      }
    } catch (error: unknown) {
      const errorMessage = (error as Error).message || "Login failed";
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
        // Update local user state
        const userData: User = {
          id: response.data.user_id.toString(),
          email: response.data.email,
          name: response.data.name,
          phone: response.data.phone,
        };
        setUser(userData);
        return { success: true, message: response.errorMessage };
      } else {
        throw new Error(response.errorMessage);
      }
    } catch (error: unknown) {
      const errorMessage = (error as Error).message || "Profile update failed";
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
      } else {
        throw new Error(response.errorMessage);
      }
    } catch (error: unknown) {
      const errorMessage = (error as Error).message || "Reset password failed";
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
        } else {
          throw new Error(response.errorMessage);
        }
      } catch (error: unknown) {
        const errorMessage =
          (error as Error).message || "Reset password confirmation failed";
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
    if (loading) {
      console.log("⚠️ Logout already in progress, skipping...");
      return;
    }

    setLoading(true);
    try {
      // Call logout API if token exists
      if (token) {
        console.log("🚪 Calling logout API...");
        await authService.logout();
        console.log("✅ Logout API call successful");
      }
    } catch (error) {
      console.error("❌ Logout API call failed:", error);
    } finally {
      // Clear local state regardless of API call result
      setToken(null);
      setUser(null);
      setError(null);
      localStorage.removeItem("auth_token");
      authService.removeAuthToken();
      setLoading(false);
      console.log("🧹 Local auth state cleared");
    }
  }, [token, loading]);

  const value: AuthContextType = {
    token,
    user,
    loading,
    error,
    login,
    logout,
    register,
    confirmRegister,
    updateProfile,
    resetPassword,
    confirmResetPassword,
    isAuthenticated: !!token && !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
