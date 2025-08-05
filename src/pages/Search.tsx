import type React from "react";
import { useState, useEffect } from "react";
import { Card, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import FlightSearchForm from "../components/FlightSearchForm";
import { airlines } from "../assets/mock";
import {
  formatPrice,
  formatDateTime,
  formatDuration,
} from "../services/flightApiService";
import type {
  FlightSearchApiResult,
  FlightSearchApiResponse,
  FlightSearchApiWrapper,
} from "../shared/types/search-api.types";
import { DEV_CONFIG, shouldShowDevControls } from "../shared/config/devConfig";
import {
  SlidersHorizontal,
  Plane,
  ChevronDown,
  ChevronUp,
  Filter,
  ArrowRight,
  Clock,
  Calendar,
  Users,
  Luggage,
  Info,
  CreditCard,
} from "lucide-react";

// Transform airlines data for use in this component
const vietnameseAirlines = airlines.map((airline) => ({
  id: airline.name.toLowerCase().replace(/\s+/g, "-"),
  name: airline.name,
  logo: airline.logo,
  code: airline.name.substring(0, 2).toUpperCase(),
}));

const Search: React.FC = () => {
  const [showFilters, setShowFilters] = useState(false);
  const [selectedAirlines, setSelectedAirlines] = useState<string[]>([]);
  const [filters, setFilters] = useState({
    priceRange: "all",
    departureTime: "all",
    stops: "all",
    duration: "all",
    sortBy: "price",
  });

  // State for API flight results
  const [flightResults, setFlightResults] = useState<FlightSearchApiResult[]>(
    []
  );
  const [searchInfo, setSearchInfo] = useState<FlightSearchApiResponse | null>(
    null
  );
  const [error, setError] = useState<string | null>(null);
  const [expandedFlightId, setExpandedFlightId] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<string>("flight");

  // Function to load search results from sessionStorage
  const loadSearchResults = () => {
    const storedResults = sessionStorage.getItem("flightSearchResults");

    if (DEV_CONFIG.ENABLE_CONSOLE_LOGS && shouldShowDevControls()) {
      console.log("🔍 Checking sessionStorage for results...");
      console.log("Raw stored results:", storedResults);
    }

    if (storedResults) {
      try {
        const results: FlightSearchApiWrapper = JSON.parse(storedResults);

        if (DEV_CONFIG.ENABLE_CONSOLE_LOGS && shouldShowDevControls()) {
          console.log("📋 Parsed search results:", results);
          console.log("📋 Results.data structure:", results.data);
          console.log("📋 Search results array:", results.data?.search_results);
        }

        // Handle the actual API response structure
        if (results.status && results.data) {
          if (DEV_CONFIG.ENABLE_CONSOLE_LOGS && shouldShowDevControls()) {
            console.log(
              "✅ Found results with status=true, data:",
              results.data
            );
          }

          // Check if search_results exists and has data
          if (
            results.data.search_results &&
            Array.isArray(results.data.search_results)
          ) {
            if (DEV_CONFIG.ENABLE_CONSOLE_LOGS && shouldShowDevControls()) {
              console.log(
                "✅ Setting flight results:",
                results.data.search_results
              );
            }
            setFlightResults(results.data.search_results);
            setSearchInfo(results.data);
            setError(null);
            if (DEV_CONFIG.ENABLE_CONSOLE_LOGS && shouldShowDevControls()) {
              console.log(
                "✅ Flight results loaded:",
                results.data.search_results.length,
                "flights"
              );
            }
          } else {
            if (DEV_CONFIG.ENABLE_CONSOLE_LOGS && shouldShowDevControls()) {
              console.warn("⚠️ No search_results array found in API response");
              console.log("Data structure:", Object.keys(results.data || {}));
            }

            // Fallback: try different possible property names
            const rawData = results.data as unknown as Record<string, unknown>;
            const possibleFlightArrays = [
              rawData.flights,
              rawData.results,
              rawData.flight_list,
              rawData.data,
            ].filter((arr): arr is FlightSearchApiResult[] =>
              Array.isArray(arr)
            );

            if (possibleFlightArrays.length > 0) {
              if (DEV_CONFIG.ENABLE_CONSOLE_LOGS && shouldShowDevControls()) {
                console.log(
                  "🔄 Found alternative flight array:",
                  possibleFlightArrays[0]
                );
              }
              setFlightResults(possibleFlightArrays[0]);
              setError(null);
            } else {
              if (DEV_CONFIG.ENABLE_CONSOLE_LOGS && shouldShowDevControls()) {
                console.warn(
                  "❌ No flight array found in any expected property"
                );
              }
              setFlightResults([]);
              setError("No flight data found in API response");
            }
            setSearchInfo(results.data);
          }
        } else {
          if (DEV_CONFIG.ENABLE_CONSOLE_LOGS && shouldShowDevControls()) {
            console.warn("⚠️ API returned status=false or no data");
          }
          setError(results.errorMessage || "API returned error");
          setFlightResults([]);
          setSearchInfo(null);
        }
      } catch (err) {
        if (DEV_CONFIG.ENABLE_CONSOLE_LOGS && shouldShowDevControls()) {
          console.error("❌ Error parsing stored results:", err);
        }
        setError("Error loading search results");
        setFlightResults([]);
        setSearchInfo(null);
      }
    } else {
      if (DEV_CONFIG.ENABLE_CONSOLE_LOGS && shouldShowDevControls()) {
        console.log("ℹ️ No stored search results found in sessionStorage");
      }
      setFlightResults([]);
      setSearchInfo(null);
      setError(null);
    }
  };

  // Load search results from sessionStorage when component mounts
  useEffect(() => {
    loadSearchResults();
  }, []);

  // Listen for storage changes to update results in real-time
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "flightSearchResults" && e.newValue) {
        if (DEV_CONFIG.ENABLE_CONSOLE_LOGS && shouldShowDevControls()) {
          console.log("🔄 SessionStorage updated, reloading search results...");
        }
        loadSearchResults();
      }
    };

    // Listen for storage events (works across tabs)
    window.addEventListener("storage", handleStorageChange);

    // Listen for custom event (for same-tab updates)
    const handleCustomStorageUpdate = () => {
      if (DEV_CONFIG.ENABLE_CONSOLE_LOGS && shouldShowDevControls()) {
        console.log(
          "🔄 Custom storage event triggered, reloading search results..."
        );
      }
      loadSearchResults();
    };

    window.addEventListener("sessionStorageUpdated", handleCustomStorageUpdate);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener(
        "sessionStorageUpdated",
        handleCustomStorageUpdate
      );
    };
  }, []);

  // Filter flights based on selected airlines and all filter criteria
  const filteredFlights = flightResults
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

    // Sort filtered flights
    .sort((a, b) => {
      let result = 0;
      switch (filters.sortBy) {
        case "price":
          result = a.pricing.grand_total - b.pricing.grand_total;
          break;
        case "departure":
          result = (
            new Date(a.departure_time).getTime() -
            new Date(b.departure_time).getTime()
          );
          break;
        case "duration":
          result = a.duration_minutes - b.duration_minutes;
          break;
        default:
          result = 0;
      }
      
      // Debug log for sorting
      if (DEV_CONFIG.ENABLE_CONSOLE_LOGS && shouldShowDevControls()) {
        console.log(`🔄 Sort by ${filters.sortBy}:`, {
          flightA: {
            id: a.flight_id,
            price: a.pricing.grand_total,
            departure: a.departure_time,
            duration: a.duration_minutes
          },
          flightB: {
            id: b.flight_id,
            price: b.pricing.grand_total,
            departure: b.departure_time,
            duration: b.duration_minutes
          },
          result
        });
      }
      
      return result;
    });

  const handleAirlineToggle = (airlineId: string) => {
    setSelectedAirlines((prev) =>
      prev.includes(airlineId)
        ? prev.filter((id) => id !== airlineId)
        : [...prev, airlineId]
    );
  };

  const toggleFlightDetails = (flightId: number) => {
    setExpandedFlightId((prev) => (prev === flightId ? null : flightId));
    setActiveTab("flight"); // Reset to first tab when opening
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Enhanced Search Form with Integrated Airlines Selection */}
      <div className="bg-white shadow-lg border-b">
        <div className="container mx-auto px-4 py-6">
          <FlightSearchForm />
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Enhanced Sidebar Filters */}
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
            <div
              className={`space-y-4 ${
                showFilters ? "block" : "hidden lg:block"
              }`}>
              {/* Filter Summary */}
              {flightResults.length > 0 && (
                <Card className="bg-blue-50 border-blue-200">
                  <CardContent>
                    <h3 className="font-semibold text-blue-900 mb-2 text-sm">
                      📊 Tổng quan
                    </h3>
                    <div className="text-xs text-blue-700 space-y-1">
                      <div>🛫 Tổng: {flightResults.length} chuyến bay</div>
                      <div>✅ Phù hợp: {filteredFlights.length} chuyến bay</div>
                      <div>
                        💰 Giá từ{" "}
                        {formatPrice(
                          Math.min(
                            ...flightResults.map((f) => f.pricing.grand_total)
                          )
                        )}
                        -{" "}
                        {formatPrice(
                          Math.max(
                            ...flightResults.map((f) => f.pricing.grand_total)
                          )
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

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
                          onChange={() => handleAirlineToggle(airline.id)}
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
                  <h3 className="font-semibold text-gray-900 mb-4">
                    Số điểm dừng
                  </h3>
                  <div className="space-y-3">
                    {(() => {
                      // Tính toán số lượng chuyến bay theo từng loại điểm dừng
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
                            option.count === 0
                              ? "opacity-50 cursor-not-allowed"
                              : ""
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
                  <h3 className="font-semibold text-gray-900 mb-4">
                    Thời gian bay
                  </h3>
                  <div className="space-y-3">
                    {(() => {
                      // Tính toán số lượng chuyến bay theo thời gian bay
                      const shortFlights = flightResults.filter(
                        (f) => f.duration_minutes <= 120
                      ).length; // <= 2h
                      const mediumFlights = flightResults.filter(
                        (f) =>
                          f.duration_minutes > 120 && f.duration_minutes <= 300
                      ).length; // 2-5h
                      const longFlights = flightResults.filter(
                        (f) => f.duration_minutes > 300
                      ).length; // > 5h

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
                      {Math.min(
                        ...flightResults.map((f) => f.duration_minutes)
                      )}{" "}
                      phút đến{" "}
                      {Math.max(
                        ...flightResults.map((f) => f.duration_minutes)
                      )}{" "}
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

          {/* Enhanced Results */}
          <div className="lg:col-span-3">
            {/* Search Results Header */}
            {searchInfo && (
              <div className="bg-white p-4 rounded-lg border border-gray-200 mb-6">
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-lg font-semibold text-gray-900">
                    🛫 {searchInfo.departure_airport} →{" "}
                    {searchInfo.arrival_airport}
                  </h2>
                  <div className="text-sm text-gray-600">
                    📅 {searchInfo.departure_date}
                  </div>
                </div>
                <div className="text-sm text-gray-600">
                  Tìm thấy{" "}
                  <span className="font-semibold text-blue-600">
                    {searchInfo.total_count}
                  </span>{" "}
                  chuyến bay • Hiển thị{" "}
                  <span className="font-semibold">
                    {filteredFlights.length}
                  </span>{" "}
                  kết quả
                  {searchInfo.passengers && (
                    <span className="ml-2">
                      • {searchInfo.passengers.adults} người lớn
                      {searchInfo.passengers.children > 0 &&
                        `, ${searchInfo.passengers.children} trẻ em`}
                      {searchInfo.passengers.infants > 0 &&
                        `, ${searchInfo.passengers.infants} em bé`}
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Debug Section - Remove in production */}
            {shouldShowDevControls() && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                <h3 className="text-sm font-semibold text-yellow-800 mb-2">
                  🐛 Debug Info
                </h3>
                <div className="text-xs text-yellow-700 space-y-1">
                  <div>
                    <strong>Flight Results Count:</strong>{" "}
                    {flightResults.length}
                  </div>
                  <div>
                    <strong>Filtered Results Count:</strong>{" "}
                    {filteredFlights.length}
                  </div>
                  <div>
                    <strong>Search Info:</strong>{" "}
                    {searchInfo ? "Present" : "Missing"}
                  </div>
                  <div>
                    <strong>Error:</strong> {error || "None"}
                  </div>
                  {searchInfo && (
                    <>
                      <div>
                        <strong>Total from API:</strong>{" "}
                        {searchInfo.total_count}
                      </div>
                      <div>
                        <strong>Search Results in API:</strong>{" "}
                        {searchInfo.search_results?.length || 0}
                      </div>
                    </>
                  )}
                  <details>
                    <summary className="cursor-pointer text-yellow-800 font-medium">
                      Raw sessionStorage data
                    </summary>
                    <pre className="mt-2 text-xs bg-yellow-100 p-2 rounded overflow-auto max-h-40">
                      {sessionStorage.getItem("flightSearchResults") ||
                        "No data"}
                    </pre>
                  </details>
                  <details>
                    <summary className="cursor-pointer text-yellow-800 font-medium">
                      Parsed API Response Structure
                    </summary>
                    <div className="mt-2 text-xs bg-yellow-100 p-2 rounded">
                      {(() => {
                        const stored = sessionStorage.getItem(
                          "flightSearchResults"
                        );
                        if (stored) {
                          try {
                            const parsed = JSON.parse(stored);
                            return (
                              <div className="space-y-1">
                                <div>
                                  <strong>Status:</strong>{" "}
                                  {String(parsed.status)}
                                </div>
                                <div>
                                  <strong>Has Data:</strong>{" "}
                                  {parsed.data ? "Yes" : "No"}
                                </div>
                                {parsed.data && (
                                  <>
                                    <div>
                                      <strong>Data Keys:</strong>{" "}
                                      {Object.keys(parsed.data).join(", ")}
                                    </div>
                                    <div>
                                      <strong>Search Results Array:</strong>{" "}
                                      {Array.isArray(parsed.data.search_results)
                                        ? `Array[${parsed.data.search_results.length}]`
                                        : "Not an array"}
                                    </div>
                                  </>
                                )}
                                <div>
                                  <strong>Error Code:</strong>{" "}
                                  {parsed.errorCode || "None"}
                                </div>
                                <div>
                                  <strong>Error Message:</strong>{" "}
                                  {parsed.errorMessage || "None"}
                                </div>
                              </div>
                            );
                          } catch (e) {
                            return `Parse error: ${e}`;
                          }
                        }
                        return "No stored data";
                      })()}
                    </div>
                  </details>
                </div>
              </div>
            )}

            {/* Error State */}
            {error && (
              <Card className="border border-red-200 bg-red-50">
                <CardContent className="p-6 text-center">
                  <div className="text-red-600 mb-2">⚠️</div>
                  <h3 className="text-lg font-medium text-red-900 mb-2">
                    Có lỗi xảy ra
                  </h3>
                  <p className="text-red-700">{error}</p>
                </CardContent>
              </Card>
            )}

            {/* Results Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-gray-900 flex items-center">
                  <span className="mr-2">Chọn chiều đi</span>
                  <Button variant="ghost" size="sm">
                    <SlidersHorizontal className="h-4 w-4" />
                  </Button>
                </h2>
                <p className="text-gray-600 text-sm">
                  {filteredFlights.length} Kết quả
                  {filters.sortBy !== "price" && (
                    <span className="ml-2 text-blue-600 font-medium">
                      • Sắp xếp theo {
                        filters.sortBy === "departure" ? "thời gian khởi hành" :
                        filters.sortBy === "duration" ? "thời gian bay" : "giá"
                      }
                    </span>
                  )}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Sắp xếp theo</span>
                <select 
                  value={filters.sortBy}
                  onChange={(e) => setFilters(prev => ({ ...prev, sortBy: e.target.value }))}
                  className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                  <option value="price">Rẻ nhất</option>
                  <option value="departure">Sớm nhất</option>
                  <option value="duration">Nhanh nhất</option>
                </select>
              </div>
            </div>

            {/* Sort Notification */}
            {filters.sortBy !== "price" && filteredFlights.length > 0 && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
                <div className="flex items-center text-green-800 text-sm">
                  <span className="mr-2">
                    {filters.sortBy === "departure" ? "🕐" : 
                     filters.sortBy === "duration" ? "⏱️" : "📊"}
                  </span>
                  <span className="font-medium">
                    Đã sắp xếp theo{" "}
                    {filters.sortBy === "departure" ? "thời gian khởi hành sớm nhất" :
                     filters.sortBy === "duration" ? "thời gian bay ngắn nhất" : "giá rẻ nhất"}
                  </span>
                </div>
              </div>
            )}

            {/* Enhanced Flight Results */}
            <div className="space-y-3">
              {/* Test API Data Display */}
              {shouldShowDevControls() && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                  <h4 className="text-sm font-semibold text-blue-800 mb-2">
                    🧪 Flight Data Test Display
                  </h4>
                  <div className="text-xs text-blue-700 space-y-2">
                    <div>
                      <strong>flightResults state:</strong>{" "}
                      {flightResults.length} items
                    </div>
                    <div>
                      <strong>filteredFlights:</strong> {filteredFlights.length}{" "}
                      items
                    </div>
                    {flightResults.length > 0 && (
                      <div className="bg-blue-100 p-2 rounded">
                        <strong>First flight sample:</strong>
                        <pre className="text-xs mt-1 whitespace-pre-wrap max-h-40 overflow-auto">
                          {JSON.stringify(flightResults[0], null, 2)}
                        </pre>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {!error && filteredFlights.length === 0 ? (
                <Card className="border border-gray-200">
                  <CardContent className="p-8 text-center">
                    <Plane className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      {flightResults.length === 0
                        ? "Chưa có kết quả tìm kiếm"
                        : "Không tìm thấy chuyến bay"}
                    </h3>
                    <p className="text-gray-500">
                      {flightResults.length === 0
                        ? "Vui lòng sử dụng form tìm kiếm ở trên để tìm chuyến bay."
                        : "Không có chuyến bay nào từ hãng hàng không đã chọn. Vui lòng thử chọn hãng khác hoặc 'Tất cả hãng bay'."}
                    </p>
                    {flightResults.length === 0 ? null : (
                      <Button
                        variant="outline"
                        onClick={() => setSelectedAirlines([])}
                        className="mt-4">
                        Xem tất cả chuyến bay
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ) : (
                filteredFlights.map((flight) => {
                  const departureTime = formatDateTime(flight.departure_time);
                  const arrivalTime = formatDateTime(flight.arrival_time);
                  const duration = formatDuration(flight.duration_minutes);

                  // Find airline logo
                  const airlineInfo =
                    vietnameseAirlines.find(
                      (a) =>
                        a.name.toLowerCase() ===
                        flight.airline_name.toLowerCase()
                    ) || vietnameseAirlines[0]; // fallback to first airline if not found

                  const isExpanded = expandedFlightId === flight.flight_id;

                  return (
                    <Card
                      key={flight.flight_id}
                      className="hover:shadow-md transition-shadow border border-gray-200">
                      <CardContent className="p-0">
                        {/* Main Flight Info */}
                        <div className="p-4">
                          <div className="flex items-center justify-between">
                            {/* Flight Info */}
                            <div className="flex items-center space-x-6 flex-1">
                              {/* Airline */}
                              <div className="flex flex-col items-center min-w-[80px]">
                                <div className="h-10 w-16 flex items-center justify-center mb-1">
                                  <img
                                    src={airlineInfo.logo}
                                    alt={flight.airline_name}
                                    className="h-8 w-auto object-contain"
                                    loading="lazy"
                                  />
                                </div>
                                <div className="text-xs font-medium text-center">
                                  {flight.flight_number}
                                </div>
                                <div className="text-xs text-gray-500 text-center">
                                  {flight.fare_class_details.cabin_class}
                                </div>
                                <div className="text-xs text-blue-600 text-center">
                                  {flight.fare_class_details.baggage_kg}
                                </div>
                              </div>

                              {/* Flight Times */}
                              <div className="flex items-center space-x-4 flex-1">
                                <div className="text-center">
                                  <div className={`text-xl font-bold ${
                                    filters.sortBy === "departure" ? "text-green-600 bg-green-50 px-2 py-1 rounded" : ""
                                  }`}>
                                    {departureTime.time}
                                    {filters.sortBy === "departure" && (
                                      <span className="text-xs ml-1">🕐</span>
                                    )}
                                  </div>
                                  <div className="text-sm text-gray-600">
                                    {flight.departure_airport_code}
                                  </div>
                                  <div className="text-xs text-gray-500">
                                    {flight.departure_airport}
                                  </div>
                                </div>

                                <div className="flex flex-col items-center px-4">
                                  <div className={`text-xs text-gray-500 mb-1 ${
                                    filters.sortBy === "duration" ? "font-bold text-green-600 bg-green-50 px-2 py-1 rounded" : ""
                                  }`}>
                                    {duration}
                                    {filters.sortBy === "duration" && (
                                      <span className="text-xs ml-1">⏱️</span>
                                    )}
                                  </div>
                                  <div className="flex items-center">
                                    <div className="h-px bg-gray-300 w-16"></div>
                                    <ArrowRight className="h-4 w-4 text-gray-400 mx-1" />
                                  </div>
                                  <div className="text-xs text-gray-500 mt-1">
                                    {flight.stops_count === 0
                                      ? "Bay thẳng"
                                      : `${flight.stops_count} điểm dừng`}
                                  </div>
                                </div>

                                <div className="text-center">
                                  <div className="text-xl font-bold">
                                    {arrivalTime.time}
                                  </div>
                                  <div className="text-sm text-gray-600">
                                    {flight.arrival_airport_code}
                                  </div>
                                  <div className="text-xs text-gray-500">
                                    {flight.arrival_airport}
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Price and Actions */}
                            <div className="flex flex-col items-end space-y-2 min-w-[140px]">
                              <div className="text-right">
                                <div className={`text-xl font-bold ${
                                  filters.sortBy === "price" ? "text-green-600 bg-green-50 px-2 py-1 rounded" : "text-orange-600"
                                }`}>
                                  {formatPrice(flight.pricing.grand_total)}
                                  {filters.sortBy === "price" && (
                                    <span className="text-xs ml-1">📊</span>
                                  )}
                                </div>
                                <div className="text-xs text-gray-500">
                                  {flight.fare_class_details.refundable
                                    ? "Hoàn tiền"
                                    : "Không hoàn tiền"}{" "}
                                  •{" "}
                                  {flight.fare_class_details.changeable
                                    ? "Đổi được"
                                    : "Không đổi"}
                                </div>
                              </div>
                              <div className="flex space-x-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() =>
                                    toggleFlightDetails(flight.flight_id)
                                  }
                                  className="px-3">
                                  {isExpanded ? (
                                    <ChevronUp className="h-4 w-4" />
                                  ) : (
                                    <ChevronDown className="h-4 w-4" />
                                  )}
                                </Button>
                                <Button
                                  size="sm"
                                  className="bg-blue-600 hover:bg-blue-700 px-6">
                                  Chọn
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Expanded Details */}
                        {isExpanded && (
                          <div className="border-t border-gray-200 bg-gray-50">
                            <div className="p-4 space-y-4">
                              {/* Flight Details Header */}
                              <div className="flex items-center justify-between">
                                <h4 className="text-lg font-semibold text-gray-900 flex items-center">
                                  <Info className="h-5 w-5 mr-2 text-blue-600" />
                                  Chi tiết chuyến bay
                                </h4>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() =>
                                    toggleFlightDetails(flight.flight_id)
                                  }
                                  className="text-gray-500 hover:text-gray-700">
                                  Thu gọn
                                </Button>
                              </div>

                              {/* Tab Navigation */}
                              <div className="flex border-b border-gray-200">
                                <button
                                  onClick={() => setActiveTab("flight")}
                                  className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                                    activeTab === "flight"
                                      ? "border-blue-600 text-blue-600"
                                      : "border-transparent text-gray-500 hover:text-gray-700"
                                  }`}>
                                  <Clock className="h-4 w-4 inline mr-2" />
                                  Chuyến bay
                                </button>
                                <button
                                  onClick={() => setActiveTab("pricing")}
                                  className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                                    activeTab === "pricing"
                                      ? "border-blue-600 text-blue-600"
                                      : "border-transparent text-gray-500 hover:text-gray-700"
                                  }`}>
                                  <CreditCard className="h-4 w-4 inline mr-2" />
                                  Giá vé
                                </button>
                                <button
                                  onClick={() => setActiveTab("conditions")}
                                  className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                                    activeTab === "conditions"
                                      ? "border-blue-600 text-blue-600"
                                      : "border-transparent text-gray-500 hover:text-gray-700"
                                  }`}>
                                  <Luggage className="h-4 w-4 inline mr-2" />
                                  Điều kiện vé
                                </button>
                              </div>

                              {/* Tab Content */}
                              <div className="mt-4">
                                {/* Flight Tab */}
                                {activeTab === "flight" && (
                                  <div className="grid md:grid-cols-2 gap-6">
                                    {/* Flight Information */}
                                    <div className="bg-white rounded-lg p-4 border border-gray-200">
                                      <h5 className="font-semibold text-gray-900 mb-3 flex items-center">
                                        <Clock className="h-4 w-4 mr-2 text-blue-600" />
                                        Thông tin chuyến bay
                                      </h5>
                                      <div className="space-y-2 text-sm">
                                        <div className="flex justify-between">
                                          <span className="text-gray-600">
                                            Mã chuyến bay:
                                          </span>
                                          <span className="font-medium">
                                            {flight.flight_number}
                                          </span>
                                        </div>
                                        <div className="flex justify-between">
                                          <span className="text-gray-600">
                                            Hãng hàng không:
                                          </span>
                                          <span className="font-medium">
                                            {flight.airline_name}
                                          </span>
                                        </div>
                                        <div className="flex justify-between">
                                          <span className="text-gray-600">
                                            Hạng vé:
                                          </span>
                                          <span className="font-medium">
                                            {flight.flight_class}
                                          </span>
                                        </div>
                                        <div className="flex justify-between">
                                          <span className="text-gray-600">
                                            Thời gian bay:
                                          </span>
                                          <span className="font-medium">
                                            {duration}
                                          </span>
                                        </div>
                                        <div className="flex justify-between">
                                          <span className="text-gray-600">
                                            Số điểm dừng:
                                          </span>
                                          <span className="font-medium">
                                            {flight.stops_count === 0
                                              ? "Bay thẳng"
                                              : `${flight.stops_count} điểm dừng`}
                                          </span>
                                        </div>
                                      </div>
                                    </div>

                                    {/* Schedule Information */}
                                    <div className="bg-white rounded-lg p-4 border border-gray-200">
                                      <h5 className="font-semibold text-gray-900 mb-3 flex items-center">
                                        <Calendar className="h-4 w-4 mr-2 text-blue-600" />
                                        Lịch trình
                                      </h5>
                                      <div className="space-y-3">
                                        <div className="flex items-start space-x-3">
                                          <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                                          <div className="flex-1">
                                            <div className="flex items-center justify-between">
                                              <span className="font-medium text-gray-900">
                                                Khởi hành
                                              </span>
                                              <span className="text-lg font-bold text-gray-900">
                                                {departureTime.time}
                                              </span>
                                            </div>
                                            <div className="text-sm text-gray-600">
                                              {departureTime.date} •{" "}
                                              {flight.departure_airport_code} -{" "}
                                              {flight.departure_airport}
                                            </div>
                                          </div>
                                        </div>
                                        <div className="ml-1 border-l-2 border-dashed border-gray-300 h-8"></div>
                                        <div className="flex items-start space-x-3">
                                          <div className="w-2 h-2 bg-orange-500 rounded-full mt-2"></div>
                                          <div className="flex-1">
                                            <div className="flex items-center justify-between">
                                              <span className="font-medium text-gray-900">
                                                Đến nơi
                                              </span>
                                              <span className="text-lg font-bold text-gray-900">
                                                {arrivalTime.time}
                                              </span>
                                            </div>
                                            <div className="text-sm text-gray-600">
                                              {arrivalTime.date} •{" "}
                                              {flight.arrival_airport_code} -{" "}
                                              {flight.arrival_airport}
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                )}

                                {/* Pricing Tab */}
                                {activeTab === "pricing" && (
                                  <div className="grid md:grid-cols-2 gap-6">
                                    {/* Fare Details */}
                                    <div className="bg-white rounded-lg p-4 border border-gray-200">
                                      <h5 className="font-semibold text-gray-900 mb-3 flex items-center">
                                        <CreditCard className="h-4 w-4 mr-2 text-blue-600" />
                                        Chi tiết giá vé
                                      </h5>
                                      <div className="space-y-2 text-sm">
                                        <div className="flex justify-between">
                                          <span className="text-gray-600">
                                            Giá cơ bản (Người lớn):
                                          </span>
                                          <span className="font-medium">
                                            {formatPrice(
                                              flight.pricing.base_prices.adult
                                            )}
                                          </span>
                                        </div>
                                        {flight.pricing.base_prices.child >
                                          0 && (
                                          <div className="flex justify-between">
                                            <span className="text-gray-600">
                                              Giá cơ bản (Trẻ em):
                                            </span>
                                            <span className="font-medium">
                                              {formatPrice(
                                                flight.pricing.base_prices.child
                                              )}
                                            </span>
                                          </div>
                                        )}
                                        <div className="flex justify-between">
                                          <span className="text-gray-600">
                                            Thuế và phí:
                                          </span>
                                          <span className="font-medium">
                                            {formatPrice(
                                              flight.pricing.taxes.adult
                                            )}
                                          </span>
                                        </div>
                                        <div className="border-t border-gray-200 pt-2 mt-2">
                                          <div className="flex justify-between font-semibold text-base">
                                            <span className="text-gray-900">
                                              Tổng cộng:
                                            </span>
                                            <span className="text-orange-600">
                                              {formatPrice(
                                                flight.pricing.grand_total
                                              )}
                                            </span>
                                          </div>
                                        </div>
                                      </div>
                                    </div>

                                    {/* Price Breakdown */}
                                    <div className="bg-white rounded-lg p-4 border border-gray-200">
                                      <h5 className="font-semibold text-gray-900 mb-3">
                                        Phân tích giá
                                      </h5>
                                      <div className="space-y-2 text-sm">
                                        <div className="flex justify-between">
                                          <span className="text-gray-600">
                                            Tổng giá (Người lớn):
                                          </span>
                                          <span className="font-medium">
                                            {formatPrice(
                                              flight.pricing.total_prices.adult
                                            )}
                                          </span>
                                        </div>
                                        {flight.pricing.total_prices.child >
                                          0 && (
                                          <div className="flex justify-between">
                                            <span className="text-gray-600">
                                              Tổng giá (Trẻ em):
                                            </span>
                                            <span className="font-medium">
                                              {formatPrice(
                                                flight.pricing.total_prices
                                                  .child
                                              )}
                                            </span>
                                          </div>
                                        )}
                                        {flight.pricing.total_prices.infant >
                                          0 && (
                                          <div className="flex justify-between">
                                            <span className="text-gray-600">
                                              Tổng giá (Em bé):
                                            </span>
                                            <span className="font-medium">
                                              {formatPrice(
                                                flight.pricing.total_prices
                                                  .infant
                                              )}
                                            </span>
                                          </div>
                                        )}
                                        <div className="text-xs text-gray-500 mt-2">
                                          * Giá bao gồm tất cả thuế và phí
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                )}

                                {/* Conditions Tab */}
                                {activeTab === "conditions" && (
                                  <div className="grid md:grid-cols-2 gap-6">
                                    {/* Services & Baggage */}
                                    <div className="bg-white rounded-lg p-4 border border-gray-200">
                                      <h5 className="font-semibold text-gray-900 mb-3 flex items-center">
                                        <Luggage className="h-4 w-4 mr-2 text-blue-600" />
                                        Dịch vụ & Hành lý
                                      </h5>
                                      <div className="space-y-2 text-sm">
                                        <div className="flex justify-between">
                                          <span className="text-gray-600">
                                            Hạng ghế:
                                          </span>
                                          <span className="font-medium">
                                            {
                                              flight.fare_class_details
                                                .cabin_class
                                            }
                                          </span>
                                        </div>
                                        <div className="flex justify-between">
                                          <span className="text-gray-600">
                                            Hành lý xách tay:
                                          </span>
                                          <span className="font-medium">
                                            7kg (tiêu chuẩn)
                                          </span>
                                        </div>
                                        <div className="flex justify-between">
                                          <span className="text-gray-600">
                                            Hành lý ký gửi:
                                          </span>
                                          <span className="font-medium">
                                            {
                                              flight.fare_class_details
                                                .baggage_kg
                                            }
                                          </span>
                                        </div>
                                        <div className="text-xs text-gray-500 mt-2">
                                          {
                                            flight.fare_class_details
                                              .description
                                          }
                                        </div>
                                      </div>
                                    </div>

                                    {/* Terms & Conditions */}
                                    <div className="bg-white rounded-lg p-4 border border-gray-200">
                                      <h5 className="font-semibold text-gray-900 mb-3 flex items-center">
                                        <Users className="h-4 w-4 mr-2 text-blue-600" />
                                        Điều kiện vé
                                      </h5>
                                      <div className="space-y-2 text-sm">
                                        <div className="flex justify-between">
                                          <span className="text-gray-600">
                                            Hoàn vé:
                                          </span>
                                          <span
                                            className={`font-medium ${
                                              flight.fare_class_details
                                                .refundable
                                                ? "text-green-600"
                                                : "text-red-600"
                                            }`}>
                                            {flight.fare_class_details
                                              .refundable
                                              ? "Được hoàn"
                                              : "Không hoàn"}
                                          </span>
                                        </div>
                                        <div className="flex justify-between">
                                          <span className="text-gray-600">
                                            Đổi vé:
                                          </span>
                                          <span
                                            className={`font-medium ${
                                              flight.fare_class_details
                                                .changeable
                                                ? "text-green-600"
                                                : "text-red-600"
                                            }`}>
                                            {flight.fare_class_details
                                              .changeable
                                              ? "Được đổi"
                                              : "Không đổi"}
                                          </span>
                                        </div>
                                        <div className="flex justify-between">
                                          <span className="text-gray-600">
                                            Mã hạng vé:
                                          </span>
                                          <span className="font-medium">
                                            {
                                              flight.fare_class_details
                                                .fare_class_code
                                            }
                                          </span>
                                        </div>
                                        <div className="text-xs text-gray-500 mt-2">
                                          💡 Lưu ý: Điều kiện có thể thay đổi
                                          theo chính sách hãng hàng không
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </div>

                              {/* Action Buttons */}
                              <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                                <div className="text-sm text-gray-600">
                                  💡 Mẹo: Đặt ngay để đảm bảo có chỗ với giá tốt
                                  nhất
                                </div>
                                <div className="flex space-x-3">
                                  <Button
                                    variant="outline"
                                    onClick={() =>
                                      toggleFlightDetails(flight.flight_id)
                                    }>
                                    Thu gọn
                                  </Button>
                                  <Button className="bg-orange-600 hover:bg-orange-700 px-8">
                                    Đặt ngay -{" "}
                                    {formatPrice(flight.pricing.grand_total)}
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })
              )}
            </div>

            {/* Load More */}
            {filteredFlights.length > 0 && (
              <div className="text-center mt-8">
                <Button variant="outline" size="lg">
                  Xem thêm chuyến bay (
                  {searchInfo?.total_count &&
                  searchInfo.total_count > filteredFlights.length
                    ? `còn ${searchInfo.total_count - filteredFlights.length}`
                    : "tất cả"}
                  )
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Search;
