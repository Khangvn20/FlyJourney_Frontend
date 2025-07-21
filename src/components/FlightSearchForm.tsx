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
} from "lucide-react";
import { format } from "date-fns";

const FlightSearchForm: React.FC = () => {
  const [departureDate, setDepartureDate] = useState<Date>();
  const [returnDate, setReturnDate] = useState<Date>();
  const [tripType, setTripType] = useState("round-trip");

  const handleSearch = () => {
    console.log("Searching flights...");
  };

  return (
    <Card className="w-full max-w-6xl mx-auto shadow-large border-0 bg-white/80 backdrop-blur-sm">
      <CardContent className="p-8">
        {/* Trip Type Selector */}
        <div className="flex items-center space-x-6 mb-8">
          <div className="flex items-center space-x-2">
            <input
              type="radio"
              id="round-trip"
              name="trip-type"
              value="round-trip"
              checked={tripType === "round-trip"}
              onChange={(e) => setTripType(e.target.value)}
              className="w-4 h-4 text-blue-600"
            />
            <Label htmlFor="round-trip" className="font-medium">
              Khứ hồi
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <input
              type="radio"
              id="one-way"
              name="trip-type"
              value="one-way"
              checked={tripType === "one-way"}
              onChange={(e) => setTripType(e.target.value)}
              className="w-4 h-4 text-blue-600"
            />
            <Label htmlFor="one-way" className="font-medium">
              Một chiều
            </Label>
          </div>
        </div>

        {/* Search Form */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-end">
          {/* From */}
          <div className="lg:col-span-3 space-y-2">
            <Label htmlFor="from" className="text-sm font-medium text-gray-700">
              Từ
            </Label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                id="from"
                placeholder="Thành phố hoặc Sân bay"
                className="pl-10 h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Swap Button */}
          <div className="lg:col-span-1 flex justify-center">
            <Button
              variant="outline"
              size="sm"
              className="h-10 w-10 rounded-full border-gray-200 hover:border-blue-300 hover:bg-blue-50 bg-transparent">
              <ArrowRightLeft className="h-4 w-4" />
            </Button>
          </div>

          {/* To */}
          <div className="lg:col-span-3 space-y-2">
            <Label htmlFor="to" className="text-sm font-medium text-gray-700">
              Đến
            </Label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                id="to"
                placeholder="Thành phố hoặc Sân bay"
                className="pl-10 h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Departure Date */}
          <div className="lg:col-span-2 space-y-2">
            <Label className="text-sm font-medium text-gray-700">
              Khởi hành
            </Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full h-12 justify-start text-left font-normal border-gray-200 hover:border-blue-300 bg-transparent">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {departureDate
                    ? format(departureDate, "MMM dd, yyyy")
                    : "Chọn ngày"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={departureDate}
                  onSelect={setDepartureDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Return Date */}
          {tripType === "round-trip" && (
            <div className="lg:col-span-2 space-y-2">
              <Label className="text-sm font-medium text-gray-700">Về</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full h-12 justify-start text-left font-normal border-gray-200 hover:border-blue-300 bg-transparent">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {returnDate
                      ? format(returnDate, "MMM dd, yyyy")
                      : "Chọn ngày"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={returnDate}
                    onSelect={setReturnDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          )}

          {/* Passengers & Class */}
          <div
            className={`${
              tripType === "round-trip" ? "lg:col-span-1" : "lg:col-span-3"
            } space-y-2`}>
            <Label className="text-sm font-medium text-gray-700">
              Hành khách
            </Label>
            <Select defaultValue="1-economy">
              <SelectTrigger className="h-12 border-gray-200 min-w-[180px]">
                <div className="flex items-center w-full">
                  <Users className="mr-2 h-4 w-4 flex-shrink-0" />
                  <SelectValue className="text-sm" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1-economy">
                  1 Người lớn, Phổ thông
                </SelectItem>
                <SelectItem value="2-economy">
                  2 Người lớn, Phổ thông
                </SelectItem>
                <SelectItem value="1-business">
                  1 Người lớn, Thương gia
                </SelectItem>
                <SelectItem value="2-business">
                  2 Người lớn, Thương gia
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Search Button */}
          <div className="lg:col-span-1">
            <Button
              onClick={handleSearch}
              className="w-full h-12 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200">
              <Search className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Popular Destinations */}
        <div className="mt-8 pt-6 border-t border-gray-100">
          <p className="text-sm text-gray-600 mb-3">Điểm đến phổ biến:</p>
          <div className="flex flex-wrap gap-2">
            {[
              "Hà Nội",
              "TP.HCM",
              "Đà Nẵng",
              "Nha Trang",
              "Phú Quốc",
              "Cần Thơ",
            ].map((city) => (
              <Button
                key={city}
                variant="outline"
                size="sm"
                className="text-xs border-gray-200 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 bg-transparent">
                {city}
              </Button>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default FlightSearchForm;
