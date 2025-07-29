/**
 * Development Configuration
 *
 * Set HIDE_DEV_CONTROLS to true to hide all dev controls across the application
 * Set to false to show dev controls for testing and development
 */
export const DEV_CONFIG = {
  // Set to true to hide all dev controls in production or when testing is complete
  HIDE_DEV_CONTROLS: false, //true,false

  // Other dev settings can be added here
  ENABLE_CONSOLE_LOGS: true,
  MOCK_API_DELAY: 1500,
} as const;

/**
 * Helper function to check if dev controls should be shown
 */
export const shouldShowDevControls = (): boolean => {
  return !DEV_CONFIG.HIDE_DEV_CONTROLS;
};
