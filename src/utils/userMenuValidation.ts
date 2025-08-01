import { shouldShowDevControls } from "../shared/config/devConfig";

/**
 * UserMenu Validation Utilities
 *
 * Features:
 * - Password strength validation (same as register form)
 * - Vietnamese name validation (bad words filter)
 * - Vietnamese phone number validation
 * - Dev bypass mode for testing
 */

// Vietnamese bad words list (basic example - you should expand this)
const BAD_WORDS = [
  "shit",
  "fuck",
  "damn",
  "ass",
  "bitch",
  "bastard",
  "đệt",
  "đmm",
  "vcl",
  "clmm",
  "địt",
  "đụ",
  "cặc",
  "lồn",
  "chó",
  "loz",
  "dkm",
  "dmm",
  "cc",
  "ngu",
  "óc chó",
];

// Password validation (matching register form logic)
export const validatePassword = (password: string) => {
  // Bypass validation in dev mode
  if (shouldShowDevControls()) {
    return { isValid: true, message: "Dev mode: Validation bypassed" };
  }

  if (password.length < 8) {
    return { isValid: false, message: "Mật khẩu phải có ít nhất 8 ký tự" };
  }

  if (!/(?=.*[a-z])/.test(password)) {
    return { isValid: false, message: "Mật khẩu phải có ít nhất 1 chữ thường" };
  }

  if (!/(?=.*[A-Z])/.test(password)) {
    return { isValid: false, message: "Mật khẩu phải có ít nhất 1 chữ hoa" };
  }

  if (!/(?=.*\d)/.test(password)) {
    return { isValid: false, message: "Mật khẩu phải có ít nhất 1 số" };
  }

  if (!/(?=.*[!@#$%^&*(),.?":{}|<>])/.test(password)) {
    return {
      isValid: false,
      message: "Mật khẩu phải có ít nhất 1 ký tự đặc biệt",
    };
  }

  return { isValid: true, message: "Mật khẩu đủ mạnh" };
};

// Vietnamese name validation
export const validateName = (name: string) => {
  // Bypass validation in dev mode
  if (shouldShowDevControls()) {
    return { isValid: true, message: "Dev mode: Validation bypassed" };
  }

  if (!name.trim()) {
    return { isValid: false, message: "Tên không được để trống" };
  }

  if (name.trim().length < 2) {
    return { isValid: false, message: "Tên phải có ít nhất 2 ký tự" };
  }

  if (name.trim().length > 50) {
    return { isValid: false, message: "Tên không được quá 50 ký tự" };
  }

  // Check for numbers in name
  if (/\d/.test(name)) {
    return { isValid: false, message: "Tên không được chứa số" };
  }

  // Check for special characters (except Vietnamese characters, spaces, and common punctuation)
  if (
    !/^[a-zA-ZÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯĂÁÀẢẠĂẮẰẲẶÂẤẦẨẬÉÈẺẸÊẾỀỂỆÍÌỈỊÓÒỎỌÔỐỒỔỘƠỚỜỞỢÚÙỦỤƯỨỪỬỰÝỲỶỴ\s.'-]+$/.test(
      name
    )
  ) {
    return {
      isValid: false,
      message: "Tên chỉ được chứa chữ cái và khoảng trắng",
    };
  }

  // Check for bad words
  const lowerName = name.toLowerCase();
  for (const badWord of BAD_WORDS) {
    if (lowerName.includes(badWord.toLowerCase())) {
      return { isValid: false, message: "Tên chứa từ ngữ không phù hợp" };
    }
  }

  return { isValid: true, message: "Tên hợp lệ" };
};

// Vietnamese phone number validation
export const validatePhone = (phone: string) => {
  // Bypass validation in dev mode
  if (shouldShowDevControls()) {
    return { isValid: true, message: "Dev mode: Validation bypassed" };
  }

  if (!phone.trim()) {
    return { isValid: false, message: "Số điện thoại không được để trống" };
  }

  // Remove all spaces and special characters
  const cleanPhone = phone.replace(/[\s\-().]/g, "");

  // Vietnamese phone number patterns
  const vnPhonePatterns = [
    /^(\+84|84|0)(3[2-9]|5[689]|7[06-9]|8[1-689]|9[0-46-9])\d{7}$/, // Mobile
    /^(\+84|84|0)(2[0-9])\d{8}$/, // Landline
  ];

  const isValidFormat = vnPhonePatterns.some((pattern) =>
    pattern.test(cleanPhone)
  );

  if (!isValidFormat) {
    return {
      isValid: false,
      message: "Số điện thoại không đúng định dạng Việt Nam",
    };
  }

  return { isValid: true, message: "Số điện thoại hợp lệ" };
};

// Format phone number for display
export const formatPhoneNumber = (phone: string): string => {
  const cleanPhone = phone.replace(/[\s\-().]/g, "");

  // Format mobile numbers: 0xxx xxx xxx
  if (/^0\d{9}$/.test(cleanPhone)) {
    return cleanPhone.replace(/(\d{4})(\d{3})(\d{3})/, "$1 $2 $3");
  }

  // Format landline numbers: 0xx xxxx xxxx
  if (/^0\d{10}$/.test(cleanPhone)) {
    return cleanPhone.replace(/(\d{3})(\d{4})(\d{4})/, "$1 $2 $3");
  }

  return phone; // Return original if no pattern matches
};

// Password strength indicator
export const getPasswordStrength = (
  password: string
): {
  score: number;
  label: string;
  color: string;
} => {
  let score = 0;

  if (password.length >= 8) score++;
  if (/(?=.*[a-z])/.test(password)) score++;
  if (/(?=.*[A-Z])/.test(password)) score++;
  if (/(?=.*\d)/.test(password)) score++;
  if (/(?=.*[!@#$%^&*(),.?":{}|<>])/.test(password)) score++;

  const levels = [
    { label: "Rất yếu", color: "text-red-600" },
    { label: "Yếu", color: "text-orange-600" },
    { label: "Trung bình", color: "text-yellow-600" },
    { label: "Mạnh", color: "text-blue-600" },
    { label: "Rất mạnh", color: "text-green-600" },
  ];

  return {
    score,
    label: levels[score]?.label || "Không xác định",
    color: levels[score]?.color || "text-gray-400",
  };
};
