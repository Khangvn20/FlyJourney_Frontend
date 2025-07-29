// Legacy export for backward compatibility
export const API_BASE =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api";

// Re-export from new config structure
export { apiConfig, apiEndpoints, apiSettings } from "./apiConfig";
