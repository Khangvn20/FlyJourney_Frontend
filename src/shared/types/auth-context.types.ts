import type { RegisterFormData } from "./auth.types";
import type {
  ConfirmRegisterRequest,
  UpdateUserRequest,
} from "./backend-api.types";

export interface User {
  id?: string;
  email: string;
  name: string;
  phone?: string;
}

export interface AuthResult {
  success: boolean;
  error?: string;
  message?: string;
  data?: unknown;
}

export interface AuthContextType {
  token: string | null;
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<AuthResult>;
  logout: () => Promise<void>;
  register: (userData: RegisterFormData) => Promise<AuthResult>;
  confirmRegister: (confirmData: ConfirmRegisterRequest) => Promise<AuthResult>;
  updateProfile: (updateData: UpdateUserRequest) => Promise<AuthResult>;
  resetPassword: (email: string) => Promise<AuthResult>;
  confirmResetPassword: (data: {
    email: string;
    new_password: string;
    otp: string;
  }) => Promise<AuthResult>;
  isAuthenticated: boolean;
}
