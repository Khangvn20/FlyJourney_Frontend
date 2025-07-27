export interface PassengerCounts {
  adults: number;
  children: number;
  infants: number;
}

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
}

export interface Airport {
  code: string;
  name: string;
  city: string;
  country: string;
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
