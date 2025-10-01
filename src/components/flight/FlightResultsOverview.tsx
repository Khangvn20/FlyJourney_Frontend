import React, { useMemo } from "react";
import {
  ArrowRight,
  CalendarDays,
  Plane,
  SlidersHorizontal,
  Users,
} from "lucide-react";
import type { PassengerCounts } from "../../shared/types";
import {
  isOneWayResponse,
  isRoundTripResponse,
  type FlightSearchResponseData,
} from "../../shared/types/search-api.types";

interface FlightResultsOverviewProps {
  tripType: "one-way" | "round-trip";
  searchInfo: FlightSearchResponseData | null;
  passengers?: PassengerCounts | null;
  sortBy: string;
  onSortChange: (value: string) => void;
  showingCount: number;
  totalCount?: number;
  totalOutbound?: number;
  totalInbound?: number;
  progressiveCount?: number;
  skeletonActive?: boolean;
  activeDirection?: "outbound" | "inbound";
  filteredCount?: number;
  countDisplayMode?: "visible" | "total";
  onCountDisplayModeChange?: (mode: "visible" | "total") => void;
  // New props for items per page
  itemsPerPage?: number;
  onItemsPerPageChange?: (value: number) => void;
}

const formatDateLabel = (value?: string | null) => {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return date.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

const resolvePassengers = (
  tripType: "one-way" | "round-trip",
  searchInfo: FlightSearchResponseData | null,
  override?: PassengerCounts | null
) => {
  const searchPassengers = (() => {
    if (!searchInfo) return undefined;
    if (tripType === "round-trip" && isRoundTripResponse(searchInfo)) {
      return searchInfo.passengers;
    }
    if (tripType === "one-way" && isOneWayResponse(searchInfo)) {
      return searchInfo.passengers;
    }
    return undefined;
  })();

  const source = override ?? searchPassengers ?? undefined;
  const adults = Math.max(1, Number(source?.adults) || 0);
  const children = Math.max(0, Number(source?.children) || 0);
  const infants = Math.max(0, Number(source?.infants) || 0);
  const total = adults + children + infants;

  const parts: string[] = [];
  if (adults > 0) parts.push(`${adults} Người lớn`);
  if (children > 0) parts.push(`${children} Trẻ em`);
  if (infants > 0) parts.push(`${infants} Em bé`);

  return {
    total,
    detail: parts.join(", ") || "—",
  };
};

const FlightResultsOverview: React.FC<FlightResultsOverviewProps> = ({
  tripType,
  searchInfo,
  passengers,
  sortBy,
  onSortChange,
  showingCount,
  totalCount,
  filteredCount,
  totalOutbound,
  totalInbound,
  progressiveCount,
  skeletonActive,
  activeDirection,
  countDisplayMode,
  onCountDisplayModeChange,
  itemsPerPage = 10,
  onItemsPerPageChange,
}) => {
  const routeInfo = useMemo(() => {
    if (!searchInfo) {
      return {
        label: "Chưa có kết quả",
        departure: "Đang chờ",
        arrival: "Kết quả",
        departureDate: undefined,
        returnDate: undefined,
      };
    }

    if (tripType === "round-trip" && isRoundTripResponse(searchInfo)) {
      return {
        label: "Khứ hồi",
        departure: searchInfo.departure_airport,
        arrival: searchInfo.arrival_airport,
        departureDate: searchInfo.departure_date,
        returnDate: searchInfo.return_date,
      };
    }

    if (tripType === "one-way" && isOneWayResponse(searchInfo)) {
      return {
        label: "Một chiều",
        departure: searchInfo.departure_airport,
        arrival: searchInfo.arrival_airport,
        departureDate: searchInfo.departure_date,
        returnDate: undefined,
      };
    }

    return {
      label: "Chuyến bay",
      departure: "—",
      arrival: "—",
      departureDate: undefined,
      returnDate: undefined,
    };
  }, [searchInfo, tripType]);

  const passengerInfo = useMemo(
    () => resolvePassengers(tripType, searchInfo, passengers),
    [tripType, searchInfo, passengers]
  );

  const resolvedDisplayMode = countDisplayMode ?? "visible";

  const flightsSummary = useMemo(() => {
    if (tripType === "round-trip") {
      if (totalOutbound !== undefined || totalInbound !== undefined) {
        const outboundLabel = totalOutbound ?? 0;
        const inboundLabel = totalInbound ?? 0;
        return `Chiều đi: ${outboundLabel} • Chiều về: ${inboundLabel}`;
      }
      return `Đang hiển thị ${showingCount} chuyến`;
    }

    const totalAvailable =
      typeof filteredCount === "number"
        ? filteredCount
        : typeof totalCount === "number"
        ? totalCount
        : showingCount;

    const currentlyVisible = progressiveCount ?? showingCount;

    if (resolvedDisplayMode === "total") {
      return `Tổng cộng ${totalAvailable} vé`;
    }

    const showTotalSuffix =
      totalAvailable > 0 &&
      currentlyVisible > 0 &&
      currentlyVisible < totalAvailable;

    if (skeletonActive && currentlyVisible === 0) {
      return "Đang tải vé...";
    }

    return showTotalSuffix
      ? `Đang hiển thị ${currentlyVisible} / ${totalAvailable} vé`
      : `Đang hiển thị ${currentlyVisible} vé`;
  }, [
    tripType,
    totalOutbound,
    totalInbound,
    showingCount,
    totalCount,
    filteredCount,
    progressiveCount,
    skeletonActive,
    resolvedDisplayMode,
  ]);

  return (
    <div className="mb-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              {tripType === "round-trip"
                ? "Chuyến bay khứ hồi"
                : "Chuyến bay một chiều"}
            </p>
            <div className="flex flex-wrap items-center gap-2 text-lg font-semibold text-slate-900">
              <span>{routeInfo.departure}</span>
              <ArrowRight className="h-4 w-4 text-blue-500" />
              <span>{routeInfo.arrival}</span>
              {tripType === "round-trip" && activeDirection && (
                <span className="ml-2 inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700">
                  {activeDirection === "inbound" ? "Chiều về" : "Chiều đi"}
                </span>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-3 text-sm text-slate-500">
              {routeInfo.departureDate && (
                <span className="inline-flex items-center gap-1">
                  <CalendarDays className="h-3.5 w-3.5 text-slate-400" />
                  {formatDateLabel(routeInfo.departureDate)}
                </span>
              )}
              {tripType === "round-trip" && routeInfo.returnDate && (
                <span className="inline-flex items-center gap-1">
                  <CalendarDays className="h-3.5 w-3.5 text-slate-400" />
                  {formatDateLabel(routeInfo.returnDate)}
                </span>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-3 md:items-end">
            <div className="flex flex-wrap gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
                <Users className="h-3.5 w-3.5 text-slate-500" />
                {`${passengerInfo.total} Hành khách • ${passengerInfo.detail}`}
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
                <Plane className="h-3.5 w-3.5 text-blue-500" />
                {flightsSummary}
              </span>
            </div>

            {tripType === "one-way" &&
            typeof onCountDisplayModeChange === "function" ? (
              <div className="inline-flex items-center gap-1 rounded-full border border-blue-100 bg-blue-50 p-1 text-xs font-semibold text-blue-600">
                <button
                  type="button"
                  onClick={() => onCountDisplayModeChange("visible")}
                  className={`rounded-full px-3 py-1 transition ${
                    resolvedDisplayMode === "visible"
                      ? "bg-white text-blue-600 shadow-sm"
                      : "text-blue-600/70 hover:text-blue-600"
                  }`}>
                  Đang hiển thị
                </button>
                <button
                  type="button"
                  onClick={() => onCountDisplayModeChange("total")}
                  className={`rounded-full px-3 py-1 transition ${
                    resolvedDisplayMode === "total"
                      ? "bg-white text-blue-600 shadow-sm"
                      : "text-blue-600/70 hover:text-blue-600"
                  }`}>
                  Tổng cộng
                </button>
              </div>
            ) : null}

            <label className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
              <SlidersHorizontal className="h-3.5 w-3.5 text-slate-400" />
              Sắp xếp theo
            </label>
            <div className="flex gap-2">
              <select
                value={sortBy}
                onChange={(event) => onSortChange(event.target.value)}
                className="flex-1 rounded-md border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 md:w-32">
                <option value="price">Rẻ nhất</option>
                <option value="departure">Sớm nhất</option>
                <option value="duration">Nhanh nhất</option>
              </select>
              {onItemsPerPageChange && (
                <select
                  value={itemsPerPage}
                  onChange={(event) =>
                    onItemsPerPageChange(Number(event.target.value))
                  }
                  className="rounded-md border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 md:w-20">
                  <option value={10}>10</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FlightResultsOverview;
