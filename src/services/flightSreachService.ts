import type { FlightResult } from "../shared/types";

export const flightSearchService = async (
  _payload: Record<string, unknown>
): Promise<FlightResult[]> => {
  console.log("Mock search payload:", _payload);
  return [
    {
      id: 1,
      flight: "VN123",
      from: "HAN",
      to: "SGN",
      departure: "2024-01-20",
      arrival: "2024-01-20",
      departureTime: "08:00",
      arrivalTime: "10:30",
      duration: "2h 30m",
      price: 120,
      currency: "USD",
      airline: "Vietnam Airlines",
      aircraft: "Airbus A321",
      stops: 0,
      class: "Economy",
      bookingClass: "Y",
      seatsAvailable: 45,
      refundable: true,
      changeable: true,
    },
    {
      id: 2,
      flight: "VJ456",
      from: "SGN",
      to: "DAD",
      departure: "2024-01-20",
      arrival: "2024-01-20",
      departureTime: "14:15",
      arrivalTime: "15:45",
      duration: "1h 30m",
      price: 85,
      currency: "USD",
      airline: "VietJet Air",
      aircraft: "Airbus A320",
      stops: 0,
      class: "Economy",
      bookingClass: "Y",
      seatsAvailable: 32,
      refundable: false,
      changeable: true,
    },
  ];
};
