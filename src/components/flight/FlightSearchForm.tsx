import { useState, useEffect, useMemo } from "react";
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
  Globe,
  Lock,
} from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Card, CardContent } from "../ui/card";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { DatePicker } from "antd";
import dayjs from "dayjs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import {
  airports as airportsData,
  FlightClass as flightClassData,
  SpecialRequirement as specialRequirementData,
} from "../../mocks/flightData";
import type { Airport } from "../../shared/types";
import { useFlightSearchForm } from "../../hooks/useFlightSearchForm";
import {
  DEV_CONFIG,
  shouldShowDevControls,
} from "../../shared/config/devConfig";
import { AIRLINE_LIST } from "../../shared/constants/airlines";
const { RangePicker } = DatePicker;

const MAX_PAX = 8;
const PREFERRED_COUNTRY = "Vietnam";
const QUICK_AIRPORT_CODES = [
  "SGN",
  "HAN",
  "DAD",
  "CXR",
  "PQC",
  "VCA",
  "HPH",
  "HUI",
];

type Option = { value: string; label: string; description?: string };
type MaybeDescribed = { value: string; label: string; description?: string };

const airports: Airport[] = airportsData as unknown as Airport[];
const flightClassOptions: Option[] = (flightClassData as MaybeDescribed[]).map(
  (fc) => ({
    value: fc.value,
    label: fc.label,
    description: fc.description,
  })
);
const specialRequirementOptions: Option[] = (
  specialRequirementData as MaybeDescribed[]
).map((r) => ({
  value: r.value,
  label: r.label,
  description: r.description,
}));

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

  const [selectedAirlines, setSelectedAirlines] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem("selectedAirlines");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const isAllAirlinesSelected = selectedAirlines.length === 0;

  const [validationErrors, setValidationErrors] = useState({
    from: false,
    to: false,
    departureDate: false,
  });

  const monthRangeLabel = useMemo(() => {
    if (!formData.searchFullMonth || !formData.departureDate) return null;
    const monthsCount = formData.monthsCount ?? 1;
    const startLabel = format(formData.departureDate, "MM/yyyy");
    if (monthsCount <= 1) {
      return `Tháng ${startLabel}`;
    }
    const endDate = new Date(
      formData.departureDate.getFullYear(),
      formData.departureDate.getMonth() + monthsCount - 1,
      1
    );
    const endLabel = format(endDate, "MM/yyyy");
    return `Tháng ${startLabel} → ${endLabel}`;
  }, [formData.searchFullMonth, formData.departureDate, formData.monthsCount]);

  useEffect(() => {
    localStorage.setItem("selectedAirlines", JSON.stringify(selectedAirlines));
  }, [selectedAirlines]);

  useEffect(() => {
    if (formData.tripType === "multi-city") {
      setFormData((p) => ({ ...p, tripType: "one-way" }));
      sessionStorage.setItem("tripType", "one-way");
      window.dispatchEvent(new CustomEvent("sessionStorageUpdated"));
    }
  }, [formData.tripType, setFormData]);

  // Use real airline mapping instead of mock data
  const vietnameseAirlines = AIRLINE_LIST.map((a) => ({
    id: a.name.toLowerCase().replace(/\s+/g, "-"),
    name: a.name,
    logo:
      a.logo || `/airlines/${a.name.toLowerCase().replace(/\s+/g, "-")}.png`,
    code: a.code,
    dbId: a.id, // Add database ID for API requests
  }));

  const quickAirports = useMemo(
    () =>
      airports
        .filter((a) => QUICK_AIRPORT_CODES.includes(a.code))
        .map((a) => ({
          city: a.city,
          code: a.code,
          fullName: `${a.city} (${a.code})`,
        })),
    []
  );

  const availableCountries = useMemo(
    () => Array.from(new Set(airports.map((a) => a.country))),
    []
  );
  const [fromCountry, setFromCountry] = useState<string>(PREFERRED_COUNTRY);
  const [toCountry, setToCountry] = useState<string>(PREFERRED_COUNTRY);

  const disablePastDate = (current: dayjs.Dayjs) => {
    if (!DEV_CONFIG.HIDE_DEV_CONTROLS) return false;
    return current && current < dayjs().startOf("day");
  };

  const getAirportCodeFromString = (s: string) => {
    const m = s.match(/\(([^)]+)\)$/);
    return m ? m[1] : "";
  };

  const filterAirports = (
    term: string,
    country: string,
    excludeCodes: string[] = []
  ): Airport[] => {
    const inCountry = airports.filter(
      (a) => a.country === country && !excludeCodes.includes(a.code)
    );
    const others = airports.filter(
      (a) => a.country !== country && !excludeCodes.includes(a.code)
    );
    if (!term) return inCountry;
    const match = (a: Airport) =>
      [a.city, a.name, a.code].some((v) =>
        v.toLowerCase().includes(term.toLowerCase())
      );
    return [...inCountry.filter(match), ...others.filter(match)].slice(0, 30);
  };

  const selectQuickDestination = (
    destination: { fullName: string; code: string },
    type: "from" | "to"
  ) => {
    if (type === "from") {
      setFormData((p) => ({ ...p, from: destination.fullName }));
      setFromSearch("");
      setShowFromDropdown(false);
    } else {
      setFormData((p) => ({ ...p, to: destination.fullName }));
      setToSearch("");
      setShowToDropdown(false);
    }
    setValidationErrors((p) => ({ ...p, [type]: false }));
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

  const handleSelectAllAirlines = () => setSelectedAirlines([]);

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
    if (validateForm()) {
      // Convert selected airlines to database IDs
      const selectedAirlineIds = selectedAirlines
        .map((airlineId) => {
          const airline = vietnameseAirlines.find((a) => a.id === airlineId);
          return airline?.dbId;
        })
        .filter((id): id is number => id !== undefined);

      handleSearch(selectedAirlineIds);
    }
  };

  const setTripType = (newType: "one-way" | "round-trip") => {
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

  const handleDevQuickSearch = () => {
    if (!shouldShowDevControls()) return;

    const devDepartureDate = new Date(2025, 7, 1);
    const devReturnDate = new Date(2025, 7, 11);
    const defaultFromAirport = airports.find(
      (airport) => airport.code === "SGN"
    );
    const defaultToAirport = airports.find((airport) => airport.code === "HAN");
    const fallbackFrom = defaultFromAirport
      ? `${defaultFromAirport.city} (${defaultFromAirport.code})`
      : "Ho Chi Minh City (SGN)";
    const fallbackTo = defaultToAirport
      ? `${defaultToAirport.city} (${defaultToAirport.code})`
      : "Ha Noi (HAN)";

    setTripType("round-trip");
    setFormData((prev) => {
      const nextFrom = prev.from?.trim() ? prev.from : fallbackFrom;
      const nextTo = prev.to?.trim() ? prev.to : fallbackTo;

      return {
        ...prev,
        tripType: "round-trip",
        from: nextFrom,
        to: nextTo,
        departureDate: devDepartureDate,
        returnDate: devReturnDate,
        searchFullMonth: false,
      };
    });

    setFromSearch("");
    setToSearch("");
    setShowFromDropdown(false);
    setShowToDropdown(false);
    setValidationErrors({ from: false, to: false, departureDate: false });

    setTimeout(() => {
      handleSearchWithValidation();
    }, 0);
  };

  const totalPassengers =
    formData.passengers.adults +
    formData.passengers.children +
    formData.passengers.infants;

  return (
    <Card className="w-full max-w-7xl mx-auto shadow-lg border-0 bg-white rounded-2xl overflow-hidden">
      <CardContent className="p-0">
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
            <div className="flex items-center gap-3">
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
              {shouldShowDevControls() && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleDevQuickSearch}
                  className="text-xs font-medium">
                  Dev quick search
                </Button>
              )}
            </div>
          </div>

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
                  {formData.searchFullMonth && monthRangeLabel && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-semibold bg-blue-100 text-blue-700 border border-blue-300">
                      {monthRangeLabel}
                    </span>
                  )}
                </Label>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3">
            <button
              type="button"
              onClick={handleSelectAllAirlines}
              aria-pressed={isAllAirlinesSelected}
              className={`group relative flex h-24 w-full flex-col items-center justify-center rounded-xl border shadow-sm transition-all duration-200 overflow-hidden px-4 text-center ${
                isAllAirlinesSelected
                  ? "border-blue-400 bg-gradient-to-br from-blue-50 to-blue-100 ring-2 ring-blue-300 text-blue-700"
                  : "border-gray-200 bg-gray-50 text-gray-600 hover:bg-white hover:border-gray-300"
              }`}>
              <span className="text-sm font-semibold">Tất cả hãng</span>
              <span
                className={`mt-1 text-[11px] ${
                  isAllAirlinesSelected ? "text-blue-600/80" : "text-gray-500"
                }`}>
                Không giới hạn lọc
              </span>
              {isAllAirlinesSelected && (
                <span className="absolute top-1 right-1 inline-block h-3 w-3 rounded-full bg-blue-500 ring-2 ring-white" />
              )}
            </button>
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

        <div className="p-6">
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
                  <div className="flex items-center gap-2 px-3 py-2 border-b bg-gray-50">
                    <Globe className="h-4 w-4 text-gray-500" />
                    {availableCountries.map((cty) => {
                      const active = cty === fromCountry;
                      const disabled = cty !== PREFERRED_COUNTRY;
                      const count = airports.filter(
                        (a) => a.country === cty
                      ).length;
                      const base =
                        "text-xs px-2.5 py-1 rounded-full border transition";
                      const enabledStyle = active
                        ? "bg-blue-600 text-white border-blue-600"
                        : "bg-white text-gray-700 border-gray-300 hover:bg-blue-50 hover:border-blue-400";
                      const disabledStyle =
                        "bg-white text-gray-500 border-gray-300 opacity-60 cursor-not-allowed";
                      return (
                        <button
                          key={`from-cty-${cty}`}
                          onClick={() => !disabled && setFromCountry(cty)}
                          className={`${base} ${
                            disabled ? disabledStyle : enabledStyle
                          }`}
                          title={disabled ? "Demo: chỉ Vietnam được bật" : cty}>
                          {cty} ({count}){" "}
                          {disabled && <Lock className="inline h-3 w-3 ml-1" />}
                        </button>
                      );
                    })}
                  </div>
                  <div className="max-h-64 overflow-y-auto">
                    {filterAirports(fromSearch, fromCountry, [
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
                        <span className="text-[11px] text-gray-500">
                          {ap.country}
                        </span>
                      </div>
                    ))}
                  </div>
                </PopoverContent>
              </Popover>
              <div className="flex flex-wrap gap-2 mt-2">
                {quickAirports.map((airport) => {
                  const isDestination =
                    getAirportCodeFromString(formData.to) === airport.code;
                  if (isDestination) return null;
                  const isSelected =
                    getAirportCodeFromString(formData.from) === airport.code;
                  return (
                    <button
                      key={`from-quick-${airport.code}`}
                      onClick={() => selectQuickDestination(airport, "from")}
                      disabled={isSelected}
                      className={`px-2 py-1 text-xs rounded-md border transition-colors ${
                        isSelected
                          ? "bg-blue-600 text-white border-blue-600 cursor-not-allowed"
                          : "bg-white text-blue-700 border-blue-200 hover:bg-blue-50"
                      }`}>
                      {airport.city} ({airport.code})
                    </button>
                  );
                })}
              </div>
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
                  <div className="flex items-center gap-2 px-3 py-2 border-b bg-gray-50">
                    <Globe className="h-4 w-4 text-gray-500" />
                    {availableCountries.map((cty) => {
                      const active = cty === toCountry;
                      const disabled = cty !== PREFERRED_COUNTRY;
                      const count = airports.filter(
                        (a) => a.country === cty
                      ).length;
                      const base =
                        "text-xs px-2.5 py-1 rounded-full border transition";
                      const enabledStyle = active
                        ? "bg-green-600 text-white border-green-600"
                        : "bg-white text-gray-700 border-gray-300 hover:bg-green-50 hover:border-green-400";
                      const disabledStyle =
                        "bg-white text-gray-500 border-gray-300 opacity-60 cursor-not-allowed";
                      return (
                        <button
                          key={`to-cty-${cty}`}
                          onClick={() => !disabled && setToCountry(cty)}
                          className={`${base} ${
                            disabled ? disabledStyle : enabledStyle
                          }`}
                          title={disabled ? "Demo: chỉ Vietnam được bật" : cty}>
                          {cty} ({count}){" "}
                          {disabled && <Lock className="inline h-3 w-3 ml-1" />}
                        </button>
                      );
                    })}
                  </div>
                  <div className="max-h-64 overflow-y-auto">
                    {filterAirports(toSearch, toCountry, [
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
                        <span className="text-[11px] text-gray-500">
                          {ap.country}
                        </span>
                      </div>
                    ))}
                  </div>
                </PopoverContent>
              </Popover>
              <div className="flex flex-wrap gap-2 mt-2">
                {quickAirports.map((airport) => {
                  const isOrigin =
                    getAirportCodeFromString(formData.from) === airport.code;
                  if (isOrigin) return null;
                  const isSelected =
                    getAirportCodeFromString(formData.to) === airport.code;
                  return (
                    <button
                      key={`to-quick-${airport.code}`}
                      onClick={() => selectQuickDestination(airport, "to")}
                      disabled={isSelected}
                      className={`px-2 py-1 text-xs rounded-md border transition-colors ${
                        isSelected
                          ? "bg-green-600 text-white border-green-600 cursor-not-allowed"
                          : "bg-white text-green-700 border-green-200 hover:bg-green-50"
                      }`}>
                      {airport.city} ({airport.code})
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
            <div
              className={`${
                formData.tripType === "round-trip"
                  ? "md:col-span-4"
                  : "md:col-span-3"
              } space-y-2`}>
              <Label
                className={`text-sm font-semibold flex items-center ${
                  !formData.departureDate ? "text-red-600" : "text-gray-700"
                }`}>
                <CalendarIcon
                  className={`h-4 w-4 mr-1 ${
                    !formData.departureDate ? "text-red-600" : "text-blue-600"
                  }`}
                />
                {formData.tripType === "round-trip"
                  ? "Ngày đi & về"
                  : formData.searchFullMonth
                  ? "Tháng khởi hành"
                  : "Khởi hành"}{" "}
                {!formData.departureDate && (
                  <span className="text-red-500 ml-1">*</span>
                )}
              </Label>
              {formData.tripType === "round-trip" ? (
                <RangePicker
                  className="w-full fly-date-picker"
                  format="DD/MM/YYYY"
                  value={[
                    formData.departureDate
                      ? dayjs(formData.departureDate)
                      : null,
                    formData.returnDate ? dayjs(formData.returnDate) : null,
                  ]}
                  disabledDate={disablePastDate}
                  onChange={(dates) => {
                    const [start, end] = dates || [];
                    setFormData((p) => ({
                      ...p,
                      departureDate: start ? start.toDate() : undefined,
                      returnDate: end ? end.toDate() : undefined,
                    }));
                    setValidationErrors((p) => ({
                      ...p,
                      departureDate: !(dates && dates[0]),
                    }));
                  }}
                />
              ) : formData.searchFullMonth ? (
                <DatePicker
                  className="w-full fly-date-picker"
                  picker="month"
                  format="MMMM YYYY"
                  inputReadOnly
                  value={
                    formData.departureDate
                      ? dayjs(formData.departureDate)
                      : null
                  }
                  disabledDate={disablePastDate}
                  onChange={(date) => {
                    setFormData((p) => ({
                      ...p,
                      departureDate: date
                        ? date.startOf("month").toDate()
                        : undefined,
                    }));
                    setValidationErrors((p) => ({
                      ...p,
                      departureDate: !date,
                    }));
                  }}
                  popupClassName="fly-month-picker-dropdown"
                />
              ) : (
                <DatePicker
                  className="w-full fly-date-picker"
                  format="DD/MM/YYYY"
                  value={
                    formData.departureDate
                      ? dayjs(formData.departureDate)
                      : null
                  }
                  disabledDate={disablePastDate}
                  onChange={(date) => {
                    setFormData((p) => ({
                      ...p,
                      departureDate: date ? date.toDate() : undefined,
                    }));
                    setValidationErrors((p) => ({
                      ...p,
                      departureDate: !date,
                    }));
                  }}
                />
              )}
            </div>

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

            <div
              className={`${
                formData.tripType === "round-trip"
                  ? "md:col-span-6"
                  : formData.searchFullMonth
                  ? "md:col-span-5"
                  : "md:col-span-7"
              } space-y-2`}>
              <div className="flex items-center justify-between">
                <Label className="text-sm font-semibold text-gray-700 flex items-center">
                  <Users className="h-4 w-4 mr-1 text-blue-600" />
                  Hành khách & Hạng
                </Label>
                <span className="text-[11px] text-gray-500">
                  Tối đa {MAX_PAX} hành khách
                </span>
              </div>
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
                  sideOffset={4}
                  avoidCollisions={false}
                  sticky="always">
                  <div className="p-4 space-y-3">
                    <div className="space-y-3">
                      <h4 className="font-semibold text-gray-900 border-b pb-2">
                        Số lượng hành khách{" "}
                        <span className="text-xs text-gray-500">
                          (tối đa {MAX_PAX})
                        </span>
                      </h4>
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
                            onClick={() =>
                              totalPassengers < MAX_PAX &&
                              updatePassengerCount("adults", true)
                            }
                            disabled={totalPassengers >= MAX_PAX}
                            className="h-8 w-8 rounded-full p-0">
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
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
                              totalPassengers < MAX_PAX &&
                              updatePassengerCount("children", true)
                            }
                            disabled={totalPassengers >= MAX_PAX}
                            className="h-8 w-8 rounded-full p-0">
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
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
                              totalPassengers < MAX_PAX &&
                              updatePassengerCount("infants", true)
                            }
                            disabled={totalPassengers >= MAX_PAX}
                            className="h-8 w-8 rounded-full p-0">
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-semibold text-gray-900 border-b pb-1">
                        Hạng vé
                      </h4>
                      <Select
                        value={formData.flightClass}
                        onValueChange={(v) =>
                          setFormData((p) => ({ ...p, flightClass: v }))
                        }>
                        <SelectTrigger className="w-full h-9">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {flightClassOptions.map((fc) => (
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
                    <div className="space-y-2">
                      <h4 className="font-semibold text-gray-900 border-b pb-1">
                        Yêu cầu đặc biệt
                      </h4>
                      <Select
                        value={formData.specialRequirements}
                        onValueChange={(v) =>
                          setFormData((p) => ({ ...p, specialRequirements: v }))
                        }>
                        <SelectTrigger className="w-full h-9">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {specialRequirementOptions.map((r) => (
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
                    <div className="pt-2 border-t">
                      <Button
                        onClick={() => setShowPassengerDropdown(false)}
                        className="w-full bg-blue-600 hover:bg-blue-700 h-9">
                        Xác nhận
                      </Button>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
            </div>

            <div className="md:col-span-2">
              <Button
                onClick={handleSearchWithValidation}
                disabled={isLoading}
                className="w-full h-12 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold text-base shadow-md hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center">
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" />
                    Đang tìm kiếm...
                  </>
                ) : (
                  <>
                    <Search className="h-5 w-5 mr-2" />
                    Tìm chuyến bay
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
