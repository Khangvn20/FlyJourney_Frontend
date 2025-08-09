import React from "react";
import { Card, CardContent } from "../ui/card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Plane, Clock, Users, Wifi } from "lucide-react";
import type { FlightResultData } from "../../shared/types";
import { flightResults } from "../../assets/mock";

interface FlightResultCardProps {
  flight?: FlightResultData;
  onSelect?: (flight: FlightResultData) => void;
}

// Lấy flight đầu tiên làm default
const defaultFlight = flightResults[0];

const FlightResultCard: React.FC<FlightResultCardProps> = ({
  flight = defaultFlight,
  onSelect,
}) => {
  const handleSelect = () => {
    if (onSelect) {
      onSelect(flight);
    }
  };

  return (
    <Card className="shadow-soft hover:shadow-large transition-all duration-300 border border-gray-200">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <Plane className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-lg text-gray-900">
                {flight.flightNumber} – {flight.airline}
              </h3>
              <p className="text-sm text-gray-600">{flight.aircraft}</p>
            </div>
          </div>
          <Badge className="bg-green-100 text-green-800 hover:bg-green-200">
            {flight.stops === 0 ? "Bay thẳng" : `${flight.stops} điểm dừng`}
          </Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          {/* Departure */}
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900">
              {flight.departure.time}
            </p>
            <p className="text-sm text-gray-600">{flight.departure.date}</p>
            <p className="font-medium text-gray-900">
              {flight.departure.airport}
            </p>
            <p className="text-xs text-gray-500">({flight.departure.code})</p>
          </div>

          {/* Duration */}
          <div className="text-center flex flex-col items-center justify-center">
            <div className="flex items-center space-x-2 mb-2">
              <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
              <div className="flex-1 h-0.5 bg-gray-300 relative">
                <Plane className="h-4 w-4 text-blue-600 absolute -top-2 left-1/2 transform -translate-x-1/2" />
              </div>
              <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
            </div>
            <p className="text-sm font-medium text-gray-600">
              {flight.duration}
            </p>
          </div>

          {/* Arrival */}
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900">
              {flight.arrival.time}
            </p>
            <p className="text-sm text-gray-600">{flight.arrival.date}</p>
            <p className="font-medium text-gray-900">
              {flight.arrival.airport}
            </p>
            <p className="text-xs text-gray-500">({flight.arrival.code})</p>
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1">
              <Clock className="h-4 w-4 text-gray-400" />
              <span className="text-sm text-gray-600">{flight.class}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Users className="h-4 w-4 text-gray-400" />
              <span className="text-sm text-gray-600">
                {flight.availableSeats} chỗ trống
              </span>
            </div>
            {flight.amenities.includes("Wifi") && (
              <div className="flex items-center space-x-1">
                <Wifi className="h-4 w-4 text-green-500" />
                <span className="text-sm text-green-600">Wifi</span>
              </div>
            )}
          </div>

          <div className="flex items-center space-x-4">
            <div className="text-right">
              <p className="text-2xl font-bold text-blue-600">
                {flight.price.formatted}
              </p>
              <p className="text-sm text-gray-600">một chiều</p>
            </div>
            <Button
              onClick={handleSelect}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
              Chọn chuyến bay
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default FlightResultCard;
