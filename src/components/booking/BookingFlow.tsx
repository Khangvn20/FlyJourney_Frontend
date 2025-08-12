import React, { useEffect, useState } from "react";
import { Steps, Result } from "antd";
import { useLocation, useNavigate } from "react-router-dom";
import BookingSummary, { type BookingSelection } from "./BookingSummary";
import BookingOverview from "./BookingOverview";
import AddonsSelector from "./AddonsSelector";
import BasicPassengerInfo, {
  type BasicPassengerData,
} from "./BasicPassengerInfo";
import PaymentStep from "./PaymentStep";
import { Button } from "../ui/button";
import { useAuthContext } from "../../hooks/useAuthContext";
import type {
  PassengerFormData,
  BookingPayload,
  PaymentMethod,
  BookingRecord,
} from "../../shared/types/passenger.types";
import { addBooking } from "../../services/bookingStorage";
import { bookingService } from "../../services/bookingService";

const { Step } = Steps;

const BookingFlow: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [selection, setSelection] = useState<BookingSelection | null>(null);
  const [step, setStep] = useState(0); // 0 overview,1 passenger,2 pay,3 internal complete
  const { user, isAuthenticated } = useAuthContext();
  const [passengers, setPassengers] = useState<PassengerFormData[]>([]);
  const [primaryPassenger, setPrimaryPassenger] = useState<BasicPassengerData>({
    firstName: "",
    lastName: "",
    gender: "",
  });
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [bookingRecord, setBookingRecord] = useState<BookingRecord | null>(
    null
  );
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("vnpay");
  const [addons, setAddons] = useState<{
    extraBaggageKg: number;
    services: string[];
    extraPrice: number;
  }>({ extraBaggageKg: 0, services: [], extraPrice: 0 });

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
        setSelection(JSON.parse(stored) as BookingSelection);
      } catch {
        /* ignore */
      }
    }
  }, [location.state]);

  const handleChangeFlights = () => navigate("/search");
  const handleConfirm = () => {
    if (isAuthenticated && user) {
      setContactName(user.name || "");
      setContactEmail(user.email || "");
      setContactPhone(user.phone || "");
    }
    if (!isAuthenticated) {
      navigate("/register", {
        state: { redirectTo: "/booking", intent: "booking", selection },
      });
      return;
    }
    setStep(1);
  };

  const canProceedPrimary =
    primaryPassenger.firstName.trim() && primaryPassenger.lastName.trim();
  const goPayment = () => {
    if (!canProceedPrimary) return;
    setPassengers([
      {
        id: crypto.randomUUID(),
        type: "adult",
        firstName: primaryPassenger.firstName,
        lastName: primaryPassenger.lastName,
        gender: primaryPassenger.gender || undefined,
      },
    ]);
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
      totalPrice: selection.totalPrice + addons.extraPrice,
      currency: selection.currency,
      paymentMethod,
      addons: {
        extraBaggageKg: addons.extraBaggageKg || undefined,
        services: addons.services.length ? addons.services : undefined,
      },
      addonExtraPrice: addons.extraPrice || 0,
      selectedFlights: {
        outbound: selection.outbound,
        inbound: selection.inbound,
      },
    };
    try {
      const res = await bookingService(
        payload as unknown as Record<string, unknown>
      );
      const id =
        (res as { bookingId?: string }).bookingId || crypto.randomUUID();
      const stored = addBooking(payload, id);
      setBookingRecord(stored);
      setStep(3);
    } finally {
      setSubmitting(false);
    }
  };

  const MiniSummary: React.FC = () => {
    if (!selection) return null;
    const outbound = selection.outbound;
    const inbound =
      selection.tripType === "round-trip" ? selection.inbound : undefined;
    const total = selection.totalPrice + addons.extraPrice;
    return (
      <div className="sticky top-4 space-y-4 animate-[fadeIn_.4s_ease]">
        <div className="relative overflow-hidden rounded-2xl border border-blue-100 bg-white/80 backdrop-blur-sm p-4 shadow-sm">
          <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full bg-blue-200/30 blur-3xl" />
          <div className="relative z-10 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-semibold tracking-wide text-blue-600 uppercase">
                Chuyến đã chọn
              </h4>
              {inbound && (
                <span className="px-2 py-0.5 rounded-full bg-indigo-600 text-[10px] text-white font-medium">
                  Khứ hồi
                </span>
              )}
            </div>
            <div className="text-[11px] font-medium text-gray-700 leading-relaxed">
              <div>
                {outbound.departure_airport_code} →{" "}
                {outbound.arrival_airport_code}
              </div>
              {inbound && (
                <div>
                  {inbound.departure_airport_code} →{" "}
                  {inbound.arrival_airport_code}
                </div>
              )}
            </div>
            <div className="pt-2 border-t border-blue-50/70 space-y-1">
              <div className="flex items-center justify-between text-[11px] text-gray-600">
                <span>Giá gốc</span>
                <span className="font-medium">
                  {selection.totalPrice.toLocaleString("vi-VN")}
                </span>
              </div>
              <div className="flex items-center justify-between text-[11px] text-gray-600">
                <span>Phụ thu dịch vụ</span>
                <span className="font-medium">
                  {addons.extraPrice.toLocaleString("vi-VN")}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs font-semibold text-gray-900">
                <span>Tạm tính</span>
                <span className="bg-gradient-to-r from-blue-600 to-indigo-600 text-transparent bg-clip-text text-sm">
                  {total.toLocaleString("vi-VN")} {selection.currency}
                </span>
              </div>
            </div>
          </div>
        </div>
        {(addons.services.length > 0 || addons.extraBaggageKg > 0) && (
          <div className="rounded-xl border bg-white/80 backdrop-blur-sm p-3 shadow-sm">
            <h5 className="text-[10px] font-semibold tracking-wide text-gray-500 uppercase mb-1">
              Dịch vụ đã chọn
            </h5>
            <ul className="text-[11px] text-gray-600 space-y-0.5 list-disc pl-4">
              {addons.extraBaggageKg > 0 && (
                <li>+{addons.extraBaggageKg}kg hành lý</li>
              )}
              {addons.services.map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  };

  const displayedStep = Math.min(step, 2);

  return (
    <div className="space-y-6">
      <div className="relative">
        <Steps current={displayedStep} style={{ marginBottom: 16 }}>
          <Step title="Tổng quan" />
          <Step title="Hành khách" />
          <Step title="Giữ chỗ/TT" />
        </Steps>
        <div className="h-1 rounded-full bg-gray-100 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 transition-all duration-500"
            style={{ width: `${(displayedStep / 2) * 100}%` }}
          />
        </div>
      </div>
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
        <div className="grid gap-8 md:grid-cols-12">
          <div className="md:col-span-8 space-y-6">
            <div className="relative overflow-hidden rounded-2xl border bg-white/90 backdrop-blur-sm p-5 shadow-sm">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-50/70 via-transparent to-indigo-50/70 opacity-60" />
              <div className="relative z-10 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 text-white text-sm font-bold shadow">
                    1
                  </span>
                  Thông tin hành khách & liên hệ
                </h3>
                <span className="text-[11px] text-gray-500">Bước 2 / 3</span>
              </div>
            </div>
            <BasicPassengerInfo
              value={primaryPassenger}
              onChange={setPrimaryPassenger}
            />
            <div className="p-5 rounded-xl border bg-white shadow-sm space-y-4 relative overflow-hidden">
              <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_85%_20%,rgba(99,102,241,0.12),transparent_70%)]" />
              <h4 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
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
                    placeholder="Nguyễn Văn A"
                    className="w-full text-sm px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400/70 bg-white/60"
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
                    placeholder="email@domain.com"
                    className="w-full text-sm px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400/70 bg-white/60"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Số điện thoại
                  </label>
                  <input
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    placeholder="09xx xxx xxx"
                    className="w-full text-sm px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400/70 bg-white/60"
                  />
                </div>
              </div>
            </div>
            <div className="p-5 rounded-xl border bg-white shadow-sm space-y-4">
              <h4 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                Hành lý & Dịch vụ thêm{" "}
                <span className="text-xs font-normal text-gray-400">
                  (tuỳ chọn)
                </span>
              </h4>
              <AddonsSelector
                baseFare={selection.totalPrice}
                onChange={(a) => setAddons(a)}
                value={{
                  extraBaggageKg: addons.extraBaggageKg,
                  services: addons.services,
                }}
              />
            </div>
            <div className="flex gap-3 pt-2">
              <Button
                variant="ghost"
                onClick={() => setStep(0)}
                className="shadow-sm">
                Quay lại
              </Button>
              <Button
                disabled={!canProceedPrimary || !contactName || !contactEmail}
                onClick={goPayment}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg shadow-blue-500/30">
                Tiếp tục{" "}
                {(selection.totalPrice + addons.extraPrice).toLocaleString(
                  "vi-VN"
                )}{" "}
                {selection.currency}
              </Button>
            </div>
          </div>
          <div className="md:col-span-4 hidden md:block">
            <MiniSummary />
          </div>
        </div>
      )}
      {selection && step === 2 && (
        <div className="grid gap-8 md:grid-cols-12">
          <div className="md:col-span-8 relative space-y-6">
            <div className="relative overflow-hidden rounded-2xl border bg-white/90 backdrop-blur-sm p-5 shadow-sm">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-50/70 via-transparent to-indigo-50/70 opacity-60" />
              <div className="relative z-10 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-indigo-600 to-violet-600 text-white text-sm font-bold shadow">
                    2
                  </span>
                  Giữ chỗ / Thanh toán
                </h3>
                <span className="text-[11px] text-gray-500">Bước 3 / 3</span>
              </div>
            </div>
            {submitting && (
              <div className="absolute inset-0 bg-white/60 flex items-center justify-center text-sm font-medium">
                Đang tạo đặt chỗ...
              </div>
            )}
            <PaymentStep
              amount={selection.totalPrice + addons.extraPrice}
              currency={selection.currency}
              onSuccess={handleCreateBooking}
              onBack={() => setStep(1)}
              method={paymentMethod}
              onMethodChange={setPaymentMethod}
            />
          </div>
          <div className="md:col-span-4 hidden md:block">
            <MiniSummary />
          </div>
        </div>
      )}
      {selection && step === 3 && (
        <BookingOverview
          selection={selection}
          passengers={passengers}
          contact={{
            name: contactName,
            email: contactEmail,
            phone: contactPhone,
          }}
          addons={addons}
          totalPrice={selection.totalPrice + addons.extraPrice}
          currency={selection.currency}
          booking={bookingRecord}
          paymentMethod={paymentMethod}
          onFinish={() => navigate("/my-bookings")}
        />
      )}
      <style>{`@keyframes fadeIn {from {opacity:0;transform:translateY(8px);} to {opacity:1;transform:translateY(0);} }`}</style>
    </div>
  );
};

export default BookingFlow;
