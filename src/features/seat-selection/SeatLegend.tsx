import React from "react";
import type { LucideIcon } from "lucide-react";
import { Armchair, Ban, Crown, DoorOpen, Expand, Info } from "lucide-react";
import { SEAT_COPY } from "../../shared/constants/seatCopy";

type SeatStatus = {
  label: string;
  color: string;
  bgColor: string;
  Icon: LucideIcon;
  tooltip: string;
  category: "status" | "special" | "class";
};

const seatStatuses: SeatStatus[] = [
  {
    label: "Trống",
    color: "text-slate-600",
    bgColor: "bg-slate-100",
    Icon: Armchair,
    tooltip: "Ghế có thể chọn",
    category: "status",
  },
  {
    label: "Đã chọn",
    color: "text-white",
    bgColor: "bg-blue-500",
    Icon: Armchair,
    tooltip: "Ghế bạn đã chọn",
    category: "status",
  },
  {
    label: "Đã đặt",
    color: "text-white",
    bgColor: "bg-red-500",
    Icon: Armchair,
    tooltip: "Ghế đã được khách khác đặt",
    category: "status",
  },
  {
    label: "Bảo trì",
    color: "text-white",
    bgColor: "bg-gray-500",
    Icon: Ban,
    tooltip: "Ghế tạm thời không thể sử dụng",
    category: "status",
  },
  {
    label: "Thoát hiểm",
    color: "text-green-700",
    bgColor: "bg-green-100",
    Icon: DoorOpen,
    tooltip: "Ghế thoát hiểm - yêu cầu đặc biệt",
    category: "special",
  },
  {
    label: "Chân rộng",
    color: "text-indigo-700",
    bgColor: "bg-indigo-100",
    Icon: Expand,
    tooltip: SEAT_COPY.extraLegroom,
    category: "special",
  },
  {
    label: "First/Business",
    color: "text-amber-700",
    bgColor: "bg-amber-100",
    Icon: Crown,
    tooltip: "Ghế hạng thương gia/hạng nhất",
    category: "class",
  },
];

const SeatLegend: React.FC = () => {
  const statusSeats = seatStatuses.filter((s) => s.category === "status");
  const specialSeats = seatStatuses.filter((s) => s.category === "special");
  const classSeats = seatStatuses.filter((s) => s.category === "class");

  return (
    <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-100 to-blue-100 px-4 py-3 border-b border-slate-200">
        <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
          <Info className="h-5 w-5 text-blue-600" />
          Chú thích
        </h3>
      </div>

      <div className="p-4 space-y-4">
        {/* Status Section */}
        <div>
          <h4 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
            <span className="w-3 h-3 bg-blue-500 rounded"></span>
            Trạng thái ghế
          </h4>
          <div className="grid grid-cols-2 gap-2">
            {statusSeats.map(({ label, color, bgColor, Icon, tooltip }) => (
              <div
                key={label}
                className="flex items-center gap-2 p-2 rounded-lg hover:bg-slate-50 transition-colors group"
                title={tooltip}>
                <div
                  className={`w-6 h-6 rounded-md ${bgColor} flex items-center justify-center shadow-sm border border-slate-200`}>
                  <Icon className={`h-3 w-3 ${color}`} aria-hidden="true" />
                </div>
                <span className="text-sm font-medium text-slate-700 group-hover:text-slate-900">
                  {label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Special Seats Section */}
        <div>
          <h4 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
            <span className="w-3 h-3 bg-green-500 rounded"></span>
            Ghế đặc biệt
          </h4>
          <div className="space-y-2">
            {specialSeats.map(({ label, color, bgColor, Icon, tooltip }) => (
              <div
                key={label}
                className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors group"
                title={tooltip}>
                <div
                  className={`w-8 h-8 rounded-lg ${bgColor} flex items-center justify-center shadow-sm border-2 border-slate-200`}>
                  <Icon className={`h-4 w-4 ${color}`} aria-hidden="true" />
                </div>
                <div className="flex-1">
                  <div className="text-sm font-medium text-slate-700 group-hover:text-slate-900">
                    {label}
                  </div>
                  <div className="text-xs text-slate-500 leading-relaxed">
                    {tooltip.length > 50
                      ? `${tooltip.substring(0, 50)}...`
                      : tooltip}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Class Section */}
        <div>
          <h4 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
            <span className="w-3 h-3 bg-amber-500 rounded"></span>
            Hạng ghế
          </h4>
          <div className="space-y-2">
            {classSeats.map(({ label, color, bgColor, Icon, tooltip }) => (
              <div
                key={label}
                className="flex items-center gap-3 p-3 rounded-lg bg-gradient-to-r from-amber-50 to-yellow-50 hover:from-amber-100 hover:to-yellow-100 transition-all duration-200 group border border-amber-200"
                title={tooltip}>
                <div
                  className={`w-8 h-8 rounded-lg ${bgColor} flex items-center justify-center shadow-sm border-2 border-amber-300`}>
                  <Icon className={`h-4 w-4 ${color}`} aria-hidden="true" />
                </div>
                <div className="flex-1">
                  <div className="text-sm font-medium text-slate-700 group-hover:text-slate-900">
                    {label}
                  </div>
                  <div className="text-xs text-amber-700">{tooltip}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick tips */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-3 border border-blue-200">
          <h5 className="text-sm font-semibold text-blue-800 mb-2">
            💡 Mẹo chọn ghế
          </h5>
          <ul className="text-xs text-blue-700 space-y-1">
            <li>• Click vào ghế để xem thông tin chi tiết</li>
            <li>• Ghế cửa sổ (A,F): Tốt cho ngắm cảnh</li>
            <li>• Ghế lối đi (C,D): Dễ di chuyển</li>
            <li>• Hàng đầu mỗi khu: Không gian chân rộng</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default SeatLegend;
