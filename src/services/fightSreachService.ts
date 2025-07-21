import type { FlightResult } from "../shared/types/api.types";

export const flightSearchService = async (
  _payload: Record<string, unknown>
): Promise<FlightResult[]> => {
  console.log("Mock search payload:", _payload);
  return [
    { id: 1, flight: "VN123", from: "HAN", to: "SGN" },
    { id: 2, flight: "VJ456", from: "SGN", to: "DAD" },
  ];
};
