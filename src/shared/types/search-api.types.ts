/**
 * Search API Response Types
 * Matches the actual API response structure from backend
 */

export interface FlightSearchApiResult {
  flight_id: number;
  flight_number: string;
  airline_name: string;
  airline_id: number;
  departure_airport_code: string;
  arrival_airport_code: string;
  departure_airport: string;
  arrival_airport: string;
  departure_time: string; // ISO format from API
  arrival_time: string; // ISO format from API
  duration_minutes: number;
  stops_count: number;
  distance: number;
  flight_class_id?: number; // newly added backend field (Aug 2025)
  flight_class: string;
  total_seats: number;
  fare_class_details: {
    fare_class_code: string;
    cabin_class: string;
    refundable: boolean;
    changeable: boolean;
    baggage_kg: string;
    description: string;
  };
  pricing: {
    base_prices: {
      adult: number;
      child: number;
      infant: number;
    };
    total_prices: {
      adult: number;
      child: number;
      infant: number;
    };
    taxes: {
      adult: number;
    };
    grand_total: number;
    currency: string;
  };
  tax_and_fees: number;
}

// One-way flight search response
export interface FlightSearchApiResponse {
  arrival_airport: string;
  arrival_date: string;
  departure_airport: string;
  departure_date: string;
  flight_class: string;
  limit: number;
  page: number;
  passengers: {
    adults: number;
    children: number;
    infants: number;
  };
  search_results: FlightSearchApiResult[];
  sort_by: string;
  sort_order: string;
  total_count: number;
  total_pages: number;
}

// Round-trip flight search response
export interface RoundTripFlightSearchApiResponse {
  arrival_airport: string;
  departure_airport: string;
  departure_date: string;
  return_date?: string;
  flight_class: string;
  limit: number;
  page: number;
  passengers: {
    adults: number;
    children?: number;
    infants?: number;
  };
  outbound_search_results: FlightSearchApiResult[];
  outbound_total_count: number;
  outbound_total_pages: number;
  inbound_search_results: FlightSearchApiResult[];
  inbound_total_count: number;
  inbound_total_pages: number;
  sort_by: string;
  sort_order: string;
}

// Union type for both one-way and round-trip responses
export type FlightSearchResponseData =
  | FlightSearchApiResponse
  | RoundTripFlightSearchApiResponse;

export interface FlightSearchApiWrapper {
  status: boolean;
  data: FlightSearchResponseData;
  errorCode?: string;
  errorMessage?: string;
}

// Helper type guards
export function isRoundTripResponse(
  data: FlightSearchResponseData
): data is RoundTripFlightSearchApiResponse {
  return "outbound_search_results" in data && "inbound_search_results" in data;
}

export function isOneWayResponse(
  data: FlightSearchResponseData
): data is FlightSearchApiResponse {
  return "search_results" in data;
}
