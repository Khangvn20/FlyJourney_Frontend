import type { ApiConfig, ApiEndpoints } from "../types";
import { ENV } from "../config/env";

const DEFAULT_API_BASE_URL = "http://103.69.96.179:3000/api/v1";

const normalizeBaseUrl = (value?: string): string => {
  const trimmed = (value ?? "").trim();
  if (!trimmed) return DEFAULT_API_BASE_URL;
  return trimmed.replace(/\/+$/, "");
};

const ensureLeadingSlash = (path: string): string =>
  path.startsWith("/") ? path : `/${path}`;

export const API_BASE_URL = normalizeBaseUrl(ENV.API_BASE_URL);

export const buildApiUrl = (path: string): string =>
  `${API_BASE_URL}${ensureLeadingSlash(path)}`;

// Flight API Configuration for Backend Integration
export const flightApiConfig = {
  baseUrl: API_BASE_URL,
  timeout: 60000, // Increased to 60 seconds for better reliability
  retries: 3,
};

// API Configuration from environment variables
export const apiConfig: ApiConfig = {
  baseUrl: API_BASE_URL,
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
    booking: "/booking",
    airlines: "/flights/airlines",
    airports: "/flights/airports",
  },
  user: {
    profile: "/users/",
    bookings: "/booking/user",
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
