import type { FlightSearchApiResult } from "../shared/types/search-api.types";

export interface FlightFilterCriteria {
  priceRange: string;
  departureTime: string[];
  stops: string;
  duration: string[];
  sortBy: string;
}

export interface FlightFilterOptions {
  flights: FlightSearchApiResult[];
  selectedAirlines: string[];
  filters: FlightFilterCriteria;
}

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

export const filterAndSortFlights = ({
  flights,
  selectedAirlines,
  filters,
}: FlightFilterOptions): FlightSearchApiResult[] => {
  const safeFlights: FlightSearchApiResult[] = Array.isArray(flights)
    ? flights
    : (flights as unknown as FlightSearchApiResult[]) || [];

  return safeFlights
    .filter((flight) => {
      if (selectedAirlines.length > 0) {
        const airlineMatch = selectedAirlines.some(
          (selectedId) =>
            flight.airline_name.toLowerCase().replace(/\s+/g, "-") ===
            selectedId
        );
        if (!airlineMatch) return false;
      }

      if (filters.departureTime.length > 0) {
        const departureHour = getHourFromDepartureTime(flight.departure_time);
        const timeMatch = filters.departureTime.some((timeSlot) => {
          switch (timeSlot) {
            case "morning":
              return departureHour >= 6 && departureHour < 12;
            case "afternoon":
              return departureHour >= 12 && departureHour < 18;
            case "evening":
              return departureHour >= 18 && departureHour < 24;
            case "night":
              return departureHour >= 0 && departureHour < 6;
            default:
              return false;
          }
        });
        if (!timeMatch) return false;
      }

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

      if (filters.duration.length > 0) {
        const durationMatch = filters.duration.some((durationType) => {
          switch (durationType) {
            case "short":
              return flight.duration_minutes <= 120;
            case "medium":
              return (
                flight.duration_minutes > 120 && flight.duration_minutes <= 300
              );
            case "long":
              return flight.duration_minutes > 300;
            default:
              return false;
          }
        });
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
};
