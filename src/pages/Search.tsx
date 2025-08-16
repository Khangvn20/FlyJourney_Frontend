import type React from "react";
import { useState, useEffect, useRef, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import FlightSearchForm from "../components/flight/FlightSearchForm";
import FilterSidebar from "../components/flight/FilterSidebar";
import OneWayFlightList from "../components/flight/OneWayFlightList";
import RoundTripFlightList from "../components/flight/RoundTripFlightList";
import SearchResultsHeader from "../components/flight/SearchResultsHeader";
import LoadMoreButton from "../components/common/LoadMoreButton";
import FlightCardSkeleton from "../components/flight/FlightCardSkeleton";
import {
  Calendar as CalendarIcon,
  X as XIcon,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

// Types for month aggregated synthetic structure
interface PerDayFlightsGroup {
  day: string; // dd/mm/yyyy
  flights: FlightSearchApiResult[];
}
// Month aggregated data mimics one-way response plus per_day_results
interface MonthAggregatedData {
  arrival_airport: string;
  arrival_date: string;
  departure_airport: string;
  departure_date: string;
  flight_class: string;
  limit: number;
  page: number;
  passengers: {
    adults: number;
    children: number;
    infants: number;
  };
  search_results: FlightSearchApiResult[]; // flattened
  sort_by: string;
  sort_order: string;
  total_count: number;
  total_pages: number;
  per_day_results: PerDayFlightsGroup[];
}
interface MonthAggregatedWrapper {
  status: boolean;
  data: MonthAggregatedData;
  meta: { month: number; year: number; days: number; loading: boolean };
  errorCode?: string;
  errorMessage?: string;
}
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

// Transform airlines data for use in this component
const vietnameseAirlines = airlines.map((airline) => ({
  id: airline.name.toLowerCase().replace(/\s+/g, "-"),
  name: airline.name,
  logo: airline.logo,
  code: airline.name.substring(0, 2).toUpperCase(),
}));

// Attempt to normalize a possibly changed round-trip response structure.
// Defensive: if backend renamed keys we still extract arrays containing flight-like objects.
type UnknownRecord = Record<string, unknown>;
function tryNormalizeRoundTrip(rawInput: unknown): {
  normalized?: RoundTripLike;
  matched: boolean;
  debug?: Record<string, unknown>;
} {
  if (!rawInput || typeof rawInput !== "object") return { matched: false };
  const raw = rawInput as UnknownRecord;

  // Collect candidate keys for outbound / inbound arrays
  const outboundKeys = [
    "outbound_search_results",
    "outbound_flights",
    "outboundFlights",
    "outboundResults",
    "outbound",
    "departing_flights",
    "departing",
  ];
  const inboundKeys = [
    "inbound_search_results",
    "inbound_flights",
    "inboundFlights",
    "inboundResults",
    "inbound",
    "return_flights",
    "returnFlights",
    "returnResults",
    "return",
  ];

  const isFlight = (v: unknown): v is FlightSearchApiResult => {
    if (!v || typeof v !== "object") return false;
    if (!("flight_id" in v)) return false;
    const pricing = (v as { pricing?: { grand_total?: unknown } }).pricing;
    if (!pricing || typeof pricing.grand_total !== "number") return false;
    return true;
  };

  const findFlightsArray = (
    keys: string[]
  ): FlightSearchApiResult[] | undefined => {
    for (const k of keys) {
      if (Array.isArray(raw[k])) {
        const arr = raw[k] as unknown[];
        if (arr.length === 0) return [] as FlightSearchApiResult[]; // empty still valid
        // Heuristic: first element has flight_id & pricing.grand_total
        const f0 = arr[0];
        if (isFlight(f0)) {
          return arr.filter(isFlight) as FlightSearchApiResult[]; // ensure all entries valid
        }
      }
    }
    return undefined;
  };

  const outboundArr = findFlightsArray(outboundKeys);
  const inboundArr = findFlightsArray(inboundKeys);
  if (!outboundArr || !inboundArr) return { matched: false };

  // Derive counts/pages if missing
  const getNumber = (...names: string[]) => {
    for (const n of names) {
      const v = raw[n];
      if (typeof v === "number") return v;
    }
    return undefined;
  };

  const outbound_total_count =
    getNumber("outbound_total_count", "outboundCount", "outbound_total") ??
    outboundArr.length;
  const inbound_total_count =
    getNumber("inbound_total_count", "inboundCount", "inbound_total") ??
    inboundArr.length;

  const outbound_total_pages =
    getNumber("outbound_total_pages", "outboundPages", "outbound_total_page") ??
    1;
  const inbound_total_pages =
    getNumber("inbound_total_pages", "inboundPages", "inbound_total_page") ?? 1;

  const normalized: RoundTripLike = {
    arrival_airport:
      (raw.arrival_airport as string) || (raw.to_airport as string) || "",
    departure_airport:
      (raw.departure_airport as string) || (raw.from_airport as string) || "",
    departure_date:
      (raw.departure_date as string) || (raw.depart_date as string) || "",
    return_date: (raw.return_date as string) || (raw.inbound_date as string),
    flight_class:
      (raw.flight_class as string) || (raw.cabin_class as string) || "",
    limit: (raw.limit as number) || 0,
    page: (raw.page as number) || 1,
    passengers: (raw.passengers as {
      adults: number;
      children?: number;
      infants?: number;
    }) || {
      adults: (raw.adults as number) || 1,
      children: (raw.children as number) || 0,
      infants: (raw.infants as number) || 0,
    },
    outbound_search_results: outboundArr,
    outbound_total_count,
    outbound_total_pages,
    inbound_search_results: inboundArr,
    inbound_total_count,
    inbound_total_pages,
    sort_by: (raw.sort_by as string) || (raw.sortBy as string) || "price",
    sort_order:
      (raw.sort_order as string) || (raw.sortOrder as string) || "asc",
  };

  return {
    matched: true,
    normalized,
    debug: {
      usedOutboundLength: outboundArr.length,
      usedInboundLength: inboundArr.length,
    },
  };
}

// Local type describing normalized structure (subset of RoundTripFlightSearchApiResponse)
interface RoundTripLike {
  arrival_airport: string;
  departure_airport: string;
  departure_date: string;
  return_date?: string;
  flight_class: string;
  limit: number;
  page: number;
  passengers: { adults: number; children?: number; infants?: number };
  outbound_search_results: FlightSearchApiResult[];
  outbound_total_count: number;
  outbound_total_pages: number;
  inbound_search_results: FlightSearchApiResult[];
  inbound_total_count: number;
  inbound_total_pages: number;
  sort_by: string;
  sort_order: string;
}

const Search: React.FC = () => {
  const navigate = useNavigate();
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
  // Month aggregated meta + per day grouping (synthetic structure from month search)
  const [perDayResults, setPerDayResults] = useState<
    { day: string; flights: FlightSearchApiResult[] }[]
  >([]);
  const [monthMeta, setMonthMeta] = useState<{
    month: number;
    year: number;
    days: number;
    loading: boolean;
  } | null>(null);
  const [tripType, setTripType] = useState<string>("one-way");
  const [error, setError] = useState<string | null>(null);
  const [showMonthOverview, setShowMonthOverview] = useState(true);
  // New phased loading UX states
  const [skeletonActive, setSkeletonActive] = useState(false);
  const [progressiveFlights, setProgressiveFlights] = useState<
    FlightSearchApiResult[]
  >([]);
  const progressiveTimerRef = useRef<number | null>(null);
  const skeletonTimerRef = useRef<number | null>(null);
  const lastAppliedSearchIdRef = useRef<string | null>(null);

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
    flights: Array.isArray(flightResults) ? flightResults : [],
    selectedAirlines,
    filters,
  });

  const { filteredFlights: filteredReturnFlights } = useFlightFilters({
    flights: Array.isArray(returnFlightResults) ? returnFlightResults : [],
    selectedAirlines,
    filters,
  });

  // Filter progressive flights in real-time
  const { filteredFlights: filteredProgressiveFlights } = useFlightFilters({
    flights: Array.isArray(progressiveFlights) ? progressiveFlights : [],
    selectedAirlines,
    filters,
  });

  // Filter per-day results for month mode manually
  const filteredPerDayResults = useMemo(() => {
    if (!perDayResults) return [];

    return perDayResults.map((dayGroup) => {
      // Manual filtering logic for each day's flights
      const filteredFlights = dayGroup.flights.filter((flight) => {
        // Airline filter
        if (selectedAirlines.length > 0) {
          const airlineMatch = selectedAirlines.some(
            (airlineId) =>
              flight.airline_id?.toString() === airlineId ||
              flight.airline_name
                ?.toLowerCase()
                .includes(airlineId.toLowerCase())
          );
          if (!airlineMatch) return false;
        }

        // Add other filters as needed (price, time, etc.)
        // For now, keep it simple with just airline filter
        return true;
      });

      return {
        ...dayGroup,
        flights: filteredFlights,
      };
    });
  }, [perDayResults, selectedAirlines, filters]);

  // Save searchInfo to sessionStorage whenever it changes
  useEffect(() => {
    if (searchInfo) {
      sessionStorage.setItem("searchInfo", JSON.stringify(searchInfo));
      if (DEV_CONFIG.ENABLE_CONSOLE_LOGS && shouldShowDevControls()) {
        console.log("💾 Saved searchInfo to sessionStorage:", searchInfo);
      }
    }
  }, [searchInfo]);

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
    if (DEV_CONFIG.ENABLE_CONSOLE_LOGS && shouldShowDevControls()) {
      console.log("🔁 Stored tripType loaded:", storedTripType);
    }

    if (storedResults) {
      try {
        const parsed = JSON.parse(storedResults) as unknown;
        type UnknownObj = Record<string, unknown>;
        let results: FlightSearchApiWrapper | MonthAggregatedWrapper;
        const looksLikeDirectData = (() => {
          if (!parsed || typeof parsed !== "object") return false;
          const obj = parsed as UnknownObj;
          if ("status" in obj) return false;
          return (
            "search_results" in obj ||
            "outbound_search_results" in obj ||
            "inbound_search_results" in obj
          );
        })();
        if (looksLikeDirectData) {
          // We trust downstream guards (isRoundTripResponse/isOneWayResponse/normalization) to validate shape.
          results = {
            status: true,
            data: parsed as unknown as FlightSearchResponseData,
          };
        } else {
          results = parsed as FlightSearchApiWrapper | MonthAggregatedWrapper;
        }

        if (DEV_CONFIG.ENABLE_CONSOLE_LOGS && shouldShowDevControls()) {
          console.log("📋 Parsed search results:", results);
          console.log("📋 Results.data structure:", results.data);
        }

        // Detect month aggregated synthetic wrapper (has meta + data.per_day_results)
        const hasMonthAggregation =
          (results as MonthAggregatedWrapper).meta &&
          Array.isArray(
            (results as MonthAggregatedWrapper).data?.per_day_results
          );

        if (hasMonthAggregation) {
          const agg = (results as MonthAggregatedWrapper).data;
          const meta = (results as MonthAggregatedWrapper).meta;
          // Flatten flights for filtering while keeping grouping
          const flatFlights: FlightSearchApiResult[] = agg.per_day_results
            .flatMap((d) => d.flights)
            .filter(Boolean);
          setPerDayResults(agg.per_day_results);
          setMonthMeta(meta);
          // Use flattened flights for filtering UI
          setFlightResults(flatFlights);
          setReturnFlightResults([]);
          // For header components expecting FlightSearchResponseData treat as one-way
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
        }

        // Handle the actual API response structure (normal API)
        if (!hasMonthAggregation && results.status && results.data) {
          if (DEV_CONFIG.ENABLE_CONSOLE_LOGS && shouldShowDevControls()) {
            console.log(
              "✅ Found results with status=true, data:",
              results.data
            );
          }

          // --- Legacy / variant round-trip schema normalization ---
          // Some backend variants wrap outbound_flights / inbound_flights inside an object at data.search_results
          // e.g. { search_results: { outbound_flights: [...], inbound_flights: [...] }, outbound_total_count, ... }
          // Before applying standard type guards, detect & normalize this shape.
          const dUnknown = results.data as unknown;
          const dAny: Record<string, unknown> =
            typeof dUnknown === "object" && dUnknown !== null
              ? (dUnknown as Record<string, unknown>)
              : ({} as Record<string, unknown>);
          const srRaw = dAny.search_results as unknown;
          const srObj: Record<string, unknown> | null =
            srRaw && typeof srRaw === "object" && !Array.isArray(srRaw)
              ? (srRaw as Record<string, unknown>)
              : null;
          if (srObj) {
            const outboundRaw = srObj.outbound_flights as unknown;
            const inboundRaw = srObj.inbound_flights as unknown;
            const outboundArr: FlightSearchApiResult[] = Array.isArray(
              outboundRaw
            )
              ? (outboundRaw as FlightSearchApiResult[])
              : [];
            const inboundArr: FlightSearchApiResult[] = Array.isArray(
              inboundRaw
            )
              ? (inboundRaw as FlightSearchApiResult[])
              : [];
            const variantDetected =
              outboundArr.length > 0 || inboundArr.length > 0;
            if (variantDetected) {
              if (DEV_CONFIG.ENABLE_CONSOLE_LOGS && shouldShowDevControls()) {
                console.log(
                  "🛠 Detected nested round-trip variant -> normalizing (out/in):",
                  outboundArr.length,
                  inboundArr.length
                );
              }
              const passengersCandidate = (dAny.passengers ||
                dAny.passenger_count) as
                | { adults: number; children?: number; infants?: number }
                | undefined;
              const normalized: RoundTripLike = {
                arrival_airport:
                  (dAny.arrival_airport as string) ||
                  (dAny.to_airport as string) ||
                  "",
                departure_airport:
                  (dAny.departure_airport as string) ||
                  (dAny.from_airport as string) ||
                  "",
                departure_date: (dAny.departure_date as string) || "",
                return_date: dAny.return_date as string | undefined,
                flight_class: (dAny.flight_class as string) || "all",
                limit: (dAny.limit as number) || outboundArr.length || 0,
                page: (dAny.page as number) || 1,
                passengers: passengersCandidate || {
                  adults: 1,
                  children: 0,
                  infants: 0,
                },
                outbound_search_results: outboundArr,
                outbound_total_count:
                  (dAny.outbound_total_count as number) ??
                  outboundArr.length ??
                  0,
                outbound_total_pages:
                  (dAny.outbound_total_pages as number) ?? 1,
                inbound_search_results: inboundArr,
                inbound_total_count:
                  (dAny.inbound_total_count as number) ??
                  inboundArr.length ??
                  0,
                inbound_total_pages: (dAny.inbound_total_pages as number) ?? 1,
                sort_by: (dAny.sort_by as string) || "price",
                sort_order: (dAny.sort_order as string) || "asc",
              };
              setTripType("round-trip");
              setFlightResults(outboundArr);
              setReturnFlightResults(inboundArr);
              setSearchInfo(normalized as unknown as FlightSearchResponseData);
              setError(null);
              if (DEV_CONFIG.ENABLE_CONSOLE_LOGS && shouldShowDevControls()) {
                console.log(
                  "✅ Normalized nested round-trip variant -> outbound/inbound counts:",
                  outboundArr.length,
                  inboundArr.length
                );
              }
              return; // Skip further processing since handled
            }
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

            // Force tripType to round-trip in case storedTripType wasn't set properly
            if (tripType !== "round-trip") {
              if (DEV_CONFIG.ENABLE_CONSOLE_LOGS && shouldShowDevControls()) {
                console.log(
                  "⚙️ Adjusting tripType -> round-trip based on data"
                );
              }
              setTripType("round-trip");
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

            // Force immediate progressive reveal for data from sessionStorage
            setTimeout(() => {
              setSkeletonActive(false);
              triggerProgressiveReveal();
            }, 50);
          } else if (isOneWayResponse(results.data)) {
            if (DEV_CONFIG.ENABLE_CONSOLE_LOGS && shouldShowDevControls()) {
              console.log("➡️ Processing one-way response");
              console.log(
                "Search results:",
                results.data.search_results?.length
              );
            }

            // Set one-way flights
            if (DEV_CONFIG.ENABLE_CONSOLE_LOGS && shouldShowDevControls()) {
              console.log("🎯 Treating response as one-way");
            }
            const sr = Array.isArray(results.data.search_results)
              ? results.data.search_results
              : [];
            if (
              !Array.isArray(results.data.search_results) &&
              DEV_CONFIG.ENABLE_CONSOLE_LOGS &&
              shouldShowDevControls()
            ) {
              console.warn(
                "⚠️ search_results was not an array (unexpected for one-way) -> coerced to []"
              );
            }
            setFlightResults(sr);
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

            // Force immediate progressive reveal for data from sessionStorage
            setTimeout(() => {
              setSkeletonActive(false);
              triggerProgressiveReveal();
            }, 50);
          } else {
            if (DEV_CONFIG.ENABLE_CONSOLE_LOGS && shouldShowDevControls()) {
              console.warn("⚠️ Unknown response format");
              console.log("Data structure:", Object.keys(results.data || {}));
            }

            // Fallback: try different possible property names
            const rawData = results.data as unknown as Record<string, unknown>;

            // Attempt normalization for changed round-trip schema
            const attempt = tryNormalizeRoundTrip(rawData);
            if (attempt.matched && attempt.normalized) {
              if (DEV_CONFIG.ENABLE_CONSOLE_LOGS && shouldShowDevControls()) {
                console.log(
                  "🔧 Normalized round-trip schema detected",
                  attempt.debug
                );
              }
              const norm = attempt.normalized;
              setTripType("round-trip");
              setFlightResults(norm.outbound_search_results || []);
              setReturnFlightResults(norm.inbound_search_results || []);
              // Cast to FlightSearchResponseData for downstream components
              setSearchInfo(norm as unknown as FlightSearchResponseData);
              setError(null);
              return; // Exit fallback branch early since handled
            }
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
        } else if (!hasMonthAggregation) {
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
      setPerDayResults([]);
      setMonthMeta(null);
      setError(null);
    }
  };

  // Load search results from sessionStorage when component mounts
  useEffect(() => {
    loadSearchResults();
  }, []);

  // Progressive reveal effect when new search results arrive (non-month searches)
  useEffect(() => {
    // If month meta present, skip progressive (already streams per day)
    if (monthMeta) return;
    const storedId = sessionStorage.getItem("flightSearchSearchId");
    if (storedId && storedId !== lastAppliedSearchIdRef.current) {
      // New search initiated -> start skeleton phase
      lastAppliedSearchIdRef.current = storedId;
      const started = Number(
        sessionStorage.getItem("flightSearchStartedAt") || Date.now()
      );
      const now = Date.now();
      const SKELETON_MS = 500; // Reduced to 0.5s for faster UI feedback
      const remaining = Math.max(0, SKELETON_MS - (now - started));
      setSkeletonActive(true);
      setProgressiveFlights([]);
      if (skeletonTimerRef.current)
        window.clearTimeout(skeletonTimerRef.current);
      skeletonTimerRef.current = window.setTimeout(() => {
        setSkeletonActive(false);
        // After skeleton phase, if results already loaded, trigger progressive build
        triggerProgressiveReveal();
      }, remaining);
    } else if (!skeletonActive) {
      // If skeleton already ended and we get new data, attempt progressive reveal
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
    if (skeletonActive) return; // wait until skeleton done
    if (monthMeta) return; // skip for month mode
    if (!flightResults || flightResults.length === 0) {
      setProgressiveFlights([]);
      return;
    }
    if (
      sessionStorage.getItem("flightSearchProgressiveApplied") ===
      lastAppliedSearchIdRef.current
    ) {
      return; // Already applied for this search id
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
        progressiveTimerRef.current = window.setTimeout(step, 350); // 350ms per airline batch
      }
    };
    step();
  };

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      if (progressiveTimerRef.current)
        window.clearTimeout(progressiveTimerRef.current);
      if (skeletonTimerRef.current)
        window.clearTimeout(skeletonTimerRef.current);
    };
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
      if (e.key === "tripType") {
        const t = sessionStorage.getItem("tripType") || "one-way";
        if (DEV_CONFIG.ENABLE_CONSOLE_LOGS && shouldShowDevControls()) {
          console.log("🧭 tripType storage event ->", t);
        }
        setTripType(t);
        if (t !== "round-trip") setActiveTab("outbound");
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
      const t = sessionStorage.getItem("tripType");
      if (t) {
        setTripType(t);
        if (t !== "round-trip") setActiveTab("outbound");
      }
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

  // Decide which flights array to present (progressive vs full) for one-way normal searches
  const displayOneWayFlights = !monthMeta
    ? skeletonActive
      ? []
      : progressiveFlights.length > 0 ||
        (lastAppliedSearchIdRef.current &&
          sessionStorage.getItem("flightSearchProgressiveApplied") ===
            lastAppliedSearchIdRef.current)
      ? filteredProgressiveFlights // Use filtered progressive flights
      : filteredFlights // Use filtered flights instead of raw flightResults
    : filteredFlights; // Also use filtered flights for month mode

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-blue-50/40 to-gray-50">
      {/* Search Form (hero style improved) */}
      <div className="relative pt-8 pb-4">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(59,130,246,0.08),transparent_60%)]" />
        <div className="container mx-auto px-4 relative">
          <div className="relative">
            <FlightSearchForm />
            {/* Decorative background */}
            <div className="pointer-events-none absolute -top-14 -left-10 w-56 h-56 bg-blue-200/40 rounded-full blur-3xl" />
            <div className="pointer-events-none absolute -bottom-10 -right-6 w-52 h-52 bg-indigo-200/40 rounded-full blur-3xl" />
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Filter Sidebar - Make it sticky */}
          <div className="lg:sticky lg:top-4 lg:self-start">
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
              progressiveCount={
                !monthMeta &&
                tripType !== "round-trip" &&
                progressiveFlights.length > 0
                  ? progressiveFlights.length
                  : undefined
              }
              skeletonActive={skeletonActive}
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

            {/* Month aggregated banner */}
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
                          // Đánh dấu cancel bằng session flag
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

            {/* Flight Lists or grouped per-day results */}
            {tripType === "round-trip" ? (
              <RoundTripFlightList
                outboundFlights={skeletonActive ? [] : filteredFlights}
                inboundFlights={skeletonActive ? [] : filteredReturnFlights}
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
            ) : monthMeta ? (
              <div className="space-y-8">
                {filteredPerDayResults
                  .filter((g) => g.flights && g.flights.length > 0) // bỏ ngày rỗng sau khi filter
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

            {/* Skeleton placeholder (only when active & not month search) */}
            {skeletonActive && !monthMeta && (
              <div className="space-y-3">
                {Array.from({ length: tripType === "round-trip" ? 6 : 4 }).map(
                  (_, i) => (
                    <FlightCardSkeleton key={i} />
                  )
                )}
              </div>
            )}

            {/* Load More Button */}
            {!monthMeta && !skeletonActive && (
              <LoadMoreButton
                searchInfo={searchInfo}
                filteredFlights={filteredFlights}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
// Heatmap tổng quan tháng
interface MonthOverviewHeatmapProps {
  perDayResults: { day: string; flights: FlightSearchApiResult[] }[];
  totalDays: number;
  onSelectDay: (day: string) => void;
}

const MonthOverviewHeatmap: React.FC<MonthOverviewHeatmapProps> = ({
  perDayResults,
  totalDays,
  onSelectDay,
}) => {
  // Map nhanh để lookup flights của ngày
  const map = new Map(perDayResults.map((g) => [g.day, g.flights] as const));
  const days: { dayStr: string; count: number; minPrice?: number }[] = [];
  if (perDayResults.length > 0) {
    const sampleDay = perDayResults[0].day; // dd/mm/yyyy
    const [, mm, yyyy] = sampleDay.split("/");
    for (let d = 1; d <= totalDays; d++) {
      const ds = d.toString().padStart(2, "0") + "/" + mm + "/" + yyyy;
      const flights = map.get(ds) || [];
      let minPrice: number | undefined;
      flights.forEach((f) => {
        if (minPrice === undefined || f.pricing.grand_total < minPrice) {
          minPrice = f.pricing.grand_total;
        }
      });
      days.push({ dayStr: ds, count: flights.length, minPrice });
    }
  }

  // Xác định thang màu theo minPrice
  const priceValues = days
    .filter((d) => d.minPrice !== undefined)
    .map((d) => d.minPrice!)
    .sort((a, b) => a - b);
  const low = priceValues[0];
  const high = priceValues[priceValues.length - 1];
  const scaleColor = (price?: number) => {
    if (price === undefined || low === undefined || high === undefined)
      return "bg-gray-100 text-gray-400";
    if (high === low) return "bg-green-500 text-white";
    const ratio = (price - low) / (high - low);
    if (ratio < 0.25) return "bg-green-500 text-white";
    if (ratio < 0.5) return "bg-green-400 text-white";
    if (ratio < 0.75) return "bg-amber-400 text-white";
    return "bg-red-500 text-white";
  };

  return (
    <div className="p-4 rounded-xl border bg-white shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-semibold text-gray-800">
          Tổng quan giá theo ngày
        </h4>
        <div className="flex items-center gap-2 text-[10px] font-medium">
          <span className="px-2 py-0.5 rounded bg-green-500 text-white">
            Rẻ
          </span>
          <span className="px-2 py-0.5 rounded bg-amber-400 text-white">
            TB
          </span>
          <span className="px-2 py-0.5 rounded bg-red-500 text-white">Cao</span>
        </div>
      </div>
      <div className="grid grid-cols-7 gap-2">
        {days.map((d) => (
          <button
            key={d.dayStr}
            onClick={() => d.count > 0 && onSelectDay(d.dayStr)}
            className={`relative h-14 rounded-lg flex flex-col items-center justify-center text-[10px] font-semibold transition-all border ${
              d.count > 0
                ? scaleColor(d.minPrice) +
                  " hover:brightness-110 border-transparent"
                : "bg-gray-50 border-dashed border-gray-300 text-gray-300"
            } ${d.count > 0 ? "cursor-pointer" : "cursor-default"}`}
            title={
              d.count > 0
                ? `Ngày ${d.dayStr}\n${d.count} chuyến • Giá thấp nhất: ${d.minPrice}`
                : `Ngày ${d.dayStr}\nKhông có chuyến bay`
            }>
            <span>{d.dayStr.split("/")[0]}</span>
            {d.count > 0 && (
              <span className="text-[9px] font-normal opacity-90 mt-0.5">
                {d.minPrice?.toLocaleString("vi-VN")}₫
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};

export default Search;
