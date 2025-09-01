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
    if (
      DEV_CONFIG.ENABLE_CONSOLE_LOGS &&
      shouldShowDevControls() &&
      !DEV_CONFIG.REDUCE_DUPLICATE_LOGS
    ) {
      console.error(`❌ HTTP Error ${response.status}:`, errorText);
    }
    throw new FlightApiError(
      `HTTP Error: ${response.status}`,
      "HTTP_ERROR",
      response.status
    );
  }

  const data: FlightApiResponse<T> = await response.json();
  // Debug: expose last parsed response + event for in-browser inspection
  try {
    (window as unknown as Record<string, unknown>)[
      "__FJ_DEBUG_LAST_RESPONSE__"
    ] = data;
    window.dispatchEvent(
      new CustomEvent("FJ_DEBUG_API", { detail: { phase: "response", data } })
    );
  } catch (e) {
    // Non-fatal: debugging instrumentation may be unavailable in some environments
    if (
      DEV_CONFIG.ENABLE_CONSOLE_LOGS &&
      shouldShowDevControls() &&
      !DEV_CONFIG.REDUCE_DUPLICATE_LOGS
    ) {
      console.debug("(debug) Unable to dispatch response debug event", e);
    }
  }
  if (
    DEV_CONFIG.ENABLE_CONSOLE_LOGS &&
    shouldShowDevControls() &&
    !DEV_CONFIG.REDUCE_DUPLICATE_LOGS
  ) {
    console.log(`✅ API Response data:`, data);
  }

  if (!data.status) {
    if (
      DEV_CONFIG.ENABLE_CONSOLE_LOGS &&
      shouldShowDevControls() &&
      !DEV_CONFIG.REDUCE_DUPLICATE_LOGS
    ) {
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
    if (
      DEV_CONFIG.ENABLE_CONSOLE_LOGS &&
      shouldShowDevControls() &&
      !DEV_CONFIG.REDUCE_DUPLICATE_LOGS
    ) {
      console.log(`🌐 Making API request to: ${url}`);
      console.log(`📋 Request options:`, options);
    }

    // Debug: expose last request with normalized shape and cURL
    try {
      const method = (options?.method || "GET").toUpperCase();
      const headers = {
        "Content-Type": "application/json",
        ...(options?.headers as Record<string, string> | undefined),
      };
      const bodyText =
        typeof options?.body === "string"
          ? options?.body
          : options?.body
          ? JSON.stringify(options.body)
          : undefined;
      const curlParts = [
        `curl -X ${method} '${url}'`,
        ...Object.entries(headers).map(([k, v]) => `-H '${k}: ${v}'`),
        bodyText ? `-d '${bodyText.replace(/'/g, "'\\''")}'` : undefined,
      ].filter(Boolean) as string[];
      const curl = curlParts.join(" ");
      const debugReq = {
        url,
        method,
        headers,
        body: bodyText ? JSON.parse(bodyText) : undefined,
        curl,
      };
      (window as unknown as Record<string, unknown>)[
        "__FJ_DEBUG_LAST_REQUEST__"
      ] = debugReq;
      window.dispatchEvent(
        new CustomEvent("FJ_DEBUG_API", {
          detail: { phase: "request", data: debugReq },
        })
      );
    } catch (e) {
      // Non-fatal: fail silently if constructing debug payload/cURL fails
      if (
        DEV_CONFIG.ENABLE_CONSOLE_LOGS &&
        shouldShowDevControls() &&
        !DEV_CONFIG.REDUCE_DUPLICATE_LOGS
      ) {
        console.debug("(debug) Unable to prepare request instrumentation", e);
      }
    }

    const response = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options?.headers,
      },
    });

    if (
      DEV_CONFIG.ENABLE_CONSOLE_LOGS &&
      shouldShowDevControls() &&
      !DEV_CONFIG.REDUCE_DUPLICATE_LOGS
    ) {
      console.log(
        `📈 Response status: ${response.status} ${response.statusText}`
      );
    }
    return handleApiResponse<T>(response);
  } catch (error) {
    if (error instanceof FlightApiError) {
      throw error;
    }

    if (
      DEV_CONFIG.ENABLE_CONSOLE_LOGS &&
      shouldShowDevControls() &&
      !DEV_CONFIG.REDUCE_DUPLICATE_LOGS
    ) {
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
  if (
    DEV_CONFIG.ENABLE_CONSOLE_LOGS &&
    shouldShowDevControls() &&
    !DEV_CONFIG.REDUCE_DUPLICATE_LOGS
  ) {
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
  if (
    DEV_CONFIG.ENABLE_CONSOLE_LOGS &&
    shouldShowDevControls() &&
    !DEV_CONFIG.REDUCE_DUPLICATE_LOGS
  ) {
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
  if (
    DEV_CONFIG.ENABLE_CONSOLE_LOGS &&
    shouldShowDevControls() &&
    !DEV_CONFIG.REDUCE_DUPLICATE_LOGS
  ) {
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
  if (
    DEV_CONFIG.ENABLE_CONSOLE_LOGS &&
    shouldShowDevControls() &&
    !DEV_CONFIG.REDUCE_DUPLICATE_LOGS
  ) {
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
  if (
    DEV_CONFIG.ENABLE_CONSOLE_LOGS &&
    shouldShowDevControls() &&
    !DEV_CONFIG.REDUCE_DUPLICATE_LOGS
  ) {
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
  if (
    DEV_CONFIG.ENABLE_CONSOLE_LOGS &&
    shouldShowDevControls() &&
    !DEV_CONFIG.REDUCE_DUPLICATE_LOGS
  ) {
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
      flight_class: params.flightClass, // Use flight class from params for consistency
      passenger: {
        adults: params.passengers.adults,
        children: params.passengers.children || 0,
        infants: params.passengers.infants || 0,
      },
      page: params.page || 1,
      limit: params.limit || 50,
      sort_by: params.sortBy || "price",
      sort_order: params.sortOrder || "asc",
      // Only include airline_ids if provided
      ...(params.airline_ids && params.airline_ids.length
        ? { airline_ids: params.airline_ids }
        : {}),
    } as const;

    if (
      DEV_CONFIG.ENABLE_CONSOLE_LOGS &&
      shouldShowDevControls() &&
      !DEV_CONFIG.REDUCE_DUPLICATE_LOGS
    ) {
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
