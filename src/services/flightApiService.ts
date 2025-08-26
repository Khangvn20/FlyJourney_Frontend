/**
 * Flight API Service - Real Backend Integration
 * Replaces mock flightSearchService with actual API calls
 */

import type {
  FlightApiResponse,
  FlightSearchOneWayRequest,
  FlightSearchRoundTripRequest,
  FlightSearchOneWayResponse,
  FlightSearchRoundTripResponse,
  FlightsByAirlineResponse,
  FlightsByStatusResponse,
  FlightDetail,
  FlightSearchParams,
  FlightClass,
} from "../shared/types/flight-api.types";
import type { FlightSearchApiWrapper } from "../shared/types/search-api.types";
import { flightApiConfig } from "../shared/constants/apiConfig";
import { DEV_CONFIG, shouldShowDevControls } from "../shared/config/devConfig";

// ===== BASE API UTILS =====

class FlightApiError extends Error {
  public code?: string;
  public status?: number;

  constructor(message: string, code?: string, status?: number) {
    super(message);
    this.name = "FlightApiError";
    this.code = code;
    this.status = status;
  }
}

const handleApiResponse = async <T>(response: Response): Promise<T> => {
  if (!response.ok) {
    const errorText = await response.text();
    if (DEV_CONFIG.ENABLE_CONSOLE_LOGS && shouldShowDevControls()) {
      console.error(`❌ HTTP Error ${response.status}:`, errorText);
    }
    throw new FlightApiError(
      `HTTP Error: ${response.status}`,
      "HTTP_ERROR",
      response.status
    );
  }

  const data: FlightApiResponse<T> = await response.json();
  if (DEV_CONFIG.ENABLE_CONSOLE_LOGS && shouldShowDevControls()) {
    console.log(`✅ API Response data:`, data);
  }

  if (!data.status) {
    if (DEV_CONFIG.ENABLE_CONSOLE_LOGS && shouldShowDevControls()) {
      console.error(`❌ API Error:`, data);
    }
    throw new FlightApiError(
      data.errorMessage || "API Error",
      data.errorCode || "API_ERROR"
    );
  }

  return data.data as T;
};

const makeApiRequest = async <T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> => {
  const url = `${flightApiConfig.baseUrl}${endpoint}`;

  try {
    if (DEV_CONFIG.ENABLE_CONSOLE_LOGS && shouldShowDevControls()) {
      console.log(`🌐 Making API request to: ${url}`);
      console.log(`📋 Request options:`, options);
    }

    const response = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options?.headers,
      },
    });

    if (DEV_CONFIG.ENABLE_CONSOLE_LOGS && shouldShowDevControls()) {
      console.log(
        `📈 Response status: ${response.status} ${response.statusText}`
      );
    }
    return handleApiResponse<T>(response);
  } catch (error) {
    if (error instanceof FlightApiError) {
      throw error;
    }

    if (DEV_CONFIG.ENABLE_CONSOLE_LOGS && shouldShowDevControls()) {
      console.error("Flight API Request failed:", error);
    }
    throw new FlightApiError(
      "Network error or server unavailable",
      "NETWORK_ERROR"
    );
  }
};

// ===== CORE API METHODS =====

/**
 * 1. Search One-Way Flights
 */
export const searchOneWayFlights = async (
  params: FlightSearchOneWayRequest
): Promise<FlightSearchOneWayResponse> => {
  if (DEV_CONFIG.ENABLE_CONSOLE_LOGS && shouldShowDevControls()) {
    console.log("🔍 Searching one-way flights with params:", params);
    console.log("📤 Request body:", JSON.stringify(params, null, 2));
  }

  return makeApiRequest<FlightSearchOneWayResponse>("/flights/search", {
    method: "POST",
    body: JSON.stringify(params),
  });
};

/**
 * 2. Search Round-Trip Flights
 */
export const searchRoundTripFlights = async (
  params: FlightSearchRoundTripRequest
): Promise<FlightSearchRoundTripResponse> => {
  if (DEV_CONFIG.ENABLE_CONSOLE_LOGS && shouldShowDevControls()) {
    console.log("🔄 Searching round-trip flights:", params);
  }

  return makeApiRequest<FlightSearchRoundTripResponse>(
    "/flights/search/roundtrip",
    {
      method: "POST",
      body: JSON.stringify(params),
    }
  );
};

/**
 * 3. Get Flight by ID
 */
export const getFlightById = async (id: number): Promise<FlightDetail> => {
  if (DEV_CONFIG.ENABLE_CONSOLE_LOGS && shouldShowDevControls()) {
    console.log("🆔 Getting flight by ID:", id);
  }

  return makeApiRequest<FlightDetail>(`/flights/${id}`, {
    method: "GET",
  });
};

/**
 * 4. Get Flights by Airline
 */
export const getFlightsByAirline = async (
  airlineId: number,
  page = 1,
  limit = 10
): Promise<FlightsByAirlineResponse> => {
  if (DEV_CONFIG.ENABLE_CONSOLE_LOGS && shouldShowDevControls()) {
    console.log("✈️ Getting flights by airline:", { airlineId, page, limit });
  }

  return makeApiRequest<FlightsByAirlineResponse>(
    `/flights/airline/${airlineId}?page=${page}&limit=${limit}`,
    { method: "GET" }
  );
};

/**
 * 5. Get Flights by Status
 */
export const getFlightsByStatus = async (
  status: string,
  page = 1,
  limit = 10
): Promise<FlightsByStatusResponse> => {
  if (DEV_CONFIG.ENABLE_CONSOLE_LOGS && shouldShowDevControls()) {
    console.log("🚦 Getting flights by status:", { status, page, limit });
  }

  return makeApiRequest<FlightsByStatusResponse>(
    `/flights/status/${status}?page=${page}&limit=${limit}`,
    { method: "GET" }
  );
};

// ===== UNIFIED SEARCH SERVICE =====

/**
 * Unified search method that handles both one-way and round-trip
 * This maintains compatibility with existing FlightSearchForm
 */
export const flightSearchService = async (
  params: FlightSearchParams
): Promise<FlightSearchApiWrapper> => {
  if (DEV_CONFIG.ENABLE_CONSOLE_LOGS && shouldShowDevControls()) {
    console.log("🚀 Unified flight search:", params);
  }

  if (params.tripType === "roundTrip") {
    throw new Error(
      "Round trip search not yet implemented with new API structure"
    );
  } else {
    // Create request in exact format as shown in Postman example
    const oneWayParams = {
      departure_airport_code: params.from,
      arrival_airport_code: params.to,
      departure_date: params.departureDate,
      flight_class: "all", // Use "all" to get all available flights as in Postman
      passenger: {
        adults: params.passengers.adults,
        children: params.passengers.children || 0,
        infants: params.passengers.infants || 0,
      },
      page: params.page || 1,
      limit: params.limit || 50,
      sort_by: params.sortBy || "price",
      sort_order: params.sortOrder || "asc",
    };

    if (DEV_CONFIG.ENABLE_CONSOLE_LOGS && shouldShowDevControls()) {
      console.log("🔍 Final one-way request params:", oneWayParams);
    }
    return makeApiRequest<FlightSearchApiWrapper>("/flights/search", {
      method: "POST",
      body: JSON.stringify(oneWayParams),
    });
  }
};

// ===== HELPER FUNCTIONS =====

/**
 * Format Date object to dd/mm/yyyy format required by API
 */
export const formatDateForApi = (date: Date): string => {
  const day = date.getDate().toString().padStart(2, "0");
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

/**
 * Map frontend form data to API request format
 */
export const mapFormToApiParams = (formData: {
  from: string;
  to: string;
  departureDate: string;
  returnDate?: string;
  passengers: { adults: number; children: number; infants: number };
  flightClass: string;
  tripType: "oneWay" | "roundTrip";
}): FlightSearchParams => {
  // Map flight class to API expected values
  const mapFlightClass = (frontendClass: string): FlightClass => {
    const classMap: { [key: string]: FlightClass } = {
      economy: "economy",
      premium: "premium_economy",
      business: "business",
      first: "first",
    };
    return classMap[frontendClass] || "economy";
  };

  return {
    tripType: formData.tripType,
    from: formData.from,
    to: formData.to,
    departureDate: formData.departureDate,
    returnDate: formData.returnDate,
    passengers: formData.passengers,
    flightClass: mapFlightClass(formData.flightClass),
    page: 1,
    limit: 50, // Increase limit to get more results
    sortBy: "price",
    sortOrder: "asc",
  };
};

// Export the main service for backward compatibility
export { flightSearchService as default };

// Export all for named imports
export * from "../shared/types/flight-api.types";
