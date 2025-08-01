import type React from "react";
import { useState } from "react";
import { Card, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { airlines } from "../assets/mock";
import {
  ArrowLeftRight,
  Calendar,
  Users,
  SearchIcon,
  SlidersHorizontal,
  Plane,
  ChevronDown,
  ChevronUp,
  Filter,
  ArrowRight,
} from "lucide-react";

// Transform airlines data for use in this component
const vietnameseAirlines = airlines.map((airline) => ({
  id: airline.name.toLowerCase().replace(/\s+/g, "-"),
  name: airline.name,
  logo: airline.logo,
  code: airline.name.substring(0, 2).toUpperCase(),
}));

// Mock data chuyến bay - Updated to use real airlines
const mockFlights = [
  {
    id: 1,
    airline:
      vietnameseAirlines.find((a) => a.name === "VietJet Air") ||
      vietnameseAirlines[1],
    flightNumber: "VJ175",
    departure: { time: "23:10", city: "Hà Nội", code: "HAN" },
    arrival: { time: "01:20", city: "Hồ Chí Minh", code: "SGN" },
    duration: "2h 10m",
    price: { amount: 1595000, currency: "VND" },
    class: "Eco",
    aircraft: "A321",
    stops: 0,
    baggage: "2 Hành khác",
  },
  {
    id: 2,
    airline:
      vietnameseAirlines.find((a) => a.name === "Bamboo Airways") ||
      vietnameseAirlines[3],
    flightNumber: "QH283",
    departure: { time: "22:15", city: "Hà Nội", code: "HAN" },
    arrival: { time: "00:25", city: "Hồ Chí Minh", code: "SGN" },
    duration: "2h 10m",
    price: { amount: 1627000, currency: "VND" },
    class: "Economy Smart",
    aircraft: "A321",
    stops: 0,
    baggage: "1 Hành khác",
  },
  {
    id: 3,
    airline:
      vietnameseAirlines.find((a) => a.name === "Vietnam Airlines") ||
      vietnameseAirlines[0],
    flightNumber: "VN1159",
    departure: { time: "16:40", city: "Hà Nội", code: "HAN" },
    arrival: { time: "18:50", city: "Hồ Chí Minh", code: "SGN" },
    duration: "2h 10m",
    price: { amount: 1725000, currency: "VND" },
    class: "Eco",
    aircraft: "A321",
    stops: 0,
    baggage: "2 Hành khác",
  },
  {
    id: 4,
    airline:
      vietnameseAirlines.find((a) => a.name === "Vietravel Airlines") ||
      vietnameseAirlines[4],
    flightNumber: "VU520",
    departure: { time: "14:30", city: "Hà Nội", code: "HAN" },
    arrival: { time: "16:40", city: "Hồ Chí Minh", code: "SGN" },
    duration: "2h 10m",
    price: { amount: 1450000, currency: "VND" },
    class: "Eco",
    aircraft: "A320",
    stops: 0,
    baggage: "2 Hành khác",
  },
  {
    id: 5,
    airline:
      vietnameseAirlines.find((a) => a.name === "Pacific Airlines") ||
      vietnameseAirlines[2],
    flightNumber: "BL345",
    departure: { time: "19:45", city: "Hà Nội", code: "HAN" },
    arrival: { time: "21:55", city: "Hồ Chí Minh", code: "SGN" },
    duration: "2h 10m",
    price: { amount: 1680000, currency: "VND" },
    class: "Economy",
    aircraft: "A321",
    stops: 0,
    baggage: "1 Hành khác",
  },
];

const Search: React.FC = () => {
  const [showFilters, setShowFilters] = useState(false);
  const [selectedAirlines, setSelectedAirlines] = useState<string[]>([]);
  const [filters, setFilters] = useState({
    priceRange: "all",
    departureTime: "all",
    stops: "all",
    sortBy: "price",
  });

  const [searchForm, setSearchForm] = useState({
    from: "Hà Nội (HAN)",
    to: "Hồ Chí Minh (SGN)",
    departDate: "30/07/2025",
    returnDate: "01/08/2025",
    passengers: "1 khách",
    tripType: "roundtrip",
  });

  const handleAirlineToggle = (airlineId: string) => {
    setSelectedAirlines((prev) =>
      prev.includes(airlineId)
        ? prev.filter((id) => id !== airlineId)
        : [...prev, airlineId]
    );
  };

  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat("vi-VN").format(amount);
  };

  // Filter flights based on selected airlines
  const filteredFlights =
    selectedAirlines.length === 0
      ? mockFlights
      : mockFlights.filter((flight) =>
          selectedAirlines.includes(flight.airline.id)
        );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Enhanced Search Form */}
      <div className="bg-white shadow-lg border-b">
        <div className="container mx-auto px-4 py-6">
          <Card className="shadow-lg border-0">
            <CardContent className="p-6">
              {/* Trip Type Selector */}
              <div className="flex items-center gap-4 mb-6">
                <div className="flex items-center gap-2">
                  <input
                    type="radio"
                    id="roundtrip"
                    name="tripType"
                    checked={searchForm.tripType === "roundtrip"}
                    onChange={() =>
                      setSearchForm((prev) => ({
                        ...prev,
                        tripType: "roundtrip",
                      }))
                    }
                    className="text-blue-600"
                  />
                  <label htmlFor="roundtrip" className="text-sm font-medium">
                    Khứ hồi
                  </label>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="radio"
                    id="oneway"
                    name="tripType"
                    checked={searchForm.tripType === "oneway"}
                    onChange={() =>
                      setSearchForm((prev) => ({ ...prev, tripType: "oneway" }))
                    }
                    className="text-blue-600"
                  />
                  <label htmlFor="oneway" className="text-sm font-medium">
                    1 chiều
                  </label>
                </div>
              </div>

              {/* Enhanced Airline Selection */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Chọn hãng hàng không
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                  {/* Select All Option */}
                  <div className="flex flex-col items-center">
                    <label className="flex flex-col items-center cursor-pointer p-3 border-2 border-gray-200 rounded-lg hover:border-blue-300 transition-colors min-h-[80px] justify-center w-full">
                      <input
                        type="checkbox"
                        checked={selectedAirlines.length === 0}
                        onChange={() => setSelectedAirlines([])}
                        className="sr-only"
                      />
                      <div
                        className={`text-center p-2 rounded-md w-full ${
                          selectedAirlines.length === 0
                            ? "bg-blue-50 border-blue-300"
                            : ""
                        }`}>
                        <div className="text-2xl mb-1">✈️</div>
                        <span className="text-xs font-medium text-gray-700">
                          Tất cả
                        </span>
                      </div>
                    </label>
                  </div>

                  {/* Individual Airlines */}
                  {vietnameseAirlines.map((airline) => (
                    <div
                      key={airline.id}
                      className="flex flex-col items-center">
                      <label className="flex flex-col items-center cursor-pointer p-2 border-2 border-gray-200 rounded-lg hover:border-blue-300 transition-colors min-h-[80px] justify-center w-full">
                        <input
                          type="checkbox"
                          checked={selectedAirlines.includes(airline.id)}
                          onChange={() => handleAirlineToggle(airline.id)}
                          className="sr-only"
                        />
                        <div
                          className={`text-center p-2 rounded-md w-full ${
                            selectedAirlines.includes(airline.id)
                              ? "bg-blue-50 border-blue-300"
                              : ""
                          }`}>
                          <img
                            src={airline.logo}
                            alt={airline.name}
                            className="h-8 w-auto mx-auto mb-1 object-contain"
                            loading="lazy"
                          />
                          <span className="text-xs font-medium text-gray-700 block truncate">
                            {airline.name}
                          </span>
                        </div>
                      </label>
                    </div>
                  ))}
                </div>

                {/* Selected Airlines Summary */}
                {selectedAirlines.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {selectedAirlines.map((airlineId) => {
                      const airline = vietnameseAirlines.find(
                        (a) => a.id === airlineId
                      );
                      return airline ? (
                        <Badge
                          key={airlineId}
                          variant="secondary"
                          className="flex items-center gap-1">
                          <img
                            src={airline.logo}
                            alt={airline.name}
                            className="h-3 w-auto"
                          />
                          {airline.name}
                          <button
                            onClick={() => handleAirlineToggle(airlineId)}
                            className="ml-1 text-gray-500 hover:text-gray-700">
                            ×
                          </button>
                        </Badge>
                      ) : null;
                    })}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedAirlines([])}
                      className="text-xs h-6 px-2">
                      Xóa tất cả
                    </Button>
                  </div>
                )}
              </div>

              {/* Search Inputs */}
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
                {/* From */}
                <div className="relative">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Từ
                  </label>
                  <div className="relative">
                    <Plane className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      value={searchForm.from}
                      onChange={(e) =>
                        setSearchForm((prev) => ({
                          ...prev,
                          from: e.target.value,
                        }))
                      }
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Thành phố đi"
                    />
                  </div>
                </div>

                {/* Swap Button */}
                <div className="flex justify-center">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="p-2 rounded-full hover:bg-gray-100"
                    onClick={() =>
                      setSearchForm((prev) => ({
                        ...prev,
                        from: prev.to,
                        to: prev.from,
                      }))
                    }>
                    <ArrowLeftRight className="h-4 w-4" />
                  </Button>
                </div>

                {/* To */}
                <div className="relative">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Đến
                  </label>
                  <div className="relative">
                    <Plane className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 rotate-90" />
                    <input
                      type="text"
                      value={searchForm.to}
                      onChange={(e) =>
                        setSearchForm((prev) => ({
                          ...prev,
                          to: e.target.value,
                        }))
                      }
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Thành phố đến"
                    />
                  </div>
                </div>

                {/* Dates */}
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Ngày đi
                    </label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input
                        type="text"
                        value={searchForm.departDate}
                        onChange={(e) =>
                          setSearchForm((prev) => ({
                            ...prev,
                            departDate: e.target.value,
                          }))
                        }
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                      />
                    </div>
                  </div>
                  {searchForm.tripType === "roundtrip" && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Ngày về
                      </label>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                          type="text"
                          value={searchForm.returnDate}
                          onChange={(e) =>
                            setSearchForm((prev) => ({
                              ...prev,
                              returnDate: e.target.value,
                            }))
                          }
                          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Search Button */}
                <div className="flex flex-col gap-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Hành khách
                    </label>
                    <div className="relative">
                      <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input
                        type="text"
                        value={searchForm.passengers}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        readOnly
                      />
                    </div>
                  </div>
                  <Button
                    size="lg"
                    className="w-full bg-blue-600 hover:bg-blue-700 py-3">
                    <SearchIcon className="h-4 w-4 mr-2" />
                    Tìm kiếm
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Enhanced Sidebar Filters */}
          <div className="lg:col-span-1">
            {/* Mobile Filter Toggle */}
            <div className="lg:hidden mb-4">
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="w-full flex items-center justify-between">
                <div className="flex items-center">
                  <Filter className="h-4 w-4 mr-2" />
                  Bộ lọc
                </div>
                {showFilters ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </Button>
            </div>

            {/* Filter Panel */}
            <div
              className={`space-y-4 ${
                showFilters ? "block" : "hidden lg:block"
              }`}>
              {/* Sort Options */}
              <Card>
                <CardContent>
                  <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                    <SlidersHorizontal className="h-4 w-4 mr-2" />
                    Sắp xếp theo
                  </h3>
                  <div className="space-y-3">
                    {[
                      { label: "Rẻ nhất", value: "price" },
                      { label: "Sớm nhất", value: "departure" },
                      { label: "Nhanh nhất", value: "duration" },
                    ].map((option) => (
                      <label
                        key={option.value}
                        className="flex items-center cursor-pointer">
                        <input
                          type="radio"
                          name="sortBy"
                          value={option.value}
                          checked={filters.sortBy === option.value}
                          onChange={(e) =>
                            setFilters((prev) => ({
                              ...prev,
                              sortBy: e.target.value,
                            }))
                          }
                          className="mr-3 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm font-medium">
                          {option.label}
                        </span>
                      </label>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Time Filter */}
              <Card>
                <CardContent>
                  <h3 className="font-semibold text-gray-900 mb-4">
                    Thời gian cất cánh
                  </h3>
                  <div className="space-y-3">
                    <div className="text-sm text-gray-600">0:00 - 24:00</div>
                    <div className="relative">
                      <input
                        type="range"
                        min="0"
                        max="24"
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                      />
                      <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>0:00</span>
                        <span>24:00</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Airlines Filter */}
              <Card>
                <CardContent>
                  <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                    <Plane className="h-4 w-4 mr-2" />
                    Hãng hàng không
                  </h3>
                  <div className="space-y-3">
                    <label className="flex items-center cursor-pointer p-2 rounded-lg hover:bg-gray-50">
                      <input
                        type="checkbox"
                        checked={selectedAirlines.length === 0}
                        onChange={() => setSelectedAirlines([])}
                        className="mr-3 text-orange-500 focus:ring-orange-500 rounded"
                      />
                      <span className="text-sm font-medium text-orange-600">
                        Tất cả hãng bay
                      </span>
                    </label>
                    {vietnameseAirlines.map((airline) => (
                      <label
                        key={airline.id}
                        className="flex items-center cursor-pointer p-2 rounded-lg hover:bg-gray-50">
                        <input
                          type="checkbox"
                          checked={selectedAirlines.includes(airline.id)}
                          onChange={() => handleAirlineToggle(airline.id)}
                          className="mr-3 text-blue-600 focus:ring-blue-500 rounded"
                        />
                        <img
                          src={airline.logo}
                          alt={airline.name}
                          className="h-6 w-auto mr-2 object-contain"
                          loading="lazy"
                        />
                        <span className="text-sm">{airline.name}</span>
                      </label>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Stops Filter */}
              <Card>
                <CardContent>
                  <h3 className="font-semibold text-gray-900 mb-4">
                    Số điểm dừng
                  </h3>
                  <div className="space-y-3">
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        className="mr-3 text-orange-500 focus:ring-orange-500 rounded"
                      />
                      <span className="text-sm font-medium text-orange-600">
                        Tất cả
                      </span>
                    </label>
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        className="mr-3 text-blue-600 focus:ring-blue-500 rounded"
                      />
                      <span className="text-sm">Bay thẳng</span>
                    </label>
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        className="mr-3 text-blue-600 focus:ring-blue-500 rounded"
                      />
                      <span className="text-sm">1 Điểm dừng</span>
                    </label>
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        className="mr-3 text-blue-600 focus:ring-blue-500 rounded"
                      />
                      <span className="text-sm">2+ Điểm dừng</span>
                    </label>
                  </div>
                </CardContent>
              </Card>

              {/* Flight Time Filter */}
              <Card>
                <CardContent>
                  <h3 className="font-semibold text-gray-900 mb-4">
                    Khoảng thời gian
                  </h3>
                  <div className="space-y-3">
                    <div className="text-sm text-gray-600">Thời gian bay</div>
                    <div className="text-sm text-gray-600">0:00 - 36:00</div>
                    <div className="relative">
                      <input
                        type="range"
                        min="0"
                        max="36"
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Enhanced Results */}
          <div className="lg:col-span-3">
            {/* Results Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-gray-900 flex items-center">
                  <span className="mr-2">Chọn chiều đi</span>
                  <Button variant="ghost" size="sm">
                    <SlidersHorizontal className="h-4 w-4" />
                  </Button>
                </h2>
                <p className="text-gray-600 text-sm">
                  {filteredFlights.length} Kết quả
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Sắp xếp theo</span>
                <select className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                  <option>Rẻ nhất</option>
                  <option>Sớm nhất</option>
                  <option>Nhanh nhất</option>
                </select>
              </div>
            </div>

            {/* Enhanced Flight Results */}
            <div className="space-y-3">
              {filteredFlights.length === 0 ? (
                <Card className="border border-gray-200">
                  <CardContent className="p-8 text-center">
                    <Plane className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      Không tìm thấy chuyến bay
                    </h3>
                    <p className="text-gray-500">
                      Không có chuyến bay nào từ hãng hàng không đã chọn. Vui
                      lòng thử chọn hãng khác hoặc "Tất cả hãng bay".
                    </p>
                    <Button
                      variant="outline"
                      onClick={() => setSelectedAirlines([])}
                      className="mt-4">
                      Xem tất cả chuyến bay
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                filteredFlights.map((flight) => (
                  <Card
                    key={flight.id}
                    className="hover:shadow-md transition-shadow border border-gray-200">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        {/* Flight Info */}
                        <div className="flex items-center space-x-6 flex-1">
                          {/* Airline */}
                          <div className="flex flex-col items-center min-w-[80px]">
                            <div className="h-10 w-16 flex items-center justify-center mb-1">
                              <img
                                src={flight.airline.logo}
                                alt={flight.airline.name}
                                className="h-8 w-auto object-contain"
                                loading="lazy"
                              />
                            </div>
                            <div className="text-xs font-medium text-center">
                              {flight.flightNumber}
                            </div>
                            <div className="text-xs text-gray-500 text-center">
                              {flight.class}
                            </div>
                            <div className="text-xs text-blue-600 text-center">
                              {flight.baggage}
                            </div>
                          </div>

                          {/* Flight Times */}
                          <div className="flex items-center space-x-4 flex-1">
                            <div className="text-center">
                              <div className="text-xl font-bold">
                                {flight.departure.time}
                              </div>
                              <div className="text-sm text-gray-600">
                                {flight.departure.city}
                              </div>
                              <div className="text-xs text-gray-500">
                                {flight.departure.code}
                              </div>
                            </div>

                            <div className="flex flex-col items-center px-4">
                              <div className="text-xs text-gray-500 mb-1">
                                {flight.duration}
                              </div>
                              <div className="flex items-center">
                                <div className="h-px bg-gray-300 w-16"></div>
                                <ArrowRight className="h-4 w-4 text-gray-400 mx-1" />
                              </div>
                              <div className="text-xs text-gray-500 mt-1">
                                {flight.stops === 0
                                  ? "Bay thẳng"
                                  : `${flight.stops} điểm dừng`}
                              </div>
                            </div>

                            <div className="text-center">
                              <div className="text-xl font-bold">
                                {flight.arrival.time}
                              </div>
                              <div className="text-sm text-gray-600">
                                {flight.arrival.city}
                              </div>
                              <div className="text-xs text-gray-500">
                                {flight.arrival.code}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Price and Action */}
                        <div className="flex flex-col items-end space-y-2 min-w-[140px]">
                          <div className="text-right">
                            <div className="text-xl font-bold text-orange-600">
                              {formatPrice(flight.price.amount)}{" "}
                              {flight.price.currency}
                            </div>
                            <div className="text-xs text-gray-500">
                              Xem chi tiết
                            </div>
                          </div>
                          <Button
                            size="sm"
                            className="bg-blue-600 hover:bg-blue-700 px-6">
                            Chọn
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>

            {/* Load More */}
            <div className="text-center mt-8">
              <Button variant="outline" size="lg">
                Xem thêm chuyến bay
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Search;
