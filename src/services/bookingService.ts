import { DEV_CONFIG, shouldShowDevControls } from "../shared/config/devConfig";
import { apiClient } from "../shared/utils/apiClient";
import type {
  BookingCreateRequest,
  BookingCreateResponse,
} from "../shared/types/booking-api.types";
import type { BookingRecord } from "../shared/types/passenger.types";
import type { FlightSearchApiResult } from "../shared/types/search-api.types";
import { getAirlineFromFlightNumber } from "../shared/constants/airlines";

/**
 * Type guard to validate if data is a BookingRecord array
 */
function isBookingRecordArray(data: unknown): data is BookingRecord[] {
  if (!Array.isArray(data)) {
    return false;
  }

  // Check if all items have required BookingRecord properties
  return data.every(
    (item) =>
      typeof item === "object" &&
      item !== null &&
      "bookingId" in item &&
      "status" in item &&
      "totalPrice" in item &&
      "passengers" in item &&
      "createdAt" in item
  );
}

/**
 * Convert backend booking format to frontend BookingRecord format
 */
function convertBackendBookingToFrontend(backendBooking: unknown): BookingRecord {
  const booking = backendBooking as Record<string, unknown>;
  
  // Map backend snake_case to frontend camelCase
  const status = (booking.status as string) || 'PENDING';
  const paymentMethod = (booking.payment_method as string) || 'office';
  
  return {
    bookingId: String(booking.booking_id || ''),
    status: ['PENDING', 'CONFIRMED', 'CANCELLED'].includes(status)
      ? (status as 'PENDING' | 'CONFIRMED' | 'CANCELLED')
      : 'PENDING',
    totalPrice: Number(booking.total_price || 0),
    currency: (booking.currency as string) || 'VND',
    passengers: [], // Will be populated from booking details if needed
    createdAt: (booking.booking_date as string) || (booking.created_at as string) || new Date().toISOString(),
    tripType: booking.return_flight_id ? 'round-trip' : 'one-way',
    paymentMethod: ['vnpay', 'card', 'office'].includes(paymentMethod)
      ? (paymentMethod as 'vnpay' | 'card' | 'office')
      : 'office',
    // Required BookingPayload properties
    outboundFlightId: Number(booking.flight_id || 0),
    inboundFlightId: booking.return_flight_id ? Number(booking.return_flight_id) : undefined,
    selectedFlights: booking.flight_details ? {
      outbound: {
        flight_number: String((booking.flight_details as Record<string, unknown>).flight_number || ''),
        departure_airport_code: String((booking.flight_details as Record<string, unknown>).departure_airport_code || ''),
        arrival_airport_code: String((booking.flight_details as Record<string, unknown>).arrival_airport_code || ''),
        departure_time: String((booking.flight_details as Record<string, unknown>).departure_time || ''),
        airline_name: String((booking.flight_details as Record<string, unknown>).airline_name || ''),
        flight_id: Number(booking.flight_id || 0),
        flight_class_id: Number((booking.flight_details as Record<string, unknown>).flight_class_id || 1),
        // Add required FlightSearchApiResult properties with defaults
        arrival_time: String((booking.flight_details as Record<string, unknown>).arrival_time || ''),
        duration_minutes: Number((booking.flight_details as Record<string, unknown>).duration_minutes || 0),
        aircraft_type: String((booking.flight_details as Record<string, unknown>).aircraft_type || ''),
        pricing: {
          base_price: Number(booking.total_price || 0),
          total_prices: {
            adult: Number(booking.total_price || 0),
            child: 0,
            infant: 0
          }
        }
      } as unknown as FlightSearchApiResult // Cast to proper type via unknown
    } : undefined,
    contact: {
      fullName: String(booking.contact_name || ''),
      email: String(booking.contact_email || ''),
      phone: String(booking.contact_phone || '')
    },
    note: booking.note as string,
    selectedSeats: (booking.selected_seats as string[]) || [],
    holdExpiresAt: booking.hold_expires_at as string
  };
}

/**
 * Normalize API response to ensure consistent BookingRecord array format
 */
function normalizeBookingsResponse(data: unknown): BookingRecord[] {
  if (DEV_CONFIG.ENABLE_CONSOLE_LOGS && shouldShowDevControls()) {
    console.log("🔍 Raw API response structure:", {
      type: typeof data,
      isArray: Array.isArray(data),
      data: data,
    });
  }

  // Handle different response formats
  if (isBookingRecordArray(data)) {
    return data;
  }

  // Handle wrapped response (e.g., { bookings: [...] })
  if (typeof data === "object" && data !== null) {
    const obj = data as Record<string, unknown>;

    // Try common wrapper property names
    const possibleArrays = ["bookings", "data", "results", "items"];
    for (const prop of possibleArrays) {
      if (prop in obj && Array.isArray(obj[prop])) {
        if (DEV_CONFIG.ENABLE_CONSOLE_LOGS && shouldShowDevControls()) {
          console.log(`📦 Found array in property: ${prop}, length: ${(obj[prop] as unknown[]).length}`);
        }
        
        // Convert backend format to frontend format
        const backendArray = obj[prop] as unknown[];
        const convertedArray = backendArray.map(convertBackendBookingToFrontend);
        
        if (DEV_CONFIG.ENABLE_CONSOLE_LOGS && shouldShowDevControls()) {
          console.log(`📦 Converted ${backendArray.length} bookings from backend format`);
          console.log(`📦 First converted booking:`, convertedArray[0]);
        }
        
        return convertedArray as BookingRecord[];
      }
    }
  }

  // If we can't normalize the data, log the issue and return empty array
  console.error("❌ Unable to normalize bookings response:", data);
  return [];
}

/**
 * Create booking in backend
 * Wraps POST /flights/booking
 */
export async function createBooking(
  payload: BookingCreateRequest
): Promise<BookingCreateResponse> {
  if (typeof payload.total_price !== "number") {
    throw new Error("booking payload missing total_price");
  }
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

/**
 * Get flight details by flight ID
 * Wraps GET /flights/:flightId
 */
export async function getFlightById(
  flightId: number,
  token?: string
): Promise<unknown> {
  try {
    const headers = token ? { Authorization: `Bearer ${token}` } : undefined;
    const res = await apiClient.get<unknown>(
      `/flights/${flightId}`,
      headers
    );
    
    if (DEV_CONFIG.ENABLE_CONSOLE_LOGS && shouldShowDevControls()) {
      console.log(`🛩️ Flight ${flightId} API response:`, res.data);
    }

    return res.data;
  } catch (error) {
    console.error(`❌ Error fetching flight ${flightId}:`, error);
    return null;
  }
}

/**
 * Get single booking by booking ID with enhanced flight details
 * Wraps GET /booking/:bookingId and enriches with flight data
 */
export async function getBookingById(
  bookingId: string,
  token?: string
): Promise<BookingRecord | null> {
  try {
    const headers = token ? { Authorization: `Bearer ${token}` } : undefined;
    const res = await apiClient.get<unknown>(
      `${apiClient.endpoints.flights.booking}/${bookingId}`,
      headers
    );
    
    if (DEV_CONFIG.ENABLE_CONSOLE_LOGS && shouldShowDevControls()) {
      console.log("📋 Single booking API response:", res);
      console.log("📋 Response data:", res.data);
    }

    // Handle single booking response
    if (typeof res.data === "object" && res.data !== null) {
      const responseData = res.data as Record<string, unknown>;
      
      // Check if it's wrapped in data property
      const bookingData = responseData.data || responseData;
      
      if (bookingData && typeof bookingData === "object") {
        const convertedBooking = convertBackendBookingToFrontend(bookingData);
        
        // Enhance with flight details
        const enhancedBooking = await enhanceBookingWithFlightDetails(convertedBooking, token);
        
        if (DEV_CONFIG.ENABLE_CONSOLE_LOGS && shouldShowDevControls()) {
          console.log("📋 Enhanced single booking:", enhancedBooking);
        }
        
        return enhancedBooking;
      }
    }

    return null;
  } catch (error) {
    console.error("❌ Error in getBookingById:", error);
    throw error;
  }
}

/**
 * Get bookings for a specific user
 * Wraps GET /booking/user/:userId
 */
export async function getBookingsByUser(
  userId: string,
  token?: string
): Promise<BookingRecord[]> {
  try {
    const headers = token ? { Authorization: `Bearer ${token}` } : undefined;
    const res = await apiClient.get<unknown>(
      `${apiClient.endpoints.user.bookings}/${userId}`,
      headers
    );
    
    if (DEV_CONFIG.ENABLE_CONSOLE_LOGS && shouldShowDevControls()) {
      console.log("📋 Raw API response:", res);
      console.log("📋 Response data type:", typeof res.data);
      console.log("📋 Response data:", res.data);
    }

    // Normalize the response to ensure consistent format
    const normalizedBookings = normalizeBookingsResponse(res.data);
    
    // Enhance bookings with flight details
    const enhancedBookings = await Promise.all(
      normalizedBookings.map(booking => enhanceBookingWithFlightDetails(booking, token))
    );
    
    if (DEV_CONFIG.ENABLE_CONSOLE_LOGS && shouldShowDevControls()) {
      console.log("📋 Enhanced bookings:", enhancedBookings);
      if (enhancedBookings.length > 0) {
        console.log("📋 Checking enhanced bookings:",
          enhancedBookings.map(b => ({
            bookingId: b.bookingId,
            totalPrice: b.totalPrice ?? "undefined",
            currency: b.currency,
            hasFlightDetails: !!b.selectedFlights?.outbound?.flight_number
          }))
        );
      } else {
        console.log("📋 No bookings after enhancement.");
      }
    }

    return enhancedBookings;
  } catch (error) {
    console.error("❌ Error in getBookingsByUser:", error);
    
    // Enhanced error logging
    if (error instanceof Error) {
      console.error("❌ Error details:", {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
    }
    
    throw error;
  }
}

/**
 * Enhance booking with detailed flight information
 */
async function enhanceBookingWithFlightDetails(
  booking: BookingRecord,
  token?: string
): Promise<BookingRecord> {
  try {
    // Get outbound flight details
    if (booking.outboundFlightId) {
      const outboundFlight = await getFlightById(booking.outboundFlightId, token);
      if (outboundFlight && (outboundFlight as unknown as { data: unknown }).data) {
        const flightData = (outboundFlight as unknown as { data: Record<string, unknown> }).data;
        booking.selectedFlights = {
          ...booking.selectedFlights,
          outbound: {
            flight_id: (flightData.flight_id as number) || booking.outboundFlightId,
            flight_number: (flightData.flight_number as string) || `FL${booking.outboundFlightId}`,
            airline_name: (flightData.airline_name as string) ||
              getAirlineFromFlightNumber((flightData.flight_number as string) || `FL${booking.outboundFlightId}`)?.name ||
              "Unknown Airline",
            departure_airport_code: (flightData.departure_airport_code as string) || "---",
            arrival_airport_code: (flightData.arrival_airport_code as string) || "---",
            departure_time: (flightData.departure_time as string) || new Date().toISOString(),
            arrival_time: (flightData.arrival_time as string) || new Date().toISOString(),
            duration_minutes: (flightData.duration_minutes as number) || 0,
            flight_class_id: (flightData.flight_class_id as number) || 1,
            // Add other required properties with defaults
            airline_id: (flightData.airline_id as number) || 0,
            departure_airport: (flightData.departure_airport as string) || "",
            arrival_airport: (flightData.arrival_airport as string) || "",
            stops_count: (flightData.stops_count as number) || 0,
            distance: (flightData.distance as number) || 0,
            flight_class: (flightData.flight_class as string) || "ECONOMY",
            total_seats: (flightData.total_seats as number) || 0,
            fare_class_details: (flightData.fare_class_details as unknown as {
              fare_class_code: string;
              cabin_class: string;
              refundable: boolean;
              changeable: boolean;
              baggage_kg: string;
              description: string;
            }) || {
              fare_class_code: "ECON",
              cabin_class: "ECONOMY",
              refundable: false,
              changeable: false,
              baggage_kg: "20kg",
              description: "Standard fare"
            },
            pricing: (flightData.pricing as unknown as {
              base_prices: { adult: number; child: number; infant: number };
              total_prices: { adult: number; child: number; infant: number };
              taxes: { adult: number };
              grand_total: number;
              currency: string;
            }) || {
              base_prices: { adult: booking.totalPrice, child: 0, infant: 0 },
              total_prices: { adult: booking.totalPrice, child: 0, infant: 0 },
              taxes: { adult: 0 },
              grand_total: booking.totalPrice,
              currency: booking.currency
            },
            tax_and_fees: (flightData.tax_and_fees as number) || 0
          }
        };
      }
    }

    // Get inbound flight details if round-trip
    if (booking.inboundFlightId) {
      const inboundFlight = await getFlightById(booking.inboundFlightId, token);
      if (inboundFlight && (inboundFlight as unknown as { data: unknown }).data) {
        const flightData = (inboundFlight as unknown as { data: Record<string, unknown> }).data;
        if (!booking.selectedFlights) {
          booking.selectedFlights = { outbound: {} as unknown as FlightSearchApiResult };
        }
        booking.selectedFlights.inbound = {
          // Similar structure as outbound
          flight_id: (flightData.flight_id as number) || booking.inboundFlightId,
          flight_number: (flightData.flight_number as string) || `FL${booking.inboundFlightId}`,
          airline_name: (flightData.airline_name as string) ||
            getAirlineFromFlightNumber((flightData.flight_number as string) || `FL${booking.inboundFlightId}`)?.name ||
            "Unknown Airline",
          departure_airport_code: (flightData.departure_airport_code as string) || "---",
          arrival_airport_code: (flightData.arrival_airport_code as string) || "---",
          departure_time: (flightData.departure_time as string) || new Date().toISOString(),
          arrival_time: (flightData.arrival_time as string) || new Date().toISOString(),
          duration_minutes: (flightData.duration_minutes as number) || 0,
          flight_class_id: (flightData.flight_class_id as number) || 1,
          // Add other required properties
          airline_id: (flightData.airline_id as number) || 0,
          departure_airport: (flightData.departure_airport as string) || "",
          arrival_airport: (flightData.arrival_airport as string) || "",
          stops_count: (flightData.stops_count as number) || 0,
          distance: (flightData.distance as number) || 0,
          flight_class: (flightData.flight_class as string) || "ECONOMY",
          total_seats: (flightData.total_seats as number) || 0,
          fare_class_details: (flightData.fare_class_details as unknown as {
            fare_class_code: string;
            cabin_class: string;
            refundable: boolean;
            changeable: boolean;
            baggage_kg: string;
            description: string;
          }) || {
            fare_class_code: "ECON",
            cabin_class: "ECONOMY",
            refundable: false,
            changeable: false,
            baggage_kg: "20kg",
            description: "Standard fare"
          },
          pricing: (flightData.pricing as unknown as {
            base_prices: { adult: number; child: number; infant: number };
            total_prices: { adult: number; child: number; infant: number };
            taxes: { adult: number };
            grand_total: number;
            currency: string;
          }) || {
            base_prices: { adult: booking.totalPrice / 2, child: 0, infant: 0 },
            total_prices: { adult: booking.totalPrice / 2, child: 0, infant: 0 },
            taxes: { adult: 0 },
            grand_total: booking.totalPrice / 2,
            currency: booking.currency
          },
          tax_and_fees: (flightData.tax_and_fees as number) || 0
        } as unknown as FlightSearchApiResult;
      }
    }

    return booking;
  } catch (error) {
    console.error("❌ Error enhancing booking with flight details:", error);
    return booking; // Return original booking if enhancement fails
  }
}

export const bookingService = {
  createBooking,
  getBookingsByUser,
  getBookingById,
  getFlightById,
};

export default bookingService;
