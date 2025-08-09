import type React from "react";
import { useState, useEffect } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Card, CardContent } from "../ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Calendar } from "../ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import {
  CalendarIcon,
  Search,
  ArrowRightLeft,
  MapPin,
  Users,
  Plane,
  CalendarIcon as CalendarMonth,
  Plus,
  Minus,
  User,
  Baby,
  UserCheck,
  ChevronDown,
  X,
  Navigation,
  AlertCircle,
} from "lucide-react";
import { format } from "date-fns";
import { Badge } from "../ui/badge";
import { useFlightSearchForm } from "../../hooks/useFlightSearchForm";
import {
  airports,
  flightClasses,
  specialRequirements,
} from "../../mocks/flightData";
import { airlines } from "../../mocks";
import type { Airport } from "../../shared/types";
import {
  DEV_CONFIG,
  shouldShowDevControls,
} from "../../shared/config/devConfig";

const FlightSearchForm: React.FC = () => {
  const {
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
  } = useFlightSearchForm();

  const [fromSearch, setFromSearch] = useState("");
  const [toSearch, setToSearch] = useState("");
  const [removingAirportCode, setRemovingAirportCode] = useState<string | null>(
    null
  );

  // Load saved selected airlines from localStorage
  const [selectedAirlines, setSelectedAirlines] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem("selectedAirlines");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // New states for validation and geolocation
  const [validationErrors, setValidationErrors] = useState<{
    from: boolean;
    to: boolean;
    departureDate: boolean;
  }>({
    from: false,
    to: false,
    departureDate: false,
  });

  const [isGettingLocation, setIsGettingLocation] = useState(false);

  // Save selected airlines to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("selectedAirlines", JSON.stringify(selectedAirlines));
  }, [selectedAirlines]);

  // Get user's location on component mount
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          // Auto-detect nearest airport
          autoDetectNearestAirport(
            position.coords.latitude,
            position.coords.longitude
          );
        },
        (error) => {
          if (DEV_CONFIG.ENABLE_CONSOLE_LOGS && shouldShowDevControls()) {
            console.log("Could not get user location:", error);
          }
        }
      );
    }
  }, []);

  // Transform airlines data for use in this component
  const vietnameseAirlines = airlines.map((airline) => ({
    id: airline.name.toLowerCase().replace(/\s+/g, "-"),
    name: airline.name,
    logo: airline.logo,
    code: airline.name.substring(0, 2).toUpperCase(),
  }));

  // Helper function để extract airport code từ string
  const getAirportCodeFromString = (locationString: string): string => {
    const match = locationString.match(/\(([^)]+)\)$/);
    return match ? match[1] : "";
  };

  // Get all selected airport codes
  const getAllSelectedAirportCodes = (): string[] => {
    const codes: string[] = [];

    // Add from and to codes
    const fromCode = getAirportCodeFromString(formData.from);
    const toCode = getAirportCodeFromString(formData.to);

    if (fromCode) codes.push(fromCode);
    if (toCode) codes.push(toCode);

    // Add multi-city codes if in multi-city mode
    if (formData.tripType === "multi-city" && formData.multiCitySegments) {
      formData.multiCitySegments.forEach((segment) => {
        const segmentFromCode = getAirportCodeFromString(segment.from);
        const segmentToCode = getAirportCodeFromString(segment.to);
        if (segmentFromCode) codes.push(segmentFromCode);
        if (segmentToCode) codes.push(segmentToCode);
      });
    }

    return codes;
  };

  // Lọc sân bay và loại bỏ sân bay đã chọn
  const filterAirports = (
    searchTerm: string,
    excludeCodes: string[] = []
  ): Airport[] => {
    const filteredAirports = airports.filter(
      (airport) => !excludeCodes.includes(airport.code)
    );

    if (!searchTerm) return filteredAirports.slice(0, 6);

    return filteredAirports
      .filter(
        (airport) =>
          airport.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
          airport.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          airport.code.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .slice(0, 6);
  };

  // Get popular destinations excluding selected airports
  const getPopularDestinations = (): Airport[] => {
    const selectedCodes = getAllSelectedAirportCodes();
    return airports
      .filter((airport) => !selectedCodes.includes(airport.code))
      .slice(0, 6);
  };

  // Calculate distance between two coordinates (Haversine formula)
  const calculateDistance = (
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number => {
    const R = 6371; // Earth's radius in kilometers
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  // Auto-detect nearest airport based on user location
  const autoDetectNearestAirport = (latitude: number, longitude: number) => {
    if (!formData.from) {
      // Only auto-fill if "from" is empty
      let nearestAirport: Airport | null = null;
      let minDistance = Infinity;

      airports.forEach((airport) => {
        // For Vietnamese airports, we'll use approximate coordinates
        // This is a simplified approach - in real app you'd have actual coordinates
        const airportCoords = getAirportCoordinates(airport.code);
        if (airportCoords) {
          const distance = calculateDistance(
            latitude,
            longitude,
            airportCoords.lat,
            airportCoords.lng
          );
          if (distance < minDistance) {
            minDistance = distance;
            nearestAirport = airport;
          }
        }
      });

      if (nearestAirport && minDistance < 200) {
        // Within 200km
        setFormData((prev) => ({
          ...prev,
          from: `${nearestAirport!.city} (${nearestAirport!.code})`,
        }));
      }
    }
  };

  // Get approximate coordinates for major Vietnamese airports
  const getAirportCoordinates = (
    code: string
  ): { lat: number; lng: number } | null => {
    const coords: { [key: string]: { lat: number; lng: number } } = {
      SGN: { lat: 10.8231, lng: 106.6297 }, // Ho Chi Minh City
      HAN: { lat: 21.2187, lng: 105.804 }, // Hanoi
      DAD: { lat: 16.0439, lng: 108.1995 }, // Da Nang
      CXR: { lat: 12.0045, lng: 109.2193 }, // Nha Trang
      PQC: { lat: 10.227, lng: 103.9673 }, // Phu Quoc
      VCA: { lat: 10.0851, lng: 105.7117 }, // Can Tho
      HPH: { lat: 20.8194, lng: 106.7256 }, // Hai Phong
      HUI: { lat: 16.4015, lng: 107.703 }, // Hue
    };
    return coords[code] || null;
  };

  // Validation function
  const validateForm = (): boolean => {
    const errors = {
      from: !formData.from || formData.from.trim() === "",
      to: !formData.to || formData.to.trim() === "",
      departureDate: !formData.departureDate,
    };

    setValidationErrors(errors);
    return !errors.from && !errors.to && !errors.departureDate;
  };

  // Enhanced handleSearch with validation
  const handleSearchWithValidation = () => {
    if (validateForm()) {
      handleSearch();
    }
  };

  // Get user location manually
  const getUserLocation = () => {
    setIsGettingLocation(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          autoDetectNearestAirport(
            position.coords.latitude,
            position.coords.longitude
          );
          setIsGettingLocation(false);
        },
        (error) => {
          if (DEV_CONFIG.ENABLE_CONSOLE_LOGS && shouldShowDevControls()) {
            console.log("Could not get user location:", error);
          }
          setIsGettingLocation(false);
        }
      );
    } else {
      setIsGettingLocation(false);
    }
  };

  const selectAirport = (airport: Airport, type: "from" | "to") => {
    // Add animation effect
    setRemovingAirportCode(airport.code);

    setTimeout(() => {
      if (type === "from") {
        setFormData((prev) => ({
          ...prev,
          from: `${airport.city} (${airport.code})`,
        }));
        setFromSearch("");
        setShowFromDropdown(false);
      } else {
        setFormData((prev) => ({
          ...prev,
          to: `${airport.city} (${airport.code})`,
        }));
        setToSearch("");
        setShowToDropdown(false);
      }
      setRemovingAirportCode(null);
    }, 300);
  };

  const selectPopularDestination = (airport: Airport) => {
    setRemovingAirportCode(airport.code);

    setTimeout(() => {
      setFormData((prev) => ({
        ...prev,
        to: `${airport.city} (${airport.code})`,
      }));
      setRemovingAirportCode(null);
    }, 300);
  };

  const handleAirlineToggle = (airlineId: string) => {
    setSelectedAirlines((prev) =>
      prev.includes(airlineId)
        ? prev.filter((id) => id !== airlineId)
        : [...prev, airlineId]
    );
  };

  const addMultiCitySegment = () => {
    if (formData.multiCitySegments && formData.multiCitySegments.length < 3) {
      setFormData((prev) => ({
        ...prev,
        multiCitySegments: [
          ...(prev.multiCitySegments || []),
          { from: "", to: "", departureDate: undefined },
        ],
      }));
    }
  };

  const removeMultiCitySegment = (index: number) => {
    if (formData.multiCitySegments && formData.multiCitySegments.length > 2) {
      setFormData((prev) => ({
        ...prev,
        multiCitySegments: prev.multiCitySegments?.filter(
          (_, i) => i !== index
        ),
      }));
    }
  };

  const updateMultiCitySegment = (
    index: number,
    field: "from" | "to" | "departureDate",
    value: string | Date | undefined
  ) => {
    setFormData((prev) => ({
      ...prev,
      multiCitySegments: prev.multiCitySegments?.map((segment, i) =>
        i === index ? { ...segment, [field]: value } : segment
      ),
    }));
  };

  return (
    <Card className="w-full max-w-7xl mx-auto shadow-lg border-0 bg-white rounded-2xl overflow-hidden">
      <CardContent className="p-0">
        {/* Header với trip type selector - Compact Design for Search */}
        <div className="bg-white border-b border-gray-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-2.5 rounded-xl">
                <Plane className="h-5 w-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  Tìm kiếm chuyến bay
                </h2>
                <p className="text-xs text-gray-500">
                  Khám phá những chuyến bay tốt nhất
                </p>
              </div>
            </div>

            {/* Trip Type Selector - Compact Design */}
            <div className="flex items-center bg-gray-100 rounded-full p-1">
              <div className="flex items-center space-x-1">
                <label
                  className={`px-3 py-1.5 rounded-full cursor-pointer transition-all duration-200 text-sm ${
                    formData.tripType === "one-way"
                      ? "bg-white shadow-sm text-blue-600 font-medium"
                      : "text-gray-600 hover:text-gray-900"
                  }`}>
                  <input
                    type="radio"
                    name="trip-type"
                    value="one-way"
                    checked={formData.tripType === "one-way"}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        tripType: e.target.value,
                      }))
                    }
                    className="sr-only"
                  />
                  Một chiều
                </label>
                <label
                  className={`px-3 py-1.5 rounded-full cursor-pointer transition-all duration-200 text-sm ${
                    formData.tripType === "round-trip"
                      ? "bg-white shadow-sm text-blue-600 font-medium"
                      : "text-gray-600 hover:text-gray-900"
                  }`}>
                  <input
                    type="radio"
                    name="trip-type"
                    value="round-trip"
                    checked={formData.tripType === "round-trip"}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        tripType: e.target.value,
                      }))
                    }
                    className="sr-only"
                  />
                  Khứ hồi
                </label>
                <label
                  className={`px-3 py-1.5 rounded-full cursor-pointer transition-all duration-200 text-sm ${
                    formData.tripType === "multi-city"
                      ? "bg-white shadow-sm text-blue-600 font-medium"
                      : "text-gray-600 hover:text-gray-900"
                  }`}>
                  <input
                    type="radio"
                    name="trip-type"
                    value="multi-city"
                    checked={formData.tripType === "multi-city"}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        tripType: e.target.value,
                        multiCitySegments: prev.multiCitySegments || [
                          { from: "", to: "", departureDate: undefined },
                          { from: "", to: "", departureDate: undefined },
                        ],
                      }))
                    }
                    className="sr-only"
                  />
                  Nhiều chặng
                </label>
              </div>
            </div>
          </div>

          {/* Full month search toggle - Compact */}
          <div className="flex items-center space-x-3 mb-4">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="full-month"
                checked={formData.searchFullMonth}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    searchFullMonth: e.target.checked,
                  }))
                }
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <Label
                htmlFor="full-month"
                className="ml-2 text-xs text-gray-700 font-medium">
                Tìm kiếm cả tháng để có giá tốt nhất
              </Label>
            </div>
          </div>

          {/* Airlines Selection Section - Optimized for Search Page */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-semibold text-gray-900">
                Chọn hãng hàng không
              </h3>
              <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                Tùy chọn
              </span>
            </div>

            <div className="bg-gray-50 rounded-2xl p-4">
              <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
                {/* Select All Option */}
                <label
                  className={`group cursor-pointer block transition-all duration-200 ${
                    selectedAirlines.length === 0
                      ? "transform scale-105"
                      : "hover:transform hover:scale-105"
                  }`}>
                  <input
                    type="checkbox"
                    checked={selectedAirlines.length === 0}
                    onChange={() => setSelectedAirlines([])}
                    className="sr-only"
                  />
                  <div
                    className={`relative border-2 rounded-xl p-4 text-center transition-all duration-200 ${
                      selectedAirlines.length === 0
                        ? "border-blue-500 bg-blue-50 shadow-lg"
                        : "border-gray-200 bg-white hover:border-gray-300 hover:shadow-md"
                    }`}>
                    <div className="flex flex-col items-center justify-center">
                      <div
                        className={`w-16 h-16 rounded-xl flex items-center justify-center ${
                          selectedAirlines.length === 0
                            ? "bg-blue-100"
                            : "bg-gray-100 group-hover:bg-gray-200"
                        }`}>
                        <span className="text-2xl">✈️</span>
                      </div>
                      <span
                        className={`text-xs font-medium mt-2 ${
                          selectedAirlines.length === 0
                            ? "text-blue-700"
                            : "text-gray-700"
                        }`}>
                        Tất cả
                      </span>
                    </div>
                    {selectedAirlines.length === 0 && (
                      <div className="absolute top-2 right-2 w-3 h-3 bg-blue-500 rounded-full"></div>
                    )}
                  </div>
                </label>

                {/* Individual Airlines */}
                {vietnameseAirlines.map((airline) => (
                  <label
                    key={airline.id}
                    className={`group cursor-pointer block transition-all duration-200 ${
                      selectedAirlines.includes(airline.id)
                        ? "transform scale-105"
                        : "hover:transform hover:scale-105"
                    }`}>
                    <input
                      type="checkbox"
                      checked={selectedAirlines.includes(airline.id)}
                      onChange={() => handleAirlineToggle(airline.id)}
                      className="sr-only"
                    />
                    <div
                      className={`relative border-2 rounded-xl p-4 text-center transition-all duration-200 ${
                        selectedAirlines.includes(airline.id)
                          ? "border-blue-500 bg-blue-50 shadow-lg"
                          : "border-gray-200 bg-white hover:border-gray-300 hover:shadow-md"
                      }`}>
                      <div className="flex items-center justify-center">
                        <div
                          className={`w-16 h-16 rounded-xl flex items-center justify-center overflow-hidden ${
                            selectedAirlines.includes(airline.id)
                              ? "bg-white ring-2 ring-blue-200"
                              : "bg-gray-50 group-hover:bg-gray-100"
                          }`}>
                          <img
                            src={airline.logo}
                            alt={airline.name}
                            className="w-12 h-12 object-contain filter transition-all duration-200 group-hover:scale-110"
                            loading="lazy"
                          />
                        </div>
                      </div>
                      {selectedAirlines.includes(airline.id) && (
                        <div className="absolute top-2 right-2 w-3 h-3 bg-blue-500 rounded-full"></div>
                      )}
                    </div>
                  </label>
                ))}
              </div>

              {/* Selected Airlines Summary - Redesigned */}
              {selectedAirlines.length > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium text-gray-700">
                      Đã chọn {selectedAirlines.length} hãng hàng không
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedAirlines([])}
                      className="text-xs h-7 px-3 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg">
                      Xóa tất cả
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {selectedAirlines.map((airlineId) => {
                      const airline = vietnameseAirlines.find(
                        (a) => a.id === airlineId
                      );
                      return airline ? (
                        <div
                          key={airlineId}
                          className="flex items-center gap-2 bg-blue-100 text-blue-700 border border-blue-200 hover:bg-blue-200 transition-colors rounded-lg px-3 py-2">
                          <img
                            src={airline.logo}
                            alt={airline.name}
                            className="w-5 h-5 object-contain"
                          />
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleAirlineToggle(airlineId);
                            }}
                            className="text-blue-500 hover:text-blue-700 hover:bg-blue-200 rounded-full w-5 h-5 flex items-center justify-center text-sm font-medium">
                            ×
                          </button>
                        </div>
                      ) : null;
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Main search form - Compact Layout */}
        <div className="p-6">
          {/* First row - Location inputs */}
          <div className="grid grid-cols-1 md:grid-cols-7 gap-4 mb-6">
            {/* From Location */}
            <div className="md:col-span-3 space-y-2">
              <div className="flex items-center justify-between">
                <Label
                  htmlFor="from"
                  className={`text-sm font-semibold flex items-center ${
                    validationErrors.from ? "text-red-600" : "text-gray-700"
                  }`}>
                  <MapPin
                    className={`h-4 w-4 mr-1 ${
                      validationErrors.from ? "text-red-600" : "text-blue-600"
                    }`}
                  />
                  Từ
                  {validationErrors.from && (
                    <span className="text-red-500 ml-1">*</span>
                  )}
                </Label>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={getUserLocation}
                  disabled={isGettingLocation}
                  className="h-6 px-2 text-xs text-blue-600 hover:text-blue-700 hover:bg-blue-50">
                  {isGettingLocation ? (
                    <>
                      <div className="animate-spin rounded-full h-3 w-3 border-b border-blue-600 mr-1"></div>
                      Đang tìm...
                    </>
                  ) : (
                    <>
                      <Navigation className="h-3 w-3 mr-1" />
                      Vị trí của tôi
                    </>
                  )}
                </Button>
              </div>
              <Popover
                open={showFromDropdown}
                onOpenChange={setShowFromDropdown}>
                <PopoverTrigger asChild>
                  <div className="relative">
                    <Input
                      id="from"
                      value={formData.from || fromSearch}
                      onChange={(e) => {
                        setFromSearch(e.target.value);
                        setFormData((prev) => ({
                          ...prev,
                          from: e.target.value,
                        }));
                        setShowFromDropdown(true);
                        // Clear validation error when user starts typing
                        if (validationErrors.from) {
                          setValidationErrors((prev) => ({
                            ...prev,
                            from: false,
                          }));
                        }
                      }}
                      placeholder="Thành phố hoặc Sân bay"
                      className={`h-12 text-base pl-4 pr-10 border-2 ${
                        validationErrors.from
                          ? "border-red-500 focus:border-red-500 focus:ring-red-200"
                          : "border-gray-200 focus:border-blue-500 focus:ring-blue-200"
                      } focus:ring-2 rounded-lg bg-gray-50/50`}
                    />
                    <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  </div>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0" align="start">
                  <div className="max-h-60 overflow-y-auto">
                    {filterAirports(fromSearch, [
                      getAirportCodeFromString(formData.to),
                    ]).map((airport) => (
                      <div
                        key={airport.code}
                        onClick={() => selectAirport(airport, "from")}
                        className="flex items-center justify-between p-3 hover:bg-gray-100 cursor-pointer border-b last:border-b-0">
                        <div className="flex items-center space-x-3">
                          <div className="bg-blue-100 text-blue-600 px-2 py-1 rounded text-sm font-bold">
                            {airport.code}
                          </div>
                          <div>
                            <div className="font-medium">{airport.city}</div>
                            <div className="text-sm text-gray-500">
                              {airport.name}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </PopoverContent>
              </Popover>
            </div>

            {/* Swap Button - Compact */}
            <div className="md:col-span-1 flex justify-center items-end pb-2">
              <Button
                onClick={swapLocations}
                variant="outline"
                size="sm"
                className="h-10 w-10 rounded-full border-2 border-blue-200 hover:border-blue-400 hover:bg-blue-50 bg-white shadow-sm transition-all duration-200">
                <ArrowRightLeft className="h-4 w-4 text-blue-600" />
              </Button>
            </div>

            {/* To Location */}
            <div className="md:col-span-3 space-y-2">
              <Label
                htmlFor="to"
                className={`text-sm font-semibold flex items-center ${
                  validationErrors.to ? "text-red-600" : "text-gray-700"
                }`}>
                <MapPin
                  className={`h-4 w-4 mr-1 ${
                    validationErrors.to ? "text-red-600" : "text-blue-600"
                  }`}
                />
                Đến
                {validationErrors.to && (
                  <span className="text-red-500 ml-1">*</span>
                )}
              </Label>
              <Popover open={showToDropdown} onOpenChange={setShowToDropdown}>
                <PopoverTrigger asChild>
                  <div className="relative">
                    <Input
                      id="to"
                      value={formData.to || toSearch}
                      onChange={(e) => {
                        setToSearch(e.target.value);
                        setFormData((prev) => ({
                          ...prev,
                          to: e.target.value,
                        }));
                        setShowToDropdown(true);
                        // Clear validation error when user starts typing
                        if (validationErrors.to) {
                          setValidationErrors((prev) => ({
                            ...prev,
                            to: false,
                          }));
                        }
                      }}
                      placeholder="Thành phố hoặc Sân bay"
                      className={`h-12 text-base pl-4 pr-10 border-2 ${
                        validationErrors.to
                          ? "border-red-500 focus:border-red-500 focus:ring-red-200"
                          : "border-gray-200 focus:border-blue-500 focus:ring-blue-200"
                      } focus:ring-2 rounded-lg bg-gray-50/50`}
                    />
                    <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  </div>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0" align="start">
                  <div className="max-h-60 overflow-y-auto">
                    {filterAirports(toSearch, [
                      getAirportCodeFromString(formData.from),
                    ]).map((airport) => (
                      <div
                        key={airport.code}
                        onClick={() => selectAirport(airport, "to")}
                        className="flex items-center justify-between p-3 hover:bg-gray-100 cursor-pointer border-b last:border-b-0">
                        <div className="flex items-center space-x-3">
                          <div className="bg-blue-100 text-blue-600 px-2 py-1 rounded text-sm font-bold">
                            {airport.code}
                          </div>
                          <div>
                            <div className="font-medium">{airport.city}</div>
                            <div className="text-sm text-gray-500">
                              {airport.name}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* Second row - Dates, Passengers, Search */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
            {/* Departure Date */}
            <div className="md:col-span-3 space-y-2">
              <Label
                className={`text-sm font-semibold flex items-center ${
                  validationErrors.departureDate
                    ? "text-red-600"
                    : "text-gray-700"
                }`}>
                <CalendarIcon
                  className={`h-4 w-4 mr-1 ${
                    validationErrors.departureDate
                      ? "text-red-600"
                      : "text-blue-600"
                  }`}
                />
                Khởi hành
                {validationErrors.departureDate && (
                  <span className="text-red-500 ml-1">*</span>
                )}
              </Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={`w-full h-12 justify-start text-left font-normal border-2 ${
                      validationErrors.departureDate
                        ? "border-red-500 hover:border-red-500"
                        : "border-gray-200 hover:border-blue-400"
                    } bg-gray-50/50 rounded-lg`}>
                    <CalendarIcon
                      className={`mr-3 h-4 w-4 ${
                        validationErrors.departureDate
                          ? "text-red-600"
                          : "text-blue-600"
                      }`}
                    />
                    <span className="text-base">
                      {formData.departureDate
                        ? format(formData.departureDate, "dd/MM/yyyy")
                        : "Chọn ngày"}
                    </span>
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={formData.departureDate}
                    onSelect={(date) => {
                      setFormData((prev) => ({ ...prev, departureDate: date }));
                      // Clear validation error when user selects a date
                      if (validationErrors.departureDate) {
                        setValidationErrors((prev) => ({
                          ...prev,
                          departureDate: false,
                        }));
                      }
                    }}
                    disabled={(date) => {
                      // Allow past dates in development mode when HIDE_DEV_CONTROLS is false
                      if (!DEV_CONFIG.HIDE_DEV_CONTROLS) {
                        return false; // Allow all dates in dev mode
                      }
                      const today = new Date(new Date().setHours(0, 0, 0, 0));
                      return date < today;
                    }}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Return Date */}
            {formData.tripType === "round-trip" && (
              <div className="md:col-span-3 space-y-2">
                <Label className="text-sm font-semibold text-gray-700 flex items-center">
                  <CalendarIcon className="h-4 w-4 mr-1 text-blue-600" />
                  Về
                </Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full h-14 justify-start text-left font-normal border-2 border-gray-200 hover:border-blue-400 bg-gray-50/50 rounded-xl">
                      <CalendarIcon className="mr-3 h-5 w-5 text-blue-600" />
                      <span className="text-lg">
                        {formData.returnDate
                          ? format(formData.returnDate, "dd/MM/yyyy")
                          : "Chọn ngày"}
                      </span>
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={formData.returnDate}
                      onSelect={(date) =>
                        setFormData((prev) => ({ ...prev, returnDate: date }))
                      }
                      disabled={(date) => {
                        // Allow past dates in development mode when HIDE_DEV_CONTROLS is false
                        if (!DEV_CONFIG.HIDE_DEV_CONTROLS) {
                          // In dev mode, only check if return date is after departure date
                          if (
                            formData.departureDate &&
                            date <= formData.departureDate
                          )
                            return true;
                          return false;
                        }
                        const today = new Date(new Date().setHours(0, 0, 0, 0));
                        const departureDate = formData.departureDate;
                        if (date < today) return true;
                        if (departureDate && date <= departureDate) return true;
                        return false;
                      }}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            )}

            {/* Passengers & Class */}
            <div
              className={`${
                formData.tripType === "round-trip"
                  ? "md:col-span-4"
                  : "md:col-span-7"
              } space-y-2`}>
              <Label className="text-sm font-semibold text-gray-700 flex items-center">
                <Users className="h-4 w-4 mr-1 text-blue-600" />
                Hành khách & Hạng
              </Label>
              <Popover
                open={showPassengerDropdown}
                onOpenChange={setShowPassengerDropdown}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full h-14 justify-between text-left font-normal border-2 border-gray-200 hover:border-blue-400 bg-gray-50/50 rounded-xl px-4">
                    <div className="flex flex-col items-start overflow-hidden">
                      <span className="text-base font-medium text-gray-900 truncate">
                        {getPassengerText()}
                      </span>
                      <span className="text-sm text-gray-500 truncate">
                        {getClassText()}
                      </span>
                    </div>
                    <ChevronDown className="h-4 w-4 text-gray-400 flex-shrink-0 ml-2" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-96 p-0" align="start">
                  <div className="p-6 space-y-6">
                    {/* Passenger counts */}
                    <div className="space-y-4">
                      <h4 className="font-semibold text-gray-900 border-b pb-2">
                        Số lượng hành khách
                      </h4>

                      {/* Adults */}
                      <div className="flex items-center justify-between py-2">
                        <div className="flex items-center space-x-3">
                          <div className="bg-blue-100 p-2 rounded-full">
                            <User className="h-4 w-4 text-blue-600" />
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">
                              Người lớn
                            </div>
                            <div className="text-sm text-gray-500">
                              Từ 12 tuổi trở lên
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              updatePassengerCount("adults", false)
                            }
                            disabled={formData.passengers.adults <= 1}
                            className="h-8 w-8 rounded-full p-0">
                            <Minus className="h-4 w-4" />
                          </Button>
                          <span className="w-8 text-center font-medium text-lg">
                            {formData.passengers.adults}
                          </span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updatePassengerCount("adults", true)}
                            className="h-8 w-8 rounded-full p-0">
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      {/* Children */}
                      <div className="flex items-center justify-between py-2">
                        <div className="flex items-center space-x-3">
                          <div className="bg-green-100 p-2 rounded-full">
                            <UserCheck className="h-4 w-4 text-green-600" />
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">
                              Trẻ em
                            </div>
                            <div className="text-sm text-gray-500">
                              Từ 2-12 tuổi
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              updatePassengerCount("children", false)
                            }
                            disabled={formData.passengers.children <= 0}
                            className="h-8 w-8 rounded-full p-0">
                            <Minus className="h-4 w-4" />
                          </Button>
                          <span className="w-8 text-center font-medium text-lg">
                            {formData.passengers.children}
                          </span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              updatePassengerCount("children", true)
                            }
                            className="h-8 w-8 rounded-full p-0">
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      {/* Infants */}
                      <div className="flex items-center justify-between py-2">
                        <div className="flex items-center space-x-3">
                          <div className="bg-pink-100 p-2 rounded-full">
                            <Baby className="h-4 w-4 text-pink-600" />
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">
                              Em bé
                            </div>
                            <div className="text-sm text-gray-500">
                              Dưới 2 tuổi
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              updatePassengerCount("infants", false)
                            }
                            disabled={formData.passengers.infants <= 0}
                            className="h-8 w-8 rounded-full p-0">
                            <Minus className="h-4 w-4" />
                          </Button>
                          <span className="w-8 text-center font-medium text-lg">
                            {formData.passengers.infants}
                          </span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              updatePassengerCount("infants", true)
                            }
                            className="h-8 w-8 rounded-full p-0">
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>

                    {/* Flight Class */}
                    <div className="space-y-3">
                      <h4 className="font-semibold text-gray-900 border-b pb-2">
                        Hạng vé
                      </h4>
                      <Select
                        value={formData.flightClass}
                        onValueChange={(value) =>
                          setFormData((prev) => ({
                            ...prev,
                            flightClass: value,
                          }))
                        }>
                        <SelectTrigger className="w-full h-12">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {flightClasses.map((flightClass) => (
                            <SelectItem
                              key={flightClass.value}
                              value={flightClass.value}>
                              <div className="flex flex-col">
                                <span className="font-medium">
                                  {flightClass.label}
                                </span>
                                {flightClass.description && (
                                  <span className="text-xs text-gray-500">
                                    {flightClass.description}
                                  </span>
                                )}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Special Requirements */}
                    <div className="space-y-3">
                      <h4 className="font-semibold text-gray-900 border-b pb-2">
                        Yêu cầu đặc biệt
                      </h4>
                      <Select
                        value={formData.specialRequirements}
                        onValueChange={(value) =>
                          setFormData((prev) => ({
                            ...prev,
                            specialRequirements: value,
                          }))
                        }>
                        <SelectTrigger className="w-full h-12">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {specialRequirements.map((requirement) => (
                            <SelectItem
                              key={requirement.value}
                              value={requirement.value}>
                              <div className="flex flex-col">
                                <span className="font-medium">
                                  {requirement.label}
                                </span>
                                {requirement.description && (
                                  <span className="text-xs text-gray-500">
                                    {requirement.description}
                                  </span>
                                )}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="pt-4 border-t">
                      <Button
                        onClick={() => setShowPassengerDropdown(false)}
                        className="w-full bg-blue-600 hover:bg-blue-700 h-12">
                        Xác nhận
                      </Button>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
            </div>

            {/* Search Button */}
            <div className="md:col-span-2">
              <Button
                onClick={handleSearchWithValidation}
                disabled={isLoading}
                className="w-full h-12 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-bold text-base shadow-lg hover:shadow-xl transition-all duration-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed">
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Đang tìm kiếm...
                  </>
                ) : (
                  <>
                    <Search className="h-5 w-5 mr-2" />
                    Tìm kiếm
                  </>
                )}
              </Button>

              {/* Validation Error Message */}
              {(validationErrors.from ||
                validationErrors.to ||
                validationErrors.departureDate) && (
                <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-start space-x-2">
                    <AlertCircle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-red-700 text-sm font-medium mb-1">
                        Vui lòng điền đầy đủ thông tin:
                      </p>
                      <ul className="text-red-600 text-xs space-y-1">
                        {validationErrors.from && (
                          <li>• Chọn điểm khởi hành</li>
                        )}
                        {validationErrors.to && <li>• Chọn điểm đến</li>}
                        {validationErrors.departureDate && (
                          <li>• Chọn ngày khởi hành</li>
                        )}
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {/* API Error Message */}
              {searchError && (
                <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-start space-x-2">
                    <AlertCircle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                    <p className="text-red-700 text-sm font-medium">
                      Lỗi tìm kiếm: {searchError}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Multi-city segments */}
          {formData.tripType === "multi-city" && formData.multiCitySegments && (
            <div className="space-y-4 mt-6 p-4 bg-gray-50 rounded-xl">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">
                  Chuyến bay nhiều chặng
                </h3>
                <Button
                  onClick={addMultiCitySegment}
                  disabled={formData.multiCitySegments.length >= 3}
                  variant="outline"
                  size="sm"
                  className="text-blue-600 border-blue-300 hover:bg-blue-50">
                  <Plus className="h-4 w-4 mr-1" />
                  Thêm chặng
                </Button>
              </div>

              {formData.multiCitySegments.map((segment, index) => (
                <div
                  key={index}
                  className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-white rounded-lg border border-gray-200">
                  <div className="flex items-center space-x-2 md:col-span-4 mb-2">
                    <span className="text-sm font-medium text-gray-600">
                      Chặng {index + 1}
                    </span>
                    {formData.multiCitySegments &&
                      formData.multiCitySegments.length > 2 && (
                        <Button
                          onClick={() => removeMultiCitySegment(index)}
                          variant="ghost"
                          size="sm"
                          className="text-red-500 hover:text-red-700 hover:bg-red-50 ml-auto">
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                  </div>

                  {/* From */}
                  <div>
                    <Label className="text-sm font-medium text-gray-700">
                      Từ
                    </Label>
                    <Input
                      type="text"
                      value={segment.from}
                      onChange={(e) =>
                        updateMultiCitySegment(index, "from", e.target.value)
                      }
                      placeholder="Chọn điểm khởi hành"
                      className="mt-1"
                    />
                  </div>

                  {/* To */}
                  <div>
                    <Label className="text-sm font-medium text-gray-700">
                      Đến
                    </Label>
                    <Input
                      type="text"
                      value={segment.to}
                      onChange={(e) =>
                        updateMultiCitySegment(index, "to", e.target.value)
                      }
                      placeholder="Chọn điểm đến"
                      className="mt-1"
                    />
                  </div>

                  {/* Departure Date */}
                  <div>
                    <Label className="text-sm font-medium text-gray-700">
                      Ngày khởi hành
                    </Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full mt-1 justify-start text-left font-normal">
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {segment.departureDate
                            ? format(segment.departureDate, "dd/MM/yyyy")
                            : "Chọn ngày"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={segment.departureDate}
                          onSelect={(date) =>
                            updateMultiCitySegment(index, "departureDate", date)
                          }
                          disabled={(date) => {
                            const today = new Date(
                              new Date().setHours(0, 0, 0, 0)
                            );
                            return date < today;
                          }}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Month search option */}
          {formData.searchFullMonth && (
            <div className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-200">
              <div className="flex items-center space-x-3">
                <CalendarMonth className="h-5 w-5 text-blue-600" />
                <div>
                  <div className="font-medium text-blue-900">
                    Tìm kiếm cả tháng
                  </div>
                  <div className="text-sm text-blue-700">
                    Chúng tôi sẽ hiển thị giá vé cho toàn bộ tháng để bạn chọn
                    ngày có giá tốt nhất
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Popular Destinations - Simplified */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-sm font-medium text-gray-700 mb-4 flex items-center">
              <MapPin className="h-4 w-4 mr-2 text-blue-600" />
              Điểm đến phổ biến:
            </p>
            <div className="flex flex-wrap gap-3">
              {getPopularDestinations().map((airport) => (
                <Button
                  key={airport.code}
                  variant="outline"
                  size="sm"
                  onClick={() => selectPopularDestination(airport)}
                  className={`text-sm border-gray-300 hover:border-blue-400 hover:bg-blue-50 hover:text-blue-700 bg-white rounded-lg px-4 py-2 transition-all duration-300 ${
                    removingAirportCode === airport.code
                      ? "opacity-0 scale-75 transform"
                      : "opacity-100 scale-100"
                  }`}>
                  <Badge variant="secondary" className="mr-2 text-xs">
                    {airport.code}
                  </Badge>
                  {airport.city}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default FlightSearchForm;
