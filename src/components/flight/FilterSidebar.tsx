import React, { useMemo, useState } from "react";
import { Card, CardContent } from "../ui/card";
import { Button } from "../ui/button";
import { Filter, ChevronDown, ChevronUp, Plane } from "lucide-react";
import { filterAndSortFlights } from "../../lib/flightFilters";
import { normalizeAirlineSlug } from "../../lib/searchUtils";
import type { FlightSearchApiResult } from "../../shared/types/search-api.types";

interface FilterSidebarProps {
  showFilters: boolean;
  setShowFilters: (show: boolean) => void;
  selectedAirlines: string[];
  setSelectedAirlines: (airlines: string[]) => void;
  filters: {
    priceRange: string;
    departureTime: string[];
    stops: string;
    duration: string[];
    sortBy: string;
  };
  setFilters: React.Dispatch<
    React.SetStateAction<{
      priceRange: string;
      departureTime: string[];
      stops: string;
      duration: string[];
      sortBy: string;
    }>
  >;
  allFlights: FlightSearchApiResult[];
  filteredFlights: FlightSearchApiResult[];
  vietnameseAirlines: Array<{
    id: string;
    logo: string;
  }>;
  onAirlineToggle: (airlineId: string) => void;
  dimUnavailableOptions?: boolean;
}

type TimeOptionKey = "morning" | "afternoon" | "evening" | "night";

const TIME_OPTIONS: Array<{
  value: TimeOptionKey;
  label: string;
  range: string;
  match: (hour: number) => boolean;
}> = [
  {
    value: "morning",
    label: "Sáng",
    range: "06:00 - 12:00",
    match: (hour) => hour >= 6 && hour < 12,
  },
  {
    value: "afternoon",
    label: "Chiều",
    range: "12:00 - 18:00",
    match: (hour) => hour >= 12 && hour < 18,
  },
  {
    value: "evening",
    label: "Tối",
    range: "18:00 - 24:00",
    match: (hour) => hour >= 18 && hour < 24,
  },
  {
    value: "night",
    label: "Đêm",
    range: "00:00 - 06:00",
    match: (hour) => hour >= 0 && hour < 6,
  },
];

type DurationOptionKey = "short" | "medium" | "long";

const DURATION_OPTIONS: Array<{
  value: DurationOptionKey;
  label: string;
  description: string;
  match: (minutes: number) => boolean;
}> = [
  {
    value: "short",
    label: "Ngắn", // under 2 hours
    description: "Dưới 2 giờ",
    match: (minutes) => minutes <= 120,
  },
  {
    value: "medium",
    label: "Trung bình",
    description: "2 - 5 giờ",
    match: (minutes) => minutes > 120 && minutes <= 300,
  },
  {
    value: "long",
    label: "Dài",
    description: "Trên 5 giờ",
    match: (minutes) => minutes > 300,
  },
];

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
      const hour = parseInt(timeStr.split(":")[0], 10);
      return Number.isNaN(hour) ? 0 : hour;
    }

    return 0;
  } catch {
    return 0;
  }
};

const FilterSidebar: React.FC<FilterSidebarProps> = ({
  showFilters,
  setShowFilters,
  selectedAirlines,
  setSelectedAirlines,
  filters,
  setFilters,
  allFlights,
  filteredFlights,
  vietnameseAirlines,
  onAirlineToggle,
  dimUnavailableOptions = false,
}) => {
  const [expandedSections, setExpandedSections] = useState({
    departureTime: true,
    airlines: true,
    duration: true,
  });

  const baseFlights =
    allFlights && allFlights.length > 0 ? allFlights : filteredFlights;

  const flightsForTimeCounts = useMemo(
    () =>
      filterAndSortFlights({
        flights: baseFlights,
        selectedAirlines,
        filters: {
          priceRange: filters.priceRange,
          departureTime: [],
          stops: filters.stops,
          duration: filters.duration,
          sortBy: filters.sortBy,
        },
      }),
    [
      baseFlights,
      selectedAirlines,
      filters.duration,
      filters.priceRange,
      filters.sortBy,
      filters.stops,
    ]
  );

  const flightsForDurationCounts = useMemo(
    () =>
      filterAndSortFlights({
        flights: baseFlights,
        selectedAirlines,
        filters: {
          priceRange: filters.priceRange,
          departureTime: filters.departureTime,
          stops: filters.stops,
          duration: [],
          sortBy: filters.sortBy,
        },
      }),
    [
      baseFlights,
      selectedAirlines,
      filters.departureTime,
      filters.priceRange,
      filters.sortBy,
      filters.stops,
    ]
  );

  const flightsForAirlineCounts = useMemo(
    () =>
      filterAndSortFlights({
        flights: baseFlights,
        selectedAirlines: [],
        filters: {
          priceRange: filters.priceRange,
          departureTime: filters.departureTime,
          stops: filters.stops,
          duration: filters.duration,
          sortBy: filters.sortBy,
        },
      }),
    [
      baseFlights,
      filters.departureTime,
      filters.duration,
      filters.priceRange,
      filters.sortBy,
      filters.stops,
    ]
  );

  const timeCounts = useMemo(() => {
    const counts: Record<TimeOptionKey, number> = {
      morning: 0,
      afternoon: 0,
      evening: 0,
      night: 0,
    };
    flightsForTimeCounts.forEach((flight) => {
      const hour = getHourFromDepartureTime(flight.departure_time);
      TIME_OPTIONS.forEach((option) => {
        if (option.match(hour)) {
          counts[option.value] += 1;
        }
      });
    });
    return counts;
  }, [flightsForTimeCounts]);

  const timeTotal = flightsForTimeCounts.length;

  const durationCounts = useMemo(() => {
    const counts: Record<DurationOptionKey, number> = {
      short: 0,
      medium: 0,
      long: 0,
    };
    flightsForDurationCounts.forEach((flight) => {
      DURATION_OPTIONS.forEach((option) => {
        if (option.match(flight.duration_minutes)) {
          counts[option.value] += 1;
        }
      });
    });
    return counts;
  }, [flightsForDurationCounts]);

  const durationTotal = flightsForDurationCounts.length;

  const airlineCounts = useMemo(() => {
    return flightsForAirlineCounts.reduce<Record<string, number>>(
      (acc, flight) => {
        const slug = normalizeAirlineSlug(flight.airline_name);
        if (!slug) return acc;
        acc[slug] = (acc[slug] ?? 0) + 1;
        return acc;
      },
      {}
    );
  }, [flightsForAirlineCounts]);

  const selectedAirlineSet = useMemo(
    () => new Set(selectedAirlines),
    [selectedAirlines]
  );

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const toggleDepartureTimeFilter = (value: TimeOptionKey) => {
    setFilters((prev) => {
      const exists = prev.departureTime.includes(value);
      return {
        ...prev,
        departureTime: exists
          ? prev.departureTime.filter((item) => item !== value)
          : [...prev.departureTime, value],
      };
    });
  };

  const toggleDurationFilter = (value: DurationOptionKey) => {
    setFilters((prev) => {
      const exists = prev.duration.includes(value);
      return {
        ...prev,
        duration: exists
          ? prev.duration.filter((item) => item !== value)
          : [...prev.duration, value],
      };
    });
  };

  const clearDepartureTime = (event?: React.MouseEvent) => {
    if (event) event.stopPropagation();
    setFilters((prev) => ({ ...prev, departureTime: [] }));
  };

  const clearDuration = (event?: React.MouseEvent) => {
    if (event) event.stopPropagation();
    setFilters((prev) => ({ ...prev, duration: [] }));
  };

  const clearAirlines = (event?: React.MouseEvent) => {
    if (event) event.stopPropagation();
    setSelectedAirlines([]);
  };

  const isFilterActive =
    filters.departureTime.length > 0 ||
    filters.duration.length > 0 ||
    selectedAirlines.length > 0 ||
    filters.stops !== "all" ||
    filters.priceRange !== "all";

  const sectionBorder =
    "border border-slate-200/80 shadow-sm hover:border-blue-200 transition bg-white";
  return (
    <div className="lg:col-span-1">
      <div className="lg:hidden mb-4">
        <Button
          variant="outline"
          onClick={() => setShowFilters(!showFilters)}
          className="w-full flex items-center justify-between">
          <div className="flex items-center">
            <Filter className="h-4 w-4 mr-2" />
            Bộ lọc
          </div>
          {showFilters ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </Button>
      </div>

      <div
        className={`space-y-4 text-sm text-slate-700 ${
          showFilters ? "block" : "hidden lg:block"
        }`}>
        <Card className={sectionBorder}>
          <CardContent className="px-4 py-5">
            <div
              className="flex items-start justify-between cursor-pointer gap-3"
              onClick={() => toggleSection("departureTime")}>
              <div>
                <h3 className="text-sm font-semibold text-slate-900">
                  Thời gian cất cánh
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-medium text-slate-500 whitespace-nowrap">
                  Tổng {timeTotal}
                </span>
                {filters.departureTime.length > 0 && (
                  <button
                    type="button"
                    onClick={clearDepartureTime}
                    className="text-xs font-medium text-blue-600 hover:text-blue-500">
                    Bỏ chọn
                  </button>
                )}
                {expandedSections.departureTime ? (
                  <ChevronUp className="h-4 w-4 text-slate-500" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-slate-500" />
                )}
              </div>
            </div>

            {expandedSections.departureTime && (
              <div className="mt-4 space-y-2">
                {TIME_OPTIONS.map((option) => {
                  const count = timeCounts[option.value] ?? 0;
                  const isChecked = filters.departureTime.includes(
                    option.value
                  );
                  const shouldDim = dimUnavailableOptions && count === 0;
                  return (
                    <label
                      key={option.value}
                      className={`flex items-center justify-between rounded-xl border px-3 py-2 text-sm transition ${
                        isChecked
                          ? "border-blue-500 bg-blue-50"
                          : "border-slate-200 hover:border-blue-300"
                      } ${
                        shouldDim && !isChecked
                          ? "opacity-40 cursor-not-allowed"
                          : "cursor-pointer"
                      }`}>
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          className="h-4 w-4 accent-blue-600"
                          checked={isChecked}
                          disabled={shouldDim && !isChecked}
                          onChange={() =>
                            toggleDepartureTimeFilter(option.value)
                          }
                        />
                        <div className="min-w-0">
                          <div className="font-medium text-slate-700 whitespace-nowrap">
                            {option.label}
                          </div>
                          <div className="text-xs text-slate-500 whitespace-nowrap">
                            {option.range}
                          </div>
                        </div>
                      </div>
                      <span className="text-xs font-medium text-slate-500 ml-3 whitespace-nowrap">
                        {count}
                      </span>
                    </label>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className={sectionBorder}>
          <CardContent className="px-4 py-5">
            <div
              className="flex items-start justify-between cursor-pointer gap-3"
              onClick={() => toggleSection("airlines")}>
              <div>
                <div className="flex items-center gap-2">
                  <Plane className="h-4 w-4 text-slate-500" />
                  <h3 className="text-sm font-semibold text-slate-900">
                    Hãng hàng không
                  </h3>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {selectedAirlines.length > 0 && (
                  <button
                    type="button"
                    onClick={clearAirlines}
                    className="text-xs font-medium text-blue-600 hover:text-blue-500">
                    Bỏ chọn
                  </button>
                )}
                {expandedSections.airlines ? (
                  <ChevronUp className="h-4 w-4 text-slate-500" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-slate-500" />
                )}
              </div>
            </div>

            {expandedSections.airlines && (
              <div className="mt-4 space-y-2">
                {vietnameseAirlines.map((airline) => {
                  const count = airlineCounts[airline.id] ?? 0;
                  const isChecked = selectedAirlineSet.has(airline.id);
                  const shouldDim = dimUnavailableOptions && count === 0;
                  return (
                    <label
                      key={airline.id}
                      className={`flex items-center justify-between rounded-xl border px-3 py-2 text-sm transition ${
                        isChecked
                          ? "border-blue-500 bg-blue-50"
                          : "border-slate-200 hover:border-blue-300"
                      } ${
                        shouldDim && !isChecked
                          ? "opacity-40 cursor-not-allowed"
                          : "cursor-pointer"
                      }`}>
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          className="h-4 w-4 accent-blue-600"
                          checked={isChecked}
                          disabled={shouldDim && !isChecked}
                          onChange={() => onAirlineToggle(airline.id)}
                        />
                        <img
                          src={airline.logo}
                          className="h-9 w-auto object-contain"
                          loading="lazy"
                          alt={airline.id}
                        />
                      </div>
                      <span className="text-xs font-medium text-slate-500 ml-3 whitespace-nowrap">
                        {count}
                      </span>
                    </label>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className={sectionBorder}>
          <CardContent className="px-4 py-5">
            <div
              className="flex items-start justify-between cursor-pointer gap-3"
              onClick={() => toggleSection("duration")}>
              <div>
                <h3 className="text-sm font-semibold text-slate-900">
                  Thời gian bay
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-medium text-slate-500 whitespace-nowrap">
                  Tổng {durationTotal}
                </span>
                {filters.duration.length > 0 && (
                  <button
                    type="button"
                    onClick={clearDuration}
                    className="text-xs font-medium text-blue-600 hover:text-blue-500">
                    Bỏ chọn
                  </button>
                )}
                {expandedSections.duration ? (
                  <ChevronUp className="h-4 w-4 text-slate-500" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-slate-500" />
                )}
              </div>
            </div>

            {expandedSections.duration && (
              <div className="mt-4 space-y-2">
                {DURATION_OPTIONS.map((option) => {
                  const count = durationCounts[option.value] ?? 0;
                  const isChecked = filters.duration.includes(option.value);
                  const shouldDim = dimUnavailableOptions && count === 0;
                  return (
                    <label
                      key={option.value}
                      className={`flex items-center justify-between rounded-xl border px-3 py-2 text-sm transition ${
                        isChecked
                          ? "border-blue-500 bg-blue-50"
                          : "border-slate-200 hover:border-blue-300"
                      } ${
                        shouldDim && !isChecked
                          ? "opacity-40 cursor-not-allowed"
                          : "cursor-pointer"
                      }`}>
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          className="h-4 w-4 accent-blue-600"
                          checked={isChecked}
                          disabled={shouldDim && !isChecked}
                          onChange={() => toggleDurationFilter(option.value)}
                        />
                        <div className="min-w-0">
                          <div className="font-medium text-slate-700 whitespace-nowrap">
                            {option.label}
                          </div>
                          <div className="text-xs text-slate-500 whitespace-nowrap">
                            {option.description}
                          </div>
                        </div>
                      </div>
                      <span className="text-xs font-medium text-slate-500 ml-3 whitespace-nowrap">
                        {count}
                      </span>
                    </label>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {isFilterActive && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setFilters({
                priceRange: "all",
                departureTime: [],
                stops: "all",
                duration: [],
                sortBy: "price",
              });
              setSelectedAirlines([]);
            }}
            className="w-full text-blue-600 border-blue-200 hover:bg-blue-50">
            Đặt lại tất cả bộ lọc
          </Button>
        )}
      </div>
    </div>
  );
};

export default FilterSidebar;
