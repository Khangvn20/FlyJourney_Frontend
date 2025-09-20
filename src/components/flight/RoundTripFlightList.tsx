import React, { useState } from "react";
import type { JSX } from "react";
import { Card, CardContent } from "../ui/card";
import { Button } from "../ui/button";
import {
  Plane,
  CheckCircle2,
  ArrowRight,
  Clock,
  AlertTriangle,
} from "lucide-react";
import FlightCard from "./FlightCard";
import {
  formatPrice,
  formatDateTime,
  formatDuration,
} from "../../shared/utils/format";
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
  bookingStep: 1 | 2 | 3;
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
  bookingStep,
}) => {
  const [expandedFlightIds, setExpandedFlightIds] = useState<{
    outbound: number | null;
    inbound: number | null;
  }>({ outbound: null, inbound: null });
  const [detailsTabs, setDetailsTabs] = useState<{
    outbound: string;
    inbound: string;
  }>({ outbound: "flight", inbound: "flight" });

  const roundTripInfo =
    searchInfo && isRoundTripResponse(searchInfo) ? searchInfo : null;

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

  const normalizedStep = bookingStep > 2 ? 2 : bookingStep;
  const stepTitle =
    normalizedStep === 1
      ? "Chọn chuyến bay chiều đi"
      : "Chọn chuyến bay chiều về";
  const stepHint =
    normalizedStep === 1
      ? "So sánh giá và thời lượng để bắt đầu hành trình"
      : selectedOutboundFlight
      ? `Khớp lịch với chuyến đi ${selectedOutboundFlight.departure_airport_code} → ${selectedOutboundFlight.arrival_airport_code}`
      : "Hoàn tất chiều đi để mở khóa chiều về";

  const renderSelectedBanner = (
    dir: "outbound" | "inbound",
    flight: FlightSearchApiResult | null
  ) => {
    if (!flight) return null;
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

      <div
        className="flex flex-col gap-3 rounded-xl border border-blue-100 bg-blue-50/60 px-4 py-3 shadow-sm sm:flex-row sm:items-center sm:justify-between"
        key={`${dir}-${flight.flight_id}`}>
        <div className="flex flex-col gap-2 text-sm text-blue-800">
          <div className="flex flex-wrap items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-blue-600" />
            <span className="font-semibold text-blue-700">
              {dir === "outbound" ? "Chiều đi" : "Chiều về"}
            </span>
            <span className="font-medium text-blue-900">
              {flight.flight_number}
            </span>
            <div className="flex items-center gap-1 text-orange-600 font-semibold">
              <span className="text-[11px] uppercase tracking-wide text-orange-500">
                Giá NL (đã gồm thuế/phí)
              </span>
              <span>{formatPrice(adultDisplayPrice)}</span>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3 text-xs text-blue-700">
            <span className="font-semibold text-blue-800">
              {flight.departure_airport_code} → {flight.arrival_airport_code}
            </span>
            {departure.time && arrival.time && (
              <span className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                {departure.time} – {arrival.time}
              </span>
            )}
            {duration && (
              <span className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                {duration}
              </span>
            )}
          </div>
          <div className="text-xs text-blue-600">
            {departure.date}
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onClearSelectedFlight(dir)}
          className="self-start text-blue-700 hover:bg-blue-100 hover:text-blue-800">
          Thay đổi
        </Button>
      </div>
    );
  };

  if (error) {
    return (
      <Card className="border border-red-200 bg-red-50/80">
        <CardContent className="flex flex-col items-center gap-3 p-6 text-center">
          <AlertTriangle className="h-6 w-6 text-red-500" />
          <h3 className="text-lg font-semibold text-red-700">
            Có lỗi xảy ra khi tải chuyến bay
          </h3>
          <p className="text-sm text-red-600">{error}</p>
        </CardContent>
      </Card>
    );
  }

  const selectedBanners = [
    renderSelectedBanner("outbound", selectedOutboundFlight),
    renderSelectedBanner("inbound", selectedInboundFlight),
  ].filter((banner): banner is JSX.Element => Boolean(banner));

  const tabMeta = [
    {
      key: "outbound" as const,
      label: "Chiều đi",
      completed: Boolean(selectedOutboundFlight),
      disabled: false,
      description:
        roundTripInfo
          ? `${roundTripInfo.departure_airport} → ${roundTripInfo.arrival_airport}`
          : "Chuyến bay đi",
    },
    {
      key: "inbound" as const,
      label: "Chiều về",
      completed: Boolean(selectedInboundFlight),
      disabled: disableInboundTab,
      description:
        selectedOutboundFlight
          ? `${selectedOutboundFlight.arrival_airport_code} → ${selectedOutboundFlight.departure_airport_code}`
          : "Chọn chiều đi trước",
    },
  ];

  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-100 px-5 py-4">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
          Bước {normalizedStep} / 3
        </p>
        <div className="mt-1 flex flex-wrap items-center gap-3">
          <h3 className="text-base font-semibold text-slate-900">
            {stepTitle}
          </h3>
          {selectedOutboundFlight && normalizedStep === 2 && (
            <span className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
              <ArrowRight className="h-3.5 w-3.5" />
              {selectedOutboundFlight.departure_airport_code} → {selectedOutboundFlight.arrival_airport_code}
            </span>
          )}
        </div>
        <p className="mt-1 text-sm text-slate-500">{stepHint}</p>
      </div>

      <div className="space-y-5 px-5 py-5">
        {selectedBanners.map((banner, index) => (
          <React.Fragment key={index}>{banner}</React.Fragment>
        ))}

        <div className="grid gap-2 sm:grid-cols-2" role="tablist">
          {tabMeta.map((tab) => {
            const isActive = activeTab === tab.key;
            const isDisabled = tab.disabled;
            return (
              <button
                key={tab.key}
                type="button"
                role="tab"
                aria-selected={isActive}
                disabled={isDisabled}
                onClick={() => {
                  if (isDisabled) return;
                  setActiveTab(tab.key);
                }}
                className={`flex flex-col rounded-xl border px-4 py-3 text-left transition focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
                  isActive
                    ? "border-blue-500 bg-blue-50 text-blue-700 shadow-sm"
                    : "border-slate-200 bg-white text-slate-600 hover:border-blue-200 hover:bg-blue-50/40"
                } ${isDisabled ? "cursor-not-allowed opacity-60" : ""}`}>
                <span className="flex items-center gap-2 text-sm font-semibold">
                  {tab.completed && <CheckCircle2 className="h-4 w-4 text-blue-600" />}
                  {tab.label}
                </span>
                <span className="mt-1 text-xs text-slate-500">
                  {tab.description}
                </span>
              </button>
            );
          })}
        </div>

        {currentFlights.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/80 px-5 py-10 text-center">
            <Plane className="mx-auto mb-4 h-10 w-10 text-slate-300" />
            <h3 className="text-base font-semibold text-slate-700">
              {activeTab === "outbound"
                ? "Chưa có chuyến bay chiều đi"
                : "Chưa có chuyến bay chiều về"}
            </h3>
            <p className="mt-2 text-sm text-slate-500">
              {activeTab === "outbound"
                ? "Vui lòng sử dụng form tìm kiếm ở trên để tìm chuyến bay."
                : "Chọn chuyến bay chiều đi trước để mở khóa chiều về."}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {currentFlights.map((flight) => {
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
                <FlightCard
                  key={`${activeTab}-${flight.flight_id}`}
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
                  isSelected={isSelected}
                />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default RoundTripFlightList;



