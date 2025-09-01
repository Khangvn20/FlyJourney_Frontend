import React from "react";

const SeatLegend: React.FC = () => (
  <div className="flex gap-4 text-sm justify-center mb-4">
    <div className="flex items-center gap-1">
      <span className="w-4 h-4 bg-gray-200 border rounded" /> Trống
    </div>
    <div className="flex items-center gap-1">
      <span className="w-4 h-4 bg-blue-500 border rounded" /> Đã chọn
    </div>
    <div className="flex items-center gap-1">
      <span className="w-4 h-4 bg-red-500 border rounded" /> Đã bán
    </div>
  </div>
);

export default SeatLegend;
