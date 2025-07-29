import { useState } from "react";
import type { FlightResult } from "../shared/types";

export const useFlightSearch = () => {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<FlightResult[]>([]);

  const searchFlights = async (_criteria: Record<string, string | Date>) => {
    setLoading(true);
    try {
      const mockResults: FlightResult[] = [
        { id: 1, flight: "VN123", from: "HAN", to: "SGN" },
        { id: 2, flight: "VJ456", from: "SGN", to: "DAD" },
      ];
      console.log("Searching with:", _criteria);
      setResults(mockResults);
    } catch (error) {
      console.error("Search failed:", error);
    } finally {
      setLoading(false);
    }
  };

  return { loading, results, searchFlights };
};
