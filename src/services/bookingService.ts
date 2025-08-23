import { DEV_CONFIG, shouldShowDevControls } from "../shared/config/devConfig";
import { apiClient } from "../shared/utils/apiClient";
import type {
  BookingCreateRequest,
  BookingCreateResponse,
} from "../shared/types/booking-api.types";

/**
 * Create booking in backend
 * Wraps POST /flights/booking
 */
export async function createBooking(
  payload: BookingCreateRequest
): Promise<BookingCreateResponse> {
  if (DEV_CONFIG.ENABLE_CONSOLE_LOGS && shouldShowDevControls()) {
    console.log("📨 Sending booking payload:", payload);
  }
  const res = await apiClient.post<BookingCreateResponse>(
    apiClient.endpoints.flights.booking,
    payload
  );
  if (DEV_CONFIG.ENABLE_CONSOLE_LOGS && shouldShowDevControls()) {
    console.log("✅ Booking response:", res.data);
  }
  return res.data as BookingCreateResponse;
}

// Backwards compatibility export
export const bookingService = async (
  details: BookingCreateRequest
): Promise<BookingCreateResponse> => createBooking(details);
