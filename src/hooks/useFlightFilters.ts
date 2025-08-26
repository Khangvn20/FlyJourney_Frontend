import { useMemo } from "react";
import type { FlightSearchApiResult } from "../shared/types/search-api.types";
import {
  filterAndSortFlights,
  type FlightFilterCriteria,
} from "../lib/flightFilters";

interface UseFlightFiltersProps {
  flights: FlightSearchApiResult[];
  selectedAirlines: string[];
  filters: FlightFilterCriteria;
}

export const useFlightFilters = ({
  flights,
  selectedAirlines,
  filters,
}: UseFlightFiltersProps) => {
  const filteredFlights = useMemo(
    () => filterAndSortFlights({ flights, selectedAirlines, filters }),
    [flights, selectedAirlines, filters]
  );

  return { filteredFlights };
};

