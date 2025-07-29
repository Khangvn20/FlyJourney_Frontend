export interface FlightResultData {
  id: string;
  airline: string;
  airlineCode: string;
  flightNumber: string;
  aircraft: string;
  departure: {
    airport: string;
    code: string;
    time: string;
    date: string;
  };
  arrival: {
    airport: string;
    code: string;
    time: string;
    date: string;
  };
  duration: string;
  price: {
    amount: number;
    currency: string;
    formatted: string;
  };
  class: string;
  amenities: string[];
  stops: number;
  availableSeats: number;
}
