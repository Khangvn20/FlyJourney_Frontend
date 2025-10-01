export interface PassengerCounts {
  adults: number;
  children: number;
  infants: number;
}

export type PassengerCountsLike = Partial<{
  adults: number | string | null | undefined;
  children: number | string | null | undefined;
  infants: number | string | null | undefined;
}>;

export interface FlightSegment {
  from: string;
  to: string;
  departureDate: Date | undefined;
}

export interface SearchFormData {
  from: string;
  to: string;
  departureDate: Date | undefined;
  returnDate: Date | undefined;
  tripType: string; // "one-way" | "round-trip" | "multi-city"
  multiCitySegments?: FlightSegment[];
  passengers: PassengerCounts;
  flightClass: string;
  specialRequirements: string;
  searchFullMonth: boolean;
  monthsCount?: number;
}

export interface FlightClass {
  value: string;
  label: string;
  description?: string;
}

export interface SpecialRequirement {
  value: string;
  label: string;
  description?: string;
}

// Flight search results
export interface FlightResult {
  id: number;
  flight: string;
  from: string;
  to: string;
  departure?: string;
  arrival?: string;
  departureTime?: string;
  arrivalTime?: string;
  duration?: string;
  price?: number;
  currency?: string;
  airline?: string;
  aircraft?: string;
  stops?: number;
  layovers?: string[];
  class?: string;
  bookingClass?: string;
  seatsAvailable?: number;
  departureTerminal?: string;
  arrivalTerminal?: string;
  departureGate?: string;
  arrivalGate?: string;
  baggage?: {
    checkedBaggage?: string;
    carryOn?: string;
  };
  amenities?: string[];
  refundable?: boolean;
  changeable?: boolean;
}
