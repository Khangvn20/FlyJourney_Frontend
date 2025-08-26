import { useState, useEffect, useRef, useMemo } from "react";
import flightSearchService from "../services/flightApiService";
import { airlines } from "../mocks";
import { useFlightFilters } from "./useFlightFilters";
import {
  filterAndSortFlights,
  type FlightFilterCriteria,
} from "../lib/flightFilters";
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

type TripTab = "outbound" | "inbound";

export const useFlightSearch = () => {
  // UI
  const [showFilters, setShowFilters] = useState(false);
  const [selectedAirlines, setSelectedAirlines] = useState<string[]>([]);
  const [filters, setFilters] = useState<FlightFilterCriteria>({
    priceRange: "all",
    departureTime: "all",
    stops: "all",
    duration: "all",
    sortBy: "price",
  });

  // Data
  const [flightResults, setFlightResults] = useState<FlightSearchApiResult[]>([]);
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
    return perDayResults.map((dayGroup) => ({
      ...dayGroup,
      flights: filterAndSortFlights({
        flights: dayGroup.flights,
        selectedAirlines,
        filters,
      }),
    }));
  }, [perDayResults, selectedAirlines, filters]);

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

  // Airline toggle
  const handleAirlineToggle = (airlineId: string) => {
    setSelectedAirlines((prev) =>
      prev.includes(airlineId)
        ? prev.filter((id) => id !== airlineId)
        : [...prev, airlineId]
    );
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
    let idx = 0;
    const applyNext = () => {
      if (idx >= groups.length) return;
      setProgressiveFlights((prev) => [...prev, ...groups[idx]]);
      idx++;
      progressiveTimerRef.current = window.setTimeout(applyNext, 300);
    };
    applyNext();
  };

  useEffect(() => {
    const handleStorageChange = () => {
      loadSearchResults();
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

  return {
    showFilters,
    setShowFilters,
    selectedAirlines,
    setSelectedAirlines,
    filters,
    setFilters,
    flightResults,
    returnFlightResults,
    searchInfo,
    perDayResults,
    monthMeta,
    tripType,
    setTripType,
    error,
    showMonthOverview,
    setShowMonthOverview,
    skeletonActive,
    progressiveFlights,
    isLoadingMore,
    bookingStep,
    setBookingStep,
    selectedOutboundFlight,
    setSelectedOutboundFlight,
    selectedInboundFlight,
    setSelectedInboundFlight,
    vietnameseAirlines,
    filteredFlights,
    filteredReturnFlights,
    filteredProgressiveFlights,
    filteredPerDayResults,
    activeTab,
    activeFlightResults,
    currentFlights,
    displayOneWayFlights,
    handleAirlineToggle,
    handleLoadMore,
    clearSelectedFlight,
    handleTabChange,
  };
};

