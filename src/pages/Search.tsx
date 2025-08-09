import type React from "react";
import { useState, useEffect } from "react";
import FlightSearchForm from "../components/flight/FlightSearchForm";
import FilterSidebar from "../components/flight/FilterSidebar";
import OneWayFlightList from "../components/flight/OneWayFlightList";
import RoundTripFlightList from "../components/flight/RoundTripFlightList";
import SearchResultsHeader from "../components/flight/SearchResultsHeader";
import LoadMoreButton from "../components/common/LoadMoreButton";
import { airlines } from "../mocks";
import { formatPrice } from "../services/flightApiService";
import { useFlightFilters } from "../hooks/useFlightFilters";
import type {
  FlightSearchApiResult,
  FlightSearchApiWrapper,
  FlightSearchResponseData,
} from "../shared/types/search-api.types";
import {
  isRoundTripResponse,
  isOneWayResponse,
} from "../shared/types/search-api.types";
import { DEV_CONFIG, shouldShowDevControls } from "../shared/config/devConfig";

// Transform airlines data for use in this component
const vietnameseAirlines = airlines.map((airline) => ({
  id: airline.name.toLowerCase().replace(/\s+/g, "-"),
  name: airline.name,
  logo: airline.logo,
  code: airline.name.substring(0, 2).toUpperCase(),
}));

const Search: React.FC = () => {
  // UI State
  const [showFilters, setShowFilters] = useState(false);
  const [selectedAirlines, setSelectedAirlines] = useState<string[]>([]);
  const [filters, setFilters] = useState({
    priceRange: "all",
    departureTime: "all",
    stops: "all",
    duration: "all",
    sortBy: "price",
  });

  // Flight Data State
  const [flightResults, setFlightResults] = useState<FlightSearchApiResult[]>(
    []
  );
  const [returnFlightResults, setReturnFlightResults] = useState<
    FlightSearchApiResult[]
  >([]);
  const [searchInfo, setSearchInfo] = useState<FlightSearchResponseData | null>(
    null
  );
  const [tripType, setTripType] = useState<string>("one-way");
  const [error, setError] = useState<string | null>(null);

  // Round-trip specific state
  const [activeTab, setActiveTab] = useState<"outbound" | "inbound">(
    "outbound"
  );
  const [selectedOutboundFlight, setSelectedOutboundFlight] =
    useState<FlightSearchApiResult | null>(null);
  const [selectedInboundFlight, setSelectedInboundFlight] =
    useState<FlightSearchApiResult | null>(null);

  // Use custom hook for filtering
  const { filteredFlights } = useFlightFilters({
    flights: flightResults,
    selectedAirlines,
    filters,
  });

  const { filteredFlights: filteredReturnFlights } = useFlightFilters({
    flights: returnFlightResults,
    selectedAirlines,
    filters,
  });

  // Get current flights to display based on trip type and active tab
  const currentFlights =
    tripType === "round-trip" && activeTab === "inbound"
      ? filteredReturnFlights
      : filteredFlights;

  // Flight selection handlers
  const handleFlightSelection = (flight: FlightSearchApiResult) => {
    if (tripType === "round-trip") {
      if (activeTab === "outbound") {
        setSelectedOutboundFlight(flight);
        setActiveTab("inbound");
      } else {
        setSelectedInboundFlight(flight);
        showBookingSummary(selectedOutboundFlight!, flight);
      }
    } else {
      proceedToBooking(flight);
    }
  };

  const showBookingSummary = (
    outbound: FlightSearchApiResult,
    inbound: FlightSearchApiResult
  ) => {
    const totalPrice =
      outbound.pricing.grand_total + inbound.pricing.grand_total;
    alert(
      `Tổng giá vé khứ hồi: ${formatPrice(totalPrice)}\nChiều đi: ${
        outbound.flight_number
      }\nChiều về: ${inbound.flight_number}`
    );
  };

  const proceedToBooking = (flight: FlightSearchApiResult) => {
    alert(
      `Đặt vé: ${flight.flight_number} - ${formatPrice(
        flight.pricing.grand_total
      )}`
    );
  };

  const clearSelectedFlight = (direction: "outbound" | "inbound") => {
    if (direction === "outbound") {
      setSelectedOutboundFlight(null);
      setActiveTab("outbound");
    } else {
      setSelectedInboundFlight(null);
    }
  };

  const handleAirlineToggle = (airlineId: string) => {
    setSelectedAirlines((prev) =>
      prev.includes(airlineId)
        ? prev.filter((id) => id !== airlineId)
        : [...prev, airlineId]
    );
  };

  // Function to load search results from sessionStorage
  const loadSearchResults = () => {
    const storedResults = sessionStorage.getItem("flightSearchResults");
    const storedTripType = sessionStorage.getItem("tripType") || "one-way";

    if (DEV_CONFIG.ENABLE_CONSOLE_LOGS && shouldShowDevControls()) {
      console.log("🔍 Checking sessionStorage for results...");
      console.log("Raw stored results:", storedResults);
      console.log("Trip type:", storedTripType);
    }

    setTripType(storedTripType);

    if (storedResults) {
      try {
        const results: FlightSearchApiWrapper = JSON.parse(storedResults);

        if (DEV_CONFIG.ENABLE_CONSOLE_LOGS && shouldShowDevControls()) {
          console.log("📋 Parsed search results:", results);
          console.log("📋 Results.data structure:", results.data);
        }

        // Handle the actual API response structure
        if (results.status && results.data) {
          if (DEV_CONFIG.ENABLE_CONSOLE_LOGS && shouldShowDevControls()) {
            console.log(
              "✅ Found results with status=true, data:",
              results.data
            );
          }

          // Check if this is a round-trip response
          if (isRoundTripResponse(results.data)) {
            if (DEV_CONFIG.ENABLE_CONSOLE_LOGS && shouldShowDevControls()) {
              console.log("🔄 Processing round-trip response");
              console.log(
                "Outbound flights:",
                results.data.outbound_search_results?.length
              );
              console.log(
                "Inbound flights:",
                results.data.inbound_search_results?.length
              );
            }

            // Set outbound and inbound flights
            setFlightResults(results.data.outbound_search_results || []);
            setReturnFlightResults(results.data.inbound_search_results || []);
            setSearchInfo(results.data);
            setError(null);

            if (DEV_CONFIG.ENABLE_CONSOLE_LOGS && shouldShowDevControls()) {
              console.log(
                "✅ Round-trip results loaded:",
                results.data.outbound_search_results?.length || 0,
                "outbound flights,",
                results.data.inbound_search_results?.length || 0,
                "inbound flights"
              );
            }
          } else if (isOneWayResponse(results.data)) {
            if (DEV_CONFIG.ENABLE_CONSOLE_LOGS && shouldShowDevControls()) {
              console.log("➡️ Processing one-way response");
              console.log(
                "Search results:",
                results.data.search_results?.length
              );
            }

            // Set one-way flights
            setFlightResults(results.data.search_results || []);
            setReturnFlightResults([]);
            setSearchInfo(results.data);
            setError(null);

            if (DEV_CONFIG.ENABLE_CONSOLE_LOGS && shouldShowDevControls()) {
              console.log(
                "✅ One-way results loaded:",
                results.data.search_results?.length || 0,
                "flights"
              );
            }
          } else {
            if (DEV_CONFIG.ENABLE_CONSOLE_LOGS && shouldShowDevControls()) {
              console.warn("⚠️ Unknown response format");
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
              setReturnFlightResults([]);
              setError(null);
            } else {
              if (DEV_CONFIG.ENABLE_CONSOLE_LOGS && shouldShowDevControls()) {
                console.warn(
                  "❌ No flight array found in any expected property"
                );
              }
              setFlightResults([]);
              setReturnFlightResults([]);
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
          setReturnFlightResults([]);
          setSearchInfo(null);
        }
      } catch (err) {
        if (DEV_CONFIG.ENABLE_CONSOLE_LOGS && shouldShowDevControls()) {
          console.error("❌ Error parsing stored results:", err);
        }
        setError("Error loading search results");
        setFlightResults([]);
        setReturnFlightResults([]);
        setSearchInfo(null);
      }
    } else {
      if (DEV_CONFIG.ENABLE_CONSOLE_LOGS && shouldShowDevControls()) {
        console.log("ℹ️ No stored search results found in sessionStorage");
      }
      setFlightResults([]);
      setReturnFlightResults([]);
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Search Form */}
      <div className="bg-white shadow-lg border-b">
        <div className="container mx-auto px-4 py-6">
          <FlightSearchForm />
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Filter Sidebar */}
          <FilterSidebar
            showFilters={showFilters}
            setShowFilters={setShowFilters}
            selectedAirlines={selectedAirlines}
            setSelectedAirlines={setSelectedAirlines}
            filters={filters}
            setFilters={setFilters}
            flightResults={flightResults}
            filteredFlights={filteredFlights}
            vietnameseAirlines={vietnameseAirlines}
            onAirlineToggle={handleAirlineToggle}
          />

          {/* Main Results */}
          <div className="lg:col-span-3">
            {/* Search Results Header */}
            <SearchResultsHeader
              searchInfo={searchInfo}
              tripType={tripType}
              filteredFlights={filteredFlights}
              returnFlightResults={returnFlightResults}
              currentFlights={currentFlights}
              activeTab={activeTab}
              filters={filters}
              setFilters={setFilters}
            />

            {/* Debug Section */}
            {shouldShowDevControls() && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                <h3 className="text-sm font-semibold text-yellow-800 mb-2">
                  🐛 Debug Info
                </h3>
                <div className="text-xs text-yellow-700 space-y-1">
                  <div>
                    <strong>Trip Type:</strong> {tripType}
                  </div>
                  <div>
                    <strong>Outbound Results:</strong> {flightResults.length}
                  </div>
                  {tripType === "round-trip" && (
                    <div>
                      <strong>Return Results:</strong>{" "}
                      {returnFlightResults.length}
                    </div>
                  )}
                  <div>
                    <strong>Error:</strong> {error || "None"}
                  </div>
                </div>
              </div>
            )}

            {/* Flight Lists */}
            {tripType === "round-trip" ? (
              <RoundTripFlightList
                outboundFlights={filteredFlights}
                inboundFlights={filteredReturnFlights}
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                selectedOutboundFlight={selectedOutboundFlight}
                selectedInboundFlight={selectedInboundFlight}
                onFlightSelect={handleFlightSelection}
                onClearSelectedFlight={clearSelectedFlight}
                sortBy={filters.sortBy}
                vietnameseAirlines={vietnameseAirlines}
                searchInfo={searchInfo}
                error={error}
              />
            ) : (
              <OneWayFlightList
                flights={filteredFlights}
                sortBy={filters.sortBy}
                vietnameseAirlines={vietnameseAirlines}
                onFlightSelect={handleFlightSelection}
                error={error}
              />
            )}

            {/* Load More Button */}
            <LoadMoreButton
              searchInfo={searchInfo}
              filteredFlights={filteredFlights}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Search;
