import { shouldShowDevControls } from "../config/devConfig";

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

export const validatePassword = (password: string) => {
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

export const validateName = (name: string) => {
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
  if (/\d/.test(name)) {
    return { isValid: false, message: "Tên không được chứa số" };
  }
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
  const lowerName = name.toLowerCase();
  for (const badWord of BAD_WORDS) {
    if (lowerName.includes(badWord.toLowerCase())) {
      return { isValid: false, message: "Tên chứa từ ngữ không phù hợp" };
    }
  }
  return { isValid: true, message: "Tên hợp lệ" };
};

export const validatePhone = (phone: string) => {
  if (shouldShowDevControls()) {
    return { isValid: true, message: "Dev mode: Validation bypassed" };
  }
  if (!phone.trim()) {
    return { isValid: false, message: "Số điện thoại không được để trống" };
  }
  const cleanPhone = phone.replace(/[\s\-().]/g, "");
  const vnPhonePatterns = [
    /^(\+84|84|0)(3[2-9]|5[689]|7[06-9]|8[1-689]|9[0-46-9])\d{7}$/,
    /^(\+84|84|0)(2[0-9])\d{8}$/,
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

export const formatPhoneNumber = (phone: string): string => {
  const cleanPhone = phone.replace(/[\s\-().]/g, "");
  if (/^0\d{9}$/.test(cleanPhone)) {
    return cleanPhone.replace(/(\d{4})(\d{3})(\d{3})/, "$1 $2 $3");
  }
  if (/^0\d{10}$/.test(cleanPhone)) {
    return cleanPhone.replace(/(\d{3})(\d{4})(\d{4})/, "$1 $2 $3");
  }
  return phone;
};

export const getPasswordStrength = (
  password: string
): { score: number; label: string; color: string } => {
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
