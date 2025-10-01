import React, { useRef, useState } from "react";
import SeatConditionModal from "../../components/booking/SeatConditionModal";
import { SERVICE_MAPPING } from "../../shared/constants/serviceMapping";
import { calculateAge } from "../../shared/utils/bookingApiHelpers";
import type { PassengerFormData } from "../../shared/types/passenger.types";
import SeatGrid from "./SeatGrid";
import ZoomControls from "./ZoomControls";
import type { SeatData, SeatInfo } from "./types";

interface SimpleSeatMapProps {
  onSeatSelect?: (seatId: string) => void;
  selectedSeats?: string[];
  maxSeats?: number;
  occupiedSeats?: string[];
  /** Optional map of seatId to price returned by API */
  seatPrices?: Record<string, number>;
  /** Optional mapping of row to seat attributes returned by API */
  rowAttributes?: Record<number, Array<"exit" | "extra" | "business">>;
  /** Override base seat price (fallback to SERVICE_MAPPING) */
  baseSeatPrice?: number;
  /** Override extra legroom price (fallback to SERVICE_MAPPING) */
  extraLegroomPrice?: number;
  /** Passenger currently selecting seat */
  currentPassenger?: PassengerFormData;
  /** Seat definitions returned from API */
  seatMap?: SeatInfo[];
  /** Force total number of rows when API doesn't provide full map */
  totalRowsOverride?: number;
}

const SimpleSeatMap: React.FC<SimpleSeatMapProps> = ({
  onSeatSelect,
  selectedSeats = [],
  maxSeats = 1,
  occupiedSeats = [],
  seatPrices,
  rowAttributes = {},
  baseSeatPrice,
  extraLegroomPrice,
  currentPassenger,
  seatMap,
  totalRowsOverride,
}) => {
  const seatLabels = ["A", "B", "C", "D", "E", "F"];
  const totalRows =
    totalRowsOverride ??
    (seatMap && seatMap.length
      ? seatMap.reduce((max, s) => {
          const row = parseInt(String(s.seat_number).slice(0, -1), 10);
          return row > max ? row : max;
        }, 0)
      : Math.max(
          0,
          ...Object.keys(rowAttributes || {}).map((r) => Number(r))
        ) || 30); // fallback default
  const seatRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const resolvedBasePrice =
    baseSeatPrice ??
    SERVICE_MAPPING.find((s) => s.id === "seat_selection")?.price ??
    0;
  const resolvedExtraPrice =
    extraLegroomPrice ??
    SERVICE_MAPPING.find((s) => s.id === "extra_legroom")?.price ??
    0;

  const [conditionModal, setConditionModal] = useState({
    open: false,
    reason: "",
  });

  const [scale, setScale] = useState(1);

  const validateSpecialSeatPassenger = (
    p?: PassengerFormData
  ): string | null => {
    if (!p) return "Thiếu thông tin hành khách.";
    const age = calculateAge(p.dateOfBirth);
    if (age < 15)
      return "Hành khách phải từ 15 tuổi trở lên mới được ngồi ghế thoát hiểm.";
    if (p.isPregnant)
      return "Hành khách đang mang thai không thể ngồi ghế thoát hiểm.";
    if (p.withInfant || p.type === "infant")
      return "Hành khách đi cùng em bé không thể ngồi ghế thoát hiểm.";
    if (p.reducedMobility)
      return "Hành khách hạn chế di chuyển không thể ngồi ghế thoát hiểm.";
    return null;
  };

  const generateSeats = (
    rowMapping: Record<number, Array<"exit" | "extra" | "business">>
  ): SeatData[] => {
    const seats: SeatData[] = [];

    for (let row = 1; row <= totalRows; row++) {
      const rowTypes = rowMapping[row] || [];
      for (let seatIndex = 0; seatIndex < seatLabels.length; seatIndex++) {
        const seatLabel = seatLabels[seatIndex];
        const seatId = `${row}${seatLabel}`;

        let seatClass: "economy" | "premium" | "business" | "first" = "economy";
        if (row >= 1 && row <= 3) {
          seatClass = "first";
        } else if (row >= 4 && row <= 8) {
          seatClass = "business";
        } else if (row >= 9 && row <= 15) {
          seatClass = "premium";
        } else {
          seatClass = "economy";
        }

        let status: "available" | "selected" | "occupied" | "unavailable" =
          "available";

        if (occupiedSeats.includes(seatId)) {
          status = "occupied";
        } else if (selectedSeats.includes(seatId)) {
          status = "selected";
        }

        seats.push({
          id: seatId,
          row,
          seat: seatLabel,
          status,
          price:
            seatPrices?.[seatId] ??
            (rowTypes.includes("exit") || rowTypes.includes("extra")
              ? resolvedExtraPrice
              : resolvedBasePrice),
          class: seatClass,
          isExitRow: rowTypes.includes("exit"),
          isExtraLegroom: rowTypes.includes("extra"),
        });
      }
    }

    return seats;
  };

  const seats = generateSeats(rowAttributes);

  const handleSeatClick = (seat: SeatData) => {
    if (seat.status === "occupied" || seat.status === "unavailable") {
      return;
    }

    if (seat.isExitRow || seat.isExtraLegroom) {
      const reason = validateSpecialSeatPassenger(currentPassenger);
      if (reason) {
        setConditionModal({ open: true, reason });
        return;
      }
    }

    // Kiểm tra số lượng ghế tối đa
    if (seat.status === "available" && selectedSeats.length >= maxSeats) {
      return;
    }

    // Subtle bounce animation for feedback
    const el = seatRefs.current[seat.id];
    el?.animate(
      [
        { transform: "scale(1)" },
        { transform: "scale(1.1)" },
        { transform: "scale(1)" },
      ],
      { duration: 200, easing: "ease-out" }
    );

    if (onSeatSelect) {
      onSeatSelect(seat.id);
    }
  };

  return (
    <>
      <div className="max-w-4xl mx-auto">
        {/* Modern Aircraft Preview */}
        <div className="relative mb-8 bg-gradient-to-br from-slate-50 to-blue-50 rounded-2xl p-6 shadow-lg border border-slate-200">
          {/* Aircraft Illustration */}
          <div className="relative bg-gradient-to-b from-slate-100 via-slate-200 to-slate-300 rounded-t-[3rem] rounded-b-xl p-6 shadow-xl overflow-hidden">
            {/* Subtle background pattern */}
            <div className="absolute inset-0 opacity-5">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-500 via-transparent to-transparent"></div>
            </div>

            {/* Cockpit */}
            <div className="flex justify-center mb-4 relative z-10">
              <div className="bg-gradient-to-b from-blue-900 to-blue-800 rounded-t-full px-6 py-2 shadow-lg border border-blue-700">
                <div className="text-white text-sm font-bold tracking-wide">
                  ✈️ COCKPIT
                </div>
              </div>
            </div>

            {/* Wing indicators with improved design */}
            <div className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-2">
              <div className="bg-gradient-to-r from-slate-400 to-slate-500 w-12 h-3 rounded-r-full shadow-md"></div>
              <div className="text-xs text-slate-600 font-medium mt-1 -ml-1">
                Cánh trái
              </div>
            </div>
            <div className="absolute right-0 top-1/2 transform -translate-y-1/2 translate-x-2">
              <div className="bg-gradient-to-l from-slate-400 to-slate-500 w-12 h-3 rounded-l-full shadow-md"></div>
              <div className="text-xs text-slate-600 font-medium mt-1 -mr-1 text-right">
                Cánh phải
              </div>
            </div>

            {/* Enhanced Class sections */}
            <div className="grid gap-4 md:grid-cols-2 relative z-10">
              {/* First Class */}
              <div className="bg-gradient-to-br from-amber-50 to-yellow-100 border-2 border-amber-300 rounded-xl p-4 shadow-md hover:shadow-lg transition-all duration-300">
                <div className="text-center">
                  <div className="text-lg font-bold text-amber-800 mb-2 flex items-center justify-center gap-2">
                    <span className="text-2xl">👑</span>
                    FIRST CLASS
                  </div>
                  <div className="text-sm text-amber-700 font-medium mb-1">
                    Hàng 1-3
                  </div>
                  <div className="text-xs text-amber-600 leading-relaxed">
                    Ghế rộng rãi • Dịch vụ 5 sao • Ưu tiên tuyệt đối
                  </div>
                </div>
              </div>

              {/* Business Class */}
              <div className="bg-gradient-to-br from-emerald-50 to-green-100 border-2 border-emerald-300 rounded-xl p-4 shadow-md hover:shadow-lg transition-all duration-300">
                <div className="text-center">
                  <div className="text-lg font-bold text-emerald-800 mb-2 flex items-center justify-center gap-2">
                    <span className="text-2xl">💼</span>
                    BUSINESS CLASS
                  </div>
                  <div className="text-sm text-emerald-700 font-medium mb-1">
                    Hàng 4-8
                  </div>
                  <div className="text-xs text-emerald-600 leading-relaxed">
                    Ghế thoải mái • Suất ăn đặc biệt • Phòng chờ VIP
                  </div>
                </div>
              </div>

              {/* Premium Economy */}
              <div className="bg-gradient-to-br from-purple-50 to-violet-100 border-2 border-purple-300 rounded-xl p-4 shadow-md hover:shadow-lg transition-all duration-300">
                <div className="text-center">
                  <div className="text-lg font-bold text-purple-800 mb-2 flex items-center justify-center gap-2">
                    <span className="text-2xl">⭐</span>
                    PREMIUM ECONOMY
                  </div>
                  <div className="text-sm text-purple-700 font-medium mb-1">
                    Hàng 9-15
                  </div>
                  <div className="text-xs text-purple-600 leading-relaxed">
                    Ghế rộng hơn • Ưu tiên nhẹ • Giá trị tối ưu
                  </div>
                </div>
              </div>

              {/* Economy Class */}
              <div className="bg-gradient-to-br from-blue-50 to-sky-100 border-2 border-blue-300 rounded-xl p-4 shadow-md hover:shadow-lg transition-all duration-300">
                <div className="text-center">
                  <div className="text-lg font-bold text-blue-800 mb-2 flex items-center justify-center gap-2">
                    <span className="text-2xl">🎫</span>
                    ECONOMY CLASS
                  </div>
                  <div className="text-sm text-blue-700 font-medium mb-1">
                    Hàng 16-30
                  </div>
                  <div className="text-xs text-blue-600 leading-relaxed">
                    Giá tốt nhất • Dịch vụ tiêu chuẩn • Phù hợp mọi ngân sách
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Instructions Panel */}
        <div className="mb-6 grid md:grid-cols-2 gap-4">
          {/* Seat Selection Guide */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-l-4 border-blue-500 rounded-lg p-5 shadow-md">
            <h4 className="text-lg font-bold text-blue-800 mb-3 flex items-center gap-2">
              <span className="text-xl">💡</span>
              Hướng dẫn chọn ghế
            </h4>
            <div className="space-y-2">
              <div className="flex items-center gap-3 text-sm text-blue-700">
                <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                <strong>Ghế cửa sổ (A, F):</strong> Ngắm cảnh, tựa tường nghỉ
              </div>
              <div className="flex items-center gap-3 text-sm text-blue-700">
                <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                <strong>Ghế lối đi (C, D):</strong> Dễ di chuyển, chân thoải mái
              </div>
              <div className="flex items-center gap-3 text-sm text-blue-700">
                <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                <strong>Ghế giữa (B, E):</strong> Giá tốt, phù hợp nhóm
              </div>
              <div className="flex items-center gap-3 text-sm text-blue-700">
                <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                <strong>Hàng đầu mỗi khu:</strong> Không gian chân rộng hơn
              </div>
            </div>
          </div>

          {/* Legend */}
          <div className="bg-gradient-to-br from-slate-50 to-gray-50 border border-slate-200 rounded-lg p-5 shadow-md">
            <h4 className="text-lg font-bold text-slate-800 mb-3 flex items-center gap-2">
              <span className="text-xl">🎨</span>Ý nghĩa màu sắc
            </h4>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-gray-200 rounded border-2 border-gray-300"></div>
                <span className="text-sm font-medium text-slate-700">
                  Trống
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-blue-500 rounded border-2 border-blue-600"></div>
                <span className="text-sm font-medium text-blue-600">
                  Đã chọn
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-red-500 rounded border-2 border-red-600"></div>
                <span className="text-sm font-medium text-red-600">Đã đặt</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-gray-400 rounded border-2 border-gray-500"></div>
                <span className="text-sm font-medium text-gray-600">
                  Bảo trì
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-green-300 rounded border-2 border-green-500"></div>
                <span className="text-sm font-medium text-green-600">
                  Thoát hiểm
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-indigo-300 rounded border-2 border-indigo-500"></div>
                <span className="text-sm font-medium text-indigo-600">
                  Chân rộng
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Seat Map */}
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
          <div className="bg-gradient-to-r from-slate-100 to-blue-100 px-6 py-4 border-b border-slate-200">
            <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <span className="text-2xl">🗺️</span>
              Sơ đồ ghế ngồi
            </h3>
            <p className="text-sm text-slate-600 mt-1">
              Chọn ghế phù hợp với nhu cầu của bạn
            </p>
          </div>

          <div className="p-6">
            <ZoomControls scale={scale} setScale={setScale}>
              <SeatGrid
                seats={seats}
                seatLabels={seatLabels}
                totalRows={totalRows}
                basePrice={resolvedBasePrice}
                seatRefs={seatRefs}
                onSeatClick={handleSeatClick}
              />
            </ZoomControls>
          </div>
        </div>
      </div>

      <SeatConditionModal
        open={conditionModal.open}
        reason={conditionModal.reason}
        onOpenChange={(open) =>
          setConditionModal((prev) => ({ ...prev, open }))
        }
      />
    </>
  );
};

export default SimpleSeatMap;
