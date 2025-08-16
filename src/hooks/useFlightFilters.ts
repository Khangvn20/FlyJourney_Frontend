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

    // Debug logging for departure time filter
    if (safeFlights.length > 0 && filters.departureTime !== "all") {
      console.log("useFlightFilters Debug:");
      console.log("Filter mode:", filters.departureTime);
      console.log("Sample flight times for filtering:");
      safeFlights.slice(0, 3).forEach((f, idx) => {
        const getHourFromDepartureTime = (departure_time: string): number => {
          try {
            if (departure_time.includes("T") || departure_time.includes("-")) {
              const date = new Date(departure_time);
              if (!isNaN(date.getTime())) {
                return date.getHours();
              }
            }
            if (departure_time.includes(":")) {
              const timeStr = departure_time.split("T")[1] || departure_time;
              const hour = parseInt(timeStr.split(":")[0]);
              return !isNaN(hour) ? hour : 0;
            }
            return 0;
          } catch {
            return 0;
          }
        };
        const hour = getHourFromDepartureTime(f.departure_time);
        console.log(
          `Flight ${idx + 1}: ${f.flight_number} | "${
            f.departure_time
          }" -> Hour: ${hour}`
        );
      });
    }

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
          // Helper function to safely get hour from departure time
          const getHourFromDepartureTime = (departure_time: string): number => {
            try {
              // Try parsing as ISO string first (API format)
              if (
                departure_time.includes("T") ||
                departure_time.includes("-")
              ) {
                const date = new Date(departure_time);
                if (!isNaN(date.getTime())) {
                  // Get hour in local timezone (Vietnam timezone assumed)
                  return date.getHours();
                }
              }

              // Fallback to HH:MM format (mock data format)
              if (departure_time.includes(":")) {
                const timeStr = departure_time.split("T")[1] || departure_time; // Handle both ISO and plain time
                const hour = parseInt(timeStr.split(":")[0]);
                return !isNaN(hour) ? hour : 0;
              }

              return 0;
            } catch (error) {
              console.warn(
                "Error parsing departure time in filter:",
                departure_time,
                error
              );
              return 0;
            }
          };

          const departureHour = getHourFromDepartureTime(flight.departure_time);
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
