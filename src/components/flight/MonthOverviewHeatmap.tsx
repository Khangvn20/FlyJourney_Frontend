import React from "react";
import { formatPrice } from "../../shared/utils/format";
import type { FlightSearchApiResult } from "../../shared/types/search-api.types";

interface MonthOverviewHeatmapProps {
  perDayResults: { day: string; flights: FlightSearchApiResult[] }[];
  totalDays: number;
  onSelectDay: (day: string) => void;
}

const MonthOverviewHeatmap: React.FC<MonthOverviewHeatmapProps> = ({
  perDayResults,
  totalDays,
  onSelectDay,
}) => {
  const map = new Map<string, FlightSearchApiResult[]>(
    perDayResults.map((g) => [g.day, g.flights] as const)
  );
  const days: { dayStr: string; count: number; minPrice?: number }[] = [];

  const getAdultDisplayPrice = (pricing: FlightSearchApiResult["pricing"]) => {
    const baseWithTax = (pricing.base_prices?.adult || 0) + (pricing.taxes?.adult || 0);
    if (pricing.total_prices?.adult && pricing.total_prices.adult > 0) {
      return pricing.total_prices.adult;
    }
    if (baseWithTax > 0) {
      return baseWithTax;
    }
    return pricing.grand_total;
  };

  if (perDayResults.length > 0) {
    const sampleDay = perDayResults[0].day; // dd/mm/yyyy
    const [, mm, yyyy] = sampleDay.split("/");
    for (let d = 1; d <= totalDays; d++) {
      const ds = d.toString().padStart(2, "0") + "/" + mm + "/" + yyyy;
      const flights = map.get(ds) || [];
      let minPrice: number | undefined;
      flights.forEach((f) => {
        const adultPrice = getAdultDisplayPrice(f.pricing);
        if (minPrice === undefined || adultPrice < minPrice) {
          minPrice = adultPrice;
        }
      });
      days.push({ dayStr: ds, count: flights.length, minPrice });
    }
  }

  const priceValues = days
    .filter((d) => d.minPrice !== undefined)
    .map((d) => d.minPrice as number)
    .sort((a, b) => a - b);
  const low = priceValues[0];
  const high = priceValues[priceValues.length - 1];

  const scaleColor = (price?: number) => {
    if (price === undefined || low === undefined || high === undefined)
      return "bg-gray-100 text-gray-400";
    if (high === low) return "bg-green-500 text-white";
    const ratio = (price - low) / (high - low);
    if (ratio < 0.25) return "bg-green-500 text-white";
    if (ratio < 0.5) return "bg-green-400 text-white";
    if (ratio < 0.75) return "bg-amber-400 text-white";
    return "bg-red-500 text-white";
  };

  return (
    <div className="p-4 rounded-xl border bg-white shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-semibold text-gray-800">
          Tổng quan giá NL (thuế/phí) theo ngày
        </h4>
        <div className="flex items-center gap-2 text-[10px] font-medium">
          <span className="px-2 py-0.5 rounded bg-green-500 text-white">
            Rẻ
          </span>
          <span className="px-2 py-0.5 rounded bg-amber-400 text-white">
            TB
          </span>
          <span className="px-2 py-0.5 rounded bg-red-500 text-white">Cao</span>
        </div>
      </div>
      <div className="grid grid-cols-7 gap-2">
        {days.map((d) => (
          <button
            key={d.dayStr}
            onClick={() => d.count > 0 && onSelectDay(d.dayStr)}
            className={`relative h-14 rounded-lg flex flex-col items-center justify-center text-[10px] font-semibold transition-all border ${
              d.count > 0
                ? scaleColor(d.minPrice) +
                  " hover:brightness-110 border-transparent"
                : "bg-gray-50 border-dashed border-gray-300 text-gray-300"
            } ${d.count > 0 ? "cursor-pointer" : "cursor-default"}`}
            title={
              d.count > 0
                ? `Ngày ${d.dayStr}\n${d.count} chuyến • Giá NL (thuế/phí): ${formatPrice(d.minPrice ?? 0)}`
                : `Ngày ${d.dayStr}\nKhông có chuyến bay`
            }>
            <span>{d.dayStr.split("/")[0]}</span>
            {d.count > 0 && (
              <span className="text-[9px] font-normal opacity-90 mt-0.5">
                {d.minPrice !== undefined ? formatPrice(d.minPrice) : ""}
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};

export default MonthOverviewHeatmap;




