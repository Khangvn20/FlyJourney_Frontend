import React, { useEffect, useState } from "react";
import { Steps, Result } from "antd";
import { useLocation, useNavigate } from "react-router-dom";
import BookingSummary, { type BookingSelection } from "./BookingSummary";
import PassengerForm from "./PassengerForm";
import PaymentStep from "./PaymentStep";
import { Button } from "../ui/button";
import { useAuthContext } from "../../hooks/useAuthContext";
import type {
  PassengerFormData,
  BookingPayload,
  PaymentMethod,
} from "../../shared/types/passenger.types";
import { addBooking } from "../../services/bookingStorage";
import { bookingService } from "../../services/bookingService";

const { Step } = Steps;

const BookingFlow: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [selection, setSelection] = useState<BookingSelection | null>(null);
  const [step, setStep] = useState(0);
  const { user, isAuthenticated } = useAuthContext();
  const [passengers, setPassengers] = useState<PassengerFormData[]>([]);
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [bookingId, setBookingId] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("vnpay");

  // Load selection from navigation state or sessionStorage
  useEffect(() => {
    const stateSel = (location.state as { bookingSelection?: BookingSelection })
      ?.bookingSelection;
    if (stateSel) {
      setSelection(stateSel);
      sessionStorage.setItem("bookingSelection", JSON.stringify(stateSel));
      return;
    }
    const stored = sessionStorage.getItem("bookingSelection");
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as BookingSelection;
        setSelection(parsed);
      } catch {
        // ignore parse error
      }
    }
  }, [location.state]);

  const handleChangeFlights = () => {
    navigate("/search");
  };

  const handleConfirm = () => {
    // Prefill contact if logged in
    if (isAuthenticated && user) {
      setContactName(user.name || "");
      setContactEmail(user.email || "");
      setContactPhone(user.phone || "");
    }
    // If chưa đăng nhập -> chuyển qua /register (tab login) và quay lại
    if (!isAuthenticated) {
      navigate("/register", {
        state: { redirectTo: "/booking", intent: "booking", selection },
      });
      return;
    }
    setStep(1);
  };

  const passengerCounts = selection
    ? {
        adult: 1, // simplify: one adult default
        child: 0,
        infant: 0,
      }
    : { adult: 0, child: 0, infant: 0 };

  const canProceedPassengers = passengers.every(
    (p) => p.firstName.trim() && p.lastName.trim()
  );

  const goPayment = () => {
    if (!canProceedPassengers) return;
    setStep(2);
  };

  const handleCreateBooking = async () => {
    if (!selection) return;
    setSubmitting(true);
    const payload: BookingPayload = {
      tripType: selection.tripType,
      outboundFlightId: selection.outbound.flight_id,
      inboundFlightId: selection.inbound?.flight_id,
      passengers,
      contact: {
        fullName: contactName,
        email: contactEmail,
        phone: contactPhone,
      },
      totalPrice: selection.totalPrice,
      currency: selection.currency,
      paymentMethod,
    };
    try {
      const res = await bookingService(
        payload as unknown as Record<string, unknown>
      );
      const id =
        (res as { bookingId?: string }).bookingId || crypto.randomUUID();
      addBooking(payload, id);
      setBookingId(id);
      setStep(3);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <Steps current={step} style={{ marginBottom: 24 }}>
        <Step title="Chọn chuyến" />
        <Step title="Nhập thông tin" />
        <Step title="Thanh toán" />
        <Step title="Hoàn tất" />
      </Steps>
      {!selection && (
        <Result
          status="warning"
          title="Chưa có chuyến bay được chọn"
          subTitle="Vui lòng quay lại trang tìm kiếm để chọn chuyến bay của bạn."
          extra={
            <Button onClick={() => navigate("/search")}>
              Về trang tìm kiếm
            </Button>
          }
        />
      )}
      {selection && step === 0 && (
        <BookingSummary
          selection={selection}
          onConfirm={handleConfirm}
          onChangeFlights={handleChangeFlights}
        />
      )}
      {selection && step === 1 && (
        <div className="space-y-6">
          <h3 className="text-lg font-semibold text-gray-900">
            Thông tin hành khách & liên hệ
          </h3>
          <PassengerForm
            passengers={passengers}
            onChange={setPassengers}
            requiredCounts={passengerCounts}
            referenceDate={selection.outbound.departure_time}
          />
          <div className="p-4 border rounded-lg bg-white shadow-sm space-y-4">
            <h4 className="text-sm font-semibold text-gray-800">
              Thông tin liên hệ
            </h4>
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Họ tên *
                </label>
                <input
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  className="w-full text-sm px-3 py-2 rounded border focus:outline-none focus:ring focus:ring-blue-300"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Email *
                </label>
                <input
                  type="email"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  className="w-full text-sm px-3 py-2 rounded border focus:outline-none focus:ring focus:ring-blue-300"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Số điện thoại
                </label>
                <input
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  className="w-full text-sm px-3 py-2 rounded border focus:outline-none focus:ring focus:ring-blue-300"
                />
              </div>
            </div>
            <div className="flex gap-3">
              <Button variant="ghost" onClick={() => setStep(0)}>
                Quay lại
              </Button>
              <Button
                disabled={
                  !canProceedPassengers || !contactName || !contactEmail
                }
                onClick={goPayment}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
                Tiếp tục thanh toán
              </Button>
            </div>
          </div>
        </div>
      )}
      {selection && step === 2 && (
        <div className="relative">
          {submitting && (
            <div className="absolute inset-0 bg-white/60 flex items-center justify-center text-sm font-medium">
              Đang tạo đặt chỗ...
            </div>
          )}
          <PaymentStep
            amount={selection.totalPrice}
            currency={selection.currency}
            onSuccess={handleCreateBooking}
            onBack={() => setStep(1)}
            method={paymentMethod}
            onMethodChange={setPaymentMethod}
          />
        </div>
      )}
      {selection && step === 3 && (
        <Result
          status="success"
          title="Đặt vé thành công"
          subTitle={`Mã đặt chỗ của bạn: ${bookingId}`}
          extra={[
            <Button key="view" onClick={() => navigate("/my-bookings")}>
              Xem đặt chỗ
            </Button>,
            <Button key="home" variant="ghost" onClick={() => navigate("/")}>
              Trang chủ
            </Button>,
          ]}
        />
      )}
    </div>
  );
};

export default BookingFlow;
