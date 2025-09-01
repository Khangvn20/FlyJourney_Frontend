import React, { useState } from "react";
import { Card, CardContent } from "../ui/card";
import { Button } from "../ui/button";
import {
  DEV_CONFIG,
  shouldShowDevControls,
} from "../../shared/config/devConfig";
import { Filter, ChevronDown, ChevronUp, Plane } from "lucide-react";
import type { FlightSearchApiResult } from "../../shared/types/search-api.types";

interface FilterSidebarProps {
  showFilters: boolean;
  setShowFilters: (show: boolean) => void;
  selectedAirlines: string[];
  setSelectedAirlines: (airlines: string[]) => void;
  filters: {
    priceRange: string;
    departureTime: string;
    stops: string;
    duration: string;
    sortBy: string;
  };
  setFilters: React.Dispatch<
    React.SetStateAction<{
      priceRange: string;
      departureTime: string;
      stops: string;
      duration: string;
      sortBy: string;
    }>
  >;
  flightResults: FlightSearchApiResult[];
  vietnameseAirlines: Array<{
    id: string;
    name: string;
    logo: string;
    code: string;
  }>;
  onAirlineToggle: (airlineId: string) => void;
  skeletonActive?: boolean;
  progressiveCount?: number;
}

const FilterSidebar: React.FC<FilterSidebarProps> = ({
  showFilters,
  setShowFilters,
  selectedAirlines,
  setSelectedAirlines,
  filters,
  setFilters,
  flightResults,
  vietnameseAirlines,
  onAirlineToggle,
}) => {
  const [expandedSections, setExpandedSections] = useState({
    departureTime: true,
    airlines: true,
    stops: true,
    duration: true,
  });

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  return (
    <div className="lg:col-span-1">
      {/* Mobile Filter Toggle */}
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

      {/* Filter Panel */}
      <div className={`space-y-4 ${showFilters ? "block" : "hidden lg:block"}`}>
        {/* Time Filter */}
        <Card>
          <CardContent className="p-4">
            <div
              className="flex items-center justify-between cursor-pointer"
              onClick={() => toggleSection("departureTime")}>
              <h3 className="font-semibold text-gray-900 flex items-center">
                <svg
                  className="h-4 w-4 mr-2"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 10" />
                </svg>
                Thời gian cất cánh
              </h3>
              {expandedSections.departureTime ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </div>

            {expandedSections.departureTime && (
              <div className="space-y-3 mt-4">
                {(() => {
                  // Helper function to parse departure time from ISO string or HH:MM format
                  const getHourFromDepartureTime = (
                    departure_time: string
                  ): number => {
                    try {
                      // Try parsing as ISO string first (API format)
                      if (
                        departure_time.includes("T") ||
                        departure_time.includes("-")
                      ) {
                        const date = new Date(departure_time);
                        if (!isNaN(date.getTime())) {
                          // Get hour in local timezone (Vietnam timezone assumed)
                          const hour = date.getHours();
                          return hour;
                        }
                      }

                      // Fallback to HH:MM format (mock data format)
                      if (departure_time.includes(":")) {
                        const timeStr =
                          departure_time.split("T")[1] || departure_time; // Handle both ISO and plain time
                        const hour = parseInt(timeStr.split(":")[0]);
                        return !isNaN(hour) ? hour : 0;
                      }

                      return 0;
                    } catch (error) {
                      console.warn(
                        "Error parsing departure time:",
                        departure_time,
                        error
                      );
                      return 0;
                    }
                  };

                  // Debug: log some sample departure times and parsed hours
                  if (
                    flightResults.length > 0 &&
                    DEV_CONFIG.ENABLE_CONSOLE_LOGS &&
                    shouldShowDevControls()
                  ) {
                    console.log("FilterSidebar Debug - Sample flight times:");
                    console.log(
                      "Total flights for filtering:",
                      flightResults.length
                    );
                    flightResults.slice(0, 5).forEach((f, idx) => {
                      const hour = getHourFromDepartureTime(f.departure_time);
                      console.log(
                        `Flight ${idx + 1}: ${f.flight_number} | Time: "${
                          f.departure_time
                        }" -> Hour: ${hour} | Airline: ${f.airline_name}`
                      );
                    });
                  }

                  const morningFlights = flightResults.filter((f) => {
                    const hour = getHourFromDepartureTime(f.departure_time);
                    return hour >= 6 && hour < 12;
                  }).length;

                  const afternoonFlights = flightResults.filter((f) => {
                    const hour = getHourFromDepartureTime(f.departure_time);
                    return hour >= 12 && hour < 18;
                  }).length;

                  const eveningFlights = flightResults.filter((f) => {
                    const hour = getHourFromDepartureTime(f.departure_time);
                    return hour >= 18 && hour < 24;
                  }).length;

                  const nightFlights = flightResults.filter((f) => {
                    const hour = getHourFromDepartureTime(f.departure_time);
                    return hour >= 0 && hour < 6;
                  }).length;

                  return [
                    {
                      label: `Tất cả (${flightResults.length})`,
                      value: "all",
                      count: flightResults.length,
                    },
                    {
                      label: `Sáng sớm (06:00 - 12:00) (${morningFlights})`,
                      value: "morning",
                      count: morningFlights,
                    },
                    {
                      label: `Chiều (12:00 - 18:00) (${afternoonFlights})`,
                      value: "afternoon",
                      count: afternoonFlights,
                    },
                    {
                      label: `Tối (18:00 - 24:00) (${eveningFlights})`,
                      value: "evening",
                      count: eveningFlights,
                    },
                    {
                      label: `Đêm (00:00 - 06:00) (${nightFlights})`,
                      value: "night",
                      count: nightFlights,
                    },
                  ].map((option) => (
                    <label
                      key={option.value}
                      className={`flex items-center cursor-pointer ${
                        option.count === 0
                          ? "opacity-50 cursor-not-allowed"
                          : ""
                      }`}>
                      <input
                        type="radio"
                        name="departureTime"
                        value={option.value}
                        checked={filters.departureTime === option.value}
                        disabled={option.count === 0}
                        onChange={(e) =>
                          setFilters((prev) => ({
                            ...prev,
                            departureTime: e.target.value,
                          }))
                        }
                        className="mr-3 text-blue-600 focus:ring-blue-500"
                      />
                      <span
                        className={`text-sm ${
                          option.value === "all"
                            ? "font-medium text-orange-600"
                            : ""
                        }`}>
                        {option.label}
                      </span>
                    </label>
                  ));
                })()}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Airlines Filter */}
        <Card>
          <CardContent className="p-4">
            <div
              className="flex items-center justify-between cursor-pointer"
              onClick={() => toggleSection("airlines")}>
              <h3 className="font-semibold text-gray-900 flex items-center">
                <Plane className="h-4 w-4 mr-2" />
                Hãng hàng không
              </h3>
              {expandedSections.airlines ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </div>

            {expandedSections.airlines && (
              <div className="space-y-3 mt-4">
                <label className="flex items-center cursor-pointer p-2 rounded-lg hover:bg-gray-50">
                  <input
                    type="checkbox"
                    checked={selectedAirlines.length === 0}
                    onChange={() => setSelectedAirlines([])}
                    className="mr-3 text-orange-500 focus:ring-orange-500 rounded"
                  />
                  <span className="text-sm font-medium text-orange-600">
                    Tất cả hãng bay
                  </span>
                </label>
                {vietnameseAirlines.map((airline) => {
                  // Check if there are flights for this airline
                  const airlineFlights = flightResults.filter(
                    (f) =>
                      f.airline_name?.toLowerCase().replace(/\s+/g, "-") ===
                      airline.id
                  ).length;

                  return (
                    <label
                      key={airline.id}
                      className={`flex items-center cursor-pointer p-2 rounded-lg hover:bg-gray-50 ${
                        airlineFlights === 0
                          ? "opacity-50 cursor-not-allowed"
                          : ""
                      }`}>
                      <input
                        type="checkbox"
                        checked={selectedAirlines.includes(airline.id)}
                        onChange={() => onAirlineToggle(airline.id)}
                        disabled={airlineFlights === 0}
                        className="mr-3 text-blue-600 focus:ring-blue-500 rounded"
                      />
                      <img
                        src={airline.logo}
                        alt={airline.name}
                        className="h-6 w-auto mr-2 object-contain"
                        loading="lazy"
                      />
                      <span className="text-sm">{airline.name}</span>
                      {airlineFlights > 0 && (
                        <span className="ml-auto text-xs text-gray-500">
                          ({airlineFlights})
                        </span>
                      )}
                    </label>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
        {/* Flight Duration Filter */}
        <Card>
          <CardContent className="p-4">
            <div
              className="flex items-center justify-between cursor-pointer"
              onClick={() => toggleSection("duration")}>
              <h3 className="font-semibold text-gray-900 flex items-center">
                <svg
                  className="h-4 w-4 mr-2"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
                Thời gian bay
              </h3>
              {expandedSections.duration ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </div>

            {expandedSections.duration && (
              <>
                <div className="space-y-3 mt-4">
                  {(() => {
                    const shortFlights = flightResults.filter(
                      (f) => f.duration_minutes <= 120
                    ).length;
                    const mediumFlights = flightResults.filter(
                      (f) =>
                        f.duration_minutes > 120 && f.duration_minutes <= 300
                    ).length;
                    const longFlights = flightResults.filter(
                      (f) => f.duration_minutes > 300
                    ).length;

                    return [
                      {
                        label: `Tất cả (${flightResults.length})`,
                        value: "all",
                        count: flightResults.length,
                      },
                      {
                        label: `Ngắn: dưới 2h (${shortFlights})`,
                        value: "short",
                        count: shortFlights,
                      },
                      {
                        label: `Trung bình: 2-5h (${mediumFlights})`,
                        value: "medium",
                        count: mediumFlights,
                      },
                      {
                        label: `Dài: trên 5h (${longFlights})`,
                        value: "long",
                        count: longFlights,
                      },
                    ].map((option) => (
                      <label
                        key={option.value}
                        className={`flex items-center cursor-pointer ${
                          option.count === 0
                            ? "opacity-50 cursor-not-allowed"
                            : ""
                        }`}>
                        <input
                          type="radio"
                          name="duration"
                          value={option.value}
                          checked={filters.duration === option.value}
                          disabled={option.count === 0}
                          onChange={(e) =>
                            setFilters((prev) => ({
                              ...prev,
                              duration: e.target.value,
                            }))
                          }
                          className="mr-3 text-blue-600 focus:ring-blue-500"
                        />
                        <span
                          className={`text-sm ${
                            option.value === "all"
                              ? "font-medium text-orange-600"
                              : ""
                          }`}>
                          {option.label}
                        </span>
                      </label>
                    ));
                  })()}
                </div>
                {flightResults.length > 0 && (
                  <div className="mt-3 text-xs text-gray-500 bg-gray-50 p-2 rounded">
                    💡 Thời gian tính từ{" "}
                    {Math.min(...flightResults.map((f) => f.duration_minutes))}{" "}
                    phút đến{" "}
                    {Math.max(...flightResults.map((f) => f.duration_minutes))}{" "}
                    phút
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>

        {/* Reset Filters */}
        {(filters.departureTime !== "all" ||
          filters.stops !== "all" ||
          filters.duration !== "all" ||
          selectedAirlines.length > 0) && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setFilters({
                priceRange: "all",
                departureTime: "all",
                stops: "all",
                duration: "all",
                sortBy: "price",
              });
              setSelectedAirlines([]);
            }}
            className="w-full text-orange-600 border-orange-300 hover:bg-orange-50">
            🔄 Xóa tất cả bộ lọc
          </Button>
        )}
      </div>
    </div>
  );
};

export default FilterSidebar;
