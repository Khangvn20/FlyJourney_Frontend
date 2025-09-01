import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import FlightSearchForm from "../components/flight/FlightSearchForm";
import FilterSidebar from "../components/flight/FilterSidebar";
import OneWayFlightList from "../components/flight/OneWayFlightList";
import RoundTripFlightList from "../components/flight/RoundTripFlightList";
import RoundTripSummary from "../components/flight/RoundTripSummary";
import SearchResultsHeader from "../components/flight/SearchResultsHeader";
import LoadMoreButton from "../components/common/LoadMoreButton";
import FlightCardSkeleton from "../components/flight/FlightCardSkeleton";
import MonthOverview from "../components/flight/MonthOverview";
import { useFlightSearch } from "../hooks/useFlightSearch";
import type { FlightSearchApiResult } from "../shared/types/search-api.types";
// Filtering/sorting handled by hooks and utilities

const Search: React.FC = () => {
  const navigate = useNavigate();
  const {
    showFilters,
    setShowFilters,
    selectedAirlines,
    setSelectedAirlines,
    filters,
    setFilters,
    searchInfo,
    perDayResults,
    monthMeta,
    tripType,
    error,
    showMonthOverview,
    setShowMonthOverview,
    skeletonActive,
    progressiveFlights,
    bookingStep,
    setBookingStep,
    selectedOutboundFlight,
    setSelectedOutboundFlight,
    selectedInboundFlight,
    setSelectedInboundFlight,
    handleLoadMore,
    isLoadingMore,
    lastLoadMoreAdded,
    handleAirlineToggle,
    clearSelectedFlight,
    handleTabChange,
    flightResults,
    filteredFlights,
    filteredReturnFlights,
    filteredPerDayResults,
    activeTab,
    currentFlights,
    displayOneWayFlights,
    vietnameseAirlines,
  } = useFlightSearch();

  const [showOtherAirlines, setShowOtherAirlines] = useState(false);

  const proceedToBooking = (flight: FlightSearchApiResult) => {
    const bookingSelection = {
      tripType: "one-way" as const,
      outbound: flight,
      totalPrice: flight.pricing.grand_total,
      currency: flight.pricing.currency,
    };
    sessionStorage.setItem(
      "bookingSelection",
      JSON.stringify(bookingSelection)
    );
    navigate("/booking", { state: { bookingSelection } });
  };

  const showBookingSummary = (
    outbound: FlightSearchApiResult,
    inbound: FlightSearchApiResult
  ) => {
    const totalPrice =
      outbound.pricing.grand_total + inbound.pricing.grand_total;
    const bookingSelection = {
      tripType: "round-trip" as const,
      outbound,
      inbound,
      totalPrice,
      currency: outbound.pricing.currency,
    };
    sessionStorage.setItem(
      "bookingSelection",
      JSON.stringify(bookingSelection)
    );
    navigate("/booking", { state: { bookingSelection } });
  };

  const confirmSelection = () => {
    if (selectedOutboundFlight && selectedInboundFlight) {
      showBookingSummary(selectedOutboundFlight, selectedInboundFlight);
    }
  };

  const handleFlightSelection = (flight: FlightSearchApiResult) => {
    if (tripType === "round-trip") {
      if (bookingStep === 1) {
        setSelectedOutboundFlight(flight);
        setBookingStep(2);
      } else if (bookingStep === 2) {
        setSelectedInboundFlight(flight);
        setBookingStep(3);
      }
    } else {
      proceedToBooking(flight);
    }
  };

  // Suggestions fetched from API (all airlines): show regardless of current non-airline filters
  const otherAirlineSuggestions = useMemo(() => {
    if (!selectedAirlines || selectedAirlines.length === 0)
      return [] as FlightSearchApiResult[];
    const selectedSet = new Set(selectedAirlines);
    const visibleIds = new Set(displayOneWayFlights.map((f) => f.flight_id));
    return (flightResults || [])
      .filter((f) => {
        const slug = (f.airline_name || "").toLowerCase().replace(/\s+/g, "-");
        return !selectedSet.has(slug);
      })
      .filter((f) => !visibleIds.has(f.flight_id));
  }, [selectedAirlines, flightResults, displayOneWayFlights]);

  const visibleOneWayFlights = useMemo(() => {
    if (tripType === "round-trip") return [] as FlightSearchApiResult[];
    return showOtherAirlines
      ? [...displayOneWayFlights, ...otherAirlineSuggestions]
      : displayOneWayFlights;
  }, [tripType, showOtherAirlines, displayOneWayFlights, otherAirlineSuggestions]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-blue-50/40 to-gray-50">
      <div className="relative pt-8 pb-4">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(59,130,246,0.08),transparent_60%)]" />
        <div className="container mx-auto px-4 relative">
          <div className="relative">
            <FlightSearchForm />
            <div className="pointer-events-none absolute -top-14 -left-10 w-56 h-56 bg-blue-200/40 rounded-full blur-3xl" />
            <div className="pointer-events-none absolute -bottom-10 -right-6 w-52 h-52 bg-indigo-200/40 rounded-full blur-3xl" />
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-4 gap-8">
          <div className="lg:sticky lg:top-4 lg:self-start">
            <FilterSidebar
              showFilters={showFilters}
              setShowFilters={setShowFilters}
              selectedAirlines={selectedAirlines}
              setSelectedAirlines={setSelectedAirlines}
              filters={filters}
              setFilters={setFilters}
              flightResults={
                activeTab === "inbound" ? filteredReturnFlights : filteredFlights
              }
              vietnameseAirlines={vietnameseAirlines}
              onAirlineToggle={handleAirlineToggle}
              skeletonActive={skeletonActive}
              progressiveCount={
                !monthMeta &&
                tripType !== "round-trip" &&
                progressiveFlights.length > 0
                  ? progressiveFlights.length
                  : undefined
              }
            />
          </div>

          <div className="lg:col-span-3">
            <SearchResultsHeader
              searchInfo={searchInfo}
              tripType={tripType}
              filteredFlights={filteredFlights}
              currentFlights={currentFlights}
              activeTab={activeTab}
              onTabChange={handleTabChange}
              filters={filters}
              setFilters={setFilters}
              progressiveCount={
                !monthMeta &&
                tripType !== "round-trip" &&
                progressiveFlights.length > 0
                  ? progressiveFlights.length
                  : undefined
              }
              skeletonActive={skeletonActive}
            />

            {monthMeta && (
              <MonthOverview
                monthMeta={monthMeta}
                perDayResults={perDayResults}
                show={showMonthOverview}
                onToggle={() => setShowMonthOverview((s) => !s)}
              />
            )}

            {tripType === "round-trip" ? (
              bookingStep === 3 &&
              selectedOutboundFlight &&
              selectedInboundFlight ? (
                <RoundTripSummary
                  outbound={selectedOutboundFlight}
                  inbound={selectedInboundFlight}
                  onEditOutbound={() => clearSelectedFlight("outbound")}
                  onEditInbound={() => clearSelectedFlight("inbound")}
                  onConfirm={confirmSelection}
                />
              ) : (
                <RoundTripFlightList
                  flights={
                    skeletonActive
                      ? []
                      : bookingStep === 2
                        ? filteredReturnFlights
                        : filteredFlights
                  }
                  activeTab={activeTab}
                  setActiveTab={handleTabChange}
                  selectedOutboundFlight={selectedOutboundFlight}
                  selectedInboundFlight={selectedInboundFlight}
                  onFlightSelect={handleFlightSelection}
                  onClearSelectedFlight={clearSelectedFlight}
                  sortBy={filters.sortBy}
                  vietnameseAirlines={vietnameseAirlines}
                  searchInfo={searchInfo}
                  error={error}
                  disableInboundTab={!selectedOutboundFlight}
                />
              )
            ) : monthMeta ? (
              <div className="space-y-8">
                {filteredPerDayResults
                  .filter((g) => g.flights && g.flights.length > 0)
                  .map((dayGroup) => (
                    <div
                      key={dayGroup.day}
                      id={`day-${dayGroup.day.replace(/\//g, "-")}`}
                      className="group/day scroll-mt-24"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                          <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-blue-600 text-white text-xs font-bold shadow-sm">
                            {dayGroup.day.split("/")[0]}
                          </span>
                          Ngày {dayGroup.day}
                        </h4>
                        <span className="text-[11px] px-2 py-1 rounded-full bg-gray-100 text-gray-600 font-medium">
                          {dayGroup.flights.length} chuyến bay
                        </span>
                      </div>
                      {dayGroup.flights.length === 0 ? (
                        <div className="p-4 rounded-lg border border-dashed border-gray-300 bg-white text-xs text-gray-500">
                          Không có chuyến bay
                        </div>
                      ) : (
                        <OneWayFlightList
                          flights={dayGroup.flights}
                          sortBy={filters.sortBy}
                          vietnameseAirlines={vietnameseAirlines}
                          onFlightSelect={handleFlightSelection}
                          error={error}
                        />
                      )}
                    </div>
                  ))}
                {monthMeta.loading && (
                  <div className="flex items-center justify-center gap-2 text-sm text-blue-700">
                    <span className="inline-flex h-3 w-3 animate-ping rounded-full bg-blue-500" />
                    Đang tải thêm...
                  </div>
                )}
              </div>
            ) : (
              <OneWayFlightList
                flights={visibleOneWayFlights}
                sortBy={filters.sortBy}
                vietnameseAirlines={vietnameseAirlines}
                onFlightSelect={handleFlightSelection}
                error={error}
                suppressEmpty={skeletonActive}
              />
            )}

            {skeletonActive && !monthMeta && (
              <div className="space-y-3">
                {Array.from({ length: tripType === "round-trip" ? 6 : 4 }).map(
                  (_, i) => (
                    <FlightCardSkeleton key={i} />
                  )
                )}
              </div>
            )}

            {!monthMeta && !skeletonActive && (
              <LoadMoreButton
                searchInfo={searchInfo}
                filteredFlights={filteredFlights}
                suggestionsCount={selectedAirlines.length > 0 ? otherAirlineSuggestions.length : undefined}
                onShowSuggestions={selectedAirlines.length > 0 ? () => {
                  // Show other airlines and clear FE filter so counts/buttons update
                  setShowOtherAirlines(true);
                  setSelectedAirlines([]);
                  try {
                    localStorage.setItem("selectedAirlines", JSON.stringify([]));
                  } catch (e) {
                    // Ignore storage failures (e.g., private mode)
                    if (import.meta.env?.DEV) {
                      console.debug("(debug) Unable to persist selectedAirlines", e);
                    }
                  }
                } : undefined}
                onLoadMore={handleLoadMore}
                loading={isLoadingMore}
                infoText={
                  lastLoadMoreAdded === 0
                    ? "Không có chuyến bay mới để hiển thị"
                    : undefined
                }
              />
            )}
          </div>
        </div>
      </div>
      {/* Debug console moved to App-level for global availability */}
    </div>
  );
};

export default Search;

