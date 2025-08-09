import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import type { SearchFormData, PassengerCounts } from "../shared/types";
import { DEV_CONFIG, shouldShowDevControls } from "../shared/config/devConfig";

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
  isRoundTrip: boolean = false
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

  const [formData, setFormData] = useState<SearchFormData>(() => {
    const savedData = loadSavedSearchData();
    return {
      tripType: "one-way",
      from: "",
      to: "",
      departureDate: undefined,
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
      flightClass: "economy",
      specialRequirements: "normal",
      searchFullMonth: false,
      ...savedData, // Apply saved data over defaults
    };
  });

  // Save form data to localStorage whenever it changes
  useEffect(() => {
    saveSearchData(formData);
  }, [formData]);

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

  const handleSearch = async () => {
    // Validation
    if (!formData.departureDate) {
      setSearchError("Please select departure date");
      return;
    }

    if (formData.tripType === "round-trip" && !formData.returnDate) {
      setSearchError("Please select return date for round-trip");
      return;
    }

    if (!formData.from || !formData.to) {
      setSearchError("Please select departure and arrival airports");
      return;
    }

    try {
      setIsLoading(true);
      setSearchError(null);

      if (DEV_CONFIG.ENABLE_CONSOLE_LOGS && shouldShowDevControls()) {
        console.log("🔍 Searching flights with data:", formData);
      }

      // Extract airport codes from location strings
      const getAirportCode = (locationString: string): string => {
        const match = locationString.match(/\(([^)]+)\)$/);
        return match ? match[1] : locationString;
      };

      const isRoundTrip = formData.tripType === "round-trip";

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
        console.log("🔄 Trip type:", isRoundTrip ? "Round-trip" : "One-way");
      }

      // Call API directly
      const results = await callApiDirectly(apiRequest, isRoundTrip);

      // Store search results in sessionStorage for the Search page
      sessionStorage.setItem("flightSearchResults", JSON.stringify(results));
      sessionStorage.setItem("tripType", formData.tripType);

      // Trigger custom event to notify Search page about the update
      window.dispatchEvent(new CustomEvent("sessionStorageUpdated"));

      // Navigate to search results page
      navigate("/search");
    } catch (error) {
      if (DEV_CONFIG.ENABLE_CONSOLE_LOGS && shouldShowDevControls()) {
        console.error("❌ Flight search failed:", error);
      }
      setSearchError(error instanceof Error ? error.message : "Search failed");
    } finally {
      setIsLoading(false);
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
    isLoading,
    searchError,
  };
};
