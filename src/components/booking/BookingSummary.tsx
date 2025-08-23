import React from "react";
import type { FlightSearchApiResult } from "../../shared/types/search-api.types";
import { formatDateTime, formatPrice } from "../../services/flightApiService";
import { Button } from "../ui/button";
import {
  PlaneTakeoff,
  PlaneLanding,
  Clock,
  ArrowRightLeft,
  TimerReset,
  ChevronRight,
} from "lucide-react";

export interface BookingSelection {
  tripType: "one-way" | "round-trip";
  outbound: FlightSearchApiResult;
  inbound?: FlightSearchApiResult;
  totalPrice: number;
  currency: string;
}

interface BookingSummaryProps {
  selection: BookingSelection;
  onConfirm?: () => void;
  onChangeFlights?: () => void;
}

const FlightInfoCard: React.FC<{
  title: string;
  flight: FlightSearchApiResult;
  highlight?: boolean;
}> = ({ title, flight, highlight }) => {
  const dep = formatDateTime(flight.departure_time);
  const arr = formatDateTime(flight.arrival_time);
  const durationHours = (flight.duration_minutes / 60).toFixed(1);
  const stopsLabel =
    flight.stops_count === 0 ? "Bay thẳng" : `${flight.stops_count} điểm dừng`;

  const airlineCode = flight.airline_name
    ?.split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 3)
    .toUpperCase();

  return (
    <div
      className={`relative overflow-hidden group rounded-xl border bg-white/90 backdrop-blur-sm shadow-sm transition-all ${
        highlight
          ? "border-blue-300 shadow-blue-100/60 ring-1 ring-blue-200"
          : "border-gray-200 hover:border-blue-200"
      }`}>
      <div className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-br from-blue-50/60 via-transparent to-indigo-50/60" />
      <div className="p-4 relative z-10 space-y-4">
        <div className="flex items-start justify-between">
          <div>
            <h4 className="text-[13px] font-bold tracking-wide text-blue-700 flex items-center gap-1 uppercase">
              <ArrowRightLeft className="w-3.5 h-3.5" /> {title}
            </h4>
            <div className="mt-1 flex items-center gap-2">
              <span className="inline-flex items-center justify-center h-7 px-3 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs font-semibold shadow">
                {flight.flight_number}
              </span>
              <span className="text-[11px] font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded-md">
                {airlineCode}
              </span>
            </div>
          </div>
          <div className="flex flex-col items-end text-right gap-1">
            <span className="text-[11px] px-2 py-1 rounded-full bg-blue-50 text-blue-600 font-medium">
              {stopsLabel}
            </span>
            <span className="text-[10px] text-gray-400">
              {flight.flight_class} • {flight.total_seats} ghế
            </span>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center text-sm">
          {/* Departure */}
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-blue-600 text-white shadow-sm">
                <PlaneTakeoff className="w-4 h-4" />
              </div>
              <div>
                <p className="text-base font-semibold text-gray-900 leading-none">
                  {dep.time}
                </p>
                <p className="text-[11px] text-gray-500 mt-0.5">{dep.date}</p>
              </div>
            </div>
            <p className="text-[11px] text-gray-600 pl-10 -mt-1">
              {flight.departure_airport} ({flight.departure_airport_code})
            </p>
          </div>
          {/* Timeline */}
          <div className="relative flex flex-col items-center justify-center">
            <div className="w-full flex items-center justify-center">
              <div className="flex-1 h-1 bg-gradient-to-r from-blue-200 via-blue-400 to-indigo-300 rounded-full relative overflow-hidden">
                <div className="absolute inset-0 bg-[linear-gradient(110deg,#ffffff22,transparent,transparent)] animate-[shine_2.2s_linear_infinite]" />
              </div>
            </div>
            <div className="mt-2 flex flex-col items-center gap-1">
              <div className="flex items-center gap-1 text-[11px] font-medium text-gray-600">
                <Clock className="w-3.5 h-3.5 text-blue-500" />
                <span>{durationHours}h</span>
              </div>
              <span className="text-[10px] text-gray-400 tracking-wide uppercase">
                {stopsLabel}
              </span>
            </div>
          </div>
          {/* Arrival */}
          <div className="space-y-1 md:text-right">
            <div className="flex items-center gap-2 md:justify-end">
              <div className="p-2 rounded-lg bg-indigo-600 text-white shadow-sm">
                <PlaneLanding className="w-4 h-4" />
              </div>
              <div className="text-left md:text-right">
                <p className="text-base font-semibold text-gray-900 leading-none">
                  {arr.time}
                </p>
                <p className="text-[11px] text-gray-500 mt-0.5">{arr.date}</p>
              </div>
            </div>
            <p className="text-[11px] text-gray-600 md:pr-10 md:text-right -mt-1 md:pl-0 pl-10">
              {flight.arrival_airport} ({flight.arrival_airport_code})
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

const BookingSummary: React.FC<BookingSummaryProps> = ({
  selection,
  onConfirm,
  onChangeFlights,
}) => {
  return (
    <div className="space-y-7 animate-[fadeIn_.4s_ease]">
      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl border border-blue-100 bg-gradient-to-br from-white via-blue-50/60 to-indigo-50/40 p-6 shadow-sm">
        <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-blue-200/30 blur-3xl" />
        <div className="absolute -bottom-12 -left-12 w-56 h-56 rounded-full bg-indigo-200/30 blur-3xl" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h3 className="text-xl font-bold tracking-tight bg-gradient-to-r from-blue-700 to-indigo-700 bg-clip-text text-transparent flex items-center gap-2">
              <TimerReset className="w-5 h-5 text-blue-600" /> Xác nhận giữ chỗ
              chuyến bay
            </h3>
            <p className="mt-1 text-sm text-gray-600 max-w-xl">
              Kiểm tra kỹ thông tin trước khi điền hành khách & chọn phương thức
              giữ chỗ / thanh toán. Bạn vẫn có thể quay lại thay đổi ở bước sau.
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <div className="flex items-center gap-1 px-2 py-1 bg-white/70 backdrop-blur rounded-md border border-blue-100 text-blue-700 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              Sẵn sàng đặt
            </div>
            {selection.tripType === "round-trip" && (
              <div className="px-2 py-1 rounded-md bg-indigo-600 text-white font-medium shadow">
                Khứ hồi
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Flights */}
      <div className="grid gap-5 md:gap-6">
        <FlightInfoCard
          title="Chiều đi"
          flight={selection.outbound}
          highlight
        />
        {selection.tripType === "round-trip" && selection.inbound && (
          <FlightInfoCard
            title="Chiều về"
            flight={selection.inbound}
            highlight={false}
          />
        )}
      </div>

      {/* Pricing & Actions */}
      <div className="relative overflow-hidden rounded-2xl border border-blue-100 bg-white shadow-sm p-5 md:p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div className="flex items-start gap-4 flex-1">
          <div className="p-3 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-md">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-semibold tracking-wide text-blue-600 uppercase">
              Tổng giá
            </p>
            <p className="text-3xl font-extrabold text-gray-900 mt-1 leading-none">
              {formatPrice(selection.totalPrice)}
            </p>
            <p className="text-[11px] text-gray-500 mt-2">
              Đã bao gồm toàn bộ thuế & phụ phí ({selection.currency}). Giá hiển
              thị là cuối cùng.
            </p>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
          <Button
            variant="ghost"
            onClick={onChangeFlights}
            className="sm:w-auto w-full border border-red-200 bg-gradient-to-r from-red-50 to-rose-50 text-red-600 hover:text-red-700 hover:bg-red-100/70">
            <span className="flex items-center gap-1 text-sm">
              <ChevronRight className="w-4 h-4 rotate-180" /> Chọn lại
            </span>
          </Button>
          <Button
            onClick={onConfirm}
            className="sm:w-auto w-full shadow-lg shadow-blue-500/20 hover:shadow-blue-600/30 bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 hover:from-blue-700 hover:via-indigo-700 hover:to-violet-700">
            <span className="flex items-center gap-2 text-sm font-semibold tracking-wide">
              Tiếp tục <ChevronRight className="w-4 h-4" />
            </span>
          </Button>
        </div>
      </div>
      <style>{`
        @keyframes shine {0%{transform:translateX(-100%);}100%{transform:translateX(100%);}}
        @keyframes fadeIn {from{opacity:0;transform:translateY(8px);}to{opacity:1;transform:translateY(0);}}
      `}</style>
    </div>
  );
};

export default BookingSummary;
