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

export interface FlightSearchApiWrapper {
  status: boolean;
  data: FlightSearchApiResponse;
  errorCode?: string;
  errorMessage?: string;
}
