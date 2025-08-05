import { DEV_CONFIG, shouldShowDevControls } from "../shared/config/devConfig";

export const bookingService = async (_details: Record<string, unknown>) => {
  if (DEV_CONFIG.ENABLE_CONSOLE_LOGS && shouldShowDevControls()) {
    console.log("Mock booking with:", _details);
  }
  return { status: "success", bookingId: "XYZ987" };
};
