export interface FlightSearchApiResult {
  flight_number: string;
  airline_name: string;
  departure_time: string;
  arrival_time: string;
  duration_minutes: number;
  stops_count: number;
  departure_airport_code: string;
  arrival_airport_code: string;
  departure_airport: string;
  arrival_airport: string;
  flight_class: "economy" | "premium_economy" | "business" | "first";
  fare_class_details: {
    fare_class_code: string;
    cabin_class: string;
    refundable: boolean;
    changeable: boolean;
    baggage_kg: string;
    description: string;
    refund_change_policy?: string;
  };
  pricing: {
    base_prices: { adult: number; child: number; infant: number };
    total_prices: { adult: number; child: number; infant: number };
    taxes: { adult: number };
    grand_total: number;
    currency: string;
  };
}

export interface FlightCardProps {
  flight: FlightSearchApiResult;
  isExpanded: boolean;
  onToggleDetails: () => void;
  onSelect: () => void;
  sortBy:
    | "price"
    | "price_asc"
    | "price_desc"
    | "duration"
    | "departure_time"
    | "arrival_time"
    | string; // fallback for unknown legacy values
  airlineLogo: string;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isSelected?: boolean;
}
