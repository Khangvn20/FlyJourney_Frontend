// Barrel exports for shared utilities (explicit to satisfy strict module resolution)
export * from "./style.ts";
export { testDirectAPI, testCORS } from "./apiDebug.ts";
export {
  convertRegisterFormToRequest,
  credentialsUtils,
  validateRegisterForm,
} from "./registerFormHelpers.ts";
export {
  validatePassword,
  validateName,
  validatePhone,
  formatPhoneNumber,
  getPasswordStrength,
} from "./userMenuValidation.ts";
export { formatPrice, formatDateTime, formatDuration } from "./format.ts";
