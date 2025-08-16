import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import SimpleSeatMap from "./SimpleSeatMap";
import type { BookingRecord } from "../../shared/types/passenger.types";
import { Button } from "../ui/button";
import { ArrowLeft, Check, Plane, CreditCard } from "lucide-react";
import { loadBookings, saveBookings } from "../../services/bookingStorage";

interface PaymentFlowProps {
  booking: BookingRecord;
  onCancel: () => void;
}

const PaymentFlow: React.FC<PaymentFlowProps> = ({ booking, onCancel }) => {
  const navigate = useNavigate();
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const [step, setStep] = useState<"seats" | "payment">("seats");
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] =
    useState<string>("vnpay");

  const totalPassengers = booking.passengers.length;

  const handleSeatSelect = (seatId: string) => {
    setSelectedSeats((prev) => {
      if (prev.includes(seatId)) {
        // Deselect seat
        return prev.filter((id) => id !== seatId);
      } else {
        // Select seat
        if (prev.length >= totalPassengers) {
          alert(
            `Bạn chỉ có thể chọn tối đa ${totalPassengers} ghế (theo số hành khách)`
          );
          return prev;
        }
        return [...prev, seatId];
      }
    });
  };

  const validateSeatSelection = () => {
    return selectedSeats.length === totalPassengers;
  };

  const proceedToPayment = () => {
    if (validateSeatSelection()) {
      setStep("payment");
    }
  };

  const handlePayment = async () => {
    setIsProcessing(true);

    // Simulate payment processing
    try {
      // In real implementation, call payment API here
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Update booking status and add seat information
      const allBookings = loadBookings();
      const updatedBookings = allBookings.map((b) => {
        if (b.bookingId === booking.bookingId) {
          return {
            ...b,
            status: "CONFIRMED" as const,
            paymentMethod: selectedPaymentMethod as "vnpay" | "card" | "office",
            selectedSeats,
            holdExpiresAt: undefined, // Remove hold expiry as it's confirmed
          };
        }
        return b;
      });

      // Save updated bookings
      saveBookings(updatedBookings);

      const paymentMethodNames = {
        vnpay: "VNPay/Momo",
        card: "Thẻ quốc tế",
        office: "Văn phòng",
      };

      alert(
        `Thanh toán thành công qua ${
          paymentMethodNames[
            selectedPaymentMethod as keyof typeof paymentMethodNames
          ]
        }!\nGhế ${selectedSeats.join(", ")} đã được xác nhận.`
      );
      navigate("/my-bookings");
    } catch {
      alert("Có lỗi xảy ra khi thanh toán. Vui lòng thử lại.");
    } finally {
      setIsProcessing(false);
    }
  };

  // Seat selection is free - price is already included in booking
  // No additional charge for seat selection
  const finalTotal = booking.totalPrice;

  if (step === "payment") {
    return (
      <div className="max-w-4xl mx-auto p-6">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => setStep("seats")}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-4">
            <ArrowLeft className="w-4 h-4" />
            Quay lại chọn ghế
          </button>

          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            Thanh toán và xác nhận
          </h1>
          <p className="text-gray-600">
            Xác nhận thông tin và hoàn tất thanh toán cho booking{" "}
            {booking.bookingId}
          </p>
        </div>

        {/* Payment Summary */}
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Selected Seats */}
            <div className="bg-white rounded-lg border p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Plane className="w-5 h-5 text-blue-600" />
                Ghế đã chọn
              </h3>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-sm text-gray-600">Chuyến bay</p>
                  <p className="font-medium">
                    {booking.selectedFlights?.outbound?.flight_number || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Tuyến bay</p>
                  <p className="font-medium">
                    {booking.selectedFlights?.outbound
                      ?.departure_airport_code || "N/A"}{" "}
                    →{" "}
                    {booking.selectedFlights?.outbound?.arrival_airport_code ||
                      "N/A"}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mb-4">
                {selectedSeats.map((seatId) => (
                  <span
                    key={seatId}
                    className="px-3 py-1 bg-blue-100 text-blue-800 rounded-lg font-medium">
                    {seatId}
                  </span>
                ))}
              </div>

              <div className="text-sm text-gray-600">
                {selectedSeats.length} ghế đã chọn (miễn phí)
              </div>
            </div>

            {/* Payment Method */}
            <div className="bg-white rounded-lg border p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-blue-600" />
                Chọn phương thức thanh toán
              </h3>

              <div className="space-y-4">
                {/* Online Payment (VNPay, Momo) */}
                <label
                  className={`flex items-start gap-3 p-4 border-2 rounded-lg cursor-pointer hover:bg-blue-50 ${
                    selectedPaymentMethod === "vnpay"
                      ? "border-blue-400 bg-blue-50"
                      : "border-gray-200"
                  }`}>
                  <input
                    type="radio"
                    name="payment"
                    value="vnpay"
                    checked={selectedPaymentMethod === "vnpay"}
                    onChange={(e) => setSelectedPaymentMethod(e.target.value)}
                    className="mt-1 text-blue-600"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center">
                        📱
                      </div>
                      <div>
                        <p className="font-semibold text-blue-900">
                          Thanh toán trực tuyến
                        </p>
                        <p className="text-xs text-blue-700">
                          VNPay QR, Momo, Internet Banking
                        </p>
                      </div>
                    </div>
                    <p className="text-xs text-blue-600 ml-10">
                      ✓ Thanh toán ngay lập tức qua mã QR
                      <br />
                      ✓ Bảo mật cao, xử lý nhanh chóng
                      <br />✓ Hỗ trợ tất cả ngân hàng và ví điện tử
                    </p>
                  </div>
                </label>

                {/* Card Payment */}
                <label
                  className={`flex items-start gap-3 p-4 border-2 rounded-lg cursor-pointer hover:bg-indigo-50 ${
                    selectedPaymentMethod === "card"
                      ? "border-indigo-400 bg-indigo-50"
                      : "border-gray-200"
                  }`}>
                  <input
                    type="radio"
                    name="payment"
                    value="card"
                    checked={selectedPaymentMethod === "card"}
                    onChange={(e) => setSelectedPaymentMethod(e.target.value)}
                    className="mt-1 text-indigo-600"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-8 h-8 bg-indigo-600 rounded flex items-center justify-center">
                        💳
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">
                          Thẻ quốc tế
                        </p>
                        <p className="text-xs text-gray-600">
                          Visa, Mastercard, JCB, American Express
                        </p>
                      </div>
                    </div>
                    <p className="text-xs text-gray-600 ml-10">
                      ✓ Thanh toán bằng thẻ tín dụng/ghi nợ
                      <br />
                      ✓ Hỗ trợ thẻ quốc tế và nội địa
                      <br />✓ Bảo mật 3D Secure
                    </p>
                  </div>
                </label>

                {/* Office Payment */}
                <label
                  className={`flex items-start gap-3 p-4 border-2 rounded-lg cursor-pointer hover:bg-purple-50 ${
                    selectedPaymentMethod === "office"
                      ? "border-purple-400 bg-purple-50"
                      : "border-gray-200"
                  }`}>
                  <input
                    type="radio"
                    name="payment"
                    value="office"
                    checked={selectedPaymentMethod === "office"}
                    onChange={(e) => setSelectedPaymentMethod(e.target.value)}
                    className="mt-1 text-purple-600"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-8 h-8 bg-purple-600 rounded flex items-center justify-center">
                        🏢
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">
                          Thanh toán tại văn phòng
                        </p>
                        <p className="text-xs text-gray-600">
                          Tiền mặt hoặc chuyển khoản trực tiếp
                        </p>
                      </div>
                    </div>
                    <div className="text-xs text-gray-600 ml-10 space-y-1">
                      <p>
                        📍 <span className="font-medium">Địa chỉ:</span> 123
                        Đường Lê Lợi, Quận 1, TP.HCM
                      </p>
                      <p>
                        🕒 <span className="font-medium">Giờ làm việc:</span>{" "}
                        8:00 - 17:30 (T2-T7)
                      </p>
                      <p>
                        📞 <span className="font-medium">Hotline:</span>{" "}
                        1900-FLYJOURNEY
                      </p>
                      <div className="mt-2 p-2 bg-purple-100 rounded text-purple-800">
                        <p className="font-medium">💰 Chuyển khoản QR:</p>
                        <p>Ngân hàng: Vietcombank</p>
                        <p>STK: 0123456789</p>
                        <p>Chủ TK: CONG TY FLY JOURNEY</p>
                      </div>
                    </div>
                  </div>
                </label>
              </div>
            </div>
          </div>

          {/* Payment Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-gray-50 rounded-lg p-6 sticky top-6">
              <h3 className="text-lg font-semibold mb-4">Tóm tắt thanh toán</h3>

              <div className="space-y-3 text-sm mb-6">
                <div className="flex justify-between">
                  <span className="text-gray-600">Giá vé gốc:</span>
                  <span className="font-medium">
                    {booking.totalPrice.toLocaleString()} {booking.currency}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Phí chọn ghế:</span>
                  <span className="font-medium text-green-600">Miễn phí</span>
                </div>
                <div className="border-t pt-3 flex justify-between text-lg font-bold">
                  <span>Tổng cộng:</span>
                  <span className="text-blue-600">
                    {finalTotal.toLocaleString()} {booking.currency}
                  </span>
                </div>
              </div>

              <div className="space-y-3">
                <Button
                  onClick={handlePayment}
                  disabled={isProcessing}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                  {isProcessing ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Đang xử lý...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4" />
                      Thanh toán {finalTotal.toLocaleString()}{" "}
                      {booking.currency}
                    </div>
                  )}
                </Button>

                <Button
                  onClick={onCancel}
                  variant="outline"
                  className="w-full"
                  disabled={isProcessing}>
                  Hủy
                </Button>
              </div>

              <div className="mt-6 p-4 bg-blue-50 rounded-lg text-xs text-blue-800">
                <p className="font-medium mb-1">💡 Lưu ý:</p>
                <p>
                  Sau khi thanh toán thành công, ghế sẽ được xác nhận và không
                  thể thay đổi.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={onCancel}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-4">
          <ArrowLeft className="w-4 h-4" />
          Quay lại danh sách booking
        </button>

        <h1 className="text-2xl font-bold text-gray-800 mb-2">Chọn ghế ngồi</h1>
        <p className="text-gray-600">
          Chọn {totalPassengers} ghế cho booking {booking.bookingId}
        </p>

        <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-center gap-2 text-sm text-blue-800">
            <span className="font-medium">💡 Lưu ý:</span>
            <span>
              Bạn cần chọn đúng {totalPassengers} ghế mới có thể tiếp tục (
              {selectedSeats.length}/{totalPassengers} ghế đã chọn)
            </span>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Seat Map */}
        <div className="lg:col-span-2">
          <SimpleSeatMap
            onSeatSelect={handleSeatSelect}
            selectedSeats={selectedSeats}
            maxSeats={totalPassengers}
          />
        </div>

        {/* Selection Summary */}
        <div className="lg:col-span-1">
          <div className="bg-gray-50 rounded-lg p-6 sticky top-6">
            <h3 className="text-lg font-semibold mb-4">Thông tin chuyến bay</h3>

            <div className="space-y-3 text-sm mb-6">
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
                  →{" "}
                  {booking.selectedFlights?.outbound?.arrival_airport_code ||
                    "N/A"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Số hành khách:</span>
                <span className="font-medium">{totalPassengers}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Ghế đã chọn:</span>
                <span
                  className={`font-medium ${
                    selectedSeats.length === totalPassengers
                      ? "text-green-600"
                      : "text-red-600"
                  }`}>
                  {selectedSeats.length}/{totalPassengers}
                </span>
              </div>
            </div>

            {selectedSeats.length > 0 && (
              <div className="mb-6">
                <h4 className="font-medium mb-2">Ghế đã chọn:</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedSeats.map((seatId) => (
                    <span
                      key={seatId}
                      className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm font-medium">
                      {seatId}
                    </span>
                  ))}
                </div>

                <div className="mt-3 p-3 bg-white rounded border">
                  <div className="text-xs text-gray-600 mb-1">
                    Chi phí chọn ghế:
                  </div>
                  <div className="text-sm font-medium text-green-600">
                    {selectedSeats.length} ghế đã chọn (miễn phí)
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-3">
              <button
                onClick={onCancel}
                className="w-full py-2 px-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                ← Hủy
              </button>
              <button
                onClick={proceedToPayment}
                disabled={!validateSeatSelection()}
                className={`w-full py-2 px-4 rounded-lg transition-colors font-medium ${
                  validateSeatSelection()
                    ? "bg-blue-600 text-white hover:bg-blue-700"
                    : "bg-gray-300 text-gray-500 cursor-not-allowed"
                }`}>
                {validateSeatSelection()
                  ? `Tiếp tục thanh toán (${finalTotal.toLocaleString()} ${
                      booking.currency
                    })`
                  : `Chọn thêm ${totalPassengers - selectedSeats.length} ghế`}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentFlow;
