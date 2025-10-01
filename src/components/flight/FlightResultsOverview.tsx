import React, { useEffect, useMemo } from "react";
import {
  ArrowRight,
  CalendarDays,
  Plane,
  SlidersHorizontal,
  Users,
} from "lucide-react";
import type { PassengerCounts, PassengerCountsLike } from "../../shared/types";
import {
  isOneWayResponse,
  isRoundTripResponse,
  type FlightSearchResponseData,
} from "../../shared/types/search-api.types";
import type { MonthRangeMeta } from "../../lib/searchUtils";

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
  activeDirection?: "outbound" | "inbound";
  filteredCount?: number;
  countDisplayMode?: "visible" | "total";
  onCountDisplayModeChange?: (mode: "visible" | "total") => void;
  // New props for items per page
  itemsPerPage?: number;
  onItemsPerPageChange?: (value: number) => void;
  monthMeta?: MonthRangeMeta | null;
  monthFlightsCount?: number;
  monthTotalFlights?: number;
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

type ResolvedPassengerInfo = {
  total: number;
  detail: string;
  source: "response" | "override" | "fallback";
  raw: PassengerCounts;
};

const resolvePassengers = (
  searchInfo: FlightSearchResponseData | null,
  override?: PassengerCounts | null
): ResolvedPassengerInfo => {
  const toNumber = (value: number | string | null | undefined) => {
    if (typeof value === "number") {
      return Number.isFinite(value) ? value : 0;
    }
    if (typeof value === "string" && value.trim() !== "") {
      const parsed = Number(value);
      return Number.isFinite(parsed) ? parsed : 0;
    }
    return 0;
  };

  const toNumericCounts = (
    counts?: PassengerCountsLike | null
  ): PassengerCounts => ({
    adults: toNumber(counts?.adults),
    children: toNumber(counts?.children),
    infants: toNumber(counts?.infants),
  });

  const hasValidCounts = (counts?: PassengerCountsLike | null) => {
    if (!counts) return false;
    const numeric = toNumericCounts(counts);
    return numeric.adults > 0 || numeric.children > 0 || numeric.infants > 0;
  };

  const resolveFromSearchInfo = (): PassengerCounts | null => {
    if (!searchInfo) return null;

    if (isRoundTripResponse(searchInfo)) {
      const roundTripInfo = searchInfo as typeof searchInfo & {
        passenger_count?: PassengerCountsLike | null;
        passengerCount?: PassengerCountsLike | null;
        passenger_counts?: PassengerCountsLike | null;
      };

      if (hasValidCounts(roundTripInfo.passenger_count)) {
        return toNumericCounts(roundTripInfo.passenger_count);
      }

      if (hasValidCounts(roundTripInfo.passengerCount)) {
        return toNumericCounts(roundTripInfo.passengerCount);
      }

      if (hasValidCounts(roundTripInfo.passenger_counts)) {
        return toNumericCounts(roundTripInfo.passenger_counts);
      }

      if (hasValidCounts(searchInfo.passengers)) {
        return toNumericCounts(searchInfo.passengers);
      }

      return null;
    }

    if (isOneWayResponse(searchInfo) && hasValidCounts(searchInfo.passengers)) {
      return toNumericCounts(searchInfo.passengers);
    }

    return null;
  };

  const responseCounts = resolveFromSearchInfo();
  const overrideCounts = hasValidCounts(override)
    ? toNumericCounts(override)
    : null;

  let source: ResolvedPassengerInfo["source"] = "fallback";
  let preferredCounts: PassengerCountsLike | null = null;

  if (responseCounts) {
    source = "response";
    preferredCounts = responseCounts;
  } else if (overrideCounts) {
    source = "override";
    preferredCounts = overrideCounts;
  }

  const numeric = toNumericCounts(preferredCounts);
  const adults = numeric.adults > 0 ? numeric.adults : 1;
  const children = Math.max(0, numeric.children);
  const infants = Math.max(0, numeric.infants);
  const total = adults + children + infants;

  const parts: string[] = [];
  if (adults > 0) parts.push(`${adults} Người lớn`);
  if (children > 0) parts.push(`${children} Trẻ em`);
  if (infants > 0) parts.push(`${infants} Em bé`);

  return {
    total,
    detail: parts.join(", ") || "—",
    source,
    raw: numeric,
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
  activeDirection,
  countDisplayMode,
  onCountDisplayModeChange,
  itemsPerPage,
  onItemsPerPageChange,
  monthMeta,
  monthFlightsCount,
  monthTotalFlights,
}) => {
  const isMonthMode = Boolean(monthMeta);

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
    () => resolvePassengers(searchInfo, passengers),
    [searchInfo, passengers]
  );

  useEffect(() => {
    if (!import.meta.env?.DEV) return;
    if (!searchInfo) return;

    let responseSources: Record<string, unknown>;

    if (isRoundTripResponse(searchInfo)) {
      const roundTripInfo = searchInfo as typeof searchInfo & {
        passenger_count?: PassengerCountsLike | null;
        passengerCount?: PassengerCountsLike | null;
        passenger_counts?: PassengerCountsLike | null;
      };

      responseSources = {
        passenger_count: roundTripInfo.passenger_count ?? null,
        passengerCount: roundTripInfo.passengerCount ?? null,
        passenger_counts: roundTripInfo.passenger_counts ?? null,
        passengers: roundTripInfo.passengers ?? null,
      };
    } else if (isOneWayResponse(searchInfo)) {
      responseSources = {
        passengers: searchInfo.passengers ?? null,
      };
    } else {
      responseSources = { passengers: null };
    }

    console.debug("[FlightResultsOverview] Passenger counts state", {
      tripType,
      source: passengerInfo.source,
      resolved: passengerInfo.raw,
      detail: passengerInfo.detail,
      responseSources,
      overridePassengers: passengers,
    });

    if (tripType === "round-trip" && passengerInfo.source !== "response") {
      console.warn(
        "[FlightResultsOverview] Using fallback passenger data instead of round-trip response",
        {
          tripType,
          source: passengerInfo.source,
          responseSources,
          overridePassengers: passengers,
          resolved: passengerInfo.raw,
        }
      );
    }
  }, [tripType, searchInfo, passengers, passengerInfo]);

  const resolvedDisplayMode = countDisplayMode ?? "visible";

  const flightsSummary = useMemo(() => {
    if (isMonthMode && monthMeta) {
      const loadedDays = monthMeta.loadedDays ?? 0;
      const totalDays = monthMeta.totalDays ?? 0;
      const visibleFlights = monthFlightsCount ?? showingCount;
      const totalFlights =
        typeof monthTotalFlights === "number"
          ? monthTotalFlights
          : typeof totalCount === "number"
          ? totalCount
          : undefined;

      const daysPart =
        totalDays > 0
          ? `${loadedDays}/${totalDays} ngày`
          : `${loadedDays} ngày`;
      const flightsPart = totalFlights
        ? `${visibleFlights}/${totalFlights} vé`
        : `${visibleFlights} vé`;

      return `Đã tải ${daysPart} • ${flightsPart}`;
    }

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

    const currentlyVisible = showingCount;

    if (resolvedDisplayMode === "total") {
      return totalAvailable > 0
        ? `Tổng cộng ${totalAvailable} vé`
        : "Không tìm thấy chuyến bay phù hợp";
    }

    const showTotalSuffix =
      totalAvailable > 0 &&
      currentlyVisible > 0 &&
      currentlyVisible < totalAvailable;

    if (totalAvailable === 0) {
      return "Không tìm thấy chuyến bay phù hợp";
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
    resolvedDisplayMode,
    isMonthMode,
    monthMeta,
    monthFlightsCount,
    monthTotalFlights,
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
            !isMonthMode &&
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
              {onItemsPerPageChange && itemsPerPage !== undefined && (
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
