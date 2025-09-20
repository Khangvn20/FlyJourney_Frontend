import React from "react";
import { CheckCircle2, Clock, ArrowRight } from "lucide-react";
import {
  formatDateTime,
  formatDuration,
  formatPrice,
} from "../../shared/utils/format";
import type {
  FlightSearchApiResult,
  FlightSearchResponseData,
} from "../../shared/types/search-api.types";
import { isRoundTripResponse } from "../../shared/types/search-api.types";

interface RoundTripStepperProps {
  bookingStep: 1 | 2 | 3;
  outbound: FlightSearchApiResult | null;
  inbound: FlightSearchApiResult | null;
  searchInfo: FlightSearchResponseData | null;
}

type StepState = "complete" | "active" | "upcoming";

const getBaseAdultPrice = (flight: FlightSearchApiResult | null) => {
  if (!flight) return null;
  const { base_prices, total_prices, taxes, grand_total } = flight.pricing;
  const adultBaseWithTax = (base_prices?.adult || 0) + (taxes?.adult || 0);
  if (total_prices?.adult && total_prices.adult > 0) {
    return total_prices.adult;
  }
  if (adultBaseWithTax > 0) {
    return adultBaseWithTax;
  }
  return grand_total;
};

const getFlightSummary = (flight: FlightSearchApiResult | null) => {
  if (!flight) return null;

  const departure = formatDateTime(flight.departure_time || "");
  const arrival = formatDateTime(flight.arrival_time || "");
  const duration = flight.duration_minutes
    ? formatDuration(flight.duration_minutes)
    : null;
  const price = getBaseAdultPrice(flight);

  const chunks = [] as string[];
  if (flight.departure_airport_code && flight.arrival_airport_code) {
    chunks.push(`${flight.departure_airport_code} → ${flight.arrival_airport_code}`);
  }
  if (departure.time && arrival.time) {
    chunks.push(`${departure.time} → ${arrival.time}`);
  }
  if (duration) {
    chunks.push(duration);
  }
  if (typeof price === "number") {
    chunks.push(`Giá NL (đã gồm thuế/phí) ${formatPrice(price)}`);
  }

  return chunks.join(" • ") || null;
};

const getStepState = (step: 1 | 2 | 3, bookingStep: 1 | 2 | 3) => {
  if (bookingStep > step) return "complete" as StepState;
  if (bookingStep === step) return "active" as StepState;
  return "upcoming" as StepState;
};

const badgeClasses: Record<StepState, string> = {
  active:
    "bg-blue-600 text-white border-transparent shadow-sm shadow-blue-200",
  complete:
    "bg-green-500 text-white border-transparent shadow-sm shadow-green-200",
  upcoming:
    "bg-white text-slate-500 border border-slate-200",
};

const RoundTripStepper: React.FC<RoundTripStepperProps> = ({
  bookingStep,
  outbound,
  inbound,
  searchInfo,
}) => {
  const roundTripInfo =
    searchInfo && isRoundTripResponse(searchInfo) ? searchInfo : null;

  const outboundSummary =
    getFlightSummary(outbound) ||
    (roundTripInfo
      ? `${roundTripInfo.departure_airport} → ${roundTripInfo.arrival_airport}`
      : "Chọn chuyến bay phù hợp")
      .replace(/\s+/g, " ");

  const inboundSummary =
    getFlightSummary(inbound) ||
    (roundTripInfo?.return_date
      ? `Ngày về ${roundTripInfo.return_date}`
      : "Chọn chiều về sau khi hoàn tất chiều đi");

  const totalPrice =
    (outbound?.pricing?.grand_total ?? 0) +
    (inbound?.pricing?.grand_total ?? 0);
  const totalDurationMinutes =
    (outbound?.duration_minutes ?? 0) + (inbound?.duration_minutes ?? 0);

  const stepSummaries = [
    {
      id: 1 as const,
      title: "Chiều đi",
      helper: "So sánh giá và thời lượng để bắt đầu hành trình",
      summary: outboundSummary,
    },
    {
      id: 2 as const,
      title: "Chiều về",
      helper: "Chọn chuyến chiều về phù hợp với lịch khởi hành",
      summary: inboundSummary,
    },
    {
      id: 3 as const,
      title: "Xác nhận",
      helper: "Kiểm tra lại thông tin trước khi tiếp tục",
      summary:
        outbound && inbound && totalPrice > 0
          ? `${formatPrice(totalPrice)} • Tổng thời gian bay ${
              totalDurationMinutes > 0
                ? formatDuration(totalDurationMinutes)
                : "--"
            }`
          : "Chọn đủ hai chiều để xem tổng giá",
    },
  ];

  const showSummaryBox = totalPrice > 0 || totalDurationMinutes > 0;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white px-4 py-4 shadow-sm md:px-6">
      <div className="relative">
        <span className="pointer-events-none absolute left-6 right-6 top-[18px] hidden h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent md:block" />
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div className="flex flex-col gap-4 md:flex-row md:gap-6 md:flex-1">
            {stepSummaries.map((step, index) => {
              const state = getStepState(step.id, bookingStep);
              return (
                <div
                  key={step.id}
                  className="relative flex flex-1 gap-3">
                  <div
                    className={`z-10 flex h-9 w-9 items-center justify-center rounded-full text-sm font-semibold transition ${badgeClasses[state]}`}>
                    {state === "complete" ? (
                      <CheckCircle2 className="h-4 w-4" />
                    ) : (
                      step.id
                    )}
                  </div>
                  <div className="space-y-1">
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                      Bước {step.id}
                    </p>
                    <p className="text-sm font-semibold text-slate-900">
                      {step.title}
                    </p>
                    <p className="text-xs leading-relaxed text-slate-500">
                      {state === "complete" || state === "active"
                        ? step.summary
                        : step.helper}
                    </p>
                  </div>
                  {index < stepSummaries.length - 1 && (
                    <ArrowRight className="absolute right-[-18px] top-2 hidden h-4 w-4 text-slate-300 md:block" />
                  )}
                </div>
              );
            })}
          </div>

          {showSummaryBox && (
            <div className="rounded-xl border border-blue-100 bg-gradient-to-br from-blue-50 via-blue-50/70 to-white px-4 py-3 text-sm text-blue-700 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wide text-blue-500">
                Tóm tắt hành trình
              </p>
              {totalPrice > 0 && (
                <p className="text-lg font-bold text-orange-600">
                  {formatPrice(totalPrice)}
                </p>
              )}
              {totalDurationMinutes > 0 && (
                <p className="mt-1 flex items-center gap-2 text-xs text-blue-700">
                  <Clock className="h-3.5 w-3.5" />
                  {formatDuration(totalDurationMinutes)} tổng thời gian bay
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RoundTripStepper;
