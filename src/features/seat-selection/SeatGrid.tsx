import React, { useState } from "react";
import { Armchair, Ban, Crown, DoorOpen, Expand } from "lucide-react";
import Tooltip from "../../components/ui/tooltip";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../../components/ui/popover";
import { formatPrice } from "../../shared/utils/format";
import { SEAT_COPY } from "../../shared/constants/seatCopy";
import type { SeatData } from "./types";

interface SeatGridProps {
  seats: SeatData[];
  seatLabels: string[];
  totalRows: number;
  basePrice: number;
  seatRefs: React.MutableRefObject<Record<string, HTMLButtonElement | null>>;
  onSeatClick: (seat: SeatData) => void;
}

const SeatGrid: React.FC<SeatGridProps> = ({
  seats,
  seatLabels,
  totalRows,
  basePrice,
  seatRefs,
  onSeatClick,
}) => {
  const [focusedSeat, setFocusedSeat] = useState<string | null>(null);

  const handleSeatKeyDown = (
    e: React.KeyboardEvent<HTMLButtonElement>,
    seat: SeatData
  ) => {
    const currentRow = seat.row;
    const currentCol = seatLabels.indexOf(seat.seat);
    const move = (dRow: number, dCol: number) => {
      let row = currentRow + dRow;
      let col = currentCol + dCol;
      while (
        row >= 1 &&
        row <= totalRows &&
        col >= 0 &&
        col < seatLabels.length
      ) {
        const targetId = `${row}${seatLabels[col]}`;
        const target = seatRefs.current[targetId];
        if (target && !target.disabled) {
          target.focus();
          break;
        }
        row += dRow;
        col += dCol;
      }
    };

    switch (e.key) {
      case "ArrowUp":
        e.preventDefault();
        move(-1, 0);
        break;
      case "ArrowDown":
        e.preventDefault();
        move(1, 0);
        break;
      case "ArrowLeft":
        e.preventDefault();
        move(0, -1);
        break;
      case "ArrowRight":
        e.preventDefault();
        move(0, 1);
        break;
      case " ":
      case "Enter":
        e.preventDefault();
        onSeatClick(seat);
        break;
    }
  };

  const renderSeatIcon = (seat: SeatData) => {
    let Icon = Armchair;
    let color = "text-slate-400";
    let bgColor = "bg-slate-100";

    if (seat.status === "selected") {
      color = "text-white";
      bgColor = "bg-blue-500";
    } else if (seat.status === "occupied") {
      color = "text-white";
      bgColor = "bg-red-500";
    } else if (seat.status === "unavailable") {
      Icon = Ban;
      color = "text-white";
      bgColor = "bg-gray-500";
    } else {
      // Available seat colors based on class
      switch (seat.class) {
        case "first":
          bgColor = "bg-gradient-to-br from-amber-100 to-yellow-200";
          color = "text-amber-700";
          break;
        case "business":
          bgColor = "bg-gradient-to-br from-emerald-100 to-green-200";
          color = "text-emerald-700";
          break;
        case "premium":
          bgColor = "bg-gradient-to-br from-purple-100 to-violet-200";
          color = "text-purple-700";
          break;
        default:
          bgColor = "bg-gradient-to-br from-slate-100 to-gray-200";
          color = "text-slate-600";
      }
    }

    return (
      <div
        className={`w-full h-full rounded-lg ${bgColor} flex items-center justify-center transition-all duration-200`}>
        <Icon className={`h-4 w-4 ${color}`} aria-hidden="true" />
      </div>
    );
  };

  const renderSeatButton = (seat: SeatData) => {
    const seatPrice = seat.price;
    const priceDiff = seatPrice - basePrice;

    let borderStyle = "border-2 border-slate-300";
    let shadowStyle = "shadow-sm hover:shadow-md";
    let cornerIcon: React.ReactNode = null;
    let hoverEffect = "hover:scale-105";

    // Enhanced styling based on seat type
    if (seat.status === "selected") {
      borderStyle = "border-2 border-blue-500 ring-2 ring-blue-200";
      shadowStyle = "shadow-lg";
      hoverEffect = "hover:scale-110";
    } else if (seat.status === "occupied") {
      borderStyle = "border-2 border-red-500";
      shadowStyle = "shadow-md";
      hoverEffect = "";
    } else if (seat.status === "unavailable") {
      borderStyle = "border-2 border-gray-400";
      shadowStyle = "shadow-sm";
      hoverEffect = "";
    } else {
      // Available seats
      if (seat.isExitRow) {
        borderStyle = "border-2 border-green-400";
        cornerIcon = (
          <DoorOpen className="h-3 w-3 text-green-600 drop-shadow-sm" />
        );
        hoverEffect = "hover:scale-105 hover:border-green-500";
      } else if (seat.isExtraLegroom) {
        borderStyle = "border-2 border-indigo-400";
        cornerIcon = (
          <Expand className="h-3 w-3 text-indigo-600 drop-shadow-sm" />
        );
        hoverEffect = "hover:scale-105 hover:border-indigo-500";
      } else if (seat.class === "first") {
        borderStyle = "border-2 border-amber-400";
        cornerIcon = (
          <Crown className="h-3 w-3 text-amber-600 drop-shadow-sm" />
        );
        hoverEffect = "hover:scale-105 hover:border-amber-500";
      } else if (seat.class === "business") {
        borderStyle = "border-2 border-emerald-400";
        cornerIcon = (
          <Crown className="h-3 w-3 text-emerald-600 drop-shadow-sm" />
        );
        hoverEffect = "hover:scale-105 hover:border-emerald-500";
      } else if (seat.class === "premium") {
        borderStyle = "border-2 border-purple-400";
        hoverEffect = "hover:scale-105 hover:border-purple-500";
      } else {
        hoverEffect = "hover:scale-105 hover:border-slate-400";
      }
    }

    const seatInfo = (
      <div className="space-y-2 text-center min-w-[200px]">
        <div className="font-bold text-lg text-slate-800">{seat.id}</div>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="bg-slate-50 rounded-lg p-2">
            <div className="font-medium text-slate-600">Giá ghế</div>
            <div className="font-bold text-slate-800">
              {formatPrice(seatPrice)}
            </div>
          </div>
          <div className="bg-slate-50 rounded-lg p-2">
            <div className="font-medium text-slate-600">Chênh lệch</div>
            <div
              className={`font-bold ${
                priceDiff > 0
                  ? "text-orange-600"
                  : priceDiff < 0
                  ? "text-green-600"
                  : "text-slate-600"
              }`}>
              {priceDiff > 0
                ? `+${formatPrice(priceDiff)}`
                : formatPrice(priceDiff)}
            </div>
          </div>
        </div>

        {/* Seat benefits */}
        <div className="space-y-1 text-xs text-left">
          {seat.class === "first" && (
            <div className="flex items-center gap-2 text-amber-700 bg-amber-50 rounded-md p-2">
              <Crown className="h-4 w-4" />
              <span>Hạng nhất: Dịch vụ 5 sao, ghế siêu rộng</span>
            </div>
          )}
          {seat.class === "business" && (
            <div className="flex items-center gap-2 text-emerald-700 bg-emerald-50 rounded-md p-2">
              <Crown className="h-4 w-4" />
              <span>Hạng thương gia: Dịch vụ ưu tiên, ghế thoải mái</span>
            </div>
          )}
          {seat.class === "premium" && (
            <div className="flex items-center gap-2 text-purple-700 bg-purple-50 rounded-md p-2">
              <span className="text-purple-600">⭐</span>
              <span>Premium: Ghế rộng hơn, dịch vụ nâng cao</span>
            </div>
          )}
          {seat.isExtraLegroom && (
            <div className="flex items-center gap-2 text-indigo-700 bg-indigo-50 rounded-md p-2">
              <Expand className="h-4 w-4" />
              <span>{SEAT_COPY.extraLegroom}</span>
            </div>
          )}
          {seat.isExitRow && (
            <div className="flex items-center gap-2 text-green-700 bg-green-50 rounded-md p-2">
              <DoorOpen className="h-4 w-4" />
              <span>Ghế thoát hiểm: Yêu cầu đủ 15 tuổi & sức khỏe tốt</span>
            </div>
          )}
        </div>
      </div>
    );

    return (
      <Popover
        key={seat.id}
        open={focusedSeat === seat.id}
        onOpenChange={(o) => setFocusedSeat(o ? seat.id : null)}>
        <PopoverTrigger asChild>
          <Tooltip content={seatInfo}>
            <div role="gridcell" className="relative">
              <button
                ref={(el) => {
                  seatRefs.current[seat.id] = el;
                }}
                type="button"
                role="button"
                onClick={() => onSeatClick(seat)}
                onKeyDown={(e) => handleSeatKeyDown(e, seat)}
                onFocus={() => setFocusedSeat(seat.id)}
                onBlur={() =>
                  setFocusedSeat((prev) => (prev === seat.id ? null : prev))
                }
                className={`relative w-12 h-12 rounded-lg ${borderStyle} ${shadowStyle} ${hoverEffect} ${
                  seat.status === "occupied" || seat.status === "unavailable"
                    ? "cursor-not-allowed opacity-60"
                    : "cursor-pointer"
                } transition-all duration-200 transform`}
                aria-label={`Ghế ${seat.id} - ${seat.class} - ${formatPrice(
                  seatPrice
                )}`}
                aria-pressed={seat.status === "selected"}
                tabIndex={
                  seat.status === "occupied" || seat.status === "unavailable"
                    ? -1
                    : 0
                }
                disabled={
                  seat.status === "occupied" || seat.status === "unavailable"
                }>
                {renderSeatIcon(seat)}

                {/* Seat ID Label */}
                <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 bg-white border border-slate-300 rounded px-1 text-[10px] font-medium text-slate-700 shadow-sm">
                  {seat.id}
                </div>

                {/* Corner icon for special seats */}
                {cornerIcon && (
                  <div className="absolute -top-1 -right-1 bg-white rounded-full p-0.5 shadow-sm border border-slate-200">
                    {cornerIcon}
                  </div>
                )}

                {/* Price indicator for premium seats */}
                {priceDiff > 0 && (
                  <div className="absolute -top-1 -left-1 bg-orange-500 text-white text-[8px] font-bold rounded-full w-4 h-4 flex items-center justify-center shadow-sm">
                    +
                  </div>
                )}
              </button>
            </div>
          </Tooltip>
        </PopoverTrigger>
        <PopoverContent className="p-3 max-w-sm">{seatInfo}</PopoverContent>
      </Popover>
    );
  };

  const renderSeatRow = (rowNumber: number) => {
    const rowSeats = seats.filter((seat) => seat.row === rowNumber);

    // Determine row class for styling
    let rowClass = "economy";
    if (rowNumber <= 3) rowClass = "first";
    else if (rowNumber <= 8) rowClass = "business";
    else if (rowNumber <= 15) rowClass = "premium";

    return (
      <div key={rowNumber} className="flex items-center gap-2 mb-2" role="row">
        {/* Row number with class indicator */}
        <div
          className={`w-8 h-12 rounded-lg flex flex-col items-center justify-center text-xs font-bold shadow-sm border-2 ${
            rowClass === "first"
              ? "bg-gradient-to-b from-amber-100 to-yellow-200 border-amber-300 text-amber-800"
              : rowClass === "business"
              ? "bg-gradient-to-b from-emerald-100 to-green-200 border-emerald-300 text-emerald-800"
              : rowClass === "premium"
              ? "bg-gradient-to-b from-purple-100 to-violet-200 border-purple-300 text-purple-800"
              : "bg-gradient-to-b from-slate-100 to-gray-200 border-slate-300 text-slate-700"
          }`}>
          <span>{rowNumber}</span>
          {rowClass === "first" && <span className="text-[8px]">👑</span>}
          {rowClass === "business" && <span className="text-[8px]">💼</span>}
          {rowClass === "premium" && <span className="text-[8px]">⭐</span>}
        </div>

        {/* Left side seats (A, B, C) */}
        <div className="flex gap-1">
          {rowSeats.slice(0, 3).map((seat) => renderSeatButton(seat))}
        </div>

        {/* Aisle indicator */}
        <div className="w-6 h-12 flex flex-col items-center justify-center bg-gradient-to-b from-blue-50 to-indigo-100 rounded-lg border border-blue-200">
          <div className="text-xs font-medium text-blue-700 rotate-90 whitespace-nowrap">
            Lối đi
          </div>
        </div>

        {/* Right side seats (D, E, F) */}
        <div className="flex gap-1">
          {rowSeats.slice(3, 6).map((seat) => renderSeatButton(seat))}
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
      {/* Header with seat labels */}
      <div className="bg-gradient-to-r from-slate-100 to-blue-100 px-6 py-4 border-b border-slate-200">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 text-center text-sm font-bold text-slate-600">
            Hàng
          </div>

          {/* Left side labels */}
          <div className="flex gap-1">
            {["A", "B", "C"].map((letter) => (
              <div key={letter} className="w-12 text-center">
                <div className="text-sm font-bold text-slate-700">{letter}</div>
                <div className="text-[10px] text-slate-500 leading-tight">
                  {letter === "A"
                    ? "Cửa sổ"
                    : letter === "C"
                    ? "Lối đi"
                    : "Giữa"}
                </div>
              </div>
            ))}
          </div>

          {/* Aisle indicator */}
          <div className="w-6 text-center">
            <div className="text-sm font-bold text-blue-600">Lối đi</div>
            <div className="text-blue-400">│</div>
          </div>

          {/* Right side labels */}
          <div className="flex gap-1">
            {["D", "E", "F"].map((letter) => (
              <div key={letter} className="w-12 text-center">
                <div className="text-sm font-bold text-slate-700">{letter}</div>
                <div className="text-[10px] text-slate-500 leading-tight">
                  {letter === "D"
                    ? "Lối đi"
                    : letter === "F"
                    ? "Cửa sổ"
                    : "Giữa"}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Seat grid */}
      <div className="p-6 bg-gradient-to-b from-white to-slate-50" role="grid">
        <div className="space-y-1">
          {Array.from({ length: totalRows }, (_, i) => {
            const rowNumber = i + 1;
            let sectionClass = "";
            let isFirstRowOfSection = false;

            if (rowNumber <= 3) {
              sectionClass = "first-class";
              isFirstRowOfSection = rowNumber === 1;
            } else if (rowNumber <= 8) {
              sectionClass = "business-class";
              isFirstRowOfSection = rowNumber === 4;
            } else if (rowNumber <= 15) {
              sectionClass = "premium-economy";
              isFirstRowOfSection = rowNumber === 9;
            } else {
              sectionClass = "economy-class";
              isFirstRowOfSection = rowNumber === 16;
            }

            return (
              <div key={rowNumber}>
                {/* Section divider */}
                {isFirstRowOfSection && rowNumber > 1 && (
                  <div className="my-4 relative">
                    <div className="border-t-2 border-dashed border-slate-300"></div>
                    <div
                      className={`absolute left-1/2 transform -translate-x-1/2 -translate-y-1/2 px-4 py-1 rounded-full text-xs font-bold shadow-md border-2 ${
                        sectionClass === "business-class"
                          ? "bg-emerald-100 border-emerald-400 text-emerald-800"
                          : sectionClass === "premium-economy"
                          ? "bg-purple-100 border-purple-400 text-purple-800"
                          : "bg-blue-100 border-blue-400 text-blue-800"
                      }`}>
                      {sectionClass === "business-class"
                        ? "💼 BUSINESS CLASS"
                        : sectionClass === "premium-economy"
                        ? "⭐ PREMIUM ECONOMY"
                        : "🎫 ECONOMY CLASS"}
                    </div>
                  </div>
                )}
                {renderSeatRow(rowNumber)}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default SeatGrid;
