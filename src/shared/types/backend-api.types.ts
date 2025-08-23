// Backend API Response Types based on the actual API responses

export interface BackendResponse<T = unknown> {
  data: T | null;
  status: boolean;
  errorCode: string;
  errorMessage: string;
}

// Auth API Types
export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
  phone: string;
}

export interface ConfirmRegisterRequest {
  name: string;
  email: string;
  otp: string;
  phone: string;
  password: string;
}

export interface ConfirmRegisterResponse {
  email: string;
  name: string;
  phone: string;
  user_id: number;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  email: string;
  name: string;
  role: string;
  token: string;
  user_id: number;
}

// User API Types
export interface BackendUserProfile {
  user_id: number;
  email: string;
  name: string;
  phone: string;
  roles: string;
  created_at: string;
  updated_at: string;
}

export interface UpdateUserRequest {
  phone?: string;
  name?: string;
}

// Common error codes from backend
export type BackendErrorCode =
  | "SUCCESS"
  | "VALIDATION_ERROR"
  | "USER_NOT_FOUND"
  | "INVALID_CREDENTIALS"
  | "OTP_EXPIRED"
  | "OTP_INVALID"
  | "EMAIL_ALREADY_EXISTS"
  | "UNAUTHORIZED"
  | "SERVER_ERROR";
