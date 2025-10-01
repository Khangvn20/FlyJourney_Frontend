import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import type { SearchFormData, PassengerCounts } from "../shared/types";
import type { FlightClass } from "../shared/types/flight-api.types";
import { DEV_CONFIG, shouldShowDevControls } from "../shared/config/devConfig";
import { buildApiUrl } from "../shared/constants/apiConfig";
import type { FlightSearchApiResponse } from "../shared/types/search-api.types";
import { toFlightClass } from "../lib/searchUtils";

// Simple interface matching Postman exactly (from SimpleFlightSearchForm)
interface SimpleSearchRequest {
  departure_airport_code: string;
  arrival_airport_code: string;
  departure_date: string; // dd/mm/yyyy format
  flight_class: FlightClass;
  passenger: {
    adults: number;
    children?: number;
    infants?: number;
  };
  page: number;
  limit: number;
  sort_by: string;
  sort_order: string;
  airline_ids?: number[]; // Add airline filtering
}

// Round-trip search request interface
interface RoundTripSearchRequest {
  departure_airport_code: string;
  arrival_airport_code: string;
  departure_date: string; // dd/mm/yyyy format
  return_date: string; // dd/mm/yyyy format for round-trip
  flight_class: FlightClass;
  passengers: {
    adults: number;
    children?: number;
    infants?: number;
  };
  page: number;
  limit: number;
  sort_by: string;
  sort_order: string;
  airline_ids?: number[]; // Add airline filtering
}

/**
 * BACKEND API INCONSISTENCY NOTE:
 *
 * There's an inconsistency in the backend API:
 * - One-way search API expects "passenger" (singular) in the request
 * - Round-trip search API expects "passengers" (plural) in the request
 *
 * Additionally, the responses are also inconsistent:
 * - One-way search API returns "passengers" in the response
 * - Round-trip search API returns "passenger_count" in the response
 *
 * To accommodate this inconsistency, we need to use the correct parameter name for each request type:
 * 1. For one-way requests: use "passenger" (singular)
 * 2. For round-trip requests: use "passengers" (plural)
 */

// Function to load saved search data from localStorage
const loadSavedSearchData = (): Partial<SearchFormData> => {
  try {
    const saved = localStorage.getItem("flightSearchFormData");
    if (saved) {
      const parsedData = JSON.parse(saved);
      // Convert date strings back to Date objects
      if (parsedData.departureDate) {
        parsedData.departureDate = new Date(parsedData.departureDate);
      }
      if (parsedData.returnDate) {
        parsedData.returnDate = new Date(parsedData.returnDate);
      }
      return parsedData;
    }
  } catch (error) {
    console.error("Error loading saved search data:", error);
  }
  return {};
};

// Function to save search data to localStorage
const saveSearchData = (formData: SearchFormData) => {
  try {
    localStorage.setItem("flightSearchFormData", JSON.stringify(formData));
  } catch (error) {
    console.error("Error saving search data:", error);
  }
};

// Direct API call matching Postman exactly (migrated from SimpleFlightSearchForm)
const callApiDirectly = async (
  params: SimpleSearchRequest | RoundTripSearchRequest,
  isRoundTrip: boolean = false,
  signal?: AbortSignal
) => {
  const baseUrl = buildApiUrl("/flights/search");
  const url = isRoundTrip ? `${baseUrl}/roundtrip` : baseUrl;

  if (DEV_CONFIG.ENABLE_CONSOLE_LOGS && shouldShowDevControls()) {
    console.log("🚀 Calling API directly:", url);
    console.log("📤 Request body:", JSON.stringify(params, null, 2));
    console.log("🔄 Trip type:", isRoundTrip ? "Round-trip" : "One-way");
  }
  try {
    const method = "POST";
    const headers = { "Content-Type": "application/json" } as const;
    const bodyText = JSON.stringify(params);
    const curl = [
      `curl -X ${method} '${url}'`,
      `-H 'Content-Type: application/json'`,
      `-d '${bodyText.replace(/'/g, "'\\''")}'`,
    ].join(" ");
    const debugReq = { url, method, headers, body: params, curl };
    (window as unknown as Record<string, unknown>)[
      "__FJ_DEBUG_LAST_REQUEST__"
    ] = debugReq;
    window.dispatchEvent(
      new CustomEvent("FJ_DEBUG_API", {
        detail: { phase: "request", data: debugReq },
      })
    );
  } catch {
    // no-op
  }

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(params),
      signal,
    });

    if (DEV_CONFIG.ENABLE_CONSOLE_LOGS && shouldShowDevControls()) {
      console.log(
        `📈 Response status: ${response.status} ${response.statusText}`
      );
    }

    if (!response.ok) {
      const errorText = await response.text();
      if (DEV_CONFIG.ENABLE_CONSOLE_LOGS && shouldShowDevControls()) {
        console.error(`❌ HTTP Error:`, errorText);
      }
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    if (DEV_CONFIG.ENABLE_CONSOLE_LOGS && shouldShowDevControls()) {
      console.log("✅ Raw API Response:", data);
    }
    try {
      (window as unknown as Record<string, unknown>)[
        "__FJ_DEBUG_LAST_RESPONSE__"
      ] = data;
      window.dispatchEvent(
        new CustomEvent("FJ_DEBUG_API", { detail: { phase: "response", data } })
      );
    } catch {
      // no-op
    }

    return data;
  } catch (error) {
    if (DEV_CONFIG.ENABLE_CONSOLE_LOGS && shouldShowDevControls()) {
      console.error("❌ API call failed:", error);
    }
    throw error;
  }
};

// Format date to dd/mm/yyyy as API expects (migrated from SimpleFlightSearchForm)
const formatDateForApiRequest = (date: Date): string => {
  const day = date.getDate().toString().padStart(2, "0");
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

export const useFlightSearchForm = () => {
  const navigate = useNavigate();
  // Ref để quản lý vòng lặp tìm kiếm tháng & hủy
  const currentMonthSearchId = useRef<number | null>(null);
  const currentAbortController = useRef<AbortController | null>(null);
  interface PerDayFlightsAggr {
    day: string;
    flights: FlightSearchApiResponse["search_results"];
  }
  interface MonthRangeMetaInternal {
    startMonth: number;
    startYear: number;
    endMonth: number;
    endYear: number;
    monthsCount: number;
    totalDays: number;
    loadedDays: number;
    loading: boolean;
    phase?: "outbound" | "inbound" | "done";
  }
  interface MonthAggregatedWrapperOneWayInternal {
    status: boolean;
    data: FlightSearchApiResponse & { per_day_results: PerDayFlightsAggr[] } & {
      mode: "one-way";
    };
    meta: MonthRangeMetaInternal;
  }
  interface RoundTripMonthWrapperInternal {
    status: boolean;
    data: {
      mode: "round-trip-month";
      outbound: {
        per_day_results: PerDayFlightsAggr[];
        search_results: FlightSearchApiResponse["search_results"];
        departure_airport: string;
        arrival_airport: string;
      };
      inbound: {
        per_day_results: PerDayFlightsAggr[];
        search_results: FlightSearchApiResponse["search_results"];
        departure_airport: string;
        arrival_airport: string;
      };
    };
    meta: MonthRangeMetaInternal;
  }
  type AggregatedMonthUnion =
    | MonthAggregatedWrapperOneWayInternal
    | RoundTripMonthWrapperInternal;
  const aggregatedMonthRef = useRef<AggregatedMonthUnion | null>(null);

  const [formData, setFormData] = useState<SearchFormData>(() => {
    const savedData = loadSavedSearchData();
    const today = new Date();
    const todayMidnight = new Date(today);
    todayMidnight.setHours(0, 0, 0, 0);

    const normalizeStoredDate = (date: unknown): Date | undefined => {
      if (!(date instanceof Date) || Number.isNaN(date.getTime())) {
        return undefined;
      }
      if (DEV_CONFIG.HIDE_DEV_CONTROLS && date < todayMidnight) {
        return undefined;
      }
      return date;
    };

    const defaultData = {
      tripType: "one-way" as const,
      from: "",
      to: "",
      departureDate: undefined as Date | undefined,
      returnDate: undefined,
      multiCitySegments: [
        { from: "", to: "", departureDate: undefined },
        { from: "", to: "", departureDate: undefined },
      ],
      passengers: {
        adults: 1,
        children: 0,
        infants: 0,
      },
      flightClass: "all" as const,
      specialRequirements: "none" as const,
      searchFullMonth: false,
      monthsCount: 1,
    };

    // Merge saved data but always use today's date for departure
    const merged = { ...defaultData, ...savedData };
    merged.departureDate = normalizeStoredDate(savedData.departureDate);
    merged.returnDate = normalizeStoredDate(savedData.returnDate);

    if (
      merged.returnDate &&
      merged.departureDate &&
      merged.returnDate < merged.departureDate
    ) {
      merged.returnDate = undefined;
    }

    return merged;
  });

  // Ref to avoid stale tripType during immediate search after toggle
  const tripTypeRef = useRef(formData.tripType);
  useEffect(() => {
    tripTypeRef.current = formData.tripType;
  }, [formData.tripType]);

  // Save form data to localStorage whenever it changes
  useEffect(() => {
    saveSearchData(formData);
  }, [formData]);

  // Keep return date in sync with departure date
  useEffect(() => {
    if (
      formData.returnDate &&
      formData.departureDate &&
      formData.returnDate < formData.departureDate
    ) {
      setFormData((p) => ({ ...p, returnDate: undefined }));
    }
  }, [formData.departureDate, formData.returnDate, setFormData]);

  const [showPassengerDropdown, setShowPassengerDropdown] = useState(false);
  const [showFromDropdown, setShowFromDropdown] = useState(false);
  const [showToDropdown, setShowToDropdown] = useState(false);

  const updatePassengerCount = (
    type: keyof PassengerCounts,
    increment: boolean
  ) => {
    setFormData((prev) => ({
      ...prev,
      passengers: {
        ...prev.passengers,
        [type]: increment
          ? prev.passengers[type] + 1
          : Math.max(type === "adults" ? 1 : 0, prev.passengers[type] - 1),
      },
    }));
  };

  const getPassengerText = () => {
    const { adults, children, infants } = formData.passengers;
    let text = `${adults} Người lớn`;
    if (children > 0) text += `, ${children} Trẻ em`;
    if (infants > 0) text += `, ${infants} Em bé`;
    return text;
  };

  const getClassText = () => {
    const classNames: Record<string, string> = {
      all: "Tất cả hạng vé",
      economy: "Phổ thông",
      "premium-economy": "Phổ thông đặc biệt",
      premium_economy: "Phổ thông đặc biệt",
      premium: "Phổ thông đặc biệt",
      business: "Thương gia",
      first: "Hạng nhất",
    };
    const key = formData.flightClass?.toLowerCase?.() ?? "";
    if (!key) return classNames.economy;

    if (classNames[key]) return classNames[key];

    const hyphenKey = key.replace(/_/g, "-");
    if (classNames[hyphenKey]) return classNames[hyphenKey];

    const underscoreKey = key.replace(/-/g, "_");
    if (classNames[underscoreKey]) return classNames[underscoreKey];

    return classNames.economy;
  };

  const swapLocations = () => {
    setFormData((prev) => ({
      ...prev,
      from: prev.to,
      to: prev.from,
    }));
  };

  const [isLoading, setIsLoading] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  // Public helper to clear stored results (used when switching trip type)
  const clearStoredResults = () => {
    try {
      sessionStorage.removeItem("flightSearchResults");
      sessionStorage.removeItem("tripType");
      window.dispatchEvent(new CustomEvent("sessionStorageUpdated"));
    } catch (error) {
      // Safely ignore storage errors
      if (DEV_CONFIG.ENABLE_CONSOLE_LOGS && shouldShowDevControls()) {
        console.warn("Warning: Could not clear stored results:", error);
      }
    }
  };

  const handleSearch = async (airlineIds?: number[]) => {
    // Immediately dispatch event with current passenger data for components to use
    const passengerData = {
      adults: formData.passengers.adults,
      children: formData.passengers.children,
      infants: formData.passengers.infants,
    };

    // Always log this to help debug
    console.log(
      "🚀 DISPATCHING SEARCH EVENT with passenger data:",
      passengerData
    );

    window.dispatchEvent(
      new CustomEvent("flightSearchRequested", {
        detail: {
          passengers: passengerData,
          tripType: formData.tripType,
        },
      })
    );

    // Validation
    if (!formData.departureDate) {
      setSearchError("Vui lòng chọn ngày khởi hành");
      return;
    }

    if (formData.tripType === "round-trip" && !formData.returnDate) {
      setSearchError("Vui lòng chọn ngày về cho chuyến bay khứ hồi");
      return;
    }

    if (!formData.from || !formData.to) {
      setSearchError("Vui lòng chọn sân bay đi và đến");
      return;
    }

    // Check date validity based on dev config
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (DEV_CONFIG.HIDE_DEV_CONTROLS && formData.departureDate < today) {
      setSearchError("Không thể tìm kiếm chuyến bay trong quá khứ");
      return;
    }

    if (
      formData.tripType === "round-trip" &&
      formData.returnDate &&
      DEV_CONFIG.HIDE_DEV_CONTROLS &&
      formData.returnDate < today
    ) {
      setSearchError("Ngày về không thể là ngày trong quá khứ");
      return;
    }

    if (
      formData.tripType === "round-trip" &&
      formData.returnDate &&
      formData.departureDate &&
      formData.returnDate < formData.departureDate
    ) {
      setSearchError("Ngày về phải sau ngày khởi hành");
      return;
    }

    // const searchStart = Date.now(); // Removed as no longer needed
    try {
      setIsLoading(true);
      setSearchError(null);
      // Always clear previous results before any new search to avoid stale data
      clearStoredResults();

      if (DEV_CONFIG.ENABLE_CONSOLE_LOGS && shouldShowDevControls()) {
        console.log("🔍 Searching flights with data:", formData);
      }

      // Extract airport codes from location strings
      const getAirportCode = (locationString: string): string => {
        const match = locationString.match(/\(([^)]+)\)$/);
        return match ? match[1] : locationString;
      };

      // Use ref to ensure latest tripType (avoids race when user clicks search immediately after toggling)
      const currentTripType = tripTypeRef.current;
      const isRoundTrip = currentTripType === "round-trip";

      if (DEV_CONFIG.ENABLE_CONSOLE_LOGS && shouldShowDevControls()) {
        console.log(
          "🔍 Trip type debug:",
          currentTripType,
          "| isRoundTrip:",
          isRoundTrip
        );
      }

      let apiRequest: SimpleSearchRequest | RoundTripSearchRequest;

      if (isRoundTrip && formData.returnDate) {
        // Create round-trip request
        const roundTripRequest: RoundTripSearchRequest = {
          departure_airport_code: getAirportCode(formData.from),
          arrival_airport_code: getAirportCode(formData.to),
          departure_date: formatDateForApiRequest(formData.departureDate),
          return_date: formatDateForApiRequest(formData.returnDate),
          flight_class: toFlightClass(formData.flightClass),
          passengers: {
            adults: formData.passengers.adults,
            children: formData.passengers.children || 0,
            infants: formData.passengers.infants || 0,
          },
          page: 1,
          limit: 100, // Increase from 50 to 100 to get more flights
          sort_by: "price",
          sort_order: "asc",
        };
        // REMOVED: We no longer need to add the 'passenger' field for round-trip requests
        // According to the API specification, round-trip requests only need 'passengers' (plural)
        // The previous implementation was adding both fields due to API inconsistency

        // Debug round-trip request
        if (DEV_CONFIG.ENABLE_CONSOLE_LOGS && shouldShowDevControls()) {
          console.log("🔍 Round-trip request:", {
            passengersSent: roundTripRequest.passengers,
          });
        }

        apiRequest = roundTripRequest;
      } else {
        // Create one-way request (existing logic)
        const oneWayRequest: SimpleSearchRequest = {
          departure_airport_code: getAirportCode(formData.from),
          arrival_airport_code: getAirportCode(formData.to),
          departure_date: formatDateForApiRequest(formData.departureDate),
          flight_class: toFlightClass(formData.flightClass),
          passenger: {
            adults: formData.passengers.adults,
            children: formData.passengers.children || 0,
            infants: formData.passengers.infants || 0,
          },
          page: 1,
          limit: 100, // Increase from 50 to 100 for one-way flights
          sort_by: "price",
          sort_order: "asc",
        };
        apiRequest = oneWayRequest;
      }

      if (DEV_CONFIG.ENABLE_CONSOLE_LOGS && shouldShowDevControls()) {
        console.log("🔍 API search request:", apiRequest);
        console.log(
          "🔄 Trip type (effective):",
          isRoundTrip ? "Round-trip" : "One-way",
          "| formData.tripType=",
          formData.tripType,
          "| ref=",
          currentTripType
        );
      }

      // If user requested full month search
      if (formData.searchFullMonth) {
        const departureDate = formData.departureDate!;
        const baseMonth = new Date(
          departureDate.getFullYear(),
          departureDate.getMonth(),
          1
        );
        const selectedMonthsRaw = Number(
          (formData as { monthsCount?: number }).monthsCount ?? 1
        );
        const requestedMonths = Number.isFinite(selectedMonthsRaw)
          ? Math.max(1, Math.min(6, Math.floor(selectedMonthsRaw)))
          : 1;

        const monthSequence = Array.from(
          { length: requestedMonths },
          (_, idx) => {
            const monthDate = new Date(
              baseMonth.getFullYear(),
              baseMonth.getMonth() + idx,
              1
            );
            const daysInTargetMonth = new Date(
              monthDate.getFullYear(),
              monthDate.getMonth() + 1,
              0
            ).getDate();
            return {
              year: monthDate.getFullYear(),
              month: monthDate.getMonth(),
              daysInMonth: daysInTargetMonth,
            };
          }
        );

        const todayMidnight = new Date(new Date().setHours(0, 0, 0, 0));
        const searchTimeline: { date: Date; monthIndex: number }[] = [];
        monthSequence.forEach((cfg, idx) => {
          for (let day = 1; day <= cfg.daysInMonth; day++) {
            const currentDate = new Date(cfg.year, cfg.month, day);
            if (DEV_CONFIG.HIDE_DEV_CONTROLS && currentDate < todayMidnight) {
              continue;
            }
            searchTimeline.push({ date: currentDate, monthIndex: idx });
          }
        });

        const hasSearchTargets = searchTimeline.length > 0;
        const searchId = Date.now();
        currentMonthSearchId.current = searchId;
        // Reset cancel flag
        sessionStorage.removeItem("cancelMonthSearch");

        // ONE-WAY MONTH (original path)
        if (!isRoundTrip) {
          const baseOneWay: FlightSearchApiResponse = {
            arrival_airport: (apiRequest as SimpleSearchRequest)
              .arrival_airport_code,
            arrival_date: "",
            departure_airport: (apiRequest as SimpleSearchRequest)
              .departure_airport_code,
            departure_date: "",
            flight_class: (apiRequest as SimpleSearchRequest).flight_class,
            limit: (apiRequest as SimpleSearchRequest).limit,
            page: 1,
            passengers: {
              adults: formData.passengers.adults,
              children: formData.passengers.children,
              infants: formData.passengers.infants,
            },
            search_results: [],
            sort_by: (apiRequest as SimpleSearchRequest).sort_by,
            sort_order: (apiRequest as SimpleSearchRequest).sort_order,
            total_count: 0,
            total_pages: 1,
          };

          const startCfg = monthSequence[0];
          const endCfg = monthSequence[monthSequence.length - 1];
          const aggregatedResults: MonthAggregatedWrapperOneWayInternal = {
            status: true,
            data: { ...baseOneWay, per_day_results: [], mode: "one-way" },
            meta: {
              startMonth: (startCfg?.month ?? baseMonth.getMonth()) + 1,
              startYear: startCfg?.year ?? baseMonth.getFullYear(),
              endMonth: (endCfg?.month ?? baseMonth.getMonth()) + 1,
              endYear: endCfg?.year ?? baseMonth.getFullYear(),
              monthsCount: monthSequence.length,
              totalDays: searchTimeline.length,
              loadedDays: 0,
              loading: hasSearchTargets,
              phase: "done",
            },
          };
          aggregatedMonthRef.current = aggregatedResults;
          sessionStorage.setItem(
            "flightSearchResults",
            JSON.stringify(aggregatedResults)
          );
          sessionStorage.setItem("tripType", formData.tripType);
          window.dispatchEvent(new CustomEvent("sessionStorageUpdated"));
          // Small delay to ensure sessionStorage is saved before navigation
          await new Promise((resolve) => setTimeout(resolve, 10));
          navigate("/search");

          for (let idx = 0; idx < searchTimeline.length; idx++) {
            if (
              currentMonthSearchId.current !== searchId ||
              sessionStorage.getItem("cancelMonthSearch") === "1"
            ) {
              break;
            }

            const currentDate = searchTimeline[idx].date;
            const dayRequest: SimpleSearchRequest = {
              ...(apiRequest as SimpleSearchRequest),
              departure_date: formatDateForApiRequest(currentDate),
              page: 1,
              airline_ids:
                airlineIds && airlineIds.length > 0 ? airlineIds : undefined,
            };

            try {
              currentAbortController.current?.abort();
              currentAbortController.current = new AbortController();
              const dayResult = await callApiDirectly(
                dayRequest,
                false,
                currentAbortController.current.signal
              );

              const flightsForDay = (dayResult?.data?.search_results ||
                dayResult?.data?.outbound_search_results ||
                []) as FlightSearchApiResponse["search_results"];

              aggregatedResults.data.per_day_results.push({
                day: formatDateForApiRequest(currentDate),
                flights: flightsForDay,
              });
              aggregatedResults.data.search_results.push(...flightsForDay);
              aggregatedResults.data.total_count =
                aggregatedResults.data.search_results.length;

              aggregatedResults.meta = {
                ...aggregatedResults.meta,
                loadedDays: aggregatedResults.data.per_day_results.length,
                loading: idx < searchTimeline.length - 1,
                phase: "done",
              };

              const updated = {
                ...aggregatedResults,
                meta: aggregatedResults.meta,
              };
              aggregatedMonthRef.current = updated as AggregatedMonthUnion;
              sessionStorage.setItem(
                "flightSearchResults",
                JSON.stringify(updated)
              );
              window.dispatchEvent(new CustomEvent("sessionStorageUpdated"));
            } catch (err) {
              if (DEV_CONFIG.ENABLE_CONSOLE_LOGS && shouldShowDevControls()) {
                console.error("Month day fetch failed", dayRequest, err);
              }
            }
          }

          if (aggregatedMonthRef.current) {
            const finalLoadedDays =
              aggregatedResults.data.per_day_results.length;
            aggregatedMonthRef.current = {
              ...aggregatedMonthRef.current,
              meta: {
                ...aggregatedMonthRef.current.meta,
                loading: false,
                phase: "done",
                loadedDays: finalLoadedDays,
              },
            };
            sessionStorage.setItem(
              "flightSearchResults",
              JSON.stringify(aggregatedMonthRef.current)
            );
            window.dispatchEvent(new CustomEvent("sessionStorageUpdated"));
            sessionStorage.removeItem("cancelMonthSearch");
          }

          setIsLoading(false);
          return;
        }

        // ROUND-TRIP MONTH (A: same month for both outbound & inbound, C: matrix later)
        // (inline types removed)
        const outboundCodeFrom =
          (apiRequest as RoundTripSearchRequest).departure_airport_code ||
          (apiRequest as SimpleSearchRequest).departure_airport_code;
        const outboundCodeTo =
          (apiRequest as RoundTripSearchRequest).arrival_airport_code ||
          (apiRequest as SimpleSearchRequest).arrival_airport_code;
        const primaryMonth = monthSequence[0];
        const monthYear = primaryMonth?.year ?? baseMonth.getFullYear();
        const monthIndex = primaryMonth?.month ?? baseMonth.getMonth();
        const daysInPrimaryMonth =
          primaryMonth?.daysInMonth ??
          new Date(monthYear, monthIndex + 1, 0).getDate();

        const wrapper: RoundTripMonthWrapperInternal = {
          status: true,
          data: {
            mode: "round-trip-month",
            outbound: {
              per_day_results: [],
              search_results: [],
              departure_airport: outboundCodeFrom,
              arrival_airport: outboundCodeTo,
            },
            inbound: {
              per_day_results: [],
              search_results: [],
              departure_airport: outboundCodeTo,
              arrival_airport: outboundCodeFrom,
            },
          },
          meta: {
            startMonth: monthIndex + 1,
            startYear: monthYear,
            endMonth: monthIndex + 1,
            endYear: monthYear,
            monthsCount: 1,
            totalDays: daysInPrimaryMonth * 2,
            loadedDays: 0,
            loading: true,
            phase: "outbound",
          },
        };
        aggregatedMonthRef.current = wrapper;
        sessionStorage.setItem("flightSearchResults", JSON.stringify(wrapper));
        sessionStorage.setItem("tripType", formData.tripType); // still round-trip
        window.dispatchEvent(new CustomEvent("sessionStorageUpdated"));
        // Small delay to ensure sessionStorage is saved before navigation
        await new Promise((resolve) => setTimeout(resolve, 10));
        navigate("/search");

        // Helper fetch one day one-way
        const fetchOneWayDay = async (from: string, to: string, d: Date) => {
          const req: SimpleSearchRequest = {
            departure_airport_code: from,
            arrival_airport_code: to,
            departure_date: formatDateForApiRequest(d),
            flight_class: toFlightClass(formData.flightClass),
            passenger: {
              adults: formData.passengers.adults,
              children: formData.passengers.children || undefined,
              infants: formData.passengers.infants || undefined,
            },
            page: 1,
            limit: 100, // Increase from 50 to 100 for month view
            sort_by: "price",
            sort_order: "asc",
          };
          currentAbortController.current?.abort();
          currentAbortController.current = new AbortController();
          const res = await callApiDirectly(
            req,
            false,
            currentAbortController.current.signal
          );
          return (res?.data?.search_results ||
            []) as FlightSearchApiResponse["search_results"];
        };
        // Phase 1: outbound
        for (let day = 1; day <= daysInPrimaryMonth; day++) {
          if (
            currentMonthSearchId.current !== searchId ||
            sessionStorage.getItem("cancelMonthSearch") === "1"
          )
            break;
          const d = new Date(monthYear, monthIndex, day);
          const todayMid = new Date(new Date().setHours(0, 0, 0, 0));
          if (DEV_CONFIG.HIDE_DEV_CONTROLS && d < todayMid) continue;
          try {
            const flights = await fetchOneWayDay(
              outboundCodeFrom,
              outboundCodeTo,
              d
            );
            wrapper.data.outbound.per_day_results.push({
              day: formatDateForApiRequest(d),
              flights,
            });
            wrapper.data.outbound.search_results.push(...flights);
            wrapper.meta = {
              ...wrapper.meta,
              phase: "outbound",
              loading: true,
              loadedDays: wrapper.data.outbound.per_day_results.length,
            };
            aggregatedMonthRef.current = wrapper;
            sessionStorage.setItem(
              "flightSearchResults",
              JSON.stringify(wrapper)
            );
            window.dispatchEvent(new CustomEvent("sessionStorageUpdated"));
          } catch (err) {
            if (DEV_CONFIG.ENABLE_CONSOLE_LOGS && shouldShowDevControls())
              console.error("Outbound month day failed", day, err);
          }
          // await new Promise((r) => setTimeout(r, 140)); // Removed delay for faster search
        }
        if (
          currentMonthSearchId.current !== searchId ||
          sessionStorage.getItem("cancelMonthSearch") === "1"
        ) {
          wrapper.meta = {
            ...wrapper.meta,
            loading: false,
            loadedDays: wrapper.data.outbound.per_day_results.length,
          };
          aggregatedMonthRef.current = wrapper;
          sessionStorage.setItem(
            "flightSearchResults",
            JSON.stringify(wrapper)
          );
          window.dispatchEvent(new CustomEvent("sessionStorageUpdated"));
          sessionStorage.removeItem("cancelMonthSearch");
          // await ensureMonthMinDuration(searchStart); // Removed timeout
          setIsLoading(false);
          return;
        }
        // Phase 2: inbound
        wrapper.meta = { ...wrapper.meta, phase: "inbound", loading: true };
        aggregatedMonthRef.current = wrapper;
        sessionStorage.setItem("flightSearchResults", JSON.stringify(wrapper));
        window.dispatchEvent(new CustomEvent("sessionStorageUpdated"));
        for (let day = 1; day <= daysInPrimaryMonth; day++) {
          if (
            currentMonthSearchId.current !== searchId ||
            sessionStorage.getItem("cancelMonthSearch") === "1"
          )
            break;
          const d = new Date(monthYear, monthIndex, day);
          const todayMid = new Date(new Date().setHours(0, 0, 0, 0));
          if (DEV_CONFIG.HIDE_DEV_CONTROLS && d < todayMid) continue;
          try {
            const flights = await fetchOneWayDay(
              outboundCodeTo,
              outboundCodeFrom,
              d
            );
            wrapper.data.inbound.per_day_results.push({
              day: formatDateForApiRequest(d),
              flights,
            });
            wrapper.data.inbound.search_results.push(...flights);
            wrapper.meta = {
              ...wrapper.meta,
              phase: "inbound",
              loading: true,
              loadedDays:
                wrapper.data.outbound.per_day_results.length +
                wrapper.data.inbound.per_day_results.length,
            };
            aggregatedMonthRef.current = wrapper;
            sessionStorage.setItem(
              "flightSearchResults",
              JSON.stringify(wrapper)
            );
            window.dispatchEvent(new CustomEvent("sessionStorageUpdated"));
          } catch (err) {
            if (DEV_CONFIG.ENABLE_CONSOLE_LOGS && shouldShowDevControls())
              console.error("Inbound month day failed", day, err);
          }
          // await new Promise((r) => setTimeout(r, 140)); // Removed delay for faster search
        }
        wrapper.meta = {
          ...wrapper.meta,
          phase: "done",
          loading: false,
          loadedDays:
            wrapper.data.outbound.per_day_results.length +
            wrapper.data.inbound.per_day_results.length,
        };
        aggregatedMonthRef.current = wrapper;
        sessionStorage.setItem("flightSearchResults", JSON.stringify(wrapper));
        window.dispatchEvent(new CustomEvent("sessionStorageUpdated"));
        sessionStorage.removeItem("cancelMonthSearch");
        // await ensureMonthMinDuration(searchStart); // Removed timeout
        setIsLoading(false);
        return;
      }

      // Normal single search call
      const results = await callApiDirectly(apiRequest, isRoundTrip);

      // Debug API results before storing
      if (DEV_CONFIG.ENABLE_CONSOLE_LOGS && shouldShowDevControls()) {
        console.log("🔍 API results before storing:", {
          results,
          hasPassengers: results?.data?.passengers || results?.passengers,
          resultType: isRoundTrip ? "round-trip" : "one-way",
          apiRequest: apiRequest,
        });
      }

      // Normal search: store results immediately for the listing page.
      sessionStorage.setItem("flightSearchResults", JSON.stringify(results));
      sessionStorage.setItem("tripType", currentTripType);
      sessionStorage.setItem("flightSearchCompletedAt", String(Date.now()));
      window.dispatchEvent(new CustomEvent("sessionStorageUpdated"));
      // Small delay to ensure sessionStorage is saved before navigation
      await new Promise((resolve) => setTimeout(resolve, 10));
      navigate("/search");
    } catch (error) {
      if (DEV_CONFIG.ENABLE_CONSOLE_LOGS && shouldShowDevControls()) {
        console.error("❌ Flight search failed:", error);
      }
      setSearchError(error instanceof Error ? error.message : "Search failed");
    } finally {
      // For month searches we already turned off loading after loops; avoid double clear
      if (formData.searchFullMonth) {
        // ensure we don't leave it true on early validation failure
        setIsLoading(false); // Remove setTimeout delay
      } else {
        setIsLoading(false);
      }
    }
  };

  return {
    formData,
    setFormData,
    showPassengerDropdown,
    setShowPassengerDropdown,
    showFromDropdown,
    setShowFromDropdown,
    showToDropdown,
    setShowToDropdown,
    updatePassengerCount,
    getPassengerText,
    getClassText,
    swapLocations,
    handleSearch,
    cancelMonthSearch: () => {
      // Đánh dấu hủy và cập nhật storage nếu đang chạy
      currentMonthSearchId.current = null; // sẽ khiến vòng lặp break ở lần kiểm tra tiếp theo
      sessionStorage.setItem("cancelMonthSearch", "1");
      currentAbortController.current?.abort();
      if (aggregatedMonthRef.current) {
        if (aggregatedMonthRef.current) {
          if (aggregatedMonthRef.current.data.mode === "one-way") {
            const one =
              aggregatedMonthRef.current as MonthAggregatedWrapperOneWayInternal;
            aggregatedMonthRef.current = {
              ...one,
              meta: {
                ...one.meta,
                loading: false,
                phase: "done",
                loadedDays: one.data.per_day_results.length,
              },
            };
          } else {
            const rt =
              aggregatedMonthRef.current as RoundTripMonthWrapperInternal;
            aggregatedMonthRef.current = {
              ...rt,
              meta: {
                ...rt.meta,
                loading: false,
                phase: rt.meta.phase ?? "done",
                loadedDays:
                  rt.data.outbound.per_day_results.length +
                  rt.data.inbound.per_day_results.length,
              },
            };
          }
        }
        sessionStorage.setItem(
          "flightSearchResults",
          JSON.stringify(aggregatedMonthRef.current)
        );
        window.dispatchEvent(new CustomEvent("sessionStorageUpdated"));
      }
      setIsLoading(false);
    },
    clearStoredResults,
    isLoading,
    searchError,
    setSearchError,
  };
};
