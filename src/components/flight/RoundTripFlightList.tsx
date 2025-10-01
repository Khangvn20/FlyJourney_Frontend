import React, { useEffect, useMemo, useState } from "react";
import type { FlightCardProps } from "../../shared/types/flight-card.types";
import { Card, CardContent } from "../ui/card";
import { Button } from "../ui/button";
import { Plane, CheckCircle2, Clock, AlertTriangle } from "lucide-react";
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

type TripDirection = "outbound" | "inbound";

const buildFlightKey = (flight: FlightSearchApiResult) => {
  const parts = [
    flight.flight_id ?? "",
    flight.flight_class_id ?? "",
    flight.departure_time ?? "",
    flight.arrival_time ?? "",
    flight.pricing?.grand_total ?? "",
  ];
  return parts.map((part) => String(part)).join("|");
};

const dedupeFlightsByKey = (
  flights: FlightSearchApiResult[]
): FlightSearchApiResult[] => {
  const seen = new Set<string>();
  return flights.filter((flight) => {
    const key = buildFlightKey(flight);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
};

interface RoundTripFlightListProps {
  outboundFlights: FlightSearchApiResult[];
  inboundFlights: FlightSearchApiResult[];
  activeTab: TripDirection;
  setActiveTab: (tab: TripDirection) => void;
  selectedOutboundFlight: FlightSearchApiResult | null;
  selectedInboundFlight: FlightSearchApiResult | null;
  onFlightSelect: (
    direction: TripDirection,
    flight: FlightSearchApiResult
  ) => void;
  onClearSelectedFlight: (direction: TripDirection) => void;
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
  const [expandedFlightIds, setExpandedFlightIds] = useState<{
    outbound: string | null;
    inbound: string | null;
  }>({ outbound: null, inbound: null });
  const [detailsTabs, setDetailsTabs] = useState<{
    outbound: string;
    inbound: string;
  }>({ outbound: "flight", inbound: "flight" });

  const roundTripInfo =
    searchInfo && isRoundTripResponse(searchInfo) ? searchInfo : null;

  const toggleFlightDetails = (dir: TripDirection, flightKey: string) => {
    setExpandedFlightIds((prev) => ({
      ...prev,
      [dir]: prev[dir] === flightKey ? null : flightKey,
    }));
    setDetailsTabs((prev) => ({ ...prev, [dir]: "flight" }));
  };

  const normalizedFlights = useMemo(
    () => ({
      outbound: dedupeFlightsByKey(outboundFlights),
      inbound: dedupeFlightsByKey(inboundFlights),
    }),
    [outboundFlights, inboundFlights]
  );

  const currentFlights = normalizedFlights[activeTab];
  const expandedFlightId = expandedFlightIds[activeTab];
  const detailsActiveTab = detailsTabs[activeTab];
  const outboundCount = normalizedFlights.outbound.length;
  const inboundCount = normalizedFlights.inbound.length;

  useEffect(() => {
    setExpandedFlightIds((prev) => {
      if (prev[activeTab] === null) {
        return prev;
      }
      return { ...prev, [activeTab]: null };
    });

    setDetailsTabs((prev) => {
      if (prev[activeTab] === "flight") {
        return prev;
      }
      return { ...prev, [activeTab]: "flight" };
    });

    if (import.meta.env?.DEV) {
      console.debug("[RoundTripFlightList] activeTab changed", {
        activeTab,
        outboundCount,
        inboundCount,
      });
    }
  }, [activeTab, outboundCount, inboundCount]);

  const getAdultDisplayPrice = (flight: FlightSearchApiResult | null) => {
    if (!flight) return 0;
    const adultBaseWithTax =
      (flight.pricing.base_prices?.adult || 0) +
      (flight.pricing.taxes?.adult || 0);
    if (
      flight.pricing.total_prices?.adult &&
      flight.pricing.total_prices.adult > 0
    ) {
      return flight.pricing.total_prices.adult;
    }
    if (adultBaseWithTax > 0) return adultBaseWithTax;
    return flight.pricing.grand_total;
  };

  const renderFlightSummary = (flight: FlightSearchApiResult | null) => {
    if (!flight) return null;
    const departure = formatDateTime(flight.departure_time || "");
    const arrival = formatDateTime(flight.arrival_time || "");
    const duration = flight.duration_minutes
      ? formatDuration(flight.duration_minutes)
      : null;
    const adultDisplayPrice = getAdultDisplayPrice(flight);

    return (
      <div className="mt-3 space-y-2 rounded-xl border border-blue-100 bg-blue-50/60 p-3 text-xs text-blue-700">
        <div className="flex flex-wrap items-center gap-2 text-sm font-semibold text-blue-800">
          <CheckCircle2 className="h-4 w-4 text-blue-600" />
          {flight.flight_number}
          <span className="text-[11px] uppercase tracking-wide text-orange-500">
            Giá (đã gồm thuế/phí)
          </span>
          <span className="text-sm font-semibold text-orange-600">
            {formatPrice(adultDisplayPrice)}
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-3">
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
        <p className="text-[11px] text-blue-600">{departure.date}</p>
      </div>
    );
  };

  const selectionMeta: Record<
    TripDirection,
    { title: string; subtitle: string; empty: string; helper: string }
  > = {
    outbound: {
      title: "Chiều đi",
      subtitle: roundTripInfo
        ? `${roundTripInfo.departure_airport} → ${roundTripInfo.arrival_airport}`
        : "Khởi hành",
      empty:
        "Bạn có thể bắt đầu ở chiều đi hoặc chuyển sang chiều về trước. Lựa chọn sẽ được giữ lại khi bạn quay lại.",
      helper: "Chọn chuyến đi phù hợp với kế hoạch khởi hành của bạn.",
    },
    inbound: {
      title: "Chiều về",
      subtitle: roundTripInfo
        ? `${roundTripInfo.arrival_airport} → ${roundTripInfo.departure_airport}`
        : "Quay về",
      empty:
        "Chọn chiều về trước nếu bạn đã biết lịch quay lại. Chúng tôi sẽ giữ lựa chọn này khi bạn điều chỉnh chiều đi.",
      helper: "Đảm bảo thời gian về phù hợp với chuyến đi bạn đã chọn.",
    },
  };

  const renderSelectionCard = (dir: TripDirection) => {
    const meta = selectionMeta[dir];
    const flight =
      dir === "outbound" ? selectedOutboundFlight : selectedInboundFlight;
    const isActive = activeTab === dir;
    const hasFlight = Boolean(flight);

    return (
      <div
        key={dir}
        className={`flex flex-col rounded-2xl border bg-white p-4 shadow-sm transition-all ${
          isActive ? "border-blue-500 ring-1 ring-blue-200" : "border-slate-200"
        }`}>
        <div className="flex flex-col gap-1">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
            {meta.title}
          </p>
          <p className="text-sm font-semibold text-slate-900">
            {meta.subtitle}
          </p>
          <p className="text-xs text-slate-500">
            {hasFlight ? meta.helper : meta.empty}
          </p>
        </div>

        {renderFlightSummary(flight)}

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <Button
            variant={isActive ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveTab(dir)}
            className={
              isActive
                ? "bg-blue-600 text-white"
                : "border-blue-200 text-blue-700"
            }>
            {hasFlight ? "Chọn lại" : "Xem danh sách"}
          </Button>
          {hasFlight && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onClearSelectedFlight(dir)}
              className="text-slate-500 hover:text-blue-700">
              Xóa lựa chọn
            </Button>
          )}
        </div>
      </div>
    );
  };

  const handleSelectFlight = (
    direction: TripDirection,
    flight: FlightSearchApiResult
  ) => {
    const companionDirection: TripDirection =
      direction === "outbound" ? "inbound" : "outbound";
    const hadSelection =
      direction === "outbound"
        ? Boolean(selectedOutboundFlight)
        : Boolean(selectedInboundFlight);
    const companionSelected =
      companionDirection === "outbound"
        ? Boolean(selectedOutboundFlight)
        : Boolean(selectedInboundFlight);

    onFlightSelect(direction, flight);

    if (!companionSelected && !hadSelection) {
      setActiveTab(companionDirection);
    }
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

  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="space-y-5 px-5 py-5">
        <div className="grid gap-3 lg:grid-cols-2">
          {renderSelectionCard("outbound")}
          {renderSelectionCard("inbound")}
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
                : "Điều chỉnh bộ lọc hoặc chuyển sang chiều đi để tìm thêm lựa chọn phù hợp."}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {currentFlights.map((flight) => {
              const flightKey = buildFlightKey(flight);
              const airlineInfo = vietnameseAirlines.find(
                (a) =>
                  a.name.toLowerCase() === flight.airline_name.toLowerCase()
              ) ||
                vietnameseAirlines[0] || {
                  logo: "",
                };
              const airlineLogo = airlineInfo?.logo ?? "";

              const isSelected =
                (activeTab === "outbound" &&
                  selectedOutboundFlight?.flight_id === flight.flight_id) ||
                (activeTab === "inbound" &&
                  selectedInboundFlight?.flight_id === flight.flight_id);

              return (
                <FlightCard
                  key={`${activeTab}-${flightKey}`}
                  flight={flight as FlightCardProps["flight"]}
                  isExpanded={expandedFlightId === flightKey}
                  onToggleDetails={() =>
                    toggleFlightDetails(activeTab, flightKey)
                  }
                  onSelect={() => handleSelectFlight(activeTab, flight)}
                  sortBy={sortBy}
                  airlineLogo={airlineLogo}
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
