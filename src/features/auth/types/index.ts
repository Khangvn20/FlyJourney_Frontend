export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  username: string;
  email: string;
  password: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}
export interface OtpVerificationRequest {
  name: string;
  email: string;
  otp: string;
  password: string;
}
interface OtpVerificationProps {
  email: string;
  name: string;     
  password: string; 
  onSuccess?: () => void;
  onBack: () => void;
  onClose: () => void;
}
