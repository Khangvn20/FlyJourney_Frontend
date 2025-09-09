import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../../ui/button";
import { ArrowLeft, Plane, CreditCard } from "lucide-react";
import { notification } from "antd";
import { loadBookings, saveBookings } from "../../../services/bookingStorage";
import type { BookingRecord, PaymentMethod } from "../../../shared/types/passenger.types";
import { formatPrice } from "../../../shared/utils/format";

interface PaymentMethodStepProps {
  booking: BookingRecord;
  selectedSeats: string[];
  onBack: () => void;
  backLabel?: string;
  token?: string | null;
}

const PaymentMethodStep: React.FC<PaymentMethodStepProps> = ({
  booking,
  selectedSeats,
  onBack,
  backLabel = "Quay lại chọn ghế",
  token,
}) => {
  const navigate = useNavigate();
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod>(
    "vnpay",
  );
  const [isProcessing, setIsProcessing] = useState(false);

  // When return from payment gateway (MoMo/VNPAY)
  useEffect(() => {
    const checkReturnFromPayment = () => {
      try {
        const pendingPaymentStr = sessionStorage.getItem("pendingMomoPayment");
        if (!pendingPaymentStr) return;
        const urlParams = new URLSearchParams(window.location.search);
        const resultCode = urlParams.get("resultCode");
        const message = urlParams.get("message") || "Không có thông tin";
        if (resultCode && (resultCode === "0" || resultCode === "9000")) {
          notification.success({
            message: "Thanh Toán Thành Công",
            description:
              "Thanh toán của bạn qua MoMo đã hoàn tất. Đơn hàng đang được xử lý.",
            placement: "top",
            duration: 5,
          });
          const all = loadBookings();
          const updated = all.map((b) =>
            b.bookingId === booking.bookingId
              ? {
                  ...b,
                  status: "CONFIRMED" as const,
                  paymentMethod: "vnpay" as const,
                  selectedSeats,
                  holdExpiresAt: undefined,
                  paymentDate: new Date().toISOString(),
                }
              : b,
          );
          saveBookings(updated);
          navigate("/my-bookings");
          sessionStorage.removeItem("pendingMomoPayment");
        } else if (resultCode) {
          notification.error({
            message: "Thanh Toán Thất Bại",
            description: `Thanh toán không thành công: ${message}`,
            placement: "top",
            duration: 7,
          });
          setIsProcessing(false);
          sessionStorage.removeItem("pendingMomoPayment");
        }
      } catch (err) {
        console.error("Error checking return from payment:", err);
      }
    };
    checkReturnFromPayment();
  }, [booking.bookingId, navigate, selectedSeats]);

  const seatPriceTotal = useMemo(() => {
    // In payment step, seat extra already accounted earlier; keep placeholder for consistency
    return 0;
  }, []);

  const handlePayment = async () => {
    setIsProcessing(true);
    try {
      if (selectedPaymentMethod === "vnpay") {
        // Initiate MoMo payment via backend
        if (!token) {
          notification.error({
            message: "Lỗi Xác Thực",
            description: "Bạn cần đăng nhập để thực hiện thanh toán",
          });
          setIsProcessing(false);
          return;
        }

        const randomOrderId = `FJ${Date.now()}${Math.floor(Math.random() * 10000)}`;
        const payload = {
          booking_id: booking.bookingId,
          partnerCode: "MOMO",
          accessKey: "F8BBA842ECF85",
          requestId: `${Date.now()}`,
          amount: `${Math.round(booking.totalPrice)}`,
          orderId: randomOrderId,
          orderInfo: `Thanh toan ve may bay FlyJourney - ${booking.bookingId}`,
          redirectUrl: "http://localhost:3030/my-bookings",
          ipnUrl: "https://4d3c40525af2.ngrok-free.app/api/v1/payment/momo/callback",
          extraData: "",
          requestType: "captureWallet",
        };

        const response = await fetch("http://localhost:3000/api/v1/payment/momo", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`MoMo API returned ${response.status}: ${errorText}`);
        }

        const result = await response.json();
        let paymentUrl: string | null = null;
        if (result.data?.momoResponse?.payUrl) paymentUrl = result.data.momoResponse.payUrl;
        else if (result.payUrl) paymentUrl = result.payUrl;
        else if (result.data?.payUrl) paymentUrl = result.data.payUrl;
        else if (result.qrCodeUrl) paymentUrl = result.qrCodeUrl;
        else if (result.data?.momoResponse?.qrCodeUrl) paymentUrl = result.data.momoResponse.qrCodeUrl;
        else if (result.data?.momoResponse?.deeplink) paymentUrl = result.data.momoResponse.deeplink;

        if (!paymentUrl) {
          notification.error({
            message: "Lỗi Thanh Toán",
            description: "Không nhận được URL thanh toán từ MoMo.",
          });
          setIsProcessing(false);
          return;
        }

        sessionStorage.setItem(
          "pendingMomoPayment",
          JSON.stringify({ bookingId: booking.bookingId, timestamp: Date.now() }),
        );
        window.location.href = paymentUrl as string;
        return;
      }

      // Other payment methods (simulate)
      await new Promise((resolve) => setTimeout(resolve, 1500));
      const all = loadBookings();
      const updated = all.map((b) =>
        b.bookingId === booking.bookingId
          ? {
              ...b,
              status: "CONFIRMED" as const,
              paymentMethod: selectedPaymentMethod,
              selectedSeats,
              holdExpiresAt: undefined,
            }
          : b,
      );
      saveBookings(updated);
      notification.success({ message: "Thanh Toán Thành Công" });
      navigate("/my-bookings");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      console.error("Payment error:", err);
      notification.error({ message: "Lỗi Thanh Toán", description: message });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-6">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-4"
        >
          <ArrowLeft className="w-4 h-4" /> {backLabel}
        </button>

        <h1 className="text-2xl font-bold text-gray-800 mb-2">Thanh toán và xác nhận</h1>
        <p className="text-gray-600">
          Xác nhận thông tin và hoàn tất thanh toán cho booking {booking.bookingId}
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="hidden">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Plane className="w-5 h-5 text-blue-600" /> Ghế đã chọn
            </h3>
            <div className="flex flex-wrap gap-2 mb-4">
              {selectedSeats.map((seatId) => (
                <span
                  key={seatId}
                  className="px-3 py-1 bg-blue-100 text-blue-800 rounded-lg font-medium"
                >
                  {seatId}
                </span>
              ))}
            </div>
            <div className="text-sm text-gray-600">
              {selectedSeats.length} ghế đã chọn
            </div>
          </div>

          <div className="bg-white rounded-lg border p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-blue-600" /> Chọn phương thức thanh toán
            </h3>

            <div className="space-y-4">
              <label
                className={`flex items-start gap-3 p-4 border-2 rounded-lg cursor-pointer hover:bg-pink-50 ${
                  selectedPaymentMethod === "vnpay"
                    ? "border-pink-400 bg-pink-50"
                    : "border-gray-200"
                }`}
              >
                <input
                  type="radio"
                  name="payment"
                  value="vnpay"
                  checked={selectedPaymentMethod === "vnpay"}
                  onChange={(e) =>
                    setSelectedPaymentMethod(e.target.value as PaymentMethod)
                  }
                  className="mt-1 text-pink-600"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 bg-pink-600 rounded flex items-center justify-center text-white font-bold">
                      M
                    </div>
                    <div>
                      <p className="font-semibold text-pink-900">Thanh toán qua MoMo</p>
                      <p className="text-xs text-pink-700">Ví điện tử MoMo</p>
                    </div>
                  </div>
                  <p className="text-xs text-pink-600 ml-10">
                    ✓ Thanh toán nhanh chóng qua ví MoMo
                  </p>
                </div>
              </label>

              {/* Card Payment */}
              <label
                className={`flex items-start gap-3 p-4 border-2 rounded-lg cursor-pointer hover:bg-blue-50 ${
                  selectedPaymentMethod === "card"
                    ? "border-blue-400 bg-blue-50"
                    : "border-gray-200"
                }`}
              >
                <input
                  type="radio"
                  name="payment"
                  value="card"
                  checked={selectedPaymentMethod === "card"}
                  onChange={(e) =>
                    setSelectedPaymentMethod(e.target.value as PaymentMethod)
                  }
                  className="mt-1 text-blue-600"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center text-white">
                      💳
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">Thẻ tín dụng/Ghi nợ</p>
                      <p className="text-xs text-gray-600">Visa, MasterCard, JCB...</p>
                    </div>
                  </div>
                  <p className="text-xs text-gray-600 ml-10">
                    ✓ Thanh toán bằng thẻ quốc tế/nội địa • ✓ Bảo mật 3D Secure
                  </p>
                </div>
              </label>

              {/* Office Payment */}
              <label
                className={`flex items-start gap-3 p-4 border-2 rounded-lg cursor-pointer hover:bg-purple-50 ${
                  selectedPaymentMethod === "office"
                    ? "border-purple-400 bg-purple-50"
                    : "border-gray-200"
                }`}
              >
                <input
                  type="radio"
                  name="payment"
                  value="office"
                  checked={selectedPaymentMethod === "office"}
                  onChange={(e) =>
                    setSelectedPaymentMethod(e.target.value as PaymentMethod)
                  }
                  className="mt-1 text-purple-600"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 bg-purple-600 rounded flex items-center justify-center">
                      🏢
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">Thanh toán tại văn phòng</p>
                      <p className="text-xs text-gray-600">Tiền mặt hoặc chuyển khoản trực tiếp</p>
                    </div>
                  </div>
                  <div className="text-xs text-gray-600 ml-10 space-y-1">
                    <p>
                      📍 <span className="font-medium">Địa chỉ:</span> 123 Đường Lê Lợi, Q1, TP.HCM
                    </p>
                    <p>
                      🕒 <span className="font-medium">Giờ làm việc:</span> 8:00 - 17:30 (T2-T7)
                    </p>
                    <p>
                      📞 <span className="font-medium">Hotline:</span> 1900-FLYJOURNEY
                    </p>
                  </div>
                </div>
              </label>
            </div>

            <div className="mt-6">
              <Button onClick={handlePayment} disabled={isProcessing} className="w-full">
                {isProcessing ? "Đang xử lý..." : "Thanh toán"}
              </Button>
            </div>
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="bg-gray-50 rounded-lg p-6 space-y-4">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Tổng tiền vé</span>
              <span className="font-medium">{formatPrice(booking.totalPrice)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Phụ thu ghế</span>
              <span className="font-medium">{formatPrice(0)}</span>
            </div>
            <div className="border-t pt-2 flex justify-between font-semibold">
              <span>Tổng thanh toán</span>
              <span>{formatPrice(booking.totalPrice)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentMethodStep;
