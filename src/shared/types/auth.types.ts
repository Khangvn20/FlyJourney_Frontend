// Authentication related interfaces and types

export interface RegisterFormData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface LoginFormData {
  email: string;
  password: string;
}

export interface UserProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  avatar?: string;
  phone?: string;
  dateOfBirth?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  user: UserProfile;
  token: string;
  refreshToken: string;
  expiresIn: number;
}

export interface OTPVerificationData {
  email: string;
  otp: string;
  type: "registration" | "password_reset" | "login";
}

export type AuthStep = "form" | "otp" | "success";
export type AuthTab = "register" | "login";
