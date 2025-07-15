export interface UserInfo {
  name: string;
  email: string;
  phone: string;
 
}
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  username: string;
  email: string;
  password: string;
  phone: string;
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
  phone: string;
}
interface OtpVerificationProps {
  email: string;
  name: string;     
  password: string; 
  phone: string;
  onSuccess?: () => void;
  onBack: () => void;
  onClose: () => void;
}
