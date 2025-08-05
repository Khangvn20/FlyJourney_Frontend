import type { RegisterFormData } from "../shared/types/auth.types";
import type { RegisterRequest } from "../shared/types/backend-api.types";
import { DEV_CONFIG, shouldShowDevControls } from "../shared/config/devConfig";

/**
 * Convert RegisterFormData to RegisterRequest for API
 */
export const convertRegisterFormToRequest = (
  formData: RegisterFormData
): RegisterRequest => {
  return {
    name: formData.name,
    email: formData.email,
    password: formData.password,
    phone: formData.phone,
  };
};

// Credentials storage utilities
interface SavedCredentials {
  email: string;
  password: string;
}

const CREDENTIALS_KEY = "saved_credentials";
const REMEMBER_ME_KEY = "remember_me";

export const credentialsUtils = {
  /**
   * Save user credentials to localStorage
   */
  saveCredentials: (email: string, password: string): void => {
    try {
      const credentials: SavedCredentials = { email, password };
      localStorage.setItem(CREDENTIALS_KEY, JSON.stringify(credentials));
      localStorage.setItem(REMEMBER_ME_KEY, "true");
    } catch (error) {
      if (DEV_CONFIG.ENABLE_CONSOLE_LOGS && shouldShowDevControls()) {
        console.error("Failed to save credentials:", error);
      }
    }
  },

  /**
   * Load saved credentials from localStorage
   */
  loadCredentials: (): {
    credentials: SavedCredentials | null;
    rememberMe: boolean;
  } => {
    try {
      const rememberMe = localStorage.getItem(REMEMBER_ME_KEY) === "true";

      if (!rememberMe) {
        return { credentials: null, rememberMe: false };
      }

      const savedCredentials = localStorage.getItem(CREDENTIALS_KEY);
      if (!savedCredentials) {
        return { credentials: null, rememberMe: false };
      }

      const credentials = JSON.parse(savedCredentials) as SavedCredentials;
      return { credentials, rememberMe: true };
    } catch (error) {
      if (DEV_CONFIG.ENABLE_CONSOLE_LOGS && shouldShowDevControls()) {
        console.error("Failed to load credentials:", error);
      }
      return { credentials: null, rememberMe: false };
    }
  },

  /**
   * Clear saved credentials from localStorage
   */
  clearCredentials: (): void => {
    try {
      localStorage.removeItem(CREDENTIALS_KEY);
      localStorage.removeItem(REMEMBER_ME_KEY);
    } catch (error) {
      if (DEV_CONFIG.ENABLE_CONSOLE_LOGS && shouldShowDevControls()) {
        console.error("Failed to clear credentials:", error);
      }
    }
  },
};

/**
 * Validate register form data
 */
export const validateRegisterForm = (
  formData: RegisterFormData
): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  // Name validation
  if (!formData.name.trim()) {
    errors.push("Họ và tên không được để trống");
  } else if (formData.name.trim().length < 2) {
    errors.push("Họ và tên phải có ít nhất 2 ký tự");
  }

  // Email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!formData.email.trim()) {
    errors.push("Email không được để trống");
  } else if (!emailRegex.test(formData.email)) {
    errors.push("Email không hợp lệ");
  }

  // Phone validation
  const phoneRegex = /^[0-9]{10,11}$/;
  if (!formData.phone.trim()) {
    errors.push("Số điện thoại không được để trống");
  } else if (!phoneRegex.test(formData.phone.replace(/\s/g, ""))) {
    errors.push("Số điện thoại không hợp lệ (10-11 số)");
  }

  // Password validation
  if (!formData.password) {
    errors.push("Mật khẩu không được để trống");
  } else if (formData.password.length < 6) {
    errors.push("Mật khẩu phải có ít nhất 6 ký tự");
  }

  // Confirm password validation
  if (formData.password !== formData.confirmPassword) {
    errors.push("Mật khẩu xác nhận không khớp");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};
