import type React from "react";
import type { FlightSearchApiResult } from "../../shared/types/search-api.types";
import { formatDateTime, formatPrice } from "../../shared/utils/format";
import { Button } from "../ui/button";
import {
  PlaneTakeoff,
  PlaneLanding,
  Clock,
  ArrowRight,
  CheckCircle2,
  ChevronRight,
} from "lucide-react";

export interface BookingSelection {
  tripType: "one-way" | "round-trip";
  outbound: FlightSearchApiResult;
  inbound?: FlightSearchApiResult;
  totalPrice: number;
  currency: string;
  passengers?: {
    adults: number;
    children: number;
    infants: number;
  };
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
      className={`rounded-xl border bg-card transition-all ${
        highlight
          ? "border-primary/30 shadow-md"
          : "border-border hover:border-primary/20 hover:shadow-sm"
      }`}>
      <div className="p-5 space-y-5">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <h4 className="text-xs font-semibold tracking-wide text-primary uppercase flex items-center gap-1.5">
              <ArrowRight className="w-3.5 h-3.5" /> {title}
            </h4>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center justify-center h-8 px-3 rounded-lg bg-primary text-primary-foreground text-sm font-bold shadow-sm">
                {flight.flight_number}
              </span>
              <span className="text-xs font-medium text-muted-foreground bg-muted px-2.5 py-1 rounded-md">
                {airlineCode}
              </span>
            </div>
          </div>
          <div className="flex flex-col items-end text-right gap-1.5">
            <span className="text-xs px-2.5 py-1 rounded-full bg-primary/10 text-primary font-medium">
              {stopsLabel}
            </span>
            <span className="text-[10px] text-muted-foreground">
              {flight.flight_class} • {flight.total_seats} ghế
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-6 items-center">
          {/* Departure */}
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-primary text-primary-foreground shadow-sm">
                <PlaneTakeoff className="w-5 h-5" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground leading-none">
                  {dep.time}
                </p>
                <p className="text-xs text-muted-foreground mt-1">{dep.date}</p>
              </div>
            </div>
            <p className="text-xs text-card-foreground pl-11">
              {flight.departure_airport} ({flight.departure_airport_code})
            </p>
          </div>

          {/* Timeline */}
          <div className="flex flex-col items-center justify-center gap-2 md:px-4">
            <div className="w-full md:w-24 h-0.5 bg-border relative">
              <div className="absolute inset-0 bg-primary/40" />
            </div>
            <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
              <Clock className="w-3.5 h-3.5 text-primary" />
              <span>{durationHours}h</span>
            </div>
          </div>

          {/* Arrival */}
          <div className="space-y-2 md:text-right">
            <div className="flex items-center gap-3 md:justify-end">
              <div className="p-2.5 rounded-lg bg-secondary text-secondary-foreground shadow-sm">
                <PlaneLanding className="w-5 h-5" />
              </div>
              <div className="text-left md:text-right">
                <p className="text-2xl font-bold text-foreground leading-none">
                  {arr.time}
                </p>
                <p className="text-xs text-muted-foreground mt-1">{arr.date}</p>
              </div>
            </div>
            <p className="text-xs text-card-foreground md:pr-11 md:text-right pl-11 md:pl-0">
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
    <div className="space-y-6 animate-[fadeIn_.4s_ease]">
      <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h3 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-primary" /> Xác nhận giữ chỗ
              chuyến bay
            </h3>
            <p className="mt-2 text-sm text-muted-foreground max-w-2xl leading-relaxed">
              Kiểm tra kỹ thông tin trước khi điền hành khách & chọn phương thức
              giữ chỗ / thanh toán. Bạn vẫn có thể quay lại thay đổi ở bước sau.
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 rounded-lg border border-primary/20 text-primary font-medium">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              Sẵn sàng đặt
            </div>
            {selection.tripType === "round-trip" && (
              <div className="px-3 py-1.5 rounded-lg bg-secondary text-secondary-foreground font-medium shadow-sm">
                Khứ hồi
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid gap-5">
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

      <div className="rounded-xl border border-border bg-card shadow-sm p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div className="flex items-start gap-4 flex-1">
          <div className="p-3 rounded-xl bg-primary text-primary-foreground shadow-sm">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold tracking-wide text-primary uppercase">
              Tổng giá
            </p>
            <p className="text-3xl font-bold text-foreground mt-1 leading-none">
              {formatPrice(selection.totalPrice)}
            </p>
            <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
              Đã bao gồm toàn bộ thuế & phụ phí ({selection.currency}). Giá hiển
              thị là cuối cùng.
            </p>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
          <Button
            variant="outline"
            onClick={onChangeFlights}
            className="sm:w-auto w-full border-destructive/30 text-destructive hover:bg-destructive/10 hover:text-destructive bg-transparent">
            <span className="flex items-center gap-1.5 text-sm font-medium">
              <ChevronRight className="w-4 h-4 rotate-180" /> Chọn lại
            </span>
          </Button>
          <Button
            onClick={onConfirm}
            className="sm:w-auto w-full shadow-md bg-primary hover:bg-primary/90 text-primary-foreground">
            <span className="flex items-center gap-2 text-sm font-semibold">
              Tiếp tục <ChevronRight className="w-4 h-4" />
            </span>
          </Button>
        </div>
      </div>
      <style>{`
        @keyframes fadeIn {from{opacity:0;transform:translateY(8px);}to{opacity:1;transform:translateY(0);}}
      `}</style>
    </div>
  );
};

export default BookingSummary;
