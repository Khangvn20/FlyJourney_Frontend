export const DEV_CONFIG = {
  // Set to true to hide all dev controls in production or when testing is complete
  HIDE_DEV_CONTROLS: true, // Set to false for testing console suppression
  // Other dev settings can be added here
  ENABLE_CONSOLE_LOGS: true,
  // Reduce duplicate logs in development
  REDUCE_DUPLICATE_LOGS: true,
  MOCK_API_DELAY: 1500,
  // Allow bypassing passenger name validations (for rapid QA flows)
  BYPASS_PASSENGER_NAME_VALIDATION: true,
  // Enable simple profanity / invalid token filtering on names
  ENABLE_NAME_PROFANITY_FILTER: true,
  // Allow bypassing passenger age validation (DOB vs type)
  BYPASS_PASSENGER_AGE_VALIDATION: false,
} as const;

/**
 * Helper function to check if dev controls should be shown
 */
export const shouldShowDevControls = (): boolean => {
  return !DEV_CONFIG.HIDE_DEV_CONTROLS;
};

/**
 * Helper for Check-in page dev button
 */
// Keep check-in dev button gated only by master dev control
