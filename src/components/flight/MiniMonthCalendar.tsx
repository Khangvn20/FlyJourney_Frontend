import React, { useMemo } from "react";
import type {
  MonthBucketSummary,
  PerDayFlightsGroup,
} from "../../lib/searchUtils";

interface MiniMonthCalendarProps {
  month: MonthBucketSummary | null;
  dayGroups: PerDayFlightsGroup[];
  filteredDayGroups: PerDayFlightsGroup[];
  activeDay: string | null;
  onSelectDay: (day: string) => void;
  onPrevMonth?: () => void;
  onNextMonth?: () => void;
}

type CalendarCell = {
  label: string;
  dayStr: string | null;
  inMonth: boolean;
  hasFlights: boolean;
  hasFilteredFlights: boolean;
};

const WEEKDAY_LABELS = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];

const MiniMonthCalendar: React.FC<MiniMonthCalendarProps> = ({
  month,
  dayGroups,
  filteredDayGroups,
  activeDay,
  onSelectDay,
  onPrevMonth,
  onNextMonth,
}) => {
  const availableDays = useMemo(() => {
    return new Set(dayGroups.map((group) => group.day));
  }, [dayGroups]);

  const filteredDays = useMemo(() => {
    return new Set(
      filteredDayGroups
        .filter((group) => group.flights.length > 0)
        .map((group) => group.day)
    );
  }, [filteredDayGroups]);

  const calendarCells = useMemo<CalendarCell[]>(() => {
    if (!month) return [];

    const cells: CalendarCell[] = [];
    const { month: monthNumber, year, totalCalendarDays } = month;
    const firstDayOfWeek = new Date(year, monthNumber - 1, 1).getDay();

    for (let i = 0; i < firstDayOfWeek; i += 1) {
      cells.push({
        label: "",
        dayStr: null,
        inMonth: false,
        hasFlights: false,
        hasFilteredFlights: false,
      });
    }

    for (let day = 1; day <= totalCalendarDays; day += 1) {
      const dayStr = `${String(day).padStart(2, "0")}/${String(
        monthNumber
      ).padStart(2, "0")}/${year}`;
      const hasFlights = availableDays.has(dayStr);
      const hasFilteredFlights = filteredDays.has(dayStr);
      cells.push({
        label: String(day),
        dayStr,
        inMonth: true,
        hasFlights,
        hasFilteredFlights,
      });
    }

    while (cells.length % 7 !== 0) {
      cells.push({
        label: "",
        dayStr: null,
        inMonth: false,
        hasFlights: false,
        hasFilteredFlights: false,
      });
    }

    return cells;
  }, [month, availableDays, filteredDays]);

  return (
    <div className="w-full rounded-2xl border border-blue-100 bg-white/95 p-3 shadow-md backdrop-blur-sm">
      <div className="mb-3 flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={onPrevMonth}
          disabled={!onPrevMonth}
          className={`flex h-7 w-7 items-center justify-center rounded-full border text-xs font-semibold transition ${
            onPrevMonth
              ? "border-blue-200 text-blue-600 hover:bg-blue-50"
              : "border-slate-200 text-slate-300"
          }`}
          aria-label="Tháng trước">
          ◀
        </button>
        <div className="text-sm font-semibold text-blue-800 tracking-tight">
          {month?.label ?? "Chưa có dữ liệu"}
        </div>
        <button
          type="button"
          onClick={onNextMonth}
          disabled={!onNextMonth}
          className={`flex h-7 w-7 items-center justify-center rounded-full border text-xs font-semibold transition ${
            onNextMonth
              ? "border-blue-200 text-blue-600 hover:bg-blue-50"
              : "border-slate-200 text-slate-300"
          }`}
          aria-label="Tháng sau">
          ▶
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 text-[10px] font-semibold uppercase tracking-wide text-slate-400">
        {WEEKDAY_LABELS.map((label) => (
          <div key={label} className="text-center">
            {label}
          </div>
        ))}
      </div>

      <div className="mt-2 grid grid-cols-7 gap-1">
        {calendarCells.map((cell, index) => {
          if (!cell.inMonth) {
            return <div key={`empty-${index}`} className="h-9" />;
          }

          const isActive = activeDay === cell.dayStr;
          const hasVisibleFlights = cell.hasFilteredFlights;

          const baseClasses = hasVisibleFlights
            ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
            : "bg-slate-100 text-slate-400 hover:bg-slate-200";
          const activeClasses = hasVisibleFlights
            ? "bg-emerald-500 text-white shadow-sm ring-2 ring-emerald-200 ring-offset-1 ring-offset-white"
            : "bg-slate-400 text-white shadow-sm ring-2 ring-slate-200 ring-offset-1 ring-offset-white";
          const finalClasses = isActive ? activeClasses : baseClasses;

          return (
            <button
              key={cell.dayStr ?? index}
              type="button"
              onClick={() => cell.dayStr && onSelectDay(cell.dayStr)}
              disabled={!cell.dayStr}
              className={`relative flex h-9 w-9 items-center justify-center rounded-full text-[11px] font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-300 ${
                cell.dayStr ? "cursor-pointer" : "cursor-default"
              } ${finalClasses}`}>
              {cell.label}
            </button>
          );
        })}
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2 text-[10px] text-slate-500">
        <div className="flex items-center gap-1">
          <span className="inline-block h-2 w-2 rounded-full bg-sky-500" />
          <span>Có chuyến bay phù hợp</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="inline-block h-2 w-2 rounded-full bg-slate-300" />
          <span>Chưa có chuyến bay phù hợp</span>
        </div>
      </div>
    </div>
  );
};

export default MiniMonthCalendar;
