import type { ApiConfig, ApiEndpoints } from "../types";
import { ENV } from "../config/env";

// Flight API Configuration for Backend Integration
export const flightApiConfig = {
  baseUrl: "http://localhost:3000/api/v1",
  timeout: 10000,
  retries: 3,
};

// API Configuration from environment variables
export const apiConfig: ApiConfig = {
  baseUrl: ENV.API_BASE_URL,
  timeout: ENV.API_TIMEOUT,
  retries: ENV.API_RETRIES,
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
  isDevelopment: ENV.DEV,
  isProduction: ENV.PROD,
  apiKey: ENV.API_KEY,
  enableLogging: ENV.ENABLE_API_LOGGING,
  enableRetries: ENV.ENABLE_RETRIES,
  enableRequestDeduplication: !ENV.DISABLE_REQUEST_DEDUP,
  // Cài đặt để tránh CORS preflight
  avoidCORSPreflight: ENV.AVOID_CORS_PREFLIGHT,
};
