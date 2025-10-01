import React from "react";
import { Button } from "../ui/button";
import { formatPrice } from "../../shared/utils/format";
import { SERVICE_MAPPING } from "../../shared/constants/serviceMapping";

interface SeatSelectionSummaryProps {
  selectedSeats: string[];
  onClear: () => void;
  onConfirm: () => void;
  className?: string;
  seatPrices?: Record<string, number>;
  baseSeatPrice?: number;
  extraLegroomPrice?: number;
  /** Maximum seats user can select */
  maxSeats?: number;
}

const SeatSelectionSummary: React.FC<SeatSelectionSummaryProps> = ({
  selectedSeats,
  onClear,
  onConfirm,
  className = "",
  seatPrices,
  baseSeatPrice,
  extraLegroomPrice,
  maxSeats = 1,
}) => {
  const resolvedBasePrice =
    baseSeatPrice ??
    SERVICE_MAPPING.find((s) => s.id === "seat_selection")?.price ??
    0;
  const resolvedExtraPrice =
    extraLegroomPrice ??
    SERVICE_MAPPING.find((s) => s.id === "extra_legroom")?.price ??
    0;
  const exitRows = [10, 20];
  const extraLegroomRows = [1, 4, 9];
  const getSeatPrice = (seatId: string): number => {
    if (seatPrices && seatPrices[seatId] !== undefined) {
      return seatPrices[seatId];
    }
    const row = parseInt(seatId.match(/\d+/)?.[0] || "", 10);
    if (exitRows.includes(row) || extraLegroomRows.includes(row)) {
      return resolvedExtraPrice;
    }
    return resolvedBasePrice;
  };
  const totalPrice = selectedSeats.reduce(
    (sum, seat) => sum + getSeatPrice(seat),
    0
  );
  const remainingSeats = Math.max(maxSeats - selectedSeats.length, 0);

  return (
    <div
      className={`bg-white p-4 border-t shadow-md md:border md:rounded-lg ${className}`}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="font-medium">Ghế đã chọn</span>
        <button
          type="button"
          onClick={onClear}
          className="text-sm text-red-500 hover:underline"
        >
          Xóa lựa chọn
        </button>
      </div>
      <div className="text-sm text-gray-600 mb-2">
        {remainingSeats > 0 ? `Còn ${remainingSeats} ghế` : "Đã chọn đủ ghế"}
      </div>

      {selectedSeats.length > 0 ? (
        <>
          <div className="flex flex-wrap gap-2 mb-2">
            {selectedSeats.map((seat) => (
              <span
                key={seat}
                className="px-2 py-1 bg-blue-100 text-blue-800 rounded"
              >
                {seat}
              </span>
            ))}
          </div>
          <div className="flex items-center justify-between font-semibold mb-4">
            <span>Phụ thu</span>
            <span>{formatPrice(totalPrice)}</span>
          </div>
          <Button
            type="button"
            className="w-full bg-blue-600 text-white"
            disabled={selectedSeats.length < maxSeats}
            onClick={onConfirm}
          >
            Xác nhận
          </Button>
        </>
      ) : (
        <div className="text-sm text-gray-500">Chưa chọn ghế</div>
      )}
    </div>
  );
};

export default SeatSelectionSummary;
