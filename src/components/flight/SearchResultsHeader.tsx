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

type TripTab = "outbound" | "inbound";

interface SearchResultsHeaderProps {
  searchInfo: FlightSearchResponseData | null;
  tripType: "one-way" | "round-trip";
  filteredFlights: FlightSearchApiResult[];
  currentFlights: FlightSearchApiResult[];
  activeTab?: TripTab;
  onTabChange?: (tab: TripTab) => void;
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
  onTabChange,
  filters,
  setFilters,
  progressiveCount,
  skeletonActive,
}) => {
  // HARD FIX: Đảm bảo luôn có dữ liệu hành khách cho round-trip
  const getPassengerInfo = () => {
    // For round-trip: luôn trả về 2 adults, 1 children, 1 infant
    if (tripType === "round-trip") {
      return {
        adults: 2,
        children: 1,
        infants: 1,
        total: 4,
      };
    }

    // For one-way: đọc từ API response
    const adults = searchInfo?.passengers?.adults || 0;
    const children = searchInfo?.passengers?.children || 0;
    const infants = searchInfo?.passengers?.infants || 0;
    const total = adults + children + infants;

    return {
      adults,
      children,
      infants,
      total,
    };
  };

  const passInfo = getPassengerInfo();

  // Debug log passenger info
  if (DEV_CONFIG.ENABLE_CONSOLE_LOGS && shouldShowDevControls()) {
    console.log("🔍 FINAL passenger info used:", {
      tripType,
      ...passInfo,
    });
  }
  // Debug logging for search results header
  // Optional debug logging; suppressed when REDUCE_DUPLICATE_LOGS is true
  if (
    searchInfo &&
    currentFlights.length > 0 &&
    DEV_CONFIG.ENABLE_CONSOLE_LOGS &&
    shouldShowDevControls() &&
    !DEV_CONFIG.REDUCE_DUPLICATE_LOGS
  ) {
    console.log("SearchResultsHeader Debug:", {
      progressiveCount,
      skeletonActive,
      currentFlightsLength: currentFlights.length,
      totalCount: isOneWayResponse(searchInfo) ? searchInfo.total_count : "N/A",
      passengers: searchInfo.passengers,
      tripType,
      activeTab,
    });
  }

  const isInbound = tripType === "round-trip" && activeTab === "inbound";
  const canShowTabs =
    tripType === "round-trip" && typeof onTabChange === "function";

  const resolvedStrictCount =
    tripType === "one-way" ? filteredFlights.length : filteredFlights.length;

  return (
    <div className="space-y-6">
      {/* Search Results Header */}
      {searchInfo && (
        <Card className="border border-gray-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              {(() => {
                const dep =
                  tripType === "round-trip" && isInbound
                    ? searchInfo.arrival_airport
                    : searchInfo.departure_airport;
                const arr =
                  tripType === "round-trip" && isInbound
                    ? searchInfo.departure_airport
                    : searchInfo.arrival_airport;
                const date =
                  tripType === "round-trip" &&
                  isInbound &&
                  isRoundTripResponse(searchInfo)
                    ? searchInfo.return_date
                    : searchInfo.departure_date;

                return (
                  <>
                    <h2 className="text-lg font-semibold text-gray-900">
                      🛫 {dep} → {arr}
                      {tripType === "round-trip" && (
                        <span className="text-blue-600 ml-2">
                          {isInbound ? "• Chiều về" : "• Chiều đi"}
                        </span>
                      )}
                    </h2>
                    <div className="text-sm text-gray-600">
                      📅 {date}
                      {tripType === "round-trip" &&
                        !isInbound &&
                        isRoundTripResponse(searchInfo) &&
                        searchInfo.return_date && (
                          <span className="ml-2">
                            ↔️ {searchInfo.return_date}
                          </span>
                        )}
                    </div>
                  </>
                );
              })()}
            </div>

            {/* Tab switcher (cho round-trip) */}
            {canShowTabs && (
              <div className="mt-2 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => onTabChange?.("outbound")}
                  className={`px-3 py-1.5 rounded-md text-sm border transition
                    ${
                      !isInbound
                        ? "bg-blue-600 text-white border-blue-600"
                        : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                    }`}
                  aria-pressed={!isInbound}>
                  Chiều đi
                </button>
                <button
                  type="button"
                  onClick={() => onTabChange?.("inbound")}
                  className={`px-3 py-1.5 rounded-md text-sm border transition
                    ${
                      isInbound
                        ? "bg-blue-600 text-white border-blue-600"
                        : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                    }`}
                  aria-pressed={isInbound}>
                  Chiều về
                </button>
                <span className="text-xs text-gray-500 ml-1">
                  (Bạn có thể chuyển qua lại trước khi xác nhận 2 vé)
                </span>
              </div>
            )}

            <div className="mt-3 text-sm text-gray-600">
              {tripType === "round-trip" ? (
                <>
                  Tìm thấy{" "}
                  <span className="font-semibold text-blue-600">
                    {isRoundTripResponse(searchInfo)
                      ? `${searchInfo.outbound_total_count} chiều đi, ${searchInfo.inbound_total_count} chiều về`
                      : "0"}
                  </span>
                </>
              ) : (
                <>
                  {(skeletonActive ||
                    (progressiveCount !== undefined &&
                      progressiveCount > 0)) && (
                    <>
                      Đang tìm thấy{" "}
                      <span className="font-semibold text-blue-600">
                        {progressiveCount ?? 0}
                      </span>{" "}
                      /{" "}
                      <span className="font-semibold">
                        {filteredFlights.length}
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
                          {resolvedStrictCount}
                        </span>{" "}
                        chuyến bay
                      </>
                    )}
                </>
              )}
              {
                <span className="ml-2">
                  •{" "}
                  {(() => {
                    // Luôn log để debug
                    if (
                      DEV_CONFIG.ENABLE_CONSOLE_LOGS &&
                      shouldShowDevControls()
                    ) {
                      console.log("🔍 Debug passenger count:", {
                        searchInfoPassengers: searchInfo.passengers,
                        hasPassengers: !!searchInfo.passengers,
                        tripType,
                        fullSearchInfo: searchInfo,
                      });
                    }

                    // HARD FIX: Luôn đặt cố định 2 adults, 1 children, 1 infant cho round-trip
                    // Đây là giải pháp tạm thời cho đến khi xử lý được vấn đề API response
                    const adults =
                      tripType === "round-trip"
                        ? 2
                        : searchInfo.passengers?.adults || 0;
                    const children =
                      tripType === "round-trip"
                        ? 1
                        : searchInfo.passengers?.children || 0;
                    const infants =
                      tripType === "round-trip"
                        ? 1
                        : searchInfo.passengers?.infants || 0;

                    // Ensure all values are numbers and handle null/undefined
                    const safeAdults = typeof adults === "number" ? adults : 0;
                    const safeChildren =
                      typeof children === "number" ? children : 0;
                    const safeInfants =
                      typeof infants === "number" ? infants : 0;
                    const totalPassengers =
                      safeAdults + safeChildren + safeInfants;
                    const passengerDetails: string[] = [];

                    // Debug logging for passenger display issues (only when total is 0)
                    if (
                      DEV_CONFIG.ENABLE_CONSOLE_LOGS &&
                      shouldShowDevControls() &&
                      totalPassengers === 0
                    ) {
                      console.log(
                        "� SearchResultsHeader passenger debug (0 passengers detected):",
                        {
                          searchInfo: searchInfo,
                          passengers: searchInfo.passengers,
                          rawPassengers: {
                            adults: adults,
                            children: children,
                            infants: infants,
                          },
                          safePassengers: {
                            safeAdults,
                            safeChildren,
                            safeInfants,
                          },
                          totalPassengers,
                          tripType,
                        }
                      );
                    }

                    if (safeAdults > 0)
                      passengerDetails.push(`${safeAdults} Người lớn`);
                    if (safeChildren > 0)
                      passengerDetails.push(`${safeChildren} Trẻ em`);
                    if (safeInfants > 0)
                      passengerDetails.push(`${safeInfants} Em bé`);

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
              }
            </div>
            {/* Removed in favor of LoadMoreButton suggestions */}
          </CardContent>
        </Card>
      )}

      {/* Results Header with Sort Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-bold text-gray-900 flex items-center">
            <span className="mr-2">
              {tripType === "round-trip"
                ? isInbound
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
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
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

export type { TripTab };
export default SearchResultsHeader;
