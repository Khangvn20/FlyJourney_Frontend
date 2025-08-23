import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import type { SearchFormData, PassengerCounts } from "../shared/types";
import { DEV_CONFIG, shouldShowDevControls } from "../shared/config/devConfig";
import type { FlightSearchApiResponse } from "../shared/types/search-api.types";

// Simple interface matching Postman exactly (from SimpleFlightSearchForm)
interface SimpleSearchRequest {
  departure_airport_code: string;
  arrival_airport_code: string;
  departure_date: string; // dd/mm/yyyy format
  flight_class: "all";
  passenger: {
    adults: number;
    children?: number;
    infants?: number;
  };
  page: number;
  limit: number;
  sort_by: string;
  sort_order: string;
}

// Round-trip search request interface
interface RoundTripSearchRequest {
  departure_airport_code: string;
  arrival_airport_code: string;
  departure_date: string; // dd/mm/yyyy format
  return_date: string; // dd/mm/yyyy format for round-trip
  flight_class: "all";
  passengers: {
    adults: number;
    children?: number;
    infants?: number;
  };
  page: number;
  limit: number;
  sort_by: string;
  sort_order: string;
}

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
  const baseUrl = "http://localhost:3000/api/v1/flights/search";
  const url = isRoundTrip ? `${baseUrl}/roundtrip` : baseUrl;

  if (DEV_CONFIG.ENABLE_CONSOLE_LOGS && shouldShowDevControls()) {
    console.log("🚀 Calling API directly:", url);
    console.log("📤 Request body:", JSON.stringify(params, null, 2));
    console.log("🔄 Trip type:", isRoundTrip ? "Round-trip" : "One-way");
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
  interface MonthAggregatedWrapperOneWayInternal {
    status: boolean;
    data: FlightSearchApiResponse & { per_day_results: PerDayFlightsAggr[] } & {
      mode: "one-way";
    };
    meta: {
      month: number;
      year: number;
      days: number;
      loading: boolean;
      phase: "done";
    };
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
    meta: {
      month: number;
      year: number;
      days: number;
      loading: boolean;
      phase: "outbound" | "inbound" | "done";
    };
  }
  type AggregatedMonthUnion =
    | MonthAggregatedWrapperOneWayInternal
    | RoundTripMonthWrapperInternal;
  const aggregatedMonthRef = useRef<AggregatedMonthUnion | null>(null);

  const [formData, setFormData] = useState<SearchFormData>(() => {
    const savedData = loadSavedSearchData();
    const today = new Date();
    const defaultData = {
      tripType: "one-way" as const,
      from: "",
      to: "",
      departureDate: today,
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
      flightClass: "economy" as const,
      specialRequirements: "normal" as const,
      searchFullMonth: false,
    };

    // Merge saved data but always use today's date for departure
    const merged = { ...defaultData, ...savedData };
    merged.departureDate = today;
    if (merged.returnDate && merged.returnDate < merged.departureDate) {
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
    const classNames = {
      economy: "Phổ thông",
      premium: "Phổ thông đặc biệt",
      business: "Thương gia",
      first: "Hạng nhất",
    };
    return classNames[formData.flightClass as keyof typeof classNames];
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

  // Old minimum spinner duration replaced by new phased loading UX:
  // First 5s: skeleton (handled in Search page) then progressive reveal by airline.
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

  const handleSearch = async () => {
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
      // Mark new search start for skeleton phase coordination (normal searches)
      const startedAt = Date.now();
      sessionStorage.setItem("flightSearchStartedAt", String(startedAt));
      sessionStorage.setItem("flightSearchSearchId", String(startedAt));
      sessionStorage.removeItem("flightSearchProgressiveApplied");
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

      let apiRequest: SimpleSearchRequest | RoundTripSearchRequest;

      if (isRoundTrip && formData.returnDate) {
        // Create round-trip request
        const roundTripRequest: RoundTripSearchRequest = {
          departure_airport_code: getAirportCode(formData.from),
          arrival_airport_code: getAirportCode(formData.to),
          departure_date: formatDateForApiRequest(formData.departureDate),
          return_date: formatDateForApiRequest(formData.returnDate),
          flight_class: "all",
          passengers: {
            adults: formData.passengers.adults,
            children:
              formData.passengers.children > 0
                ? formData.passengers.children
                : undefined,
            infants:
              formData.passengers.infants > 0
                ? formData.passengers.infants
                : undefined,
          },
          page: 1,
          limit: 50,
          sort_by: "price",
          sort_order: "asc",
        };
        // Backend compatibility: some implementations expect singular 'passenger'
        // Clone and attach if needed without altering type
        (roundTripRequest as unknown as Record<string, unknown>)["passenger"] =
          {
            adults: formData.passengers.adults,
            children:
              formData.passengers.children > 0
                ? formData.passengers.children
                : undefined,
            infants:
              formData.passengers.infants > 0
                ? formData.passengers.infants
                : undefined,
          };
        apiRequest = roundTripRequest;
      } else {
        // Create one-way request (existing logic)
        const oneWayRequest: SimpleSearchRequest = {
          departure_airport_code: getAirportCode(formData.from),
          arrival_airport_code: getAirportCode(formData.to),
          departure_date: formatDateForApiRequest(formData.departureDate),
          flight_class: "all",
          passenger: {
            adults: formData.passengers.adults,
            children:
              formData.passengers.children > 0
                ? formData.passengers.children
                : undefined,
            infants:
              formData.passengers.infants > 0
                ? formData.passengers.infants
                : undefined,
          },
          page: 1,
          limit: 50,
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
        const year = departureDate.getFullYear();
        const month = departureDate.getMonth(); // 0 index
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const searchId = Date.now();
        currentMonthSearchId.current = searchId;
        // Reset cancel flag
        sessionStorage.removeItem("cancelMonthSearch");

        // ONE-WAY MONTH (original path)
        if (!isRoundTrip) {
          // (inline type removed)
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
          const aggregatedResults: MonthAggregatedWrapperOneWayInternal = {
            status: true,
            data: { ...baseOneWay, per_day_results: [], mode: "one-way" },
            meta: {
              month: month + 1,
              year,
              days: daysInMonth,
              loading: true,
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
          for (let day = 1; day <= daysInMonth; day++) {
            if (
              currentMonthSearchId.current !== searchId ||
              sessionStorage.getItem("cancelMonthSearch") === "1"
            )
              break;
            const currentDate = new Date(year, month, day);
            const todayMidnight = new Date(new Date().setHours(0, 0, 0, 0));
            if (DEV_CONFIG.HIDE_DEV_CONTROLS && currentDate < todayMidnight)
              continue;
            const dayRequest: SimpleSearchRequest = {
              ...(apiRequest as SimpleSearchRequest),
              departure_date: formatDateForApiRequest(currentDate),
              page: 1,
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
              const updated = {
                ...aggregatedResults,
                meta: {
                  ...aggregatedResults.meta,
                  loading: day < daysInMonth,
                  phase: "done",
                },
              };
              aggregatedMonthRef.current = updated as AggregatedMonthUnion;
              sessionStorage.setItem(
                "flightSearchResults",
                JSON.stringify(updated)
              );
              window.dispatchEvent(new CustomEvent("sessionStorageUpdated"));
            } catch (err) {
              if (DEV_CONFIG.ENABLE_CONSOLE_LOGS && shouldShowDevControls())
                console.error("Month day fetch failed", dayRequest, err);
            }
            // await new Promise((r) => setTimeout(r, 160)); // Removed delay for faster search
          }
          if (aggregatedMonthRef.current) {
            aggregatedMonthRef.current = {
              ...aggregatedMonthRef.current,
              meta: {
                ...aggregatedMonthRef.current.meta,
                loading: false,
                phase: "done",
              },
            };
            sessionStorage.setItem(
              "flightSearchResults",
              JSON.stringify(aggregatedMonthRef.current)
            );
            window.dispatchEvent(new CustomEvent("sessionStorageUpdated"));
            sessionStorage.removeItem("cancelMonthSearch");
          }
          // await ensureMonthMinDuration(searchStart); // Removed timeout
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
            month: month + 1,
            year,
            days: daysInMonth,
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
            flight_class: "all",
            passenger: {
              adults: formData.passengers.adults,
              children: formData.passengers.children || undefined,
              infants: formData.passengers.infants || undefined,
            },
            page: 1,
            limit: 50,
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
        for (let day = 1; day <= daysInMonth; day++) {
          if (
            currentMonthSearchId.current !== searchId ||
            sessionStorage.getItem("cancelMonthSearch") === "1"
          )
            break;
          const d = new Date(year, month, day);
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
          wrapper.meta = { ...wrapper.meta, loading: false };
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
        for (let day = 1; day <= daysInMonth; day++) {
          if (
            currentMonthSearchId.current !== searchId ||
            sessionStorage.getItem("cancelMonthSearch") === "1"
          )
            break;
          const d = new Date(year, month, day);
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
            wrapper.meta = { ...wrapper.meta, phase: "inbound", loading: true };
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
        wrapper.meta = { ...wrapper.meta, phase: "done", loading: false };
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
      // Normal search: no artificial 8s wait. Skeleton phase handled externally.
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
              meta: { ...one.meta, loading: false, phase: "done" },
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
