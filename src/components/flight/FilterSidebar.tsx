import React from "react";
import { Card, CardContent } from "../ui/card";
import { Button } from "../ui/button";
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
  filteredFlights: FlightSearchApiResult[];
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
          <CardContent>
            <h3 className="font-semibold text-gray-900 mb-4">
              Thời gian cất cánh
            </h3>
            <div className="space-y-3">
              {[
                { label: "Tất cả", value: "all" },
                { label: "Sáng sớm (06:00 - 12:00)", value: "morning" },
                { label: "Chiều (12:00 - 18:00)", value: "afternoon" },
                { label: "Tối (18:00 - 24:00)", value: "evening" },
                { label: "Đêm (00:00 - 06:00)", value: "night" },
              ].map((option) => (
                <label
                  key={option.value}
                  className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    name="departureTime"
                    value={option.value}
                    checked={filters.departureTime === option.value}
                    onChange={(e) =>
                      setFilters((prev) => ({
                        ...prev,
                        departureTime: e.target.value,
                      }))
                    }
                    className="mr-3 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm">{option.label}</span>
                </label>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Airlines Filter */}
        <Card>
          <CardContent>
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
              <Plane className="h-4 w-4 mr-2" />
              Hãng hàng không
            </h3>
            <div className="space-y-3">
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
              {vietnameseAirlines.map((airline) => (
                <label
                  key={airline.id}
                  className="flex items-center cursor-pointer p-2 rounded-lg hover:bg-gray-50">
                  <input
                    type="checkbox"
                    checked={selectedAirlines.includes(airline.id)}
                    onChange={() => onAirlineToggle(airline.id)}
                    className="mr-3 text-blue-600 focus:ring-blue-500 rounded"
                  />
                  <img
                    src={airline.logo}
                    alt={airline.name}
                    className="h-6 w-auto mr-2 object-contain"
                    loading="lazy"
                  />
                  <span className="text-sm">{airline.name}</span>
                </label>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Stops Filter */}
        <Card>
          <CardContent>
            <h3 className="font-semibold text-gray-900 mb-4">Số điểm dừng</h3>
            <div className="space-y-3">
              {(() => {
                const directFlights = flightResults.filter(
                  (f) => f.stops_count === 0
                ).length;
                const oneStopFlights = flightResults.filter(
                  (f) => f.stops_count === 1
                ).length;
                const multiStopFlights = flightResults.filter(
                  (f) => f.stops_count >= 2
                ).length;

                return [
                  {
                    label: `Tất cả (${flightResults.length})`,
                    value: "all",
                    count: flightResults.length,
                  },
                  {
                    label: `Bay thẳng (${directFlights})`,
                    value: "direct",
                    count: directFlights,
                  },
                  {
                    label: `1 Điểm dừng (${oneStopFlights})`,
                    value: "one-stop",
                    count: oneStopFlights,
                  },
                  {
                    label: `2+ Điểm dừng (${multiStopFlights})`,
                    value: "multi-stop",
                    count: multiStopFlights,
                  },
                ].map((option) => (
                  <label
                    key={option.value}
                    className={`flex items-center cursor-pointer ${
                      option.count === 0 ? "opacity-50 cursor-not-allowed" : ""
                    }`}>
                    <input
                      type="radio"
                      name="stops"
                      value={option.value}
                      checked={filters.stops === option.value}
                      disabled={option.count === 0}
                      onChange={(e) =>
                        setFilters((prev) => ({
                          ...prev,
                          stops: e.target.value,
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
          </CardContent>
        </Card>

        {/* Flight Duration Filter */}
        <Card>
          <CardContent>
            <h3 className="font-semibold text-gray-900 mb-4">Thời gian bay</h3>
            <div className="space-y-3">
              {(() => {
                const shortFlights = flightResults.filter(
                  (f) => f.duration_minutes <= 120
                ).length;
                const mediumFlights = flightResults.filter(
                  (f) => f.duration_minutes > 120 && f.duration_minutes <= 300
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
                      option.count === 0 ? "opacity-50 cursor-not-allowed" : ""
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
                {Math.min(...flightResults.map((f) => f.duration_minutes))} phút
                đến {Math.max(...flightResults.map((f) => f.duration_minutes))}{" "}
                phút
              </div>
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
