import React, { useState } from "react";
import { Card, CardContent } from "./ui/card";
import { Plane } from "lucide-react";
import FlightCard from "./FlightCard";
import type { FlightSearchApiResult } from "../shared/types/search-api.types";

interface OneWayFlightListProps {
  flights: FlightSearchApiResult[];
  sortBy: string;
  vietnameseAirlines: Array<{
    id: string;
    name: string;
    logo: string;
    code: string;
  }>;
  onFlightSelect: (flight: FlightSearchApiResult) => void;
  error: string | null;
}

const OneWayFlightList: React.FC<OneWayFlightListProps> = ({
  flights,
  sortBy,
  vietnameseAirlines,
  onFlightSelect,
  error,
}) => {
  const [expandedFlightId, setExpandedFlightId] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<string>("flight");

  const toggleFlightDetails = (flightId: number) => {
    setExpandedFlightId((prev) => (prev === flightId ? null : flightId));
    setActiveTab("flight");
  };

  if (error) {
    return (
      <Card className="border border-red-200 bg-red-50">
        <CardContent className="p-6 text-center">
          <div className="text-red-600 mb-2">⚠️</div>
          <h3 className="text-lg font-medium text-red-900 mb-2">
            Có lỗi xảy ra
          </h3>
          <p className="text-red-700">{error}</p>
        </CardContent>
      </Card>
    );
  }

  if (flights.length === 0) {
    return (
      <Card className="border border-gray-200">
        <CardContent className="p-8 text-center">
          <Plane className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Chưa có kết quả tìm kiếm
          </h3>
          <p className="text-gray-500">
            Vui lòng sử dụng form tìm kiếm ở trên để tìm chuyến bay.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {flights.map((flight) => {
        const airlineInfo =
          vietnameseAirlines.find(
            (a) => a.name.toLowerCase() === flight.airline_name.toLowerCase()
          ) || vietnameseAirlines[0];

        return (
          <FlightCard
            key={flight.flight_id}
            flight={flight}
            isExpanded={expandedFlightId === flight.flight_id}
            onToggleDetails={() => toggleFlightDetails(flight.flight_id)}
            onSelect={() => onFlightSelect(flight)}
            sortBy={sortBy}
            airlineLogo={airlineInfo.logo}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
          />
        );
      })}
    </div>
  );
};

export default OneWayFlightList;
