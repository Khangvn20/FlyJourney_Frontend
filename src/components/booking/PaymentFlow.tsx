import React, { useMemo, useState } from "react";
import type {
  BookingRecord,
  PassengerFormData,
} from "../../shared/types/passenger.types";
import { ArrowLeft } from "lucide-react";
import { useAuthContext } from "../../hooks/useAuthContext";
import { SERVICE_MAPPING } from "../../shared/constants/serviceMapping";
import SeatMapStep from "./payment/SeatMapStep";
import PaymentMethodStep from "./payment/PaymentMethodStep";

interface PaymentFlowProps {
  booking: BookingRecord;
  onCancel: () => void;
  // Start directly at payment step and skip seat selection UI when true
  initialStep?: "seats" | "payment";
}

const PaymentFlow: React.FC<PaymentFlowProps> = ({ booking, onCancel, initialStep = "seats" }) => {
  const { token } = useAuthContext();

  // Seat selection state
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const [step, setStep] = useState<"seats" | "payment">(initialStep);

  // Determine passengers eligible for seating (exclude infants)
  const rawPassengers = Array.isArray(booking.passengers) ? booking.passengers : [];
  const seatEligiblePassengers = useMemo(
    () => rawPassengers.filter((p) => p?.type !== "infant"),
    [rawPassengers],
  );
  const seatEligibleCount = Math.max(1, seatEligiblePassengers.length || rawPassengers.length || 0);
  const currentPassenger: PassengerFormData | undefined =
    seatEligiblePassengers[selectedSeats.length] ?? seatEligiblePassengers[0];

  // Ancillary prices (fallback to service mapping)
  const findAncillaryPrice = (keyword: string) =>
    booking.backendAncillaries?.find((a) => a.description?.toLowerCase().includes(keyword))?.price;

  const baseSeatPrice =
    findAncillaryPrice("chọn chỗ") ??
    SERVICE_MAPPING.find((s) => s.id === "seat_selection")?.price ??
    0;

  const extraLegroomPrice =
    findAncillaryPrice("ghế khoang rộng") ??
    findAncillaryPrice("extra legroom") ??
    SERVICE_MAPPING.find((s) => s.id === "extra_legroom")?.price ??
    baseSeatPrice;

  const proceedToPayment = () => setStep("payment");

  if (step === "payment") {
    return (
      <PaymentMethodStep
        booking={booking}
        selectedSeats={selectedSeats}
        // If starting from payment directly, back should exit the flow
        onBack={initialStep === "payment" ? onCancel : () => setStep("seats")}
        backLabel={initialStep === "payment" ? "Quay lại" : "Quay lại chọn ghế"}
        token={token}
      />
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={onCancel}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Quay lại danh sách booking
        </button>

        <h1 className="text-2xl font-bold text-gray-800 mb-2">Chọn ghế ngồi</h1>
        <p className="text-gray-600">
          {seatEligibleCount > 0 ? (
            <>
              Chọn {seatEligibleCount} ghế cho booking {booking.bookingId}
            </>
          ) : (
            <>Không cần chọn ghế (không có hành khách cần ghế riêng)</>
          )}
        </p>

        {seatEligibleCount > 0 && (
          <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center gap-2 text-sm text-blue-800">
              <span className="font-medium">💡 Lưu ý:</span>
              <span>
                Bạn cần chọn đúng {seatEligibleCount} ghế mới có thể tiếp tục (
                {selectedSeats.length}/{seatEligibleCount} ghế đã chọn)
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Seats step */}
      <SeatMapStep
        booking={booking}
        token={token}
        seatEligibleCount={seatEligibleCount}
        currentPassenger={currentPassenger}
        baseSeatPrice={baseSeatPrice}
        extraLegroomPrice={extraLegroomPrice}
        selectedSeats={selectedSeats}
        onSeatChange={setSelectedSeats}
        onProceed={proceedToPayment}
      />
    </div>
  );
};

export default PaymentFlow;
