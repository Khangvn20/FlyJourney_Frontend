import React, { useMemo } from "react";
import { formatPrice } from "../../shared/utils/format";
import type { FlightSearchApiResult } from "../../shared/types/search-api.types";
import type { PerDayFlightsGroup } from "../../lib/searchUtils";

interface MonthOverviewHeatmapProps {
  monthLabel: string;
  totalDays: number;
  dayGroups: PerDayFlightsGroup[];
  activeDay: string | null;
  onSelectDay: (day: string) => void;
}

interface EnrichedDay {
  day: string;
  displayDay: string;
  weekday: string;
  minPrice: number;
  flightsCount: number;
}

const getAdultDisplayPrice = (pricing: FlightSearchApiResult["pricing"]) => {
  const baseWithTax =
    (pricing.base_prices?.adult || 0) + (pricing.taxes?.adult || 0);
  if (pricing.total_prices?.adult && pricing.total_prices.adult > 0) {
    return pricing.total_prices.adult;
  }
  if (baseWithTax > 0) {
    return baseWithTax;
  }
  return pricing.grand_total;
};

const parseDay = (day: string) => {
  const [d, m, y] = day.split("/").map(Number);
  if (!d || !m || !y) return null;
  const date = new Date(y, m - 1, d);
  return Number.isNaN(date.getTime()) ? null : date;
};

const MonthOverviewHeatmap: React.FC<MonthOverviewHeatmapProps> = ({
  monthLabel,
  totalDays,
  dayGroups,
  activeDay,
  onSelectDay,
}) => {
  const enrichedDays = useMemo<EnrichedDay[]>(() => {
    return dayGroups
      .filter((group) => group.flights && group.flights.length > 0)
      .map((group) => {
        const date = parseDay(group.day);
        const minPrice = group.flights.reduce((min, flight) => {
          const price = getAdultDisplayPrice(flight.pricing);
          if (min === null || price < min) {
            return price;
          }
          return min;
        }, null as number | null);

        const displayDay = date
          ? date.getDate().toString().padStart(2, "0")
          : group.day;
        const weekday = date
          ? date
              .toLocaleDateString("vi-VN", { weekday: "short" })
              .replace(".", "")
          : "";

        return {
          day: group.day,
          displayDay,
          weekday,
          minPrice: minPrice ?? 0,
          flightsCount: group.flights.length,
        };
      })
      .sort((a, b) => {
        const dateA = parseDay(a.day)?.getTime() ?? 0;
        const dateB = parseDay(b.day)?.getTime() ?? 0;
        return dateA - dateB;
      });
  }, [dayGroups]);

  const priceRange = useMemo(() => {
    const prices = enrichedDays.map((d) => d.minPrice).filter((p) => p > 0);
    if (prices.length === 0) {
      return { min: 0, max: 0 } as const;
    }
    return {
      min: Math.min(...prices),
      max: Math.max(...prices),
    } as const;
  }, [enrichedDays]);

  const scaleColor = (price: number) => {
    if (priceRange.max === 0 || priceRange.max === priceRange.min) {
      return "bg-emerald-500 text-white";
    }
    const ratio = (price - priceRange.min) / (priceRange.max - priceRange.min);
    if (ratio <= 0.25) return "bg-emerald-500 text-white";
    if (ratio <= 0.5) return "bg-emerald-400 text-white";
    if (ratio <= 0.75) return "bg-amber-400 text-white";
    return "bg-rose-500 text-white";
  };

  return (
    <div className="p-4 rounded-xl border bg-white shadow-sm space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h4 className="text-sm font-semibold text-slate-900">
            Biểu đồ giá theo ngày • {monthLabel}
          </h4>
          <p className="text-xs text-slate-500">
            {enrichedDays.length} ngày có dữ liệu trong tổng {totalDays} ngày
          </p>
        </div>
        <div className="flex items-center gap-2 text-[10px] font-medium">
          <span className="px-2 py-0.5 rounded bg-emerald-500 text-white">
            Rẻ
          </span>
          <span className="px-2 py-0.5 rounded bg-amber-400 text-white">
            Trung bình
          </span>
          <span className="px-2 py-0.5 rounded bg-rose-500 text-white">
            Cao
          </span>
        </div>
      </div>

      {enrichedDays.length === 0 ? (
        <div className="p-6 text-sm text-slate-500 bg-slate-50 rounded-lg border border-dashed border-slate-200">
          Chưa có dữ liệu chuyến bay cho tháng này. Vui lòng thay đổi bộ lọc
          hoặc chọn tháng khác.
        </div>
      ) : (
        <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-7 gap-2 md:auto-rows-[96px] lg:auto-rows-[104px] md:min-h-[200px] lg:min-h-[220px]">
          {enrichedDays.map((day) => {
            const isActive = activeDay === day.day;
            return (
              <button
                key={day.day}
                type="button"
                onClick={() => onSelectDay(day.day)}
                className={`relative flex h-full w-full min-w-[68px] flex-col items-center justify-center rounded-lg border text-xs font-semibold shadow-sm transition focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-300 ${scaleColor(
                  day.minPrice
                )} ${
                  isActive
                    ? "ring-2 ring-offset-2 ring-offset-white ring-blue-400"
                    : "hover:scale-[1.03]"
                }`}
                title={`Ngày ${day.day}\n${
                  day.flightsCount
                } chuyến • ${formatPrice(day.minPrice)}`}>
                <span className="text-[10px] uppercase tracking-tight opacity-80">
                  {day.weekday}
                </span>
                <span className="text-base font-extrabold">
                  {day.displayDay}
                </span>
                <span className="text-[10px] font-medium opacity-90">
                  {formatPrice(day.minPrice)}
                </span>
                <span className="text-[9px] font-medium opacity-80 mt-0.5">
                  {day.flightsCount} chuyến
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MonthOverviewHeatmap;
