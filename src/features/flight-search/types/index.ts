export interface FlightSearchFormData {
  from: string;
  to: string;
  departureDate?: string;
  returnDate?: string;
  dates?: [string, string];
  passengers: number;
  class: string;
}

export interface FlightSearchFilters {
  priceRange: [number, number];
  stops: number[];
  airlines: string[];
  departureTime?: string;
  arrivalTime?: string;
}

export interface FlightSearchState {
  searchData: FlightSearchFormData | null;
  filters: FlightSearchFilters;
  loading: boolean;
  error: string | null;
}