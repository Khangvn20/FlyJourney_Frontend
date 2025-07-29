import type { ApiConfig, ApiEndpoints } from "../types";

// API Configuration from environment variables
export const apiConfig: ApiConfig = {
  baseUrl: import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api/v1",
  timeout: Number(import.meta.env.VITE_API_TIMEOUT) || 10000,
  retries: Number(import.meta.env.VITE_API_RETRIES) || 3,
};

// API Endpoints Configuration
export const apiEndpoints: ApiEndpoints = {
  auth: {
    login: "/auth/login",
    register: "/auth/register",
    confirmRegister: "/auth/confirm-register",
    refresh: "/auth/refresh",
    logout: "/auth/logout",
    verifyOtp: "/auth/verify-otp",
    resendOtp: "/auth/resend-otp",
  },
  flights: {
    search: "/flights/search",
    booking: "/flights/booking",
    airlines: "/flights/airlines",
    airports: "/flights/airports",
  },
  user: {
    profile: "/users/",
    bookings: "/user/bookings",
    preferences: "/user/preferences",
  },
};

// Environment-based settings
export const apiSettings = {
  isDevelopment: import.meta.env.MODE === "development",
  isProduction: import.meta.env.MODE === "production",
  apiKey: import.meta.env.VITE_API_KEY,
  enableLogging: import.meta.env.VITE_ENABLE_API_LOGGING === "true",
  enableRetries: import.meta.env.VITE_ENABLE_RETRIES !== "false",
};
