/**
 * Flight API Types - Based on Backend API Documentation
 * Generated on August 4, 2025
 */

// ===== REQUEST TYPES =====

export interface FlightSearchOneWayRequest {
  departure_airport_code: string; // "HAN", "SGN", etc.
  arrival_airport_code: string; // "SGN", "DAD", etc.
  departure_date: string; // "04/08/2025" (dd/mm/yyyy format required by API)
  passenger: {
    adults: number; // 1-9
    children?: number; // 0-9
    infants?: number; // 0-9
  };
  flight_class: FlightClass;
  airline_ids?: number[];
  max_stops?: number;
  page?: number;
  limit?: number;
  sort_by?: FlightSortBy;
  sort_order?: "asc" | "desc";
}

export interface FlightSearchRoundTripRequest {
  departure_airport_code: string;
  arrival_airport_code: string;
  departure_date: string; // "04/08/2025" (dd/mm/yyyy format required by API)
  return_date: string; // "10/08/2025" (dd/mm/yyyy format required by API)
  flight_class: FlightClass;
  passengers: {
    // Note: different field name for roundtrip
    adults: number;
    children?: number;
    infants?: number;
  };
  airline_ids?: number[];
  max_stops?: number;
  page?: number;
  limit?: number;
  sort_by?: FlightSortBy;
  sort_order?: "asc" | "desc";
}

// ===== RESPONSE TYPES =====

export interface FlightApiResponse<T = unknown> {
  status: boolean;
  data?: T;
  errorCode?: string;
  errorMessage?: string;
}

export interface FlightDetail {
  id: number;
  flight_number: string;
  flight_class_id: number;
  airline_name: string;
  departure_airport: string;
  arrival_airport: string;
  departure_time: string; // ISO 8601 UTC format
  arrival_time: string; // ISO 8601 UTC format
  duration_minutes: number;
  stops_count?: number;
  status?: FlightStatus;
  classes?: FlightClassInfo[];
}

export interface FlightClassInfo {
  class: FlightClass;
  base_price: number; // VND
  available_seats: number;
  base_price_child?: number; // VND
  base_price_infant?: number; // VND
}

export interface FlightSearchOneWayResponse {
  flights: FlightDetail[];
  pagination: FlightPagination;
}

export interface FlightSearchRoundTripResponse {
  outbound_flights: FlightDetail[];
  return_flights: FlightDetail[];
  total_price: number; // VND
  pagination: FlightPagination;
}

export interface FlightsByAirlineResponse {
  flights: FlightDetail[];
  pagination: FlightPagination;
}

export interface FlightsByStatusResponse {
  flights: FlightDetail[];
  pagination: FlightPagination;
}

export interface FlightPagination {
  page: number;
  limit: number;
  total: number;
}

// ===== ENUM TYPES =====

export type FlightClass =
  | "economy"
  | "premium_economy"
  | "business"
  | "first"
  | "all";

export type FlightStatus =
  | "scheduled"
  | "delayed"
  | "cancelled"
  | "boarding"
  | "departed"
  | "arrived"
  | "diverted";

export type FlightSortBy =
  | "departure_time"
  | "arrival_time"
  | "price"
  | "duration"
  | "stops";

// ===== MAPPING TYPES =====

/**
 * Map from current frontend FlightResult to new API FlightDetail
 */
export interface FlightResultMapping {
  // Current frontend format
  frontend: {
    id: number;
    flight: string;
    from: string;
    to: string;
    departure: string;
    arrival: string;
    departureTime: string;
    arrivalTime: string;
    duration: string;
    price: number;
    currency: string;
    airline: string;
    aircraft?: string;
    stops: number;
    class: string;
    bookingClass?: string;
    seatsAvailable: number;
    refundable?: boolean;
    changeable?: boolean;
  };

  // New API format
  api: FlightDetail;
}

// ===== UTILITY TYPES =====

export interface FlightSearchParams {
  tripType: "oneWay" | "roundTrip";
  from: string;
  to: string;
  departureDate: string;
  returnDate?: string;
  passengers: {
    adults: number;
    children: number;
    infants: number;
  };
  flightClass: FlightClass;
  airline_ids?: number[]; // optional filter by airline ids
  page?: number;
  limit?: number;
  sortBy?: FlightSortBy;
  sortOrder?: "asc" | "desc";
}

