import React from "react";
import {
  Calendar as CalendarIcon,
  X as XIcon,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import MonthOverviewHeatmap from "./MonthOverviewHeatmap";
import type {
  MonthRangeMeta,
  PerDayFlightsGroup,
  MonthBucketSummary,
} from "../../lib/searchUtils";

interface MonthOverviewProps {
  monthMeta: MonthRangeMeta;
  dayGroups: PerDayFlightsGroup[];
  monthBuckets: MonthBucketSummary[];
  activeMonthKey: string | null;
  onMonthChange: (key: string) => void;
  activeDay: string | null;
  onSelectDay: (day: string) => void;
  show: boolean;
  onToggle: () => void;
}

const MonthOverview: React.FC<MonthOverviewProps> = ({
  monthMeta,
  dayGroups,
  monthBuckets,
  activeMonthKey,
  onMonthChange,
  activeDay,
  onSelectDay,
  show,
  onToggle,
}) => {
  const rangeLabel =
    monthMeta.monthsCount > 1
      ? `Kết quả từ ${String(monthMeta.startMonth).padStart(2, "0")}/${
          monthMeta.startYear
        } đến ${String(monthMeta.endMonth).padStart(2, "0")}/${
          monthMeta.endYear
        }`
      : `Kết quả theo tháng ${monthMeta.startMonth}/${monthMeta.startYear}`;

  const currentIndex = activeMonthKey
    ? monthBuckets.findIndex((bucket) => bucket.key === activeMonthKey)
    : monthBuckets.length > 0
    ? 0
    : -1;

  const currentBucket =
    currentIndex >= 0 ? monthBuckets[currentIndex] : monthBuckets[0] ?? null;

  const loadedDays =
    currentBucket?.loadedDays ?? monthMeta.loadedDays ?? dayGroups.length;
  const totalDays =
    currentBucket?.totalCalendarDays ??
    monthMeta.totalDays ??
    currentBucket?.loadedDays ??
    dayGroups.length;
  const dayProgress =
    totalDays && totalDays > 0 ? `${loadedDays}/${totalDays}` : `${loadedDays}`;

  const monthSummaryLabel = currentBucket?.label ?? rangeLabel;

  const canGoPrev = currentIndex > 0;
  const canGoNext = currentIndex >= 0 && currentIndex < monthBuckets.length - 1;

  const handlePrevMonth = () => {
    if (canGoPrev) {
      onMonthChange(monthBuckets[currentIndex - 1].key);
    }
  };

  const handleNextMonth = () => {
    if (canGoNext) {
      onMonthChange(monthBuckets[currentIndex + 1].key);
    }
  };

  return (
    <div className="mb-6 space-y-3">
      <div className="flex flex-col gap-3 rounded-xl border border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50/60 p-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600 shadow">
            <CalendarIcon className="h-5 w-5 text-white" />
          </div>
          <div>
            <p className="text-sm font-semibold text-blue-900">{rangeLabel}</p>
            <p className="text-xs text-blue-700">
              Đã tải {dayProgress} ngày
              {monthMeta.loading && " – đang tiếp tục..."}
            </p>
          </div>
        </div>

        <div className="flex flex-col items-stretch gap-2 sm:flex-row sm:items-center">
          <div className="flex items-center gap-1 rounded-lg border border-blue-200 bg-white/70 px-2 py-1 shadow-sm">
            <button
              type="button"
              onClick={handlePrevMonth}
              disabled={!canGoPrev}
              className={`rounded-md px-2 py-1 text-xs font-semibold transition ${
                canGoPrev
                  ? "text-blue-700 hover:bg-blue-50"
                  : "cursor-not-allowed text-blue-300"
              }`}>
              Trước
            </button>
            <span className="px-2 text-xs font-semibold text-blue-700">
              {monthSummaryLabel}
            </span>
            <button
              type="button"
              onClick={handleNextMonth}
              disabled={!canGoNext}
              className={`rounded-md px-2 py-1 text-xs font-semibold transition ${
                canGoNext
                  ? "text-blue-700 hover:bg-blue-50"
                  : "cursor-not-allowed text-blue-300"
              }`}>
              Sau
            </button>
          </div>

          {currentBucket && (
            <span className="rounded-md border border-blue-200 bg-blue-100/60 px-2 py-1 text-[10px] font-medium text-blue-600">
              {currentBucket.loadedDays} ngày có chuyến /{" "}
              {currentBucket.totalCalendarDays} ngày
            </span>
          )}

          <button
            onClick={onToggle}
            className="flex items-center gap-1 rounded-md border border-blue-200 bg-white/70 px-3 py-2 text-xs font-medium text-blue-700 shadow-sm hover:bg-white">
            {show ? (
              <>
                <ChevronUp className="h-3 w-3" />
                Thu gọn tổng quan
              </>
            ) : (
              <>
                <ChevronDown className="h-3 w-3" />
                Mở tổng quan
              </>
            )}
          </button>

          {monthMeta.loading && (
            <button
              onClick={() => {
                sessionStorage.setItem("cancelMonthSearch", "1");
                window.dispatchEvent(new CustomEvent("cancelMonthSearch"));
              }}
              className="flex items-center gap-1 rounded-md border border-red-300 bg-red-100 px-3 py-2 text-xs font-semibold text-red-700 shadow-sm hover:bg-red-200">
              <XIcon className="h-3 w-3" />
              Hủy
            </button>
          )}
        </div>
      </div>

      {show && (
        <MonthOverviewHeatmap
          monthLabel={monthSummaryLabel}
          totalDays={totalDays}
          dayGroups={dayGroups}
          activeDay={activeDay}
          onSelectDay={onSelectDay}
        />
      )}
    </div>
  );
};

export default MonthOverview;
