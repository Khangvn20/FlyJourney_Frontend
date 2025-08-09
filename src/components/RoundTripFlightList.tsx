import React, { useState } from "react";
import { Card, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { Plane } from "lucide-react";
import FlightCard from "./FlightCard";
import { formatPrice, formatDateTime } from "../services/flightApiService";
import type {
  FlightSearchApiResult,
  FlightSearchResponseData,
} from "../shared/types/search-api.types";
import { isRoundTripResponse } from "../shared/types/search-api.types";

interface RoundTripFlightListProps {
  outboundFlights: FlightSearchApiResult[];
  inboundFlights: FlightSearchApiResult[];
  activeTab: "outbound" | "inbound";
  setActiveTab: (tab: "outbound" | "inbound") => void;
  selectedOutboundFlight: FlightSearchApiResult | null;
  selectedInboundFlight: FlightSearchApiResult | null;
  onFlightSelect: (flight: FlightSearchApiResult) => void;
  onClearSelectedFlight: (direction: "outbound" | "inbound") => void;
  sortBy: string;
  vietnameseAirlines: Array<{
    id: string;
    name: string;
    logo: string;
    code: string;
  }>;
  searchInfo: FlightSearchResponseData | null;
  error: string | null;
}

const RoundTripFlightList: React.FC<RoundTripFlightListProps> = ({
  outboundFlights,
  inboundFlights,
  activeTab,
  setActiveTab,
  selectedOutboundFlight,
  selectedInboundFlight,
  onFlightSelect,
  onClearSelectedFlight,
  sortBy,
  vietnameseAirlines,
  searchInfo,
  error,
}) => {
  const [expandedFlightId, setExpandedFlightId] = useState<number | null>(null);
  const [detailsActiveTab, setDetailsActiveTab] = useState<string>("flight");

  const toggleFlightDetails = (flightId: number) => {
    setExpandedFlightId((prev) => (prev === flightId ? null : flightId));
    setDetailsActiveTab("flight");
  };

  const currentFlights =
    activeTab === "inbound" ? inboundFlights : outboundFlights;

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

  return (
    <div className="space-y-6">
      {/* Round-trip Tab Navigation */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {/* Selected Outbound Flight Display */}
        {selectedOutboundFlight && (
          <div className="bg-green-50 border-b border-green-200 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <span className="text-green-600 font-semibold">
                    ✓ Chiều đi đã chọn:
                  </span>
                  <span className="font-medium">
                    {selectedOutboundFlight.flight_number}
                  </span>
                  <span className="text-sm text-gray-600">
                    {formatDateTime(selectedOutboundFlight.departure_time).time}{" "}
                    - {formatDateTime(selectedOutboundFlight.arrival_time).time}
                  </span>
                </div>
                <div className="text-orange-600 font-bold">
                  {formatPrice(selectedOutboundFlight.pricing.grand_total)}
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onClearSelectedFlight("outbound")}
                className="text-red-600 hover:text-red-700 hover:bg-red-50">
                Thay đổi
              </Button>
            </div>
          </div>
        )}

        <div className="flex">
          <Button
            variant={activeTab === "outbound" ? "default" : "ghost"}
            onClick={() => setActiveTab("outbound")}
            className="flex-1 rounded-none py-3"
            disabled={selectedOutboundFlight !== null}>
            <div className="text-center">
              <div className="font-semibold">
                {selectedOutboundFlight ? "✓ Chiều đi" : "Chiều đi"}
              </div>
              <div className="text-xs text-gray-500">
                {searchInfo && isRoundTripResponse(searchInfo) && (
                  <>
                    🛫 {searchInfo.departure_airport} →{" "}
                    {searchInfo.arrival_airport}
                  </>
                )}
              </div>
            </div>
          </Button>
          <Button
            variant={activeTab === "inbound" ? "default" : "ghost"}
            onClick={() => setActiveTab("inbound")}
            className="flex-1 rounded-none py-3"
            disabled={!selectedOutboundFlight}>
            <div className="text-center">
              <div className="font-semibold">
                {selectedInboundFlight ? "✓ Chiều về" : "Chiều về"}
              </div>
              <div className="text-xs text-gray-500">
                {searchInfo && isRoundTripResponse(searchInfo) && (
                  <>
                    🛬 {searchInfo.arrival_airport} →{" "}
                    {searchInfo.departure_airport}
                  </>
                )}
              </div>
            </div>
          </Button>
        </div>
      </div>

      {/* Flight List */}
      <div className="space-y-3">
        {currentFlights.length === 0 ? (
          <Card className="border border-gray-200">
            <CardContent className="p-8 text-center">
              <Plane className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {activeTab === "outbound"
                  ? "Chưa có chuyến bay chiều đi"
                  : "Chưa có chuyến bay chiều về"}
              </h3>
              <p className="text-gray-500">
                {activeTab === "outbound"
                  ? "Vui lòng sử dụng form tìm kiếm ở trên để tìm chuyến bay."
                  : "Vui lòng chọn chuyến bay chiều đi trước."}
              </p>
            </CardContent>
          </Card>
        ) : (
          currentFlights.map((flight) => {
            const airlineInfo =
              vietnameseAirlines.find(
                (a) =>
                  a.name.toLowerCase() === flight.airline_name.toLowerCase()
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
                activeTab={detailsActiveTab}
                setActiveTab={setDetailsActiveTab}
              />
            );
          })
        )}
      </div>
    </div>
  );
};

export default RoundTripFlightList;
