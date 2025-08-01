// API Configuration Types
export interface ApiConfig {
  baseUrl: string;
  timeout: number;
  retries: number;
}

// Generic API Response Types
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  code?: number;
}

export interface ApiError {
  message: string;
  code: number;
  details?: Record<string, unknown>;
}

// Pagination Types
export interface PaginationParams {
  page: number;
  limit: number;
  sort?: string;
  order?: "asc" | "desc";
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// API Endpoints Configuration
export interface ApiEndpoints {
  auth: {
    login: string;
    register: string;
    confirmRegister: string;
    logout: string;
    verifyOtp: string;
    resendOtp: string;
    resetPassword: string;
    confirmResetPassword: string;
  };
  flights: {
    search: string;
    booking: string;
    airlines: string;
    airports: string;
  };
  user: {
    profile: string;
    bookings: string;
    preferences: string;
  };
}

// Request/Response Headers
export type ApiHeaders = Record<string, string>;
