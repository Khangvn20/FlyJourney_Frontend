import React, { useMemo, useState } from "react";
import { SimpleSeatMap, SeatLegend } from "../../../features/seat-selection";
import ForbiddenItemsPanel from "../../common/ForbiddenItemsPanel";
import SeatSelectionSummary from "../SeatSelectionSummary";
import type {
  BookingRecord,
  PassengerFormData,
} from "../../../shared/types/passenger.types";
import { notification } from "antd";
import { useSeatMapData } from "./useSeatMapData";

const DEFAULT_TOTAL_ROWS = 30;

interface SeatMapStepProps {
  booking: BookingRecord;
  token?: string | null;
  seatEligibleCount: number;
  currentPassenger?: PassengerFormData;
  baseSeatPrice: number;
  extraLegroomPrice: number;
  selectedSeats: string[];
  onSeatChange: (seats: string[]) => void;
  onProceed: () => void;
}

const SeatMapStep: React.FC<SeatMapStepProps> = ({
  booking,
  token,
  seatEligibleCount,
  currentPassenger,
  baseSeatPrice,
  extraLegroomPrice,
  selectedSeats,
  onSeatChange,
  onProceed,
}) => {
  const [localSeats, setLocalSeats] = useState<string[]>(selectedSeats);
  const { loading, error, occupiedSeats, seatPrices, rowAttributes } =
    useSeatMapData(booking.outboundFlightId, token);

  const handleSeatSelect = (seatId: string) => {
    setLocalSeats((prev) => {
      if (prev.includes(seatId)) {
        return prev.filter((id) => id !== seatId);
      }
      if (prev.length >= seatEligibleCount) {
        notification.warning({
          message: "Giới Hạn Chỗ Ngồi",
          description: `Bạn chỉ có thể chọn tối đa ${seatEligibleCount} ghế`,
          placement: "top",
          duration: 3,
        });
        return prev;
      }
      return [...prev, seatId];
    });
  };

  const canProceed = useMemo(
    () => localSeats.length === seatEligibleCount,
    [localSeats, seatEligibleCount],
  );

  const proceed = () => {
    onSeatChange(localSeats);
    if (canProceed) onProceed();
  };

  return (
    <div className="grid lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 flex flex-col md:flex-row gap-4">
        <aside className="md:w-48 space-y-4">
          <SeatLegend />
          <ForbiddenItemsPanel />
        </aside>
        <div className="flex-1">
          {loading ? (
            <div className="h-40 bg-gray-200 rounded animate-pulse" />
          ) : error ? (
            <div className="p-4 bg-red-50 text-red-700 rounded">{error}</div>
          ) : (
            <div className="bg-white rounded-lg border p-4">
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2 text-sm">
                <div className="text-gray-700">
                  Đang chọn ghế cho: {" "}
                  <span className="font-medium">
                    {currentPassenger
                      ? `${currentPassenger.lastName} ${currentPassenger.firstName}`
                      : "Hành khách"}
                  </span>
                </div>
                <div className="text-gray-600">
                  {localSeats.length}/{seatEligibleCount} ghế đã chọn
                </div>
              </div>
              {localSeats.length > 0 && (
                <div className="mb-3 flex flex-wrap gap-2">
                  {localSeats.map((s) => (
                    <span
                      key={s}
                      className="px-2 py-1 bg-blue-50 text-blue-700 border border-blue-200 rounded"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              )}
              <SimpleSeatMap
                onSeatSelect={handleSeatSelect}
                selectedSeats={localSeats}
                maxSeats={seatEligibleCount}
                baseSeatPrice={baseSeatPrice}
                extraLegroomPrice={extraLegroomPrice}
                currentPassenger={currentPassenger}
                occupiedSeats={occupiedSeats}
                seatPrices={seatPrices}
                rowAttributes={rowAttributes}
                totalRowsOverride={DEFAULT_TOTAL_ROWS}
              />
            </div>
          )}
        </div>
      </div>

      {/* Selection Summary */}
      <div className="lg:col-span-1">
        <div className="space-y-6 sticky top-6">
          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4">Thông tin chuyến bay</h3>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Booking ID:</span>
                <span className="font-medium">{booking.bookingId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Chuyến bay:</span>
                <span className="font-medium">
                  {booking.selectedFlights?.outbound?.flight_number || "N/A"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Tuyến bay:</span>
                <span className="font-medium">
                  {booking.selectedFlights?.outbound?.departure_airport_code ||
                    "N/A"}{" "}
                  → {" "}
                  {booking.selectedFlights?.outbound?.arrival_airport_code ||
                    "N/A"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Số hành khách:</span>
                <span className="font-medium">
                  {Math.max(1, booking.passengers?.length || 0)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Cần ghế:</span>
                <span className="font-medium">{seatEligibleCount}</span>
              </div>
            </div>
          </div>
          <SeatSelectionSummary
            selectedSeats={localSeats}
            onClear={() => setLocalSeats([])}
            onConfirm={proceed}
            maxSeats={seatEligibleCount}
            baseSeatPrice={baseSeatPrice}
            extraLegroomPrice={extraLegroomPrice}
          />
        </div>
      </div>
    </div>
  );
};

export default SeatMapStep;

