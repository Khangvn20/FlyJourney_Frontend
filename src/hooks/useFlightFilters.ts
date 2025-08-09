import { useMemo } from "react";
import type { FlightSearchApiResult } from "../shared/types/search-api.types";

interface FilterCriteria {
  priceRange: string;
  departureTime: string;
  stops: string;
  duration: string;
  sortBy: string;
}

interface UseFlightFiltersProps {
  flights: FlightSearchApiResult[];
  selectedAirlines: string[];
  filters: FilterCriteria;
}

export const useFlightFilters = ({
  flights,
  selectedAirlines,
  filters,
}: UseFlightFiltersProps) => {
  const filteredFlights = useMemo(() => {
    const safeFlights: FlightSearchApiResult[] = Array.isArray(flights)
      ? flights
      : (flights as unknown as FlightSearchApiResult[]) || [];
    return safeFlights
      .filter((flight) => {
        // Airline filter
        if (selectedAirlines.length > 0) {
          const airlineMatch = selectedAirlines.some(
            (selectedId) =>
              flight.airline_name.toLowerCase().replace(/\s+/g, "-") ===
              selectedId
          );
          if (!airlineMatch) return false;
        }

        // Departure time filter
        if (filters.departureTime !== "all") {
          const departureHour = new Date(flight.departure_time).getHours();
          let timeMatch = false;

          switch (filters.departureTime) {
            case "morning":
              timeMatch = departureHour >= 6 && departureHour < 12;
              break;
            case "afternoon":
              timeMatch = departureHour >= 12 && departureHour < 18;
              break;
            case "evening":
              timeMatch = departureHour >= 18 && departureHour < 24;
              break;
            case "night":
              timeMatch = departureHour >= 0 && departureHour < 6;
              break;
          }
          if (!timeMatch) return false;
        }

        // Stops filter
        if (filters.stops !== "all") {
          let stopsMatch = false;

          switch (filters.stops) {
            case "direct":
              stopsMatch = flight.stops_count === 0;
              break;
            case "one-stop":
              stopsMatch = flight.stops_count === 1;
              break;
            case "multi-stop":
              stopsMatch = flight.stops_count >= 2;
              break;
          }
          if (!stopsMatch) return false;
        }

        // Duration filter
        if (filters.duration !== "all") {
          let durationMatch = false;

          switch (filters.duration) {
            case "short":
              durationMatch = flight.duration_minutes <= 120;
              break;
            case "medium":
              durationMatch =
                flight.duration_minutes > 120 && flight.duration_minutes <= 300;
              break;
            case "long":
              durationMatch = flight.duration_minutes > 300;
              break;
          }
          if (!durationMatch) return false;
        }

        return true;
      })
      .sort((a, b) => {
        let result = 0;
        switch (filters.sortBy) {
          case "price":
            result = a.pricing.grand_total - b.pricing.grand_total;
            break;
          case "departure":
            result =
              new Date(a.departure_time).getTime() -
              new Date(b.departure_time).getTime();
            break;
          case "duration":
            result = a.duration_minutes - b.duration_minutes;
            break;
          default:
            result = 0;
        }
        return result;
      });
  }, [flights, selectedAirlines, filters]);

  return { filteredFlights };
};
