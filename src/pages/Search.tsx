// src/pages/Search.tsx
import type React from "react";
import { useState, useEffect, useRef, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import FlightSearchForm from "../components/flight/FlightSearchForm";
import FilterSidebar from "../components/flight/FilterSidebar";
import OneWayFlightList from "../components/flight/OneWayFlightList";
import RoundTripFlightList from "../components/flight/RoundTripFlightList";
import RoundTripSelectionSummary from "../components/flight/RoundTripSelectionSummary";
import SearchResultsHeader from "../components/flight/SearchResultsHeader";
import type { TripTab } from "../components/flight/SearchResultsHeader";
import LoadMoreButton from "../components/common/LoadMoreButton";
import FlightCardSkeleton from "../components/flight/FlightCardSkeleton";
import flightSearchService from "../services/flightApiService";
import MonthOverviewHeatmap from "../components/flight/MonthOverviewHeatmap";
import {
  Calendar as CalendarIcon,
  X as XIcon,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

import { airlines } from "../mocks";
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
import type { FlightSortBy as ApiFlightSortBy } from "../shared/types/flight-api.types";
import {
  getStr,
  getNum,
  toFlightClass,
  toSortBy,
  toSortOrder,
  isMonthAggregatedWrapper,
  isDirectFlightData,
  extractNestedRoundTrip,
  type PerDayFlightsGroup,
  type MonthAggregatedWrapper,
  type SafeObj,
} from "../lib/searchUtils";

/* ================= Component ================= */
const Search: React.FC = () => {
  const navigate = useNavigate();

  // UI
  const [showFilters, setShowFilters] = useState(false);
  const [selectedAirlines, setSelectedAirlines] = useState<string[]>([]);
  const [filters, setFilters] = useState({
    priceRange: "all",
    departureTime: "all",
    stops: "all",
    duration: "all",
    sortBy: "price",
  });

  // Data
  const [flightResults, setFlightResults] = useState<FlightSearchApiResult[]>(
    []
  );
  const [returnFlightResults, setReturnFlightResults] = useState<
    FlightSearchApiResult[]
  >([]);
  const [searchInfo, setSearchInfo] = useState<FlightSearchResponseData | null>(
    null
  );

  // Month
  const [perDayResults, setPerDayResults] = useState<PerDayFlightsGroup[]>([]);
  const [monthMeta, setMonthMeta] = useState<{
    month: number;
    year: number;
    days: number;
    loading: boolean;
  } | null>(null);

  const [tripType, setTripType] = useState<"one-way" | "round-trip">("one-way");
  const [error, setError] = useState<string | null>(null);
  const [showMonthOverview, setShowMonthOverview] = useState(true);

  // Progressive UX
  const [skeletonActive, setSkeletonActive] = useState(false);
  const [progressiveFlights, setProgressiveFlights] = useState<
    FlightSearchApiResult[]
  >([]);
  const progressiveTimerRef = useRef<number | null>(null);
  const skeletonTimerRef = useRef<number | null>(null);
  const lastAppliedSearchIdRef = useRef<string | null>(null);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // Round-trip UI
  const [bookingStep, setBookingStep] = useState<1 | 2 | 3>(1);
  const [selectedOutboundFlight, setSelectedOutboundFlight] =
    useState<FlightSearchApiResult | null>(null);
  const [selectedInboundFlight, setSelectedInboundFlight] =
    useState<FlightSearchApiResult | null>(null);

  // Airlines
  const vietnameseAirlines = useMemo(
    () =>
      airlines.map((airline) => ({
        id: airline.name.toLowerCase().replace(/\s+/g, "-"),
        name: airline.name,
        logo: airline.logo,
        code: airline.name.substring(0, 2).toUpperCase(),
      })),
    []
  );

  // Filters
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
  const { filteredFlights: filteredProgressiveFlights } = useFlightFilters({
    flights: progressiveFlights,
    selectedAirlines,
    filters,
  });
  const activeTab: TripTab = bookingStep === 2 ? "inbound" : "outbound";
  const activeFlightResults =
    activeTab === "inbound" ? filteredReturnFlights : filteredFlights;

  // Per-day filter (month)
  const filteredPerDayResults = useMemo(() => {
    return perDayResults.map((dayGroup) => {
      const dayFlights = dayGroup.flights.filter((flight) => {
        if (selectedAirlines.length > 0) {
          const ok = selectedAirlines.some(
            (airlineId) =>
              flight.airline_id?.toString() === airlineId ||
              flight.airline_name
                ?.toLowerCase()
                .includes(airlineId.toLowerCase())
          );
          if (!ok) return false;
        }
        return true;
      });
      return { ...dayGroup, flights: dayFlights };
    });
  }, [perDayResults, selectedAirlines]);

  // Persist searchInfo
  useEffect(() => {
    if (searchInfo) {
      sessionStorage.setItem("searchInfo", JSON.stringify(searchInfo));
      if (DEV_CONFIG.ENABLE_CONSOLE_LOGS && shouldShowDevControls()) {
        console.log("💾 Saved searchInfo:", searchInfo);
      }
    }
  }, [searchInfo]);

  // Current flights (for header)
  const currentFlights =
    tripType === "round-trip" && bookingStep === 2
      ? filteredReturnFlights
      : filteredFlights;

  // Select flight
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

  const confirmSelection = () => {
    if (selectedOutboundFlight && selectedInboundFlight) {
      showBookingSummary(selectedOutboundFlight, selectedInboundFlight);
    }
  };

  const clearSelectedFlight = (direction: TripTab) => {
    if (direction === "outbound") {
      setSelectedOutboundFlight(null);
      setSelectedInboundFlight(null);
      setBookingStep(1);
    } else {
      setSelectedInboundFlight(null);
      setBookingStep(2);
    }
  };

  const handleTabChange = (tab: TripTab) => {
    if (tab === "inbound") {
      if (selectedOutboundFlight) {
        setBookingStep(2);
      }
    } else {
      setBookingStep(1);
    }
  };

  const handleAirlineToggle = (airlineId: string) => {
    setSelectedAirlines((prev) =>
      prev.includes(airlineId)
        ? prev.filter((id) => id !== airlineId)
        : [...prev, airlineId]
    );
  };

  /* ============ Load more (one-way only) ============ */
  const handleLoadMore = async () => {
    if (!searchInfo || !isOneWayResponse(searchInfo)) return;
    const nextPage = searchInfo.page + 1;
    setIsLoadingMore(true);
    try {
      const response = await flightSearchService({
        tripType: "oneWay",
        from: searchInfo.departure_airport,
        to: searchInfo.arrival_airport,
        departureDate: searchInfo.departure_date,
        passengers: searchInfo.passengers,
        flightClass: toFlightClass(searchInfo.flight_class),
        page: nextPage,
        limit: searchInfo.limit,
        sortBy: toSortBy(searchInfo.sort_by) as unknown as ApiFlightSortBy,
        sortOrder: toSortOrder(searchInfo.sort_order),
      });
      if (response.status && response.data && isOneWayResponse(response.data)) {
        const newFlights = response.data.search_results || [];
        setFlightResults((prev) => [...prev, ...newFlights]);
        setSearchInfo(response.data);
      }
    } catch (err) {
      setError("Không thể tải thêm chuyến bay");
      if (DEV_CONFIG.ENABLE_CONSOLE_LOGS && shouldShowDevControls()) {
        console.error("Load more failed", err);
      }
    } finally {
      setIsLoadingMore(false);
    }
  };

  /* ============ Load from sessionStorage ============ */
  const loadSearchResults = () => {
    const storedResults = sessionStorage.getItem("flightSearchResults");
    const storedTripType =
      (sessionStorage.getItem("tripType") as "one-way" | "round-trip") ||
      "one-way";

    // Reset to outbound whenever new results are loaded so filters and lists
    // initialize in sync
    setBookingStep(1);
    setSelectedOutboundFlight(null);
    setSelectedInboundFlight(null);
    setTripType(storedTripType);

    if (!storedResults) {
      setFlightResults([]);
      setReturnFlightResults([]);
      setSearchInfo(null);
      setPerDayResults([]);
      setMonthMeta(null);
      setError(null);
      return;
    }

    try {
      const parsed: unknown = JSON.parse(storedResults);

      // 1) Month aggregated wrapper
      if (isMonthAggregatedWrapper(parsed)) {
        const agg = (parsed as MonthAggregatedWrapper).data;
        const meta = (parsed as MonthAggregatedWrapper).meta;
        const flatFlights = agg.per_day_results.flatMap((d) => d.flights);
        setPerDayResults(agg.per_day_results);
        setMonthMeta(meta);
        setFlightResults(flatFlights);
        setReturnFlightResults([]);
        setSearchInfo({
          arrival_airport: agg.arrival_airport,
          arrival_date: agg.arrival_date,
          departure_airport: agg.departure_airport,
          departure_date: agg.departure_date,
          flight_class: agg.flight_class,
          limit: agg.limit,
          page: agg.page,
          passengers: agg.passengers,
          search_results: flatFlights,
          sort_by: agg.sort_by,
          sort_order: agg.sort_order,
          total_count: agg.total_count,
          total_pages: agg.total_pages,
        });
        setError(null);
        return;
      }

      // 2) Data thuần
      if (isDirectFlightData(parsed)) {
        const data = parsed as FlightSearchResponseData;
        // nested?
        const nested = extractNestedRoundTrip(data);
        if (nested) {
          setTripType("round-trip");
          setFlightResults(nested.outbound);
          setReturnFlightResults(nested.inbound);
          // build round-trip like searchInfo đầy đủ count
          const root = data as unknown as SafeObj;
          const searchInfoRound: FlightSearchResponseData = {
            arrival_airport: getStr(root, "arrival_airport") ?? "",
            arrival_date: getStr(root, "arrival_date") ?? "",
            departure_airport: getStr(root, "departure_airport") ?? "",
            departure_date: getStr(root, "departure_date") ?? "",
            return_date: getStr(root, "return_date"),
            flight_class: getStr(root, "flight_class") ?? "economy",
            limit: getNum(root, "limit") ?? nested.outbound.length,
            page: getNum(root, "page") ?? 1,
            passengers: (root["passengers"] as {
              adults: number;
              children?: number;
              infants?: number;
            }) ?? {
              adults: 1,
              children: 0,
              infants: 0,
            },
            outbound_search_results: nested.outbound,
            outbound_total_count: nested.outbound.length,
            outbound_total_pages: 1,
            inbound_search_results: nested.inbound,
            inbound_total_count: nested.inbound.length,
            inbound_total_pages: 1,
            sort_by: getStr(root, "sort_by") ?? "price",
            sort_order: getStr(root, "sort_order") ?? "asc",
          };
          setSearchInfo(searchInfoRound);
          setError(null);
          return;
        }

        if (isRoundTripResponse(data)) {
          setTripType("round-trip");
          setFlightResults(data.outbound_search_results || []);
          setReturnFlightResults(data.inbound_search_results || []);
          setSearchInfo(data);
          setError(null);
          return;
        }
        if (isOneWayResponse(data)) {
          setTripType("one-way");
          setFlightResults(
            Array.isArray(data.search_results) ? data.search_results : []
          );
          setReturnFlightResults([]);
          setSearchInfo(data);
          setError(null);
          return;
        }

        setError("Unsupported search result schema");
        setFlightResults([]);
        setReturnFlightResults([]);
        setSearchInfo(null);
        return;
      }

      // 3) Wrapper { status, data }
      const wrapper = parsed as FlightSearchApiWrapper;
      if (!wrapper || wrapper.status !== true || !wrapper.data) {
        setError(wrapper?.errorMessage || "API returned error");
        setFlightResults([]);
        setReturnFlightResults([]);
        setSearchInfo(null);
        return;
      }

      const data = wrapper.data;
      const nested = extractNestedRoundTrip(data);

      if (nested) {
        setTripType("round-trip");
        setFlightResults(nested.outbound);
        setReturnFlightResults(nested.inbound);
        const root = data as unknown as SafeObj;
        const searchInfoRound: FlightSearchResponseData = {
          arrival_airport: getStr(root, "arrival_airport") ?? "",
          arrival_date: getStr(root, "arrival_date") ?? "",
          departure_airport: getStr(root, "departure_airport") ?? "",
          departure_date: getStr(root, "departure_date") ?? "",
          return_date: getStr(root, "return_date"),
          flight_class: getStr(root, "flight_class") ?? "economy",
          limit: getNum(root, "limit") ?? nested.outbound.length,
          page: getNum(root, "page") ?? 1,
          passengers: (root["passengers"] as {
            adults: number;
            children?: number;
            infants?: number;
          }) ?? {
            adults: 1,
            children: 0,
            infants: 0,
          },
          outbound_search_results: nested.outbound,
          outbound_total_count: nested.outbound.length,
          outbound_total_pages: 1,
          inbound_search_results: nested.inbound,
          inbound_total_count: nested.inbound.length,
          inbound_total_pages: 1,
          sort_by: getStr(root, "sort_by") ?? "price",
          sort_order: getStr(root, "sort_order") ?? "asc",
        };
        setSearchInfo(searchInfoRound);
        setError(null);
      } else if (isRoundTripResponse(data)) {
        setTripType("round-trip");
        setFlightResults(data.outbound_search_results || []);
        setReturnFlightResults(data.inbound_search_results || []);
        setSearchInfo(data);
        setError(null);
      } else if (isOneWayResponse(data)) {
        setTripType("one-way");
        setFlightResults(
          Array.isArray(data.search_results) ? data.search_results : []
        );
        setReturnFlightResults([]);
        setSearchInfo(data);
        setError(null);
      } else {
        setError("Unsupported search result schema");
        setFlightResults([]);
        setReturnFlightResults([]);
        setSearchInfo(null);
      }
    } catch (err) {
      if (DEV_CONFIG.ENABLE_CONSOLE_LOGS && shouldShowDevControls()) {
        console.error("Parse session results error:", err);
      }
      setError("Error loading search results");
      setFlightResults([]);
      setReturnFlightResults([]);
      setSearchInfo(null);
    }
  };

  // Mount
  useEffect(() => {
    loadSearchResults();
  }, []);

  // Progressive reveal
  useEffect(() => {
    if (monthMeta) return;
    const storedId = sessionStorage.getItem("flightSearchSearchId");
    if (storedId && storedId !== lastAppliedSearchIdRef.current) {
      lastAppliedSearchIdRef.current = storedId;
      const started = Number(
        sessionStorage.getItem("flightSearchStartedAt") || Date.now()
      );
      const now = Date.now();
      const SKELETON_MS = 500;
      const remaining = Math.max(0, SKELETON_MS - (now - started));
      setSkeletonActive(true);
      setProgressiveFlights([]);
      if (skeletonTimerRef.current)
        window.clearTimeout(skeletonTimerRef.current);
      skeletonTimerRef.current = window.setTimeout(() => {
        setSkeletonActive(false);
        triggerProgressiveReveal();
      }, remaining);
    } else if (!skeletonActive) {
      triggerProgressiveReveal();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [flightResults, returnFlightResults, monthMeta]);

  const groupFlightsByAirline = (flights: FlightSearchApiResult[]) => {
    const map = new Map<string, FlightSearchApiResult[]>();
    flights.forEach((f) => {
      const key = f.airline_name || "UNKNOWN";
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(f);
    });
    return Array.from(map.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([, arr]) => arr);
  };

  const triggerProgressiveReveal = () => {
    if (skeletonActive || monthMeta) return;
    if (!flightResults || flightResults.length === 0) {
      setProgressiveFlights([]);
      return;
    }
    if (
      sessionStorage.getItem("flightSearchProgressiveApplied") ===
      lastAppliedSearchIdRef.current
    ) {
      return;
    }
    sessionStorage.setItem(
      "flightSearchProgressiveApplied",
      lastAppliedSearchIdRef.current || ""
    );
    const groups = groupFlightsByAirline(flightResults);
    setProgressiveFlights([]);
    if (progressiveTimerRef.current)
      window.clearTimeout(progressiveTimerRef.current);
    let idx = 0;
    const step = () => {
      setProgressiveFlights((prev) => [...prev, ...groups[idx]]);
      idx += 1;
      if (idx < groups.length) {
        progressiveTimerRef.current = window.setTimeout(step, 350);
      }
    };
    step();
  };

  // Cleanup timers
  useEffect(() => {
    return () => {
      if (progressiveTimerRef.current)
        window.clearTimeout(progressiveTimerRef.current);
      if (skeletonTimerRef.current)
        window.clearTimeout(skeletonTimerRef.current);
    };
  }, []);

  // Listen storage
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "flightSearchResults" && e.newValue) {
        loadSearchResults();
      }
      if (e.key === "tripType") {
        const t =
          (sessionStorage.getItem("tripType") as "one-way" | "round-trip") ||
          "one-way";
        setTripType(t);
        if (t !== "round-trip") setBookingStep(1);
      }
    };

    window.addEventListener("storage", handleStorageChange);

    const handleCustomStorageUpdate = () => {
      loadSearchResults();
      const t = sessionStorage.getItem("tripType") as
        | "one-way"
        | "round-trip"
        | null;
      if (t) {
        setTripType(t);
        if (t !== "round-trip") setBookingStep(1);
      }
    };

    window.addEventListener(
      "sessionStorageUpdated",
      handleCustomStorageUpdate as EventListener
    );

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener(
        "sessionStorageUpdated",
        handleCustomStorageUpdate as EventListener
      );
    };
  }, []);

  // One-way list to display
  const displayOneWayFlights = !monthMeta
    ? skeletonActive
      ? []
      : progressiveFlights.length > 0 ||
        (lastAppliedSearchIdRef.current &&
          sessionStorage.getItem("flightSearchProgressiveApplied") ===
            lastAppliedSearchIdRef.current)
      ? filteredProgressiveFlights
      : filteredFlights
    : filteredFlights;

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-blue-50/40 to-gray-50">
      {/* Search Form */}
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
          {/* Sidebar */}
          <div className="lg:sticky lg:top-4 lg:self-start">
            <FilterSidebar
              showFilters={showFilters}
              setShowFilters={setShowFilters}
              selectedAirlines={selectedAirlines}
              setSelectedAirlines={setSelectedAirlines}
              filters={filters}
              setFilters={setFilters}
              flightResults={activeFlightResults}
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

          {/* Main */}
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

            {/* Month banner */}
            {monthMeta && (
              <div className="mb-6 space-y-3">
                <div className="p-4 rounded-xl border border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50/60 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center shadow">
                      <CalendarIcon className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-blue-900">
                        Kết quả theo tháng {monthMeta.month}/{monthMeta.year}
                      </p>
                      <p className="text-xs text-blue-700">
                        Đã tải {perDayResults.length}/{monthMeta.days} ngày
                        {monthMeta.loading && " – đang tiếp tục..."}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setShowMonthOverview((s) => !s)}
                      className="text-xs px-3 py-2 rounded-md font-medium bg-white/70 hover:bg-white border border-blue-200 text-blue-700 flex items-center gap-1 shadow-sm">
                      {showMonthOverview ? (
                        <>
                          <ChevronUp className="h-3 w-3" />
                          Thu gọn tổng quan
                        </>
                      ) : (
                        <>
                          <ChevronDown className="h-3 w-3" />
                          Mở tổng quan
                        </>
                      )}
                    </button>
                    {monthMeta.loading && (
                      <button
                        onClick={() => {
                          sessionStorage.setItem("cancelMonthSearch", "1");
                          window.dispatchEvent(
                            new CustomEvent("cancelMonthSearch")
                          );
                        }}
                        className="text-xs px-3 py-2 rounded-md font-semibold bg-red-100 hover:bg-red-200 text-red-700 border border-red-300 flex items-center gap-1 shadow-sm">
                        <XIcon className="h-3 w-3" />
                        Hủy
                      </button>
                    )}
                  </div>
                </div>
                {showMonthOverview && (
                  <MonthOverviewHeatmap
                    perDayResults={perDayResults}
                    totalDays={monthMeta.days}
                    onSelectDay={(day) => {
                      const el = document.getElementById(
                        `day-${day.replace(/\//g, "-")}`
                      );
                      if (el)
                        el.scrollIntoView({
                          behavior: "smooth",
                          block: "start",
                        });
                    }}
                  />
                )}
              </div>
            )}

            {/* Lists */}
            {tripType === "round-trip" ? (
              bookingStep === 3 &&
              selectedOutboundFlight &&
              selectedInboundFlight ? (
                <RoundTripSelectionSummary
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
                flights={displayOneWayFlights}
                sortBy={filters.sortBy}
                vietnameseAirlines={vietnameseAirlines}
                onFlightSelect={handleFlightSelection}
                error={error}
                suppressEmpty={skeletonActive}
              />
            )}

            {/* Skeleton */}
            {skeletonActive && !monthMeta && (
              <div className="space-y-3">
                {Array.from({ length: tripType === "round-trip" ? 6 : 4 }).map(
                  (_, i) => (
                    <FlightCardSkeleton key={i} />
                  )
                )}
              </div>
            )}

            {/* Load More */}
            {!monthMeta && !skeletonActive && (
              <LoadMoreButton
                searchInfo={searchInfo}
                  filteredFlights={filteredFlights}
                onLoadMore={handleLoadMore}
                loading={isLoadingMore}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Search;
