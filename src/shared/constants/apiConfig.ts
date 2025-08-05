import type { ApiConfig, ApiEndpoints } from "../types";

// Flight API Configuration for Backend Integration
export const flightApiConfig = {
  baseUrl: "http://localhost:3000/api/v1",
  timeout: 10000,
  retries: 3,
};

// API Configuration from environment variables
export const apiConfig: ApiConfig = {
  baseUrl: import.meta.env.VITE_API_BASE_URL,
  timeout: Number(import.meta.env.VITE_API_TIMEOUT) || 10000,
  retries: Number(import.meta.env.VITE_API_RETRIES),
};

// API Endpoints Configuration
export const apiEndpoints: ApiEndpoints = {
  auth: {
    login: "/auth/login",
    register: "/auth/register",
    confirmRegister: "/auth/confirm-register",
    logout: "/auth/logout",
    verifyOtp: "/auth/verify-otp",
    resendOtp: "/auth/resend-otp",
    resetPassword: "/auth/reset-password",
    confirmResetPassword: "/auth/confirm-reset-password",
  },
  flights: {
    search: "/flights/search",
    searchRoundTrip: "/flights/search/roundtrip",
    getById: "/flights/{id}",
    getByAirline: "/flights/airline/{airline_id}",
    getByStatus: "/flights/status/{status}",
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
  enableRequestDeduplication:
    import.meta.env.VITE_DISABLE_REQUEST_DEDUPLICATION !== "true",
  // Cài đặt để tránh CORS preflight
  avoidCORSPreflight: import.meta.env.VITE_AVOID_CORS_PREFLIGHT === "true",
};
