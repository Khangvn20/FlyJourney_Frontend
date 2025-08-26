import React from "react";
import { Card, CardContent } from "../ui/card";
import { Button } from "../ui/button";
import { CheckCircle2 } from "lucide-react";
import { formatPrice, formatDateTime } from "../../shared/utils/format";
import type { FlightSearchApiResult } from "../../shared/types/search-api.types";

interface RoundTripSummaryProps {
  outbound: FlightSearchApiResult;
  inbound: FlightSearchApiResult;
  onEditOutbound: () => void;
  onEditInbound: () => void;
  onConfirm: () => void;
}

const RoundTripSummary: React.FC<RoundTripSummaryProps> = ({
  outbound,
  inbound,
  onEditOutbound,
  onEditInbound,
  onConfirm,
}) => {
  const renderFlight = (
    dir: "outbound" | "inbound",
    flight: FlightSearchApiResult,
    onEdit: () => void
  ) => {
    return (
      <div className="flex items-center justify-between p-4 border-b last:border-0">
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
              }`}
            >
              {dir === "outbound" ? "✓ Chiều đi" : "✓ Chiều về"}
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
        <Button variant="ghost" size="sm" onClick={onEdit}>
          Thay đổi
        </Button>
      </div>
    );
  };

  return (
    <Card className="border border-gray-200">
      <CardContent className="p-0">
        {renderFlight("outbound", outbound, onEditOutbound)}
        {renderFlight("inbound", inbound, onEditInbound)}
        <div className="p-4 text-right">
          <Button onClick={onConfirm}>Tiếp tục</Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default RoundTripSummary;

