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
import MiniMonthCalendar from "../components/flight/MiniMonthCalendar";
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
    tripType,
    error,
    showMonthOverview,
    setShowMonthOverview,
    monthMeta,
    monthBuckets,
    activeMonthKey,
    setActiveMonthKey,
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
  const isMonthMode = Boolean(monthMeta);
  const [activeDay, setActiveDayState] = useState<string | null>(null);
  const userSelectedDayRef = React.useRef(false);

  const updateActiveDay = React.useCallback(
    (day: string | null, source: "user" | "system") => {
      userSelectedDayRef.current = source === "user";
      setActiveDayState(day);
    },
    []
  );

  const handleUserSelectDay = React.useCallback(
    (day: string) => {
      updateActiveDay(day, "user");
    },
    [updateActiveDay]
  );

  const currentMonthBucket = useMemo(() => {
    if (monthBuckets.length === 0) return null;
    if (activeMonthKey) {
      const found = monthBuckets.find(
        (bucket) => bucket.key === activeMonthKey
      );
      if (found) return found;
    }
    return monthBuckets[0];
  }, [monthBuckets, activeMonthKey]);

  const currentMonthIndex = useMemo(() => {
    if (!currentMonthBucket) return -1;
    return monthBuckets.findIndex(
      (bucket) => bucket.key === currentMonthBucket.key
    );
  }, [monthBuckets, currentMonthBucket]);

  const currentMonthDayGroups = useMemo(() => {
    if (!isMonthMode) return [] as typeof filteredPerDayResults;
    return filteredPerDayResults;
  }, [isMonthMode, filteredPerDayResults]);

  const monthDataSignature = React.useMemo(() => {
    if (!isMonthMode) return "";
    return filteredPerDayResults
      .map((group) => `${group.day}:${group.flights?.length ?? 0}`)
      .join("|");
  }, [isMonthMode, filteredPerDayResults]);

  // Stable key to detect a new search (used for resetting day selection)
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

  const lastAppliedSearchKeyRef = React.useRef<string | null>(null);
  const lastMonthDataSignatureRef = React.useRef<string | null>(null);

  React.useEffect(() => {
    if (!isMonthMode) {
      if (activeDay !== null) {
        updateActiveDay(null, "system");
      }
      lastAppliedSearchKeyRef.current = null;
      lastMonthDataSignatureRef.current = null;
      return;
    }

    const fallbackDay =
      currentMonthDayGroups.find((group) => group.flights.length > 0)?.day ??
      currentMonthBucket?.groups?.find((group) => group.flights.length > 0)
        ?.day ??
      currentMonthBucket?.groups?.[0]?.day ??
      null;

    if (!currentMonthBucket) {
      if (activeDay !== null) {
        updateActiveDay(null, "system");
      }
      lastAppliedSearchKeyRef.current = searchKey;
      lastMonthDataSignatureRef.current = monthDataSignature;
      return;
    }

    const [activeDayDate, activeDayMonth, activeDayYear] = (() => {
      if (!activeDay) return [null, null, null] as const;
      const [d, m, y] = activeDay.split("/").map(Number);
      if (!d || !m || !y) return [null, null, null] as const;
      const dateObj = new Date(y, m - 1, d);
      if (Number.isNaN(dateObj.getTime())) return [null, null, null] as const;
      return [dateObj, m, y] as const;
    })();

    const isNewSearch = lastAppliedSearchKeyRef.current !== searchKey;
    const isActiveDayInCurrentMonth = Boolean(
      activeDayDate &&
        activeDayMonth === currentMonthBucket.month &&
        activeDayYear === currentMonthBucket.year
    );

    const datasetChanged =
      monthDataSignature !== lastMonthDataSignatureRef.current;

    if (datasetChanged) {
      userSelectedDayRef.current = false;
    }

    const shouldAutoSelect =
      !activeDay ||
      !isActiveDayInCurrentMonth ||
      datasetChanged ||
      (isNewSearch && !userSelectedDayRef.current);

    if (shouldAutoSelect) {
      if (fallbackDay || !isActiveDayInCurrentMonth) {
        updateActiveDay(fallbackDay ?? null, "system");
      }
    }

    lastAppliedSearchKeyRef.current = searchKey;
    lastMonthDataSignatureRef.current = monthDataSignature;
  }, [
    isMonthMode,
    currentMonthDayGroups,
    currentMonthBucket,
    activeDay,
    searchKey,
    updateActiveDay,
    monthDataSignature,
  ]);

  const handleMonthChange = React.useCallback(
    (key: string) => {
      if (!key) return;
      setActiveMonthKey(key);
    },
    [setActiveMonthKey]
  );

  const handlePrevMonth = React.useCallback(() => {
    if (currentMonthIndex > 0) {
      setActiveMonthKey(monthBuckets[currentMonthIndex - 1].key);
    }
  }, [currentMonthIndex, monthBuckets, setActiveMonthKey]);

  const handleNextMonth = React.useCallback(() => {
    if (currentMonthIndex >= 0 && currentMonthIndex < monthBuckets.length - 1) {
      setActiveMonthKey(monthBuckets[currentMonthIndex + 1].key);
    }
  }, [currentMonthIndex, monthBuckets, setActiveMonthKey]);

  const activeDayGroup = useMemo(() => {
    if (!isMonthMode || !activeDay) return null;
    return (
      currentMonthDayGroups.find((group) => group.day === activeDay) ?? null
    );
  }, [isMonthMode, activeDay, currentMonthDayGroups]);

  const activeDayHasAnyFlights = useMemo(() => {
    if (!isMonthMode || !activeDay || !currentMonthBucket) return false;
    return currentMonthBucket.groups?.some((group) => group.day === activeDay);
  }, [isMonthMode, activeDay, currentMonthBucket]);

  const activeDayLabel = useMemo(() => {
    if (!activeDay) return null;
    const [d, m, y] = activeDay.split("/").map(Number);
    if (!d || !m || !y) return activeDay;
    const date = new Date(y, m - 1, d);
    if (Number.isNaN(date.getTime())) return activeDay;
    return date.toLocaleDateString("vi-VN", {
      weekday: "long",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  }, [activeDay]);

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

  const monthFlightsCount = useMemo(() => {
    if (!isMonthMode) return undefined;
    return currentMonthDayGroups.reduce(
      (sum, group) => sum + group.flights.length,
      0
    );
  }, [isMonthMode, currentMonthDayGroups]);

  const monthTotalFlights = useMemo(() => {
    if (!isMonthMode) return undefined;
    if (!currentMonthBucket) return 0;
    return currentMonthBucket.groups.reduce(
      (sum, group) => sum + group.flights.length,
      0
    );
  }, [isMonthMode, currentMonthBucket]);

  const overviewShowingCount = isMonthMode
    ? monthFlightsCount ?? 0
    : tripType === "round-trip"
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

  const activeDirection = tripType === "round-trip" ? activeTab : undefined;
  const showLoadingState = isLoading && !monthMeta;
  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-blue-50/40 to-gray-50">
      <div className="relative pt-8 pb-4">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(59,130,246,0.08),transparent_60%)]" />
        <div className="container mx-auto px-4 relative max-w-7xl">
          <div className="relative">
            <FlightSearchForm />
            <div className="pointer-events-none absolute -top-14 -left-10 w-56 h-56 bg-blue-200/40 rounded-full blur-3xl" />
            <div className="pointer-events-none absolute -bottom-10 -right-6 w-52 h-52 bg-indigo-200/40 rounded-full blur-3xl" />
          </div>
        </div>
      </div>

      <div className="px-6 lg:px-[36px] py-12">
        <div className="flex gap-6">
          {/* Left Sidebar - Fixed width, stick to left */}
          <div className="w-[264px] flex-shrink-0">
            <div className="sticky top-6">
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
                dimUnavailableOptions={isMonthMode}
              />
            </div>
          </div>

          {/* Main Content - Flexible center area */}
          <div className="flex-1 min-w-0 space-y-8">
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
                onItemsPerPageChange={
                  isMonthMode ? undefined : handleItemsPerPageChange
                }
                itemsPerPage={isMonthMode ? undefined : itemsPerPage}
                monthMeta={monthMeta}
                monthFlightsCount={monthFlightsCount}
                monthTotalFlights={monthTotalFlights}
              />
            )}

            {monthMeta && (
              <MonthOverview
                monthMeta={monthMeta}
                dayGroups={currentMonthDayGroups}
                monthBuckets={monthBuckets}
                activeMonthKey={
                  activeMonthKey ?? currentMonthBucket?.key ?? null
                }
                onMonthChange={handleMonthChange}
                activeDay={activeDay}
                onSelectDay={handleUserSelectDay}
                show={showMonthOverview}
                onToggle={() => setShowMonthOverview((s) => !s)}
              />
            )}

            {monthMeta && (
              <div className="lg:hidden">
                <MiniMonthCalendar
                  month={currentMonthBucket}
                  dayGroups={currentMonthBucket?.groups ?? []}
                  filteredDayGroups={currentMonthDayGroups}
                  activeDay={activeDay}
                  onSelectDay={handleUserSelectDay}
                  onPrevMonth={
                    currentMonthIndex > 0 ? handlePrevMonth : undefined
                  }
                  onNextMonth={
                    currentMonthIndex >= 0 &&
                    currentMonthIndex < monthBuckets.length - 1
                      ? handleNextMonth
                      : undefined
                  }
                />
              </div>
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
                <div className="space-y-4">
                  <div className="rounded-2xl border border-blue-100 bg-white p-4 shadow-sm">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-blue-500">
                          Ngày được chọn
                        </p>
                        <h3 className="text-lg font-semibold text-slate-900">
                          {activeDayLabel ?? "Chọn một ngày trong tháng"}
                        </h3>
                      </div>
                      {activeDay && activeDayGroup && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                          {activeDayGroup.flights.length} chuyến bay
                        </span>
                      )}
                      {activeDay &&
                        !activeDayGroup &&
                        activeDayHasAnyFlights && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-600">
                            0 chuyến bay sau bộ lọc
                          </span>
                        )}
                    </div>
                  </div>

                  {activeDay ? (
                    activeDayGroup ? (
                      activeDayGroup.flights.length > 0 ? (
                        <OneWayFlightList
                          flights={activeDayGroup.flights}
                          sortBy={filters.sortBy}
                          vietnameseAirlines={vietnameseAirlines}
                          onFlightSelect={handleOneWaySelection}
                          error={error}
                        />
                      ) : (
                        <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-6 text-sm text-slate-500">
                          Không có chuyến bay phù hợp với bộ lọc. Hãy chọn ngày
                          khác hoặc điều chỉnh bộ lọc.
                        </div>
                      )
                    ) : (
                      <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-6 text-sm text-slate-500">
                        {activeDayHasAnyFlights
                          ? "Các chuyến bay của ngày này không khớp với bộ lọc hiện tại. Hãy điều chỉnh bộ lọc hoặc chọn ngày khác."
                          : "Ngày này hiện chưa có chuyến bay được mở bán. Bạn có thể thử chọn ngày lân cận."}
                      </div>
                    )
                  ) : (
                    <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-6 text-sm text-slate-500">
                      Chọn một ngày trong tháng để xem danh sách chuyến bay chi
                      tiết.
                    </div>
                  )}
                </div>
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

          {/* Right Calendar - Fixed width, stick to right, only show in month mode */}
          {monthMeta && (
            <div className="w-[308px] flex-shrink-0 hidden lg:block">
              <div className="sticky top-6">
                <MiniMonthCalendar
                  month={currentMonthBucket}
                  dayGroups={currentMonthBucket?.groups ?? []}
                  filteredDayGroups={currentMonthDayGroups}
                  activeDay={activeDay}
                  onSelectDay={handleUserSelectDay}
                  onPrevMonth={
                    currentMonthIndex > 0 ? handlePrevMonth : undefined
                  }
                  onNextMonth={
                    currentMonthIndex >= 0 &&
                    currentMonthIndex < monthBuckets.length - 1
                      ? handleNextMonth
                      : undefined
                  }
                />
              </div>
            </div>
          )}
        </div>
      </div>
      {/* Debug console moved to App-level for global availability */}
    </div>
  );
};
export default Search;
