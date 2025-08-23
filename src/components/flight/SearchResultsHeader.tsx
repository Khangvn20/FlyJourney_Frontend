import React from "react";
import { Card, CardContent } from "../ui/card";
import type {
  FlightSearchResponseData,
  FlightSearchApiResult,
} from "../../shared/types/search-api.types";
import {
  isRoundTripResponse,
  isOneWayResponse,
} from "../../shared/types/search-api.types";
import {
  DEV_CONFIG,
  shouldShowDevControls,
} from "../../shared/config/devConfig";

interface SearchResultsHeaderProps {
  searchInfo: FlightSearchResponseData | null;
  tripType: string;
  filteredFlights: FlightSearchApiResult[];
  returnFlightResults: FlightSearchApiResult[];
  currentFlights: FlightSearchApiResult[];
  activeTab?: string;
  filters: {
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
  progressiveCount?: number; // how many flights revealed so far (one-way)
  skeletonActive?: boolean;
}

const SearchResultsHeader: React.FC<SearchResultsHeaderProps> = ({
  searchInfo,
  tripType,
  filteredFlights,
  currentFlights,
  activeTab,
  filters,
  setFilters,
  progressiveCount,
  skeletonActive,
}) => {
  // Debug logging for search results header
  if (
    searchInfo &&
    filteredFlights.length > 0 &&
    DEV_CONFIG.ENABLE_CONSOLE_LOGS &&
    shouldShowDevControls()
  ) {
    console.log("SearchResultsHeader Debug:", {
      progressiveCount,
      skeletonActive,
      filteredFlightsLength: filteredFlights.length,
      totalCount: isOneWayResponse(searchInfo) ? searchInfo.total_count : "N/A",
      passengers: searchInfo.passengers,
    });
  }

  return (
    <div className="space-y-6">
      {/* Search Results Header */}
      {searchInfo && (
        <Card className="border border-gray-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-lg font-semibold text-gray-900">
                🛫 {searchInfo.departure_airport} → {searchInfo.arrival_airport}
                {tripType === "round-trip" && (
                  <span className="text-blue-600 ml-2">• Khứ hồi</span>
                )}
              </h2>
              <div className="text-sm text-gray-600">
                📅 {searchInfo.departure_date}
                {isRoundTripResponse(searchInfo) && searchInfo.return_date && (
                  <span className="ml-2">↔️ {searchInfo.return_date}</span>
                )}
              </div>
            </div>
            <div className="text-sm text-gray-600">
              {tripType === "round-trip" ? (
                <>
                  Tìm thấy{" "}
                  <span className="font-semibold text-blue-600">
                    {isRoundTripResponse(searchInfo)
                      ? `${searchInfo.outbound_total_count} chiều đi, ${searchInfo.inbound_total_count} chiều về`
                      : "0"}
                  </span>{" "}
                </>
              ) : (
                <>
                  {(skeletonActive ||
                    (progressiveCount !== undefined &&
                      progressiveCount > 0)) && (
                    <>
                      Đang tìm thấy{" "}
                      <span className="font-semibold text-blue-600">
                        {Math.max(
                          progressiveCount ?? 0,
                          filteredFlights.length
                        )}
                      </span>{" "}
                      /{" "}
                      <span className="font-semibold">
                        {isOneWayResponse(searchInfo)
                          ? searchInfo.total_count
                          : filteredFlights.length}
                      </span>{" "}
                      chuyến bay
                    </>
                  )}
                  {!skeletonActive &&
                    (progressiveCount === undefined ||
                      progressiveCount === 0) && (
                      <>
                        Tìm thấy{" "}
                        <span className="font-semibold text-blue-600">
                          {isOneWayResponse(searchInfo)
                            ? searchInfo.total_count
                            : filteredFlights.length}
                        </span>{" "}
                        chuyến bay
                      </>
                    )}
                </>
              )}
              {searchInfo.passengers && (
                <span className="ml-2">
                  •{" "}
                  {(() => {
                    const {
                      adults,
                      children = 0,
                      infants = 0,
                    } = searchInfo.passengers;
                    const totalPassengers = adults + children + infants;
                    const passengerDetails = [];

                    if (adults > 0)
                      passengerDetails.push(`${adults} Người lớn`);
                    if (children > 0)
                      passengerDetails.push(`${children} Trẻ em`);
                    if (infants > 0) passengerDetails.push(`${infants} Em bé`);

                    return (
                      <>
                        <span className="font-medium">
                          {totalPassengers} Hành khách
                        </span>
                        <span className="text-gray-500 text-xs ml-1">
                          ({passengerDetails.join(", ")})
                        </span>
                      </>
                    );
                  })()}
                </span>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Results Header with Sort Controls */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900 flex items-center">
            <span className="mr-2">
              {tripType === "round-trip"
                ? activeTab === "inbound"
                  ? "Chọn chiều về"
                  : "Chọn chiều đi"
                : "Chọn chuyến bay"}
            </span>
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">Sắp xếp theo</span>
          <select
            value={filters.sortBy}
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, sortBy: e.target.value }))
            }
            className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent">
            <option value="price">Rẻ nhất</option>
            <option value="departure">Sớm nhất</option>
            <option value="duration">Nhanh nhất</option>
          </select>
        </div>
      </div>

      {/* Sort Notification */}
      {filters.sortBy !== "price" && currentFlights.length > 0 && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
          <div className="flex items-center text-green-800 text-sm">
            <span className="mr-2">
              {filters.sortBy === "departure"
                ? "🕐"
                : filters.sortBy === "duration"
                ? "⏱️"
                : "📊"}
            </span>
            <span className="font-medium">
              Đã sắp xếp theo{" "}
              {filters.sortBy === "departure"
                ? "thời gian khởi hành sớm nhất"
                : filters.sortBy === "duration"
                ? "thời gian bay ngắn nhất"
                : "giá rẻ nhất"}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchResultsHeader;
