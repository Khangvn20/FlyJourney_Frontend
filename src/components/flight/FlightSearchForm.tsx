import { useState, useEffect } from "react";
import { format } from "date-fns";
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
  Route,
} from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Card, CardContent } from "../ui/card";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Calendar } from "../ui/calendar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import {
  airports,
  flightClasses,
  specialRequirements,
} from "../../mocks/flightData";
import { airlines } from "../../mocks";
import type { Airport } from "../../shared/types";
import { useFlightSearchForm } from "../../hooks/useFlightSearchForm";
import { DEV_CONFIG } from "../../shared/config/devConfig";

export default function FlightSearchForm() {
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
    clearStoredResults,
    isLoading,
    searchError,
    setSearchError,
  } = useFlightSearchForm();

  const [fromSearch, setFromSearch] = useState("");
  const [toSearch, setToSearch] = useState("");
  // removed removingAirportCode (animation not essential in restored version)

  const [selectedAirlines, setSelectedAirlines] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem("selectedAirlines");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [validationErrors, setValidationErrors] = useState({
    from: false,
    to: false,
    departureDate: false,
  });

  useEffect(() => {
    localStorage.setItem("selectedAirlines", JSON.stringify(selectedAirlines));
  }, [selectedAirlines]);

  // Coerce legacy multi-city
  useEffect(() => {
    if (formData.tripType === "multi-city") {
      setFormData((p) => ({ ...p, tripType: "one-way" }));
      sessionStorage.setItem("tripType", "one-way");
      window.dispatchEvent(new CustomEvent("sessionStorageUpdated"));
    }
  }, [formData.tripType, setFormData]);

  const vietnameseAirlines = airlines.map((a) => ({
    id: a.name.toLowerCase().replace(/\s+/g, "-"),
    name: a.name,
    logo: a.logo,
    code: a.name.substring(0, 2).toUpperCase(),
  }));

  // Top 10 Vietnamese airports cho quick selection
  const vietnameseAirports = [
    { city: "TP. Hồ Chí Minh", code: "SGN", fullName: "TP. Hồ Chí Minh (SGN)" },
    { city: "Hà Nội", code: "HAN", fullName: "Hà Nội (HAN)" },
    { city: "Đà Nẵng", code: "DAD", fullName: "Đà Nẵng (DAD)" },
    { city: "Nha Trang", code: "CXR", fullName: "Nha Trang (CXR)" },
    { city: "Phú Quốc", code: "PQC", fullName: "Phú Quốc (PQC)" },
    { city: "Đà Lạt", code: "DLI", fullName: "Đà Lạt (DLI)" },
    { city: "Huế", code: "HUI", fullName: "Huế (HUI)" },
    { city: "Cần Thơ", code: "VCA", fullName: "Cần Thơ (VCA)" },
    { city: "Quy Nhon", code: "UIH", fullName: "Quy Nhon (UIH)" },
    { city: "Pleiku", code: "PXU", fullName: "Pleiku (PXU)" },
  ];

  const selectQuickDestination = (
    destination: { fullName: string; code: string },
    type: "from" | "to"
  ) => {
    if (type === "from") {
      setFormData((p) => ({
        ...p,
        from: destination.fullName,
      }));
      setFromSearch("");
      setShowFromDropdown(false);
    } else {
      setFormData((p) => ({
        ...p,
        to: destination.fullName,
      }));
      setToSearch("");
      setShowToDropdown(false);
    }
    // Clear validation errors
    setValidationErrors((p) => ({ ...p, [type]: false }));
  };

  const getAirportCodeFromString = (s: string) => {
    const m = s.match(/\(([^)]+)\)$/);
    return m ? m[1] : "";
  };
  const filterAirports = (
    term: string,
    excludeCodes: string[] = []
  ): Airport[] => {
    // Get Vietnamese airports first, then others
    const vietnameseAirports = airports.filter(
      (a) => a.country === "Vietnam" && !excludeCodes.includes(a.code)
    );
    const otherAirports = airports.filter(
      (a) => a.country !== "Vietnam" && !excludeCodes.includes(a.code)
    );

    if (!term) {
      // Show top 10 Vietnamese airports when no search term
      return vietnameseAirports.slice(0, 10);
    }

    // Filter Vietnamese airports first, then others
    const filteredVietnamese = vietnameseAirports.filter((a) =>
      [a.city, a.name, a.code].some((v) =>
        v.toLowerCase().includes(term.toLowerCase())
      )
    );

    const filteredOthers = otherAirports.filter((a) =>
      [a.city, a.name, a.code].some((v) =>
        v.toLowerCase().includes(term.toLowerCase())
      )
    );

    // Return Vietnamese results first, then others, limit to 10
    return [...filteredVietnamese, ...filteredOthers].slice(0, 10);
  };

  const selectAirport = (airport: Airport, type: "from" | "to") => {
    if (type === "from") {
      setFormData((p) => ({ ...p, from: `${airport.city} (${airport.code})` }));
      setFromSearch("");
      setShowFromDropdown(false);
    } else {
      setFormData((p) => ({ ...p, to: `${airport.city} (${airport.code})` }));
      setToSearch("");
      setShowToDropdown(false);
    }
  };

  const handleAirlineToggle = (id: string) =>
    setSelectedAirlines((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );

  const validateForm = () => {
    const errs = {
      from: !formData.from || !formData.from.trim(),
      to: !formData.to || !formData.to.trim(),
      departureDate: !formData.departureDate,
    };
    setValidationErrors(errs);
    return !errs.from && !errs.to && !errs.departureDate;
  };
  const handleSearchWithValidation = () => {
    if (validateForm()) handleSearch();
  };

  const setTripType = (newType: "one-way" | "round-trip") => {
    // Clear any existing search errors when changing trip type
    setSearchError(null);
    clearStoredResults();
    setFormData((p) => ({
      ...p,
      tripType: newType,
      searchFullMonth: newType === "round-trip" ? false : p.searchFullMonth,
    }));
    sessionStorage.setItem("tripType", newType);
    window.dispatchEvent(new CustomEvent("sessionStorageUpdated"));
  };

  return (
    <Card className="w-full max-w-7xl mx-auto shadow-lg border-0 bg-white rounded-2xl overflow-hidden">
      <CardContent className="p-0">
        {/* Header */}
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
            <div className="flex items-center bg-gray-100 rounded-full p-1">
              {(["one-way", "round-trip"] as const).map((t) => (
                <label
                  key={t}
                  className={`px-3 py-1.5 rounded-full cursor-pointer transition-all duration-200 text-sm ${
                    formData.tripType === t
                      ? "bg-white shadow-sm text-blue-600 font-medium"
                      : "text-gray-600 hover:text-gray-900"
                  }`}>
                  <input
                    type="radio"
                    name="trip-type"
                    value={t}
                    className="sr-only"
                    checked={formData.tripType === t}
                    onChange={() => setTripType(t)}
                  />
                  {t === "one-way" ? "Một chiều" : "Khứ hồi"}
                </label>
              ))}
            </div>
          </div>
          {/* Full month toggle only one-way */}
          {formData.tripType === "one-way" && (
            <div className="flex items-center space-x-3 mb-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="full-month"
                  checked={formData.searchFullMonth}
                  onChange={(e) =>
                    setFormData((p) => ({
                      ...p,
                      searchFullMonth: e.target.checked,
                    }))
                  }
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <Label
                  htmlFor="full-month"
                  className="ml-2 text-xs text-gray-700 font-medium flex items-center gap-2">
                  Tìm kiếm cả tháng để có giá tốt nhất
                  {formData.searchFullMonth && formData.departureDate && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-semibold bg-blue-100 text-blue-700 border border-blue-300">
                      Tháng {format(formData.departureDate, "MM/yyyy")}
                    </span>
                  )}
                </Label>
              </div>
            </div>
          )}
          {/* Airlines grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
            {vietnameseAirlines.map((al) => {
              const active = selectedAirlines.includes(al.id);
              return (
                <label
                  key={al.id}
                  className={`group relative cursor-pointer flex items-center justify-center rounded-xl transition-all duration-200 h-24 w-full shadow-sm border overflow-hidden ${
                    active
                      ? "border-blue-400 bg-gradient-to-br from-blue-50 to-blue-100 ring-2 ring-blue-300"
                      : "border-gray-200 bg-gray-50 hover:bg-white hover:border-gray-300"
                  }`}
                  title={al.name}>
                  <input
                    type="checkbox"
                    checked={active}
                    onChange={() => handleAirlineToggle(al.id)}
                    className="sr-only"
                  />
                  <img
                    src={al.logo}
                    alt={al.name}
                    loading="lazy"
                    className={`object-contain w-full h-full p-4 transition-transform ${
                      active ? "scale-90" : "group-hover:scale-105"
                    }`}
                  />
                  {active && (
                    <span className="absolute top-1 right-1 inline-block w-3 h-3 bg-blue-500 rounded-full ring-2 ring-white" />
                  )}
                </label>
              );
            })}
          </div>
        </div>

        {/* Main form */}
        <div className="p-6">
          {/* Quick Destinations */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <Route className="h-4 w-4 text-blue-600" />
                <h3 className="text-sm font-semibold text-gray-700">
                  Chọn nhanh sân bay Việt Nam
                </h3>
              </div>
              <div className="text-xs text-gray-500">
                Chọn từ 10 sân bay phổ biến
              </div>
            </div>

            {/* Two row layout: FROM và TO */}
            <div className="space-y-3">
              {/* FROM row */}
              <div>
                <div className="flex items-center space-x-2 mb-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="text-xs font-medium text-blue-700">
                    Điểm đi (FROM)
                  </span>
                </div>
                <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
                  {vietnameseAirports.map((airport) => {
                    const isSelected =
                      getAirportCodeFromString(formData.from) === airport.code;
                    const isDestination =
                      getAirportCodeFromString(formData.to) === airport.code;
                    const isDisabled = isSelected || isDestination;

                    return (
                      <button
                        key={`from-${airport.code}`}
                        onClick={() => selectQuickDestination(airport, "from")}
                        disabled={isDisabled}
                        className={`relative p-2 rounded-lg border transition-all duration-200 text-center ${
                          isSelected
                            ? "bg-blue-500 text-white border-blue-500 cursor-not-allowed"
                            : isDestination
                            ? "bg-gray-200 text-gray-400 border-gray-300 cursor-not-allowed"
                            : "bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200 hover:border-blue-300"
                        }`}
                        title={
                          isSelected
                            ? `Đã chọn ${airport.fullName} làm điểm đi`
                            : isDestination
                            ? `${airport.fullName} đã được chọn làm điểm đến`
                            : `Chọn ${airport.fullName} làm điểm đi`
                        }>
                        <div className="text-xs font-bold">{airport.code}</div>
                        <div className="text-[10px] leading-tight mt-0.5">
                          {airport.city}
                        </div>
                        {isSelected && (
                          <div className="absolute -top-1 -right-1 w-3 h-3 bg-white rounded-full flex items-center justify-center">
                            <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                          </div>
                        )}
                        {isDestination && (
                          <div className="absolute inset-0 bg-gray-300 bg-opacity-50 rounded-lg flex items-center justify-center">
                            <div className="text-[8px] text-gray-600 font-medium">
                              ĐẾN
                            </div>
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* TO row */}
              <div>
                <div className="flex items-center space-x-2 mb-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-xs font-medium text-green-700">
                    Điểm đến (TO)
                  </span>
                </div>
                <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
                  {vietnameseAirports.map((airport) => {
                    const isSelected =
                      getAirportCodeFromString(formData.to) === airport.code;
                    const isOrigin =
                      getAirportCodeFromString(formData.from) === airport.code;
                    const isDisabled = isSelected || isOrigin;

                    return (
                      <button
                        key={`to-${airport.code}`}
                        onClick={() => selectQuickDestination(airport, "to")}
                        disabled={isDisabled}
                        className={`relative p-2 rounded-lg border transition-all duration-200 text-center ${
                          isSelected
                            ? "bg-green-500 text-white border-green-500 cursor-not-allowed"
                            : isOrigin
                            ? "bg-gray-200 text-gray-400 border-gray-300 cursor-not-allowed"
                            : "bg-green-50 hover:bg-green-100 text-green-700 border-green-200 hover:border-green-300"
                        }`}
                        title={
                          isSelected
                            ? `Đã chọn ${airport.fullName} làm điểm đến`
                            : isOrigin
                            ? `${airport.fullName} đã được chọn làm điểm đi`
                            : `Chọn ${airport.fullName} làm điểm đến`
                        }>
                        <div className="text-xs font-bold">{airport.code}</div>
                        <div className="text-[10px] leading-tight mt-0.5">
                          {airport.city}
                        </div>
                        {isSelected && (
                          <div className="absolute -top-1 -right-1 w-3 h-3 bg-white rounded-full flex items-center justify-center">
                            <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                          </div>
                        )}
                        {isOrigin && (
                          <div className="absolute inset-0 bg-gray-300 bg-opacity-50 rounded-lg flex items-center justify-center">
                            <div className="text-[8px] text-gray-600 font-medium">
                              ĐI
                            </div>
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Locations row */}
          <div className="grid grid-cols-1 md:grid-cols-7 gap-4 mb-6">
            <div className="md:col-span-3 space-y-2">
              <Label
                className={`text-sm font-semibold flex items-center ${
                  validationErrors.from ? "text-red-600" : "text-gray-700"
                }`}>
                <MapPin
                  className={`h-4 w-4 mr-1 ${
                    validationErrors.from ? "text-red-600" : "text-blue-600"
                  }`}
                />
                Từ{" "}
                {validationErrors.from && (
                  <span className="text-red-500 ml-1">*</span>
                )}
              </Label>
              <Popover
                open={showFromDropdown}
                onOpenChange={setShowFromDropdown}>
                <PopoverTrigger asChild>
                  <div className="relative">
                    <Input
                      value={formData.from || fromSearch}
                      placeholder="Thành phố hoặc Sân bay"
                      onChange={(e) => {
                        setFromSearch(e.target.value);
                        setFormData((p) => ({ ...p, from: e.target.value }));
                        setShowFromDropdown(true);
                        if (validationErrors.from)
                          setValidationErrors((p) => ({ ...p, from: false }));
                      }}
                      className={`h-12 text-base pl-4 pr-10 border-2 ${
                        validationErrors.from
                          ? "border-red-500 focus:border-red-500 focus:ring-red-200"
                          : "border-gray-200 focus:border-blue-500 focus:ring-blue-200"
                      } focus:ring-2 rounded-lg bg-gray-50/50`}
                    />
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  </div>
                </PopoverTrigger>
                <PopoverContent
                  className="w-full p-0"
                  align="start"
                  side="bottom"
                  sideOffset={4}>
                  <div className="max-h-60 overflow-y-auto">
                    {filterAirports(fromSearch, [
                      getAirportCodeFromString(formData.to),
                    ]).map((ap) => (
                      <div
                        key={ap.code}
                        onClick={() => selectAirport(ap, "from")}
                        className="flex items-center justify-between p-3 hover:bg-gray-100 cursor-pointer border-b last:border-b-0">
                        <div className="flex items-center space-x-3">
                          <div className="bg-blue-100 text-blue-600 px-2 py-1 rounded text-sm font-bold">
                            {ap.code}
                          </div>
                          <div>
                            <div className="font-medium">{ap.city}</div>
                            <div className="text-sm text-gray-500">
                              {ap.name}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </PopoverContent>
              </Popover>
            </div>
            <div className="md:col-span-1 flex justify-center items-end pb-2">
              <Button
                onClick={swapLocations}
                variant="outline"
                size="sm"
                className="h-10 w-10 rounded-full border-2 border-blue-200 hover:border-blue-400 hover:bg-blue-50 bg-white shadow-sm">
                <ArrowRightLeft className="h-4 w-4 text-blue-600" />
              </Button>
            </div>
            <div className="md:col-span-3 space-y-2">
              <Label
                className={`text-sm font-semibold flex items-center ${
                  validationErrors.to ? "text-red-600" : "text-gray-700"
                }`}>
                <MapPin
                  className={`h-4 w-4 mr-1 ${
                    validationErrors.to ? "text-red-600" : "text-blue-600"
                  }`}
                />
                Đến{" "}
                {validationErrors.to && (
                  <span className="text-red-500 ml-1">*</span>
                )}
              </Label>
              <Popover open={showToDropdown} onOpenChange={setShowToDropdown}>
                <PopoverTrigger asChild>
                  <div className="relative">
                    <Input
                      value={formData.to || toSearch}
                      placeholder="Thành phố hoặc Sân bay"
                      onChange={(e) => {
                        setToSearch(e.target.value);
                        setFormData((p) => ({ ...p, to: e.target.value }));
                        setShowToDropdown(true);
                        if (validationErrors.to)
                          setValidationErrors((p) => ({ ...p, to: false }));
                      }}
                      className={`h-12 text-base pl-4 pr-10 border-2 ${
                        validationErrors.to
                          ? "border-red-500 focus:border-red-500 focus:ring-red-200"
                          : "border-gray-200 focus:border-blue-500 focus:ring-blue-200"
                      } focus:ring-2 rounded-lg bg-gray-50/50`}
                    />
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  </div>
                </PopoverTrigger>
                <PopoverContent
                  className="w-full p-0"
                  align="start"
                  side="bottom"
                  sideOffset={4}>
                  <div className="max-h-60 overflow-y-auto">
                    {filterAirports(toSearch, [
                      getAirportCodeFromString(formData.from),
                    ]).map((ap) => (
                      <div
                        key={ap.code}
                        onClick={() => selectAirport(ap, "to")}
                        className="flex items-center justify-between p-3 hover:bg-gray-100 cursor-pointer border-b last:border-b-0">
                        <div className="flex items-center space-x-3">
                          <div className="bg-blue-100 text-blue-600 px-2 py-1 rounded text-sm font-bold">
                            {ap.code}
                          </div>
                          <div>
                            <div className="font-medium">{ap.city}</div>
                            <div className="text-sm text-gray-500">
                              {ap.name}
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

          {/* Dates & passengers */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
            {/* Departure */}
            <div className="md:col-span-3 space-y-2">
              <Label
                className={`text-sm font-semibold flex items-center ${
                  !formData.departureDate ? "text-red-600" : "text-gray-700"
                }`}>
                <CalendarIcon
                  className={`h-4 w-4 mr-1 ${
                    !formData.departureDate ? "text-red-600" : "text-blue-600"
                  }`}
                />
                {formData.tripType === "one-way" && formData.searchFullMonth
                  ? "Tháng khởi hành"
                  : "Khởi hành"}{" "}
                {!formData.departureDate && (
                  <span className="text-red-500 ml-1">*</span>
                )}
              </Label>
              {formData.tripType === "one-way" && formData.searchFullMonth ? (
                <input
                  type="month"
                  className="w-full h-12 px-4 border-2 rounded-lg bg-gray-50/50 text-base focus:outline-none focus:ring-2 border-gray-200 focus:border-blue-500 focus:ring-blue-200"
                  value={
                    formData.departureDate
                      ? `${formData.departureDate.getFullYear()}-${String(
                          formData.departureDate.getMonth() + 1
                        ).padStart(2, "0")}`
                      : ""
                  }
                  onChange={(e) => {
                    if (!e.target.value) return;
                    const [y, m] = e.target.value.split("-").map(Number);
                    setFormData((p) => ({
                      ...p,
                      departureDate: new Date(y, m - 1, 1),
                    }));
                  }}
                />
              ) : (
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full h-12 justify-start text-left font-normal border-2 border-gray-200 hover:border-blue-400 bg-gray-50/50 rounded-lg">
                      <CalendarIcon className="mr-3 h-4 w-4 text-blue-600" />
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
                      onSelect={(d) =>
                        setFormData((p) => ({
                          ...p,
                          departureDate: d || undefined,
                        }))
                      }
                      disabled={(date) => {
                        if (DEV_CONFIG.HIDE_DEV_CONTROLS) {
                          const today = new Date();
                          today.setHours(0, 0, 0, 0);
                          return date < today;
                        }
                        return false;
                      }}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              )}
            </div>
            {/* Return date (round-trip only) */}
            {formData.tripType === "round-trip" && (
              <div className="md:col-span-3 space-y-2">
                <Label className="text-sm font-semibold flex items-center text-gray-700">
                  <CalendarIcon className="h-4 w-4 mr-1 text-blue-600" />
                  Về
                </Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full h-12 justify-start text-left font-normal border-2 border-gray-200 hover:border-blue-400 bg-gray-50/50 rounded-lg">
                      <CalendarIcon className="mr-3 h-4 w-4 text-blue-600" />
                      <span className="text-base">
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
                      onSelect={(d) =>
                        setFormData((p) => ({
                          ...p,
                          returnDate: d || undefined,
                        }))
                      }
                      disabled={(date) => {
                        if (DEV_CONFIG.HIDE_DEV_CONTROLS) {
                          const today = new Date();
                          today.setHours(0, 0, 0, 0);
                          return date < today;
                        }
                        return false;
                      }}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            )}
            {/* Months count (only when month search active) */}
            {formData.tripType === "one-way" && formData.searchFullMonth && (
              <div className="md:col-span-2 space-y-2">
                <Label className="text-sm font-semibold text-gray-700 flex items-center">
                  <CalendarMonth className="h-4 w-4 mr-1 text-blue-600" />
                  Số tháng
                </Label>
                <Select
                  value={String(
                    (formData as { monthsCount?: number }).monthsCount || 1
                  )}
                  onValueChange={(v) =>
                    setFormData((p) => ({ ...p, monthsCount: Number(v) }))
                  }>
                  <SelectTrigger className="w-full h-12">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4, 5, 6].map((m) => (
                      <SelectItem key={m} value={String(m)}>
                        {m} tháng
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            {/* Passengers & Class */}
            <div
              className={`space-y-2 ${
                formData.tripType === "round-trip"
                  ? "md:col-span-4"
                  : formData.searchFullMonth
                  ? "md:col-span-4"
                  : "md:col-span-5"
              }`}>
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
                    <ChevronDown className="h-4 w-4 text-gray-400 ml-2" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent
                  className="w-96 p-0"
                  align="start"
                  side="bottom"
                  sideOffset={4}>
                  <div className="p-6 space-y-6">
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
                        onValueChange={(v) =>
                          setFormData((p) => ({ ...p, flightClass: v }))
                        }>
                        <SelectTrigger className="w-full h-12">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {flightClasses.map((fc) => (
                            <SelectItem key={fc.value} value={fc.value}>
                              <div className="flex flex-col">
                                <span className="font-medium">{fc.label}</span>
                                {fc.description && (
                                  <span className="text-xs text-gray-500">
                                    {fc.description}
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
                        onValueChange={(v) =>
                          setFormData((p) => ({ ...p, specialRequirements: v }))
                        }>
                        <SelectTrigger className="w-full h-12">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {specialRequirements.map((r) => (
                            <SelectItem key={r.value} value={r.value}>
                              <div className="flex flex-col">
                                <span className="font-medium">{r.label}</span>
                                {r.description && (
                                  <span className="text-xs text-gray-500">
                                    {r.description}
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
            {/* Search */}
            <div className="md:col-span-2">
              <Button
                onClick={handleSearchWithValidation}
                disabled={isLoading}
                className="w-full h-12 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-bold text-base shadow-lg hover:shadow-xl transition-all duration-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed">
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" />
                    Đang tìm kiếm...
                  </>
                ) : (
                  <>
                    <Search className="h-5 w-5 mr-2" />
                    Tìm kiếm
                  </>
                )}
              </Button>
              {(validationErrors.from ||
                validationErrors.to ||
                validationErrors.departureDate) && (
                <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-600">
                  Vui lòng điền đủ thông tin bắt buộc.
                </div>
              )}
              {searchError && (
                <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-600">
                  Lỗi tìm kiếm: {searchError}
                </div>
              )}
            </div>
          </div>

          {formData.tripType === "one-way" && formData.searchFullMonth && (
            <div className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-200 text-sm text-blue-700">
              Hiển thị giá vé cả tháng để chọn ngày tốt nhất.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
