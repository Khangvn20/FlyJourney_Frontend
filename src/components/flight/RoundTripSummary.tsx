import React from "react";
import { Card, CardContent } from "../ui/card";
import { Button } from "../ui/button";
import { CheckCircle2, ArrowRight, Clock } from "lucide-react";
import {
  formatPrice,
  formatDateTime,
  formatDuration,
} from "../../shared/utils/format";
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
  const totalPrice =
    (outbound?.pricing?.grand_total ?? 0) +
    (inbound?.pricing?.grand_total ?? 0);
  const totalDurationMinutes =
    (outbound?.duration_minutes ?? 0) + (inbound?.duration_minutes ?? 0);

  const renderFlight = (
    dir: "outbound" | "inbound",
    flight: FlightSearchApiResult,
    onEdit: () => void
  ) => {
    const departure = formatDateTime(flight.departure_time || "");
    const arrival = formatDateTime(flight.arrival_time || "");
    const duration = flight.duration_minutes
      ? formatDuration(flight.duration_minutes)
      : null;
    const adultBaseWithTax =
      (flight.pricing.base_prices?.adult || 0) + (flight.pricing.taxes?.adult || 0);
    const adultDisplayPrice =
      flight.pricing.total_prices?.adult && flight.pricing.total_prices.adult > 0
        ? flight.pricing.total_prices.adult
        : adultBaseWithTax > 0
        ? adultBaseWithTax
        : flight.pricing.grand_total;

    return (

      <div className="flex flex-col gap-3 border-b border-slate-100 px-5 py-4 last:border-b-0 md:flex-row md:items-center md:justify-between">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2 text-sm font-semibold text-slate-800">
            <CheckCircle2 className={`h-4 w-4 ${dir === "outbound" ? "text-green-600" : "text-blue-600"}`} />
            <span>{dir === "outbound" ? "Chiều đi" : "Chiều về"}</span>
            <span className="text-slate-500">•</span>
            <span className="font-medium text-slate-900">
              {flight.flight_number}
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-3 text-sm text-slate-600">
            <span className="font-semibold text-slate-900">
              {flight.departure_airport_code} → {flight.arrival_airport_code}
            </span>
            {departure.time && arrival.time && (
              <span className="flex items-center gap-1 text-xs">
                <Clock className="h-3.5 w-3.5" />
                {departure.time} – {arrival.time}
              </span>
            )}
            {duration && (
              <span className="flex items-center gap-1 text-xs">
                <Clock className="h-3.5 w-3.5" />
                {duration}
              </span>
            )}
            <div className="flex items-center gap-1 text-orange-600 font-semibold">
              <span className="text-[11px] uppercase tracking-wide text-orange-500">
                Giá NL (đã gồm thuế/phí)
              </span>
              <span>{formatPrice(adultDisplayPrice)}</span>
            </div>
          </div>
          <div className="text-xs text-slate-500">
            {departure.date} • {flight.departure_airport} → {flight.arrival_airport}
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={onEdit}
          className="self-start md:self-auto">
          Thay đổi
        </Button>
      </div>
    );
  };

  return (
    <Card className="rounded-2xl border border-blue-100 bg-white shadow-sm">
      <CardContent className="p-0">
        <div className="border-b border-blue-100 px-5 py-4">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-blue-500">
            Tóm tắt chuyến bay khứ hồi
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-slate-600">
            <span className="font-semibold text-slate-900">Hoàn tất lựa chọn</span>
            <ArrowRight className="h-4 w-4 text-slate-300" />
            <span>Kiểm tra lại thông tin trước khi tiếp tục</span>
          </div>
        </div>

        {renderFlight("outbound", outbound, onEditOutbound)}
        {renderFlight("inbound", inbound, onEditInbound)}

        <div className="flex flex-col gap-4 border-t border-blue-100 px-5 py-5 md:flex-row md:items-center md:justify-between">
          <div className="space-y-1 text-sm text-slate-600">
            <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Tổng giá dự kiến
            </span>
            <p className="text-xl font-bold text-orange-600">
              {formatPrice(totalPrice)}
            </p>
            {totalDurationMinutes > 0 && (
              <p className="flex items-center gap-2 text-xs text-slate-500">
                <Clock className="h-3.5 w-3.5" />
                Tổng thời gian bay {formatDuration(totalDurationMinutes)}
              </p>
            )}
          </div>
          <Button
            size="lg"
            onClick={onConfirm}
            className="bg-blue-600 px-8 text-white hover:bg-blue-700">
            Tiếp tục
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default RoundTripSummary;


