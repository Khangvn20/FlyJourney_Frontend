import { useState, useEffect, useRef, useMemo } from "react";
import flightSearchService, {
  MAX_FLIGHT_SEARCH_LIMIT,
} from "../services/flightApiService";
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
  FlightSearchApiResponse,
  RoundTripFlightSearchApiResponse,
} from "../shared/types/search-api.types";
import type { PassengerCounts, PassengerCountsLike } from "../shared/types";
import {
  isRoundTripResponse,
  isOneWayResponse,
} from "../shared/types/search-api.types";
import { DEV_CONFIG, shouldShowDevControls } from "../shared/config/devConfig";
import type { FlightSortBy as ApiFlightSortBy } from "../shared/types/flight-api.types";
import {
  getStr,
  getNum,
  getObj,
  toFlightClass,
  toSortBy,
  toSortOrder,
  isMonthAggregatedWrapper,
  isDirectFlightData,
  extractNestedRoundTrip,
  type PerDayFlightsGroup,
  type MonthBucketSummary,
  type MonthAggregatedWrapper,
  type MonthRangeMeta,
  type SafeObj,
} from "../lib/searchUtils";

type TripTab = "outbound" | "inbound";

// Normalize passengers from various possible API shapes (passengers|passenger, numbers or strings)
function normalizePassengersFromAny(input: unknown): {
  adults: number;
  children: number;
  infants: number;
} {
  // Helper to treat unknown object safely
  const asRecord = (v: unknown): Record<string, unknown> | null =>
    v && typeof v === "object" && !Array.isArray(v)
      ? (v as Record<string, unknown>)
      : null;

  // First, if input already looks like { adults, children, infants }
  const direct = asRecord(input);
  const fromDirect =
    direct &&
    ("adults" in direct || "children" in direct || "infants" in direct)
      ? direct
      : null;

  // Else, try nested under passengers or passenger
  const container = fromDirect ?? asRecord(input);
  // Truy cập data.data nếu có
  const dataObj = container && asRecord(container["data"]);

  // Tìm passengers ở nhiều vị trí khác nhau
  const maybePassengers = container && asRecord(container["passengers"]);
  const maybePassenger = container && asRecord(container["passenger"]);
  const maybePassengerCount =
    container && asRecord(container["passenger_count"]);

  // Tìm passenger_count trong data.data nếu có
  const dataPassengerCount = dataObj && asRecord(dataObj["passenger_count"]);

  // Lấy đối tượng passenger đầu tiên tìm thấy
  const pRaw =
    (fromDirect ??
      maybePassengers ??
      maybePassenger ??
      maybePassengerCount ??
      dataPassengerCount) ||
    {};

  const toNum = (v: unknown, def = 0) => {
    if (typeof v === "number") return v;
    if (typeof v === "string" && v.trim() !== "") {
      const n = Number(v);
      return Number.isFinite(n) ? n : def;
    }
    return def;
  };

  const adults = Math.max(0, toNum(pRaw["adults"], 0));
  const children = Math.max(0, toNum(pRaw["children"], 0));
  const infants = Math.max(0, toNum(pRaw["infants"], 0));

  // Note: API doesn't return passenger data, normalization may not be needed
  // but keeping for compatibility with existing structure

  if (adults === 0 && children === 0 && infants === 0) {
    const hasAny = !!pRaw && Object.keys(pRaw).length > 0;
    return hasAny
      ? { adults: 1, children: 0, infants: 0 }
      : { adults: 0, children: 0, infants: 0 };
  }
  return { adults, children, infants };
}

function normalizeOneWayResponse(
  data: FlightSearchApiResponse
): FlightSearchApiResponse {
  const src: unknown =
    (data as unknown as SafeObj)["passengers"] ??
    (data as unknown as SafeObj)["passenger"] ??
    data.passengers;
  const pax = normalizePassengersFromAny(src);
  return {
    ...data,
    passengers: {
      adults: pax.adults,
      children: pax.children,
      infants: pax.infants,
    },
  };
}

function normalizeRoundTripResponse(
  data: RoundTripFlightSearchApiResponse
): RoundTripFlightSearchApiResponse {
  // Chuẩn bị các đối tượng để truy cập an toàn
  const asRecord = data as unknown as Record<string, unknown>;
  const dataObj = (asRecord.data as Record<string, unknown>) || {};

  // Lấy thông tin hành khách từ tất cả vị trí có thể có
  const src: unknown =
    (data as unknown as SafeObj)["passengers"] ??
    (data as unknown as SafeObj)["passenger"] ??
    (data as unknown as SafeObj)["passenger_count"] ??
    dataObj["passenger_count"] ??
    data.passengers;

  // Đảm bảo normalizePassengersFromAny nhận được giá trị
  const pax = normalizePassengersFromAny(src);

  // Don't override passenger data if API doesn't return valid data
  // Let the component use form data instead
  const shouldUseApiPassengerData =
    pax.adults > 0 || pax.children > 0 || pax.infants > 0;

  return {
    ...data,
    // Only use API passenger data if it's valid, otherwise don't include it
    ...(shouldUseApiPassengerData && {
      passengers: {
        adults: pax.adults,
        children: pax.children,
        infants: pax.infants,
      },
    }),
  };
}

function toPassengerCountsOrNull(input: unknown): PassengerCounts | null {
  const normalized = normalizePassengersFromAny(input);
  return normalized.adults > 0 ||
    normalized.children > 0 ||
    normalized.infants > 0
    ? normalized
    : null;
}

export const useFlightSearch = () => {
  // UI
  const [showFilters, setShowFilters] = useState(false);
  const [selectedAirlines, setSelectedAirlines] = useState<string[]>([]);
  const [filters, setFilters] = useState<FlightFilterCriteria>({
    priceRange: "all",
    departureTime: [],
    stops: "all",
    duration: [],
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
  const [passengerCounts, setPassengerCounts] =
    useState<PassengerCounts | null>(null);
  const latestRequestedPassengersRef = useRef<PassengerCounts | null>(null);

  const arePassengerCountsEqual = (
    a: PassengerCounts | null,
    b: PassengerCounts | null
  ) =>
    !!a &&
    !!b &&
    a.adults === b.adults &&
    a.children === b.children &&
    a.infants === b.infants;

  const applyPassengerCounts = (
    raw: unknown,
    fallback?: PassengerCountsLike | null
  ): PassengerCounts | null => {
    const normalized = toPassengerCountsOrNull(raw);
    const fallbackNormalized =
      fallback != null ? toPassengerCountsOrNull(fallback) : null;
    const requested = latestRequestedPassengersRef.current;
    const candidate = normalized ?? fallbackNormalized;
    const shouldPreferRequested =
      requested && candidate && !arePassengerCountsEqual(candidate, requested);
    const next = shouldPreferRequested
      ? requested
      : candidate ?? requested ?? null;
    if (next) {
      latestRequestedPassengersRef.current = next;
      setPassengerCounts(next);
      return next;
    }
    return null;
  };

  useEffect(() => {
    const handleFlightSearchRequested: EventListener = (event) => {
      const custom = event as CustomEvent<{
        passengers?: PassengerCounts | null;
      }>;
      const incoming = toPassengerCountsOrNull(custom.detail?.passengers);
      latestRequestedPassengersRef.current = incoming;
      setPassengerCounts(incoming);
    };

    window.addEventListener(
      "flightSearchRequested",
      handleFlightSearchRequested
    );

    return () => {
      window.removeEventListener(
        "flightSearchRequested",
        handleFlightSearchRequested
      );
    };
  }, []);

  // Month
  const [perDayResults, setPerDayResults] = useState<PerDayFlightsGroup[]>([]);
  const [monthMeta, setMonthMeta] = useState<MonthRangeMeta | null>(null);
  const [activeMonthKey, setActiveMonthKey] = useState<string | null>(null);

  const monthBuckets = useMemo<MonthBucketSummary[]>(() => {
    if (!perDayResults.length) return [];

    const buckets = new Map<
      string,
      { month: number; year: number; groups: PerDayFlightsGroup[] }
    >();

    perDayResults.forEach((group) => {
      const [, month, year] = group.day.split("/").map(Number);
      if (!month || !year) return;
      const key = `${year}-${String(month).padStart(2, "0")}`;
      if (!buckets.has(key)) {
        buckets.set(key, { month, year, groups: [] });
      }
      buckets.get(key)!.groups.push(group);
    });

    return Array.from(buckets.entries())
      .map(([key, value]) => {
        const sortedGroups = [...value.groups].sort((a, b) => {
          const [dayA, monthA, yearA] = a.day.split("/").map(Number);
          const [dayB, monthB, yearB] = b.day.split("/").map(Number);
          const dateA = new Date(
            yearA || 0,
            (monthA || 1) - 1,
            dayA || 1
          ).getTime();
          const dateB = new Date(
            yearB || 0,
            (monthB || 1) - 1,
            dayB || 1
          ).getTime();
          return dateA - dateB;
        });

        const totalCalendarDays = new Date(
          value.year,
          value.month,
          0
        ).getDate();

        return {
          key,
          month: value.month,
          year: value.year,
          label: `Tháng ${String(value.month).padStart(2, "0")}/${value.year}`,
          shortLabel: `${String(value.month).padStart(2, "0")}/${String(
            value.year
          ).slice(-2)}`,
          totalCalendarDays,
          loadedDays: sortedGroups.length,
          groups: sortedGroups,
        } satisfies MonthBucketSummary;
      })
      .sort((a, b) => {
        const timeA = new Date(a.year, a.month - 1, 1).getTime();
        const timeB = new Date(b.year, b.month - 1, 1).getTime();
        return timeA - timeB;
      });
  }, [perDayResults]);

  useEffect(() => {
    if (monthBuckets.length === 0) {
      if (activeMonthKey !== null) {
        setActiveMonthKey(null);
      }
      return;
    }

    if (
      !activeMonthKey ||
      !monthBuckets.some((bucket) => bucket.key === activeMonthKey)
    ) {
      setActiveMonthKey(monthBuckets[0].key);
    }
  }, [monthBuckets, activeMonthKey]);

  const [tripType, setTripType] = useState<"one-way" | "round-trip">("one-way");
  const [error, setError] = useState<string | null>(null);
  const [showMonthOverview, setShowMonthOverview] = useState(true);

  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [lastLoadMoreAdded, setLastLoadMoreAdded] = useState<number | null>(
    null
  );
  const [suggestionFlights, setSuggestionFlights] = useState<
    FlightSearchApiResult[]
  >([]);

  // Round-trip UI
  const [activeTab, setActiveTab] = useState<TripTab>("outbound");
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

  // Initialize selectedAirlines from localStorage (so FE filters apply immediately after search)
  useEffect(() => {
    try {
      const saved = localStorage.getItem("selectedAirlines");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) setSelectedAirlines(parsed as string[]);
      }
    } catch {
      // ignore
    }
  }, []);

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
  const activeFlightResults =
    activeTab === "inbound" ? filteredReturnFlights : filteredFlights;

  const bookingStep: 1 | 2 | 3 = useMemo(() => {
    if (selectedOutboundFlight && selectedInboundFlight) return 3;
    if (selectedOutboundFlight || selectedInboundFlight) return 2;
    return 1;
  }, [selectedOutboundFlight, selectedInboundFlight]);

  // Per-day filter (month)
  const filteredPerDayResults = useMemo(() => {
    const sourceGroups = activeMonthKey
      ? monthBuckets.find((bucket) => bucket.key === activeMonthKey)?.groups ??
        []
      : perDayResults;

    return sourceGroups.map((dayGroup) => ({
      ...dayGroup,
      flights: filterAndSortFlights({
        flights: dayGroup.flights,
        selectedAirlines,
        filters,
      }),
    }));
  }, [perDayResults, selectedAirlines, filters, monthBuckets, activeMonthKey]);

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
    tripType === "round-trip" && activeTab === "inbound"
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
    } else {
      setSelectedInboundFlight(null);
    }
    setActiveTab(direction);
  };

  const handleTabChange = (tab: TripTab) => {
    setActiveTab(tab);
  };

  /* ============ Load more (one-way only) ============ */
  const handleLoadMore = async () => {
    if (!searchInfo || !isOneWayResponse(searchInfo)) return;
    const currentLimit = Math.min(
      searchInfo.limit || 20,
      MAX_FLIGHT_SEARCH_LIMIT
    );
    if (currentLimit >= MAX_FLIGHT_SEARCH_LIMIT) {
      setLastLoadMoreAdded(0);
      return;
    }
    const nextLimit = Math.min(currentLimit + 20, MAX_FLIGHT_SEARCH_LIMIT);

    // Prefer IATA codes from results; fallback to searchInfo fields
    const fromCode =
      flightResults[0]?.departure_airport_code || searchInfo.departure_airport;
    const toCode =
      flightResults[0]?.arrival_airport_code || searchInfo.arrival_airport;

    setIsLoadingMore(true);
    try {
      const response = await flightSearchService({
        tripType: "oneWay",
        from: fromCode,
        to: toCode,
        departureDate: searchInfo.departure_date,
        passengers: searchInfo.passengers,
        flightClass: toFlightClass(searchInfo.flight_class),
        page: 1, // Always use page=1 since API doesn't support page>1
        limit: nextLimit,
        sortBy: toSortBy(searchInfo.sort_by) as unknown as ApiFlightSortBy,
        sortOrder: toSortOrder(searchInfo.sort_order),
      });
      if (response.status && response.data && isOneWayResponse(response.data)) {
        const incoming = response.data.search_results || [];
        let added = 0;
        setFlightResults((prev) => {
          const existing = new Set(prev.map((f) => f.flight_id));
          const dedup = incoming.filter((f) => !existing.has(f.flight_id));
          added = dedup.length;
          return dedup.length > 0 ? [...prev, ...dedup] : prev;
        });
        setLastLoadMoreAdded(added);
        const oneWay = response.data; // narrowed by isOneWayResponse
        // Preserve total_count/total_pages from latest response, update limit
        applyPassengerCounts(oneWay.passengers);
        setSearchInfo({ ...oneWay, page: 1, limit: nextLimit });
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

  /** Ensure at least `minVisible` results are loaded in memory (one-way only).
   * This will fetch subsequent pages until we have enough or there are no more pages.
   */
  const ensureLoadedCount = async (minVisible: number) => {
    if (!searchInfo || !isOneWayResponse(searchInfo)) return;
    if (flightResults.length >= minVisible) return;

    // Prefer IATA codes from results; fallback to searchInfo fields
    const fromCode =
      flightResults[0]?.departure_airport_code || searchInfo.departure_airport;
    const toCode =
      flightResults[0]?.arrival_airport_code || searchInfo.arrival_airport;

    const totalPages = searchInfo.total_pages ?? undefined;
    const limit = Math.min(searchInfo.limit || 20, MAX_FLIGHT_SEARCH_LIMIT);
    let loadedCount = flightResults.length;
    const maxLoops = 10; // Safety: max 10 increments to avoid infinite loop
    let loopCount = 0;
    let currentLimit = limit; // Start with current limit

    if (DEV_CONFIG.ENABLE_CONSOLE_LOGS && shouldShowDevControls()) {
      console.log("🔄 ensureLoadedCount start (limit-based):", {
        minVisible,
        loadedCount,
        currentLimit,
        totalPages,
        totalCount: searchInfo?.total_count,
      });
    }

    setIsLoadingMore(true);
    try {
      // Loop to increase limit while we need more and haven't exceeded max loops
      while (loadedCount < minVisible && loopCount < maxLoops) {
        if (currentLimit >= MAX_FLIGHT_SEARCH_LIMIT) {
          if (DEV_CONFIG.ENABLE_CONSOLE_LOGS && shouldShowDevControls()) {
            console.log("🔄 ensureLoadedCount: reached max limit cap");
          }
          break;
        }
        const nextLimit = Math.min(currentLimit + 20, MAX_FLIGHT_SEARCH_LIMIT);
        if (nextLimit === currentLimit) {
          break;
        }
        if (DEV_CONFIG.ENABLE_CONSOLE_LOGS && shouldShowDevControls()) {
          console.log("🔄 ensureLoadedCount loop (limit-based):", {
            loopCount,
            loadedCount,
            minVisible,
            nextLimit,
            totalCount: searchInfo?.total_count,
          });
        }
        const response = await flightSearchService({
          tripType: "oneWay",
          from: fromCode,
          to: toCode,
          departureDate: searchInfo.departure_date,
          passengers: searchInfo.passengers,
          flightClass: toFlightClass(searchInfo.flight_class),
          page: 1, // Always use page=1 since API doesn't support page>1
          limit: nextLimit,
          sortBy: toSortBy(searchInfo.sort_by) as unknown as ApiFlightSortBy,
          sortOrder: toSortOrder(searchInfo.sort_order),
        });
        if (
          response.status &&
          response.data &&
          isOneWayResponse(response.data)
        ) {
          const incoming = response.data.search_results || [];
          let added = 0;
          setFlightResults((prev) => {
            const existing = new Set(prev.map((f) => f.flight_id));
            const dedup = incoming.filter((f) => !existing.has(f.flight_id));
            added = dedup.length;
            return dedup.length > 0 ? [...prev, ...dedup] : prev;
          });
          loadedCount += added;
          setLastLoadMoreAdded(added);

          const oneWay = response.data;
          currentLimit = nextLimit;
          applyPassengerCounts(oneWay.passengers);
          setSearchInfo({ ...oneWay, page: 1, limit: currentLimit }); // Always page=1

          if (DEV_CONFIG.ENABLE_CONSOLE_LOGS && shouldShowDevControls()) {
            console.log("🔄 ensureLoadedCount added (limit-based):", {
              added,
              loadedCount,
              newTotalCount: oneWay.total_count,
              newLimit: currentLimit,
            });
          }

          // If server returned nothing new, break to avoid infinite loop
          if (added === 0) {
            if (DEV_CONFIG.ENABLE_CONSOLE_LOGS && shouldShowDevControls()) {
              console.log("🔄 ensureLoadedCount: no new results, breaking");
            }
            break;
          }

          // If we've reached the total available, break
          if (loadedCount >= (oneWay.total_count || 0)) {
            if (DEV_CONFIG.ENABLE_CONSOLE_LOGS && shouldShowDevControls()) {
              console.log(
                "🔄 ensureLoadedCount: reached total count, breaking"
              );
            }
            break;
          }
        } else {
          if (DEV_CONFIG.ENABLE_CONSOLE_LOGS && shouldShowDevControls()) {
            console.log("🔄 ensureLoadedCount: API error, breaking");
          }
          break;
        }
        loopCount++;
      }
      if (DEV_CONFIG.ENABLE_CONSOLE_LOGS && shouldShowDevControls()) {
        console.log("🔄 ensureLoadedCount end (limit-based):", {
          loadedCount,
          minVisible,
          loopCount,
          finalLimit: currentLimit,
        });
      }
    } catch (err) {
      console.error("🔄 ensureLoadedCount API call failed:", err);
      setError("Không thể tải thêm chuyến bay");
      if (DEV_CONFIG.ENABLE_CONSOLE_LOGS && shouldShowDevControls()) {
        console.error("ensureLoadedCount failed", err);
      }
    } finally {
      setIsLoadingMore(false);
    }
  };

  /* ============ Reveal other airlines (suggestions) ============ */
  const revealOtherAirlines = async () => {
    if (!searchInfo) return;
    try {
      setIsLoadingMore(true);
      const fromCode =
        flightResults[0]?.departure_airport_code ||
        searchInfo.departure_airport;
      const toCode =
        flightResults[0]?.arrival_airport_code || searchInfo.arrival_airport;
      const pax = isOneWayResponse(searchInfo)
        ? searchInfo.passengers
        : isRoundTripResponse(searchInfo)
        ? {
            adults: searchInfo.passengers.adults,
            children: searchInfo.passengers.children ?? 0,
            infants: searchInfo.passengers.infants ?? 0,
          }
        : { adults: 1, children: 0, infants: 0 };
      // Step 1: Fetch all airlines to learn available airline_ids
      const effectiveLimit = Math.min(
        Math.max(searchInfo.limit || 50, 50),
        MAX_FLIGHT_SEARCH_LIMIT
      );
      const response = await flightSearchService({
        tripType: "oneWay",
        from: fromCode,
        to: toCode,
        departureDate: searchInfo.departure_date,
        passengers: pax,
        flightClass: toFlightClass(searchInfo.flight_class),
        page: 1,
        limit: effectiveLimit,
        sortBy: toSortBy(searchInfo.sort_by) as unknown as ApiFlightSortBy,
        sortOrder: toSortOrder(searchInfo.sort_order),
      });
      if (response.status && response.data && isOneWayResponse(response.data)) {
        const all = response.data.search_results || [];
        // Build airline_id list that are NOT selected
        const selectedSlugSet = new Set(selectedAirlines);
        const allAirlineIds = Array.from(
          new Set(
            all
              .map((f) => ({
                id: f.airline_id,
                slug: (f.airline_name || "").toLowerCase().replace(/\s+/g, "-"),
              }))
              .filter((x) => x.slug && !selectedSlugSet.has(x.slug))
              .map((x) => x.id)
          )
        );

        if (allAirlineIds.length === 0) {
          setSuggestionFlights([]);
          return;
        }

        // Step 2: Fetch again with airline_ids restricted to other airlines
        const respOthers = await flightSearchService({
          tripType: "oneWay",
          from: fromCode,
          to: toCode,
          departureDate: searchInfo.departure_date,
          passengers: pax,
          flightClass: toFlightClass(searchInfo.flight_class),
          page: 1,
          limit: effectiveLimit,
          sortBy: toSortBy(searchInfo.sort_by) as unknown as ApiFlightSortBy,
          sortOrder: toSortOrder(searchInfo.sort_order),
          airline_ids: allAirlineIds,
        });
        if (
          respOthers.status &&
          respOthers.data &&
          isOneWayResponse(respOthers.data)
        ) {
          const others = respOthers.data.search_results || [];
          // Fallback: if API returns empty (edge), use all (from step 1) filtered by not-selected
          setSuggestionFlights(
            others.length > 0
              ? others
              : all.filter((f) => {
                  const slug = (f.airline_name || "")
                    .toLowerCase()
                    .replace(/\s+/g, "-");
                  return !selectedSlugSet.has(slug);
                })
          );
        } else {
          setSuggestionFlights(
            all.filter((f) => {
              const slug = (f.airline_name || "")
                .toLowerCase()
                .replace(/\s+/g, "-");
              return !selectedSlugSet.has(slug);
            })
          );
        }
      }
    } catch (err) {
      setError("Không thể tải gợi ý từ hãng khác");
      if (DEV_CONFIG.ENABLE_CONSOLE_LOGS && shouldShowDevControls()) {
        console.error("Reveal other airlines failed", err);
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
    setActiveTab("outbound");
    setSelectedOutboundFlight(null);
    setSelectedInboundFlight(null);
    setTripType(storedTripType);

    if (!storedResults) {
      setFlightResults([]);
      setReturnFlightResults([]);
      setSearchInfo(null);
      // Preserve the latest requested passengers so UI reflects the current search
      // even while we wait for new API results to arrive.
      setPassengerCounts(latestRequestedPassengersRef.current);
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
        const pax =
          applyPassengerCounts(agg.passengers) ??
          normalizePassengersFromAny(agg.passengers);
        const info: FlightSearchApiResponse = {
          arrival_airport: agg.arrival_airport,
          arrival_date: agg.arrival_date,
          departure_airport: agg.departure_airport,
          departure_date: agg.departure_date,
          flight_class: agg.flight_class,
          limit: agg.limit,
          page: agg.page,
          passengers: {
            adults: pax.adults,
            children: pax.children,
            infants: pax.infants,
          },
          search_results: flatFlights,
          sort_by: agg.sort_by,
          sort_order: agg.sort_order,
          total_count: agg.total_count,
          total_pages: agg.total_pages,
        };
        setSearchInfo(info);
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
          const pObj =
            getObj(root, "passengers") ?? getObj(root, "passenger") ?? {};
          const pax =
            applyPassengerCounts(pObj) ?? normalizePassengersFromAny(pObj);
          const searchInfoRound: RoundTripFlightSearchApiResponse = {
            arrival_airport: getStr(root, "arrival_airport") ?? "",
            departure_airport: getStr(root, "departure_airport") ?? "",
            departure_date: getStr(root, "departure_date") ?? "",
            return_date: getStr(root, "return_date"),
            flight_class: getStr(root, "flight_class") ?? "economy",
            limit: getNum(root, "limit") ?? nested.outbound.length,
            page: getNum(root, "page") ?? 1,
            passengers: {
              adults: pax.adults,
              children: pax.children,
              infants: pax.infants,
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

          const normalizedSearchInfo = normalizeRoundTripResponse(data);
          const roundTripRaw = data as unknown as SafeObj;
          const passengerSource =
            roundTripRaw["passenger_count"] ??
            roundTripRaw["passengers"] ??
            normalizedSearchInfo.passengers;
          applyPassengerCounts(
            passengerSource,
            normalizedSearchInfo.passengers
          );

          setSearchInfo(normalizedSearchInfo);
          setError(null);
          return;
        }
        if (isOneWayResponse(data)) {
          setTripType("one-way");
          setFlightResults(
            Array.isArray(data.search_results) ? data.search_results : []
          );
          setReturnFlightResults([]);
          const normalizedOneWay = normalizeOneWayResponse(data);
          applyPassengerCounts(normalizedOneWay.passengers ?? data.passengers);
          setSearchInfo(normalizedOneWay);
          setError(null);
          return;
        }

        setError("Unsupported search result schema");
        setFlightResults([]);
        setReturnFlightResults([]);
        setSearchInfo(null);
        latestRequestedPassengersRef.current = null;
        setPassengerCounts(null);
        return;
      }

      // 3) Wrapper { status, data }
      const wrapper = parsed as FlightSearchApiWrapper;
      if (!wrapper || wrapper.status !== true || !wrapper.data) {
        setError(wrapper?.errorMessage || "API returned error");
        setFlightResults([]);
        setReturnFlightResults([]);
        setSearchInfo(null);
        latestRequestedPassengersRef.current = null;
        setPassengerCounts(null);
        return;
      }

      const data = wrapper.data;
      const nested = extractNestedRoundTrip(data);

      if (nested) {
        setTripType("round-trip");
        setFlightResults(nested.outbound);
        setReturnFlightResults(nested.inbound);
        const root = data as unknown as SafeObj;
        const pObj2 =
          getObj(root, "passengers") ?? getObj(root, "passenger") ?? {};
        const pax2 =
          applyPassengerCounts(pObj2) ?? normalizePassengersFromAny(pObj2);
        const searchInfoRound: RoundTripFlightSearchApiResponse = {
          arrival_airport: getStr(root, "arrival_airport") ?? "",
          departure_airport: getStr(root, "departure_airport") ?? "",
          departure_date: getStr(root, "departure_date") ?? "",
          return_date: getStr(root, "return_date"),
          flight_class: getStr(root, "flight_class") ?? "economy",
          limit: getNum(root, "limit") ?? nested.outbound.length,
          page: getNum(root, "page") ?? 1,
          passengers: {
            adults: pax2.adults,
            children: pax2.children,
            infants: pax2.infants,
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
        const normalizedRoundTrip = normalizeRoundTripResponse(data);
        const wrapperRaw = data as unknown as SafeObj;
        const passengerSource =
          wrapperRaw["passenger_count"] ??
          wrapperRaw["passengers"] ??
          normalizedRoundTrip.passengers;
        applyPassengerCounts(passengerSource, normalizedRoundTrip.passengers);
        setSearchInfo(normalizedRoundTrip);
        setError(null);
      } else if (isOneWayResponse(data)) {
        setTripType("one-way");
        setFlightResults(
          Array.isArray(data.search_results) ? data.search_results : []
        );
        setReturnFlightResults([]);
        const normalizedOneWay = normalizeOneWayResponse(data);
        applyPassengerCounts(normalizedOneWay.passengers ?? data.passengers);
        setSearchInfo(normalizedOneWay);
        setError(null);
      } else {
        setError("Unsupported search result schema");
        setFlightResults([]);
        setReturnFlightResults([]);
        setSearchInfo(null);
        latestRequestedPassengersRef.current = null;
        setPassengerCounts(null);
      }
    } catch (err) {
      if (DEV_CONFIG.ENABLE_CONSOLE_LOGS && shouldShowDevControls()) {
        console.error("Parse session results error:", err);
      }
      setError("Error loading search results");
      setFlightResults([]);
      setReturnFlightResults([]);
      setSearchInfo(null);
      latestRequestedPassengersRef.current = null;
      setPassengerCounts(null);
    }
  };

  // Mount
  useEffect(() => {
    loadSearchResults();
  }, []);

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
        if (t !== "round-trip") {
          setActiveTab("outbound");
        }
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
    passengerCounts,
    perDayResults,
    monthMeta,
    monthBuckets,
    activeMonthKey,
    setActiveMonthKey,
    tripType,
    setTripType,
    error,
    showMonthOverview,
    setShowMonthOverview,
    isLoadingMore,
    lastLoadMoreAdded,
    suggestionFlights,
    bookingStep,
    selectedOutboundFlight,
    setSelectedOutboundFlight,
    selectedInboundFlight,
    setSelectedInboundFlight,
    vietnameseAirlines,
    filteredFlights,
    filteredReturnFlights,
    filteredPerDayResults,
    activeTab,
    setActiveTab,
    activeFlightResults,
    currentFlights,
    handleAirlineToggle,
    handleLoadMore,
    ensureLoadedCount,
    revealOtherAirlines,
    clearSelectedFlight,
    handleTabChange,
  };
};
