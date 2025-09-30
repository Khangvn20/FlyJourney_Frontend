import React, { useMemo, useState } from "react";
import { Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import FlightSearchForm from "../components/flight/FlightSearchForm";
import FilterSidebar from "../components/flight/FilterSidebar";
import OneWayFlightList from "../components/flight/OneWayFlightList";
import RoundTripFlightList from "../components/flight/RoundTripFlightList";
import RoundTripSummary from "../components/flight/RoundTripSummary";
import FlightResultsOverview from "../components/flight/FlightResultsOverview";
import FlightInfiniteScroll from "../components/common/FlightInfiniteScroll";
import MonthOverview from "../components/flight/MonthOverview";
import { useFlightSearch } from "../hooks/useFlightSearch";
import { useFlightSearchForm } from "../hooks/useFlightSearchForm";
import {
  isOneWayResponse,
  isRoundTripResponse,
  type FlightSearchApiResult,
} from "../shared/types/search-api.types";
// Filtering/sorting handled by hooks and utilities

const Search: React.FC = () => {
  const navigate = useNavigate();

  // Add flight search form hook to get current passenger data
  const { formData, isLoading } = useFlightSearchForm();

  // (debug removed to reduce noise)

  const {
    showFilters,
    setShowFilters,
    selectedAirlines,
    setSelectedAirlines,
    filters,
    setFilters,
    searchInfo,
    perDayResults,
    tripType,
    error,
    showMonthOverview,
    setShowMonthOverview,
    monthMeta,
    bookingStep,
    selectedOutboundFlight,
    setSelectedOutboundFlight,
    selectedInboundFlight,
    setSelectedInboundFlight,
    isLoadingMore,
    lastLoadMoreAdded,
    handleAirlineToggle,
    clearSelectedFlight,
    handleTabChange,
    flightResults,
    returnFlightResults,
    filteredFlights,
    filteredReturnFlights,
    filteredPerDayResults,
    activeTab,
    currentFlights,
    vietnameseAirlines,
    passengerCounts,
    ensureLoadedCount,
  } = useFlightSearch();

  const [showOtherAirlines, setShowOtherAirlines] = useState(false);
  const [itemsPerPage, setItemsPerPage] = useState(10); // Default to 10 flights per page
  const [currentLoadedCount, setCurrentLoadedCount] = useState(10); // Track loaded items for infinite scroll

  // Stable key to detect a new search (so we can reset counts) without reacting to pagination appends
  const searchKey = useMemo(() => {
    if (!searchInfo) return "none";
    if (isOneWayResponse(searchInfo)) {
      return [
        "ow",
        searchInfo.departure_airport,
        searchInfo.arrival_airport,
        searchInfo.departure_date,
        searchInfo.flight_class,
      ].join("|");
    }
    if (isRoundTripResponse(searchInfo)) {
      return [
        "rt",
        searchInfo.departure_airport,
        searchInfo.arrival_airport,
        searchInfo.departure_date,
        searchInfo.return_date ?? "",
        searchInfo.flight_class,
      ].join("|");
    }
    return "unknown";
  }, [searchInfo]);

  const handleItemsPerPageChange = (newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage);

    // When changing items per page directly, update current count immediately
    // instead of waiting for useEffect
    const baseFlights = showOtherAirlines
      ? [...filteredFlights, ...otherAirlineSuggestions]
      : filteredFlights;

    // Always respect the user's selection for items per page
    // This will reset to show exactly the number selected (or all if fewer available)
    const newCount = Math.min(newItemsPerPage, baseFlights.length);
    setCurrentLoadedCount(newCount);

    // If API indicates more than currently loaded and user requests more, fetch to satisfy
    if (
      tripType === "one-way" &&
      !showOtherAirlines &&
      typeof totalAvailableFlights === "number" &&
      totalAvailableFlights > baseFlights.length &&
      newItemsPerPage > baseFlights.length
    ) {
      ensureLoadedCount(newItemsPerPage);
    }
  };

  const handleInfiniteLoadMore = () => {
    if (import.meta.env?.DEV) {
      console.log("🔄 Search: handleInfiniteLoadMore called", {
        currentLoadedCount,
        itemsPerPage,
        totalAvailableFlights,
        baseFlightsLength: (showOtherAirlines
          ? [...filteredFlights, ...otherAirlineSuggestions]
          : filteredFlights
        ).length,
        canFetchMoreFromApi:
          !showOtherAirlines &&
          totalAvailableFlights >
            (showOtherAirlines
              ? [...filteredFlights, ...otherAirlineSuggestions]
              : filteredFlights
            ).length,
      });
    }
    // Use filteredFlights (actual API data) instead of displayOneWayFlights
    const baseFlights = showOtherAirlines
      ? [...filteredFlights, ...otherAirlineSuggestions]
      : filteredFlights;

    // Load more using itemsPerPage as the increment
    const increment = itemsPerPage;
    const targetCount = currentLoadedCount + increment;

    const canFetchMoreFromApi =
      !showOtherAirlines && totalAvailableFlights > baseFlights.length;

    if (canFetchMoreFromApi && baseFlights.length < targetCount) {
      // Ask hook to fetch enough pages to satisfy targetCount
      ensureLoadedCount(targetCount);
      // Optimistically increase visible count toward target/API total
      setCurrentLoadedCount(Math.min(targetCount, totalAvailableFlights));
      return;
    }

    const nextCount = Math.min(targetCount, baseFlights.length);
    setCurrentLoadedCount(nextCount);
  };

  const effectivePassengerCounts = useMemo(() => {
    if (passengerCounts) {
      return passengerCounts;
    }
    if (formData?.passengers) {
      return formData.passengers;
    }
    if (
      searchInfo &&
      isRoundTripResponse(searchInfo) &&
      searchInfo.passengers
    ) {
      const pax = searchInfo.passengers;
      return {
        adults: pax.adults ?? 0,
        children: pax.children ?? 0,
        infants: pax.infants ?? 0,
      };
    }
    return null;
  }, [passengerCounts, formData, searchInfo]);

  const proceedToBooking = (flight: FlightSearchApiResult) => {
    const bookingSelection = {
      tripType: "one-way" as const,
      outbound: flight,
      totalPrice: flight.pricing.grand_total,
      currency: flight.pricing.currency,
      passengers: {
        adults: formData.passengers.adults,
        children: formData.passengers.children,
        infants: formData.passengers.infants,
      },
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
      passengers: {
        adults: formData.passengers.adults,
        children: formData.passengers.children,
        infants: formData.passengers.infants,
      },
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

  const handleFlightSelection = (
    direction: "outbound" | "inbound",
    flight: FlightSearchApiResult
  ) => {
    if (tripType === "round-trip") {
      if (direction === "outbound") {
        setSelectedOutboundFlight(flight);
      } else {
        setSelectedInboundFlight(flight);
      }
    } else {
      proceedToBooking(flight);
    }
  };

  const handleOneWaySelection = (flight: FlightSearchApiResult) =>
    handleFlightSelection("outbound", flight);

  // Suggestions fetched from API (all airlines): show regardless of current non-airline filters
  const otherAirlineSuggestions = useMemo(() => {
    if (!selectedAirlines || selectedAirlines.length === 0)
      return [] as FlightSearchApiResult[];
    const selectedSet = new Set(selectedAirlines);
    const visibleIds = new Set(filteredFlights.map((f) => f.flight_id));
    return (flightResults || [])
      .filter((f) => {
        const slug = (f.airline_name || "").toLowerCase().replace(/\s+/g, "-");
        return !selectedSet.has(slug);
      })
      .filter((f) => !visibleIds.has(f.flight_id));
  }, [selectedAirlines, flightResults, filteredFlights]);

  // Get total available flights for calculating hasMore - use actual API data
  const totalAvailableFlights = useMemo(() => {
    if (tripType === "round-trip") return 0;
    // Use filteredFlights (from API) instead of displayOneWayFlights
    const baseFlights = showOtherAirlines
      ? [...filteredFlights, ...otherAirlineSuggestions]
      : filteredFlights;

    // Prefer API total_count if present so we know there are more results to fetch
    if (!showOtherAirlines && searchInfo) {
      if (
        isOneWayResponse(searchInfo) &&
        typeof searchInfo.total_count === "number"
      ) {
        return searchInfo.total_count;
      }
      if (
        isRoundTripResponse(searchInfo) &&
        typeof searchInfo.outbound_total_count === "number"
      ) {
        // For round-trip we don't use this path, but keep fallback safe
        return searchInfo.outbound_total_count;
      }
    }
    return baseFlights.length;
  }, [
    tripType,
    showOtherAirlines,
    filteredFlights,
    otherAirlineSuggestions,
    searchInfo,
  ]);

  // Reset loaded count when search results change or filters change
  React.useEffect(() => {
    // Always respect the itemsPerPage selection
    // This will ensure we initially show exactly the number of items user selected
    const actualCount = Math.min(itemsPerPage, totalAvailableFlights);

    // Debug logging
    // Reduce noise: only print minimal debug in DEV
    if (import.meta.env?.DEV) {
      console.debug("resetLoadedCount", {
        itemsPerPage,
        totalAvailableFlights,
        actualCount,
      });
    }

    setCurrentLoadedCount(actualCount);

    // If the user-selected itemsPerPage exceeds what we have in memory but API has more, prefetch
    if (
      tripType === "one-way" &&
      !showOtherAirlines &&
      typeof totalAvailableFlights === "number" &&
      totalAvailableFlights > filteredFlights.length &&
      itemsPerPage > filteredFlights.length
    ) {
      ensureLoadedCount(itemsPerPage);
    }
    // We intentionally avoid depending on filteredFlights/totalAvailableFlights here to prevent resets on pagination
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    searchKey,
    selectedAirlines,
    filters.sortBy,
    itemsPerPage,
    showOtherAirlines,
    tripType,
  ]);

  const visibleOneWayFlights = useMemo(() => {
    if (tripType === "round-trip") return [] as FlightSearchApiResult[];
    // Use filteredFlights (actual API data) instead of displayOneWayFlights
    const baseFlights = showOtherAirlines
      ? [...filteredFlights, ...otherAirlineSuggestions]
      : filteredFlights;

    // DEBUG: Log để xem tại sao chỉ hiển thị 20 vé
    if (import.meta.env?.DEV) {
      console.debug("visibleOneWayFlights", {
        base: baseFlights.length,
        count: currentLoadedCount,
        filtered: filteredFlights.length,
        sugg: otherAirlineSuggestions.length,
        showOtherAirlines,
      });
    }

    // Apply current loaded count for infinite scroll
    return baseFlights.slice(0, currentLoadedCount);
  }, [
    tripType,
    showOtherAirlines,
    filteredFlights,
    otherAirlineSuggestions,
    currentLoadedCount,
  ]);

  const overviewShowingCount =
    tripType === "round-trip"
      ? currentFlights.length
      : visibleOneWayFlights.length;

  const overviewTotals = useMemo(() => {
    if (!searchInfo) {
      return { total: undefined, outbound: undefined, inbound: undefined };
    }
    if (tripType === "one-way" && isOneWayResponse(searchInfo)) {
      return {
        total: searchInfo.total_count,
        outbound: undefined,
        inbound: undefined,
      };
    }
    if (tripType === "round-trip" && isRoundTripResponse(searchInfo)) {
      return {
        total: undefined,
        outbound: searchInfo.outbound_total_count,
        inbound: searchInfo.inbound_total_count,
      };
    }
    return { total: undefined, outbound: undefined, inbound: undefined };
  }, [searchInfo, tripType]);

  const sidebarAllFlights =
    tripType === "round-trip"
      ? activeTab === "inbound"
        ? returnFlightResults
        : flightResults
      : flightResults;

  const sidebarFilteredFlights =
    tripType === "round-trip"
      ? activeTab === "inbound"
        ? filteredReturnFlights
        : filteredFlights
      : filteredFlights;

  React.useEffect(() => {
    const target = Math.min(itemsPerPage, totalAvailableFlights || 0);
    if (
      selectedAirlines.length > 0 &&
      !showOtherAirlines &&
      filteredFlights.length < target &&
      otherAirlineSuggestions.length > 0
    ) {
      setShowOtherAirlines(true);
    }
  }, [
    itemsPerPage,
    totalAvailableFlights,
    selectedAirlines.length,
    filteredFlights.length,
    otherAirlineSuggestions.length,
    showOtherAirlines,
  ]);

  const activeDirection = tripType === "round-trip" ? activeTab : undefined;
  const showLoadingState = isLoading && !monthMeta;
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
              allFlights={sidebarAllFlights}
              filteredFlights={sidebarFilteredFlights}
              vietnameseAirlines={vietnameseAirlines}
              onAirlineToggle={handleAirlineToggle}
            />
          </div>

          <div className="lg:col-span-3">
            {searchInfo && (
              <FlightResultsOverview
                tripType={tripType}
                searchInfo={searchInfo}
                passengers={passengerCounts ?? formData?.passengers ?? null}
                sortBy={filters.sortBy}
                onSortChange={(value) =>
                  setFilters((prev) => ({ ...prev, sortBy: value }))
                }
                showingCount={overviewShowingCount}
                totalCount={overviewTotals.total}
                totalOutbound={overviewTotals.outbound}
                totalInbound={overviewTotals.inbound}
                activeDirection={activeDirection}
                itemsPerPage={itemsPerPage}
                onItemsPerPageChange={handleItemsPerPageChange}
              />
            )}

            {monthMeta && (
              <MonthOverview
                monthMeta={monthMeta}
                perDayResults={perDayResults}
                show={showMonthOverview}
                onToggle={() => setShowMonthOverview((s) => !s)}
              />
            )}

            {showLoadingState ? (
              <div className="flex flex-col items-center justify-center py-16 text-blue-600">
                <Loader2 className="h-8 w-8 animate-spin" aria-hidden="true" />
                <p className="mt-3 text-sm font-medium">
                  Đang tìm kiếm chuyến bay...
                </p>
              </div>
            ) : tripType === "round-trip" ? (
              <div className="space-y-4">
                {bookingStep === 3 &&
                selectedOutboundFlight &&
                selectedInboundFlight ? (
                  <RoundTripSummary
                    outbound={selectedOutboundFlight}
                    inbound={selectedInboundFlight}
                    passengerCounts={effectivePassengerCounts}
                    onEditOutbound={() => clearSelectedFlight("outbound")}
                    onEditInbound={() => clearSelectedFlight("inbound")}
                    onConfirm={confirmSelection}
                  />
                ) : (
                  <RoundTripFlightList
                    outboundFlights={filteredFlights}
                    inboundFlights={filteredReturnFlights}
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
                  />
                )}
              </div>
            ) : monthMeta ? (
              <div className="space-y-8">
                {filteredPerDayResults
                  .filter((g) => g.flights && g.flights.length > 0)
                  .map((dayGroup) => (
                    <div
                      key={dayGroup.day}
                      id={`day-${dayGroup.day.replace(/\//g, "-")}`}
                      className="group/day scroll-mt-24">
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
                          onFlightSelect={handleOneWaySelection}
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
                onFlightSelect={handleOneWaySelection}
                error={error}
              />
            )}

            {!monthMeta && !showLoadingState && (
              <FlightInfiniteScroll
                searchInfo={searchInfo}
                filteredFlights={visibleOneWayFlights}
                totalAvailableFlights={totalAvailableFlights}
                suggestionsCount={
                  selectedAirlines.length > 0
                    ? otherAirlineSuggestions.length
                    : undefined
                }
                onShowSuggestions={
                  selectedAirlines.length > 0
                    ? () => {
                        setShowOtherAirlines(true);
                        setSelectedAirlines([]);
                        try {
                          localStorage.setItem(
                            "selectedAirlines",
                            JSON.stringify([])
                          );
                        } catch (e) {
                          if (import.meta.env?.DEV) {
                            console.debug(
                              "(debug) Unable to persist selectedAirlines",
                              e
                            );
                          }
                        }
                      }
                    : undefined
                }
                onLoadMore={handleInfiniteLoadMore}
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
