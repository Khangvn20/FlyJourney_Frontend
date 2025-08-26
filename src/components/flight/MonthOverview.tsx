import React from "react";
import {
  Calendar as CalendarIcon,
  X as XIcon,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import MonthOverviewHeatmap from "./MonthOverviewHeatmap";
import type { PerDayFlightsGroup } from "../../lib/searchUtils";

interface MonthOverviewProps {
  monthMeta: { month: number; year: number; days: number; loading: boolean };
  perDayResults: PerDayFlightsGroup[];
  show: boolean;
  onToggle: () => void;
}

const MonthOverview: React.FC<MonthOverviewProps> = ({
  monthMeta,
  perDayResults,
  show,
  onToggle,
}) => {
  return (
    <div className="mb-6 space-y-3">
      <div className="p-4 rounded-xl border border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50/60 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center shadow">
            <CalendarIcon className="h-5 w-5 text-white" />
          </div>
          <div>
            <p className="text-sm font-semibold text-blue-900">
              Kết quả theo tháng {monthMeta.month}/{monthMeta.year}
            </p>
            <p className="text-xs text-blue-700">
              Đã tải {perDayResults.length}/{monthMeta.days} ngày
              {monthMeta.loading && " – đang tiếp tục..."}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={onToggle}
            className="text-xs px-3 py-2 rounded-md font-medium bg-white/70 hover:bg-white border border-blue-200 text-blue-700 flex items-center gap-1 shadow-sm"
          >
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
              className="text-xs px-3 py-2 rounded-md font-semibold bg-red-100 hover:bg-red-200 text-red-700 border border-red-300 flex items-center gap-1 shadow-sm"
            >
              <XIcon className="h-3 w-3" />
              Hủy
            </button>
          )}
        </div>
      </div>
      {show && (
        <MonthOverviewHeatmap
          perDayResults={perDayResults}
          totalDays={monthMeta.days}
          onSelectDay={(day) => {
            const el = document.getElementById(`day-${day.replace(/\//g, "-")}`);
            if (el)
              el.scrollIntoView({ behavior: "smooth", block: "start" });
          }}
        />
      )}
    </div>
  );
};

export default MonthOverview;

