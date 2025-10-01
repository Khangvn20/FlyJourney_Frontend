import { DEV_CONFIG, shouldShowDevControls } from "../shared/config/devConfig";
import { apiClient } from "../shared/utils/apiClient";
import type { ApiResponse } from "../shared/types/api.types";
import type {
  FlightSearchResponseData,
  FlightSearchApiResult,
} from "../shared/types/search-api.types";
import {
  isOneWayResponse,
  isRoundTripResponse,
} from "../shared/types/search-api.types";

interface AirportInfo {
  code: string;
  name: string;
  city?: string;
  country?: string;
}

// Cache to avoid duplicate API calls
const airportCache = new Map<string, AirportInfo>();

/**
 * Get airport information by code from various APIs
 */
export async function getAirportInfo(
  airportCode: string,
  token?: string
): Promise<AirportInfo | null> {
  if (!airportCode) return null;

  // Check cache first
  const cached = airportCache.get(airportCode);
  if (cached) {
    return cached;
  }

  try {
    // Strategy 1: Try to get from flights search API (might have airport info)
    const today = new Date().toISOString().split("T")[0];
    const searchResponse = (await apiClient.get(
      `${apiClient.endpoints.flights.search}?departure_airport=${airportCode}&arrival_airport=${airportCode}&departure_date=${today}`,
      token ? { Authorization: `Bearer ${token}` } : undefined
    )) as ApiResponse<FlightSearchResponseData>;

    if (DEV_CONFIG.ENABLE_CONSOLE_LOGS && shouldShowDevControls()) {
      console.log(`🏢 Search API response for ${airportCode}:`, searchResponse);
    }

    // Extract airport info from search results if available
    let airportInfo = extractAirportInfoFromSearchResponse(
      searchResponse,
      airportCode
    );

    if (!airportInfo) {
      // Strategy 2: Try dedicated airports API if exists
      try {
        const airportResponse = (await apiClient.get(
          `${apiClient.endpoints.flights.airports}/${airportCode}`,
          token ? { Authorization: `Bearer ${token}` } : undefined
        )) as ApiResponse<AirportInfo>;

        if (DEV_CONFIG.ENABLE_CONSOLE_LOGS && shouldShowDevControls()) {
          console.log(
            `🏢 Airport API response for ${airportCode}:`,
            airportResponse
          );
        }

        airportInfo = extractAirportInfoFromAirportResponse(airportResponse);
      } catch (airportError) {
        if (DEV_CONFIG.ENABLE_CONSOLE_LOGS && shouldShowDevControls()) {
          console.log(
            `⚠️ Airport API not available for ${airportCode}:`,
            airportError
          );
        }
      }
    }

    if (!airportInfo) {
      // Strategy 3: Try to get from any flight that has this airport
      try {
        const flightResponse = (await apiClient.get(
          `${apiClient.endpoints.flights.search}?departure_airport_code=${airportCode}`,
          token ? { Authorization: `Bearer ${token}` } : undefined
        )) as ApiResponse<FlightSearchApiResult[]>;

        if (DEV_CONFIG.ENABLE_CONSOLE_LOGS && shouldShowDevControls()) {
          console.log(
            `🛫 Flight list API response for ${airportCode}:`,
            flightResponse
          );
        }

        airportInfo = extractAirportInfoFromFlightResponse(
          flightResponse,
          airportCode
        );
      } catch (flightError) {
        if (DEV_CONFIG.ENABLE_CONSOLE_LOGS && shouldShowDevControls()) {
          console.log(
            `⚠️ Flight list API failed for ${airportCode}:`,
            flightError
          );
        }
      }
    }

    if (airportInfo) {
      // Cache the result
      airportCache.set(airportCode, airportInfo);
      return airportInfo;
    }

    // Fallback: return code as name if no API worked
    const fallback: AirportInfo = {
      code: airportCode,
      name: airportCode, // Will show code as name
    };
    airportCache.set(airportCode, fallback);
    return fallback;
  } catch (error) {
    if (DEV_CONFIG.ENABLE_CONSOLE_LOGS && shouldShowDevControls()) {
      console.error(`❌ Error getting airport info for ${airportCode}:`, error);
    }
    return null;
  }
}

/**
 * Extract airport info from flight search API response
 */
function extractAirportInfoFromSearchResponse(
  response: ApiResponse<FlightSearchResponseData>,
  airportCode: string
): AirportInfo | null {
  try {
    const responseData = response.data;

    if (!responseData) return null;
    let flights: FlightSearchApiResult[] = [];
    if (isOneWayResponse(responseData)) {
      flights = responseData.search_results;
    } else if (isRoundTripResponse(responseData)) {
      flights = [
        ...responseData.outbound_search_results,
        ...responseData.inbound_search_results,
      ];
    }

    // Look for airport info in any flight
    for (const flight of flights) {
      // Check departure airport
      if (flight.departure_airport_code === airportCode) {
        const name = flight.departure_airport;
        if (name && name !== airportCode) {
          return {
            code: airportCode,
            name: name,
            city: undefined,
          };
        }
      }

      // Check arrival airport
      if (flight.arrival_airport_code === airportCode) {
        const name = flight.arrival_airport;
        if (name && name !== airportCode) {
          return {
            code: airportCode,
            name: name,
            city: undefined,
          };
        }
      }
    }

    return null;
  } catch {
    return null;
  }
}

/**
 * Extract airport info from dedicated airport API response
 */
function extractAirportInfoFromAirportResponse(
  response: ApiResponse<AirportInfo>
): AirportInfo | null {
  try {
    const airport = response.data;

    if (airport?.code) {
      return {
        code: airport.code,
        name: airport.name,
        city: airport.city,
        country: airport.country,
      };
    }

    return null;
  } catch {
    return null;
  }
}

/**
 * Extract airport info from flight list API response
 */
function extractAirportInfoFromFlightResponse(
  response: ApiResponse<FlightSearchApiResult[]>,
  airportCode: string
): AirportInfo | null {
  try {
    const flights = response.data || [];

    // Look for any flight that has this airport code
    for (const flight of flights) {
      if (flight.departure_airport_code === airportCode) {
        const name = flight.departure_airport;
        if (name && name !== airportCode) {
          return {
            code: airportCode,
            name: name,
          };
        }
      }

      if (flight.arrival_airport_code === airportCode) {
        const name = flight.arrival_airport;
        if (name && name !== airportCode) {
          return {
            code: airportCode,
            name: name,
          };
        }
      }
    }

    return null;
  } catch {
    return null;
  }
}

/**
 * Get multiple airports info in parallel
 */
export async function getMultipleAirportsInfo(
  airportCodes: string[],
  token?: string
): Promise<Map<string, AirportInfo>> {
  const results = new Map<string, AirportInfo>();

  // Filter out duplicates and empty codes
  const uniqueCodes = [
    ...new Set(airportCodes.filter((code) => code && code.trim())),
  ];

  // Get all airport info in parallel
  const promises = uniqueCodes.map(async (code) => {
    const info = await getAirportInfo(code, token);
    if (info) {
      results.set(code, info);
    }
  });

  await Promise.all(promises);

  if (DEV_CONFIG.ENABLE_CONSOLE_LOGS && shouldShowDevControls()) {
    console.log(
      `🏢 Retrieved airport info for ${results.size}/${uniqueCodes.length} airports:`,
      results
    );
  }

  return results;
}

/**
 * Clear airport cache (useful for testing or when data changes)
 */
export function clearAirportCache(): void {
  airportCache.clear();
  if (DEV_CONFIG.ENABLE_CONSOLE_LOGS && shouldShowDevControls()) {
    console.log("🧹 Airport cache cleared");
  }
}
