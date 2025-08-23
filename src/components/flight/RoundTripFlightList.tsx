import React, { useState } from "react";
import { Card, CardContent } from "../ui/card";
import { Button } from "../ui/button";
import { Plane, CheckCircle2 } from "lucide-react";
import FlightCard from "./FlightCard";
import { formatPrice, formatDateTime } from "../../services/flightApiService";
import type {
  FlightSearchApiResult,
  FlightSearchResponseData,
} from "../../shared/types/search-api.types";
import { isRoundTripResponse } from "../../shared/types/search-api.types";

interface RoundTripFlightListProps {
  flights: FlightSearchApiResult[];
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
  disableInboundTab?: boolean;
}

const RoundTripFlightList: React.FC<RoundTripFlightListProps> = ({
  flights,
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
  disableInboundTab = false,
}) => {
  const [expandedFlightIds, setExpandedFlightIds] = useState<{
    outbound: number | null;
    inbound: number | null;
  }>({ outbound: null, inbound: null });
  const [detailsTabs, setDetailsTabs] = useState<{
    outbound: string;
    inbound: string;
  }>({ outbound: "flight", inbound: "flight" });

  const toggleFlightDetails = (
    dir: "outbound" | "inbound",
    flightId: number
  ) => {
    setExpandedFlightIds((prev) => ({
      ...prev,
      [dir]: prev[dir] === flightId ? null : flightId,
    }));
    setDetailsTabs((prev) => ({ ...prev, [dir]: "flight" }));
  };

  const currentFlights = flights;
  const expandedFlightId = expandedFlightIds[activeTab];
  const detailsActiveTab = detailsTabs[activeTab];

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

  const renderSelectedBanner = (
    dir: "outbound" | "inbound",
    flight: FlightSearchApiResult | null
  ) => {
    if (!flight) return null;
    return (
      <div
        className={`${
          dir === "outbound"
            ? "bg-green-50 border-green-200"
            : "bg-blue-50 border-blue-200"
        } border-b p-4`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CheckCircle2
              className={`h-5 w-5 ${
                dir === "outbound" ? "text-green-600" : "text-blue-600"
              }`}
            />
            <div className="flex items-center flex-wrap gap-x-3 gap-y-1">
              <span
                className={`font-semibold ${
                  dir === "outbound" ? "text-green-700" : "text-blue-700"
                }`}>
                {dir === "outbound"
                  ? "✓ Chiều đi đã chọn:"
                  : "✓ Chiều về đã chọn:"}
              </span>
              <span className="font-medium">{flight.flight_number}</span>
              <span className="text-sm text-gray-600">
                {formatDateTime(flight.departure_time).time} –{" "}
                {formatDateTime(flight.arrival_time).time}
              </span>
              <span className="text-orange-600 font-bold">
                {formatPrice(flight.pricing.grand_total)}
              </span>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onClearSelectedFlight(dir)}
            className={`${
              dir === "outbound"
                ? "text-red-600 hover:text-red-700 hover:bg-red-50"
                : "text-red-600 hover:text-red-700 hover:bg-red-50"
            }`}>
            Thay đổi
          </Button>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Round-trip Tab Navigation */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {/* Selected banners */}
        {renderSelectedBanner("outbound", selectedOutboundFlight)}
        {renderSelectedBanner("inbound", selectedInboundFlight)}

        <div className="flex">
          {/* Chiều đi: KHÔNG disable để user quay lại chọn/đổi */}
          <Button
            variant={activeTab === "outbound" ? "default" : "ghost"}
            onClick={() => setActiveTab("outbound")}
            className="flex-1 rounded-none py-3">
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

          {/* Chiều về: chỉ disable khi CHƯA chọn chiều đi */}
          <Button
            variant={activeTab === "inbound" ? "default" : "ghost"}
            onClick={() => !disableInboundTab && setActiveTab("inbound")}
            disabled={disableInboundTab}
            className="flex-1 rounded-none py-3">
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

            const isSelected =
              (activeTab === "outbound" &&
                selectedOutboundFlight?.flight_id === flight.flight_id) ||
              (activeTab === "inbound" &&
                selectedInboundFlight?.flight_id === flight.flight_id);

            return (
              <div
                key={`${activeTab}-${flight.flight_id}`}
                className={`rounded-xl transition-all ${
                  isSelected
                    ? "ring-2 ring-blue-500/60 ring-offset-1"
                    : "ring-0"
                }`}>
                {/* Nếu FlightCard hỗ trợ isSelected, truyền xuống; nếu không, vẫn có ring ở wrapper */}
                <FlightCard
                  flight={flight}
                  isExpanded={expandedFlightId === flight.flight_id}
                  onToggleDetails={() =>
                    toggleFlightDetails(activeTab, flight.flight_id)
                  }
                  onSelect={() => onFlightSelect(flight)}
                  sortBy={sortBy}
                  airlineLogo={airlineInfo.logo}
                  activeTab={detailsActiveTab}
                  setActiveTab={(tab) =>
                    setDetailsTabs((prev) => ({ ...prev, [activeTab]: tab }))
                  }
                  isSelected={isSelected as unknown as boolean} // backward compat
                />
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default RoundTripFlightList;
