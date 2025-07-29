import type React from "react";
import { useState } from "react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Card, CardContent } from "../components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { Calendar } from "../components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../components/ui/popover";
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
} from "lucide-react";
import { format } from "date-fns";
import { Badge } from "./ui/badge";
import { useFlightSearchForm } from "../hooks/useFlightSearchForm";
import {
  airports,
  flightClasses,
  specialRequirements,
} from "../assets/mock/flightData";
import type { Airport } from "../shared/types";

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
  } = useFlightSearchForm();

  const [fromSearch, setFromSearch] = useState("");
  const [toSearch, setToSearch] = useState("");
  const [removingAirportCode, setRemovingAirportCode] = useState<string | null>(
    null
  );

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
    <Card className="w-full max-w-7xl mx-auto shadow-2xl border-0 bg-white/95 backdrop-blur-md rounded-3xl overflow-hidden">
      <CardContent className="p-0">
        {/* Header với trip type selector */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <Plane className="h-6 w-6" />
              <h2 className="text-xl font-bold">Tìm kiếm chuyến bay</h2>
            </div>
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2">
                <input
                  type="radio"
                  id="round-trip"
                  name="trip-type"
                  value="round-trip"
                  checked={formData.tripType === "round-trip"}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      tripType: e.target.value,
                    }))
                  }
                  className="w-4 h-4 text-white"
                />
                <Label htmlFor="round-trip" className="font-medium text-white">
                  Khứ hồi
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="radio"
                  id="one-way"
                  name="trip-type"
                  value="one-way"
                  checked={formData.tripType === "one-way"}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      tripType: e.target.value,
                    }))
                  }
                  className="w-4 h-4 text-white"
                />
                <Label htmlFor="one-way" className="font-medium text-white">
                  Một chiều
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="radio"
                  id="multi-city"
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
                  className="w-4 h-4 text-white"
                />
                <Label htmlFor="multi-city" className="font-medium text-white">
                  Nhiều chặng
                </Label>
              </div>
            </div>
          </div>

          {/* Full month search toggle */}
          <div className="flex items-center space-x-2">
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
              className="w-4 h-4 text-blue-600"
            />
            <Label htmlFor="full-month" className="text-sm text-white/90">
              Tìm kiếm cả tháng để có giá tốt nhất
            </Label>
          </div>
        </div>

        {/* Main search form */}
        <div className="p-8">
          {/* First row - Location inputs */}
          <div className="grid grid-cols-1 md:grid-cols-7 gap-4 mb-6">
            {/* From Location */}
            <div className="md:col-span-3 space-y-2">
              <Label
                htmlFor="from"
                className="text-sm font-semibold text-gray-700 flex items-center">
                <MapPin className="h-4 w-4 mr-1 text-blue-600" />
                Từ
              </Label>
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
                      }}
                      placeholder="Thành phố hoặc Sân bay"
                      className="h-14 text-lg pl-4 pr-10 border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 rounded-xl bg-gray-50/50"
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

            {/* Swap Button */}
            <div className="md:col-span-1 flex justify-center items-end pb-2">
              <Button
                onClick={swapLocations}
                variant="outline"
                size="sm"
                className="h-12 w-12 rounded-full border-2 border-blue-200 hover:border-blue-400 hover:bg-blue-50 bg-white shadow-md transition-all duration-200">
                <ArrowRightLeft className="h-5 w-5 text-blue-600" />
              </Button>
            </div>

            {/* To Location */}
            <div className="md:col-span-3 space-y-2">
              <Label
                htmlFor="to"
                className="text-sm font-semibold text-gray-700 flex items-center">
                <MapPin className="h-4 w-4 mr-1 text-blue-600" />
                Đến
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
                      }}
                      placeholder="Thành phố hoặc Sân bay"
                      className="h-14 text-lg pl-4 pr-10 border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 rounded-xl bg-gray-50/50"
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
              <Label className="text-sm font-semibold text-gray-700 flex items-center">
                <CalendarIcon className="h-4 w-4 mr-1 text-blue-600" />
                Khởi hành
              </Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full h-14 justify-start text-left font-normal border-2 border-gray-200 hover:border-blue-400 bg-gray-50/50 rounded-xl">
                    <CalendarIcon className="mr-3 h-5 w-5 text-blue-600" />
                    <span className="text-lg">
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
                    onSelect={(date) =>
                      setFormData((prev) => ({ ...prev, departureDate: date }))
                    }
                    disabled={(date) => {
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
                onClick={handleSearch}
                className="w-full h-14 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-bold text-lg shadow-xl hover:shadow-2xl transition-all duration-300 rounded-xl">
                <Search className="h-5 w-5 mr-2" />
                Tìm kiếm
              </Button>
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

          {/* Popular Destinations với animation */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-sm font-medium text-gray-700 mb-4 flex items-center">
              <Plane className="h-4 w-4 mr-2 text-blue-600" />
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
