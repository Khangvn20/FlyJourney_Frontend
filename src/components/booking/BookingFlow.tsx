import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Result } from "antd";
import { useAuthContext } from "../../hooks/useAuthContext";
import BookingSummary from "./BookingSummary";
import type { BookingSelection } from "./BookingSummary";
import BookingOverview from "./BookingOverview";
import { Button } from "../ui/button";
import type {
  PassengerFormData,
  BookingRecord,
} from "../../shared/types/passenger.types";
import { createBooking } from "../../services/bookingService";
import { createBookingPayload } from "../../shared/utils/bookingApiHelpers";
import { saveBookings, loadBookings } from "../../services/bookingStorage";
import {
  DEV_CONFIG,
  shouldShowDevControls,
} from "../../shared/config/devConfig";

// Import the new step components
import { BookingStepHeader, PassengerInformationStep } from "./steps";

const BookingFlow: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [selection, setSelection] = useState<BookingSelection | null>(null);
  const [step, setStep] = useState(0); // 0 summary, 1 passengers, 2 seat selection, 3 overview
  const [showPayment, setShowPayment] = useState(false);
  const { user, isAuthenticated } = useAuthContext();

  // Basic state
  const [passengers, setPassengers] = useState<PassengerFormData[]>([]);
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [contactAddress, setContactAddress] = useState("");
  const [note, setNote] = useState("");
  const [bookingRecord, setBookingRecord] = useState<BookingRecord | null>(
    null
  );
  const [isBooking, setIsBooking] = useState(false);
  const [bookingError, setBookingError] = useState<string | null>(null);
  const [bookingSuccess, setBookingSuccess] = useState(false);

  // Passenger counts and addons state
  const [passengerCounts, setPassengerCounts] = useState<{
    adults: number;
    children: number;
    infants: number;
  }>({ adults: 1, children: 0, infants: 0 });

  const [addons, setAddons] = useState<{
    extraBaggageKg: number;
    services: string[];
    extraPrice: number;
  }>({ extraBaggageKg: 0, services: [], extraPrice: 0 });

  // Load selection from route state or sessionStorage
  useEffect(() => {
    const stateSel = (location.state as { bookingSelection?: BookingSelection })
      ?.bookingSelection;
    if (stateSel) {
      setSelection(stateSel);
      sessionStorage.setItem("bookingSelection", JSON.stringify(stateSel));
    } else {
      const stored = sessionStorage.getItem("bookingSelection");
      if (stored) {
        try {
          setSelection(JSON.parse(stored) as BookingSelection);
        } catch {
          /* ignore */
        }
      }
    }

    // Load passenger counts from search info
    const storedSearchInfo = sessionStorage.getItem("searchInfo");
    if (storedSearchInfo) {
      try {
        const searchInfo = JSON.parse(storedSearchInfo);
        if (searchInfo.passengers) {
          const counts = {
            adults: Math.min(searchInfo.passengers.adults || 1, 8),
            children: Math.min(searchInfo.passengers.children || 0, 8),
            infants: Math.min(searchInfo.passengers.infants || 0, 8),
          };

          // Ensure total passengers don't exceed 8
          const total = counts.adults + counts.children + counts.infants;
          if (total > 8) {
            // Prioritize adults, then children, then infants
            let remaining = 8;
            counts.adults = Math.min(counts.adults, remaining);
            remaining -= counts.adults;
            counts.children = Math.min(counts.children, remaining);
            remaining -= counts.children;
            counts.infants = Math.min(counts.infants, remaining);
          }

          setPassengerCounts(counts);
        }
      } catch (error) {
        console.error("Failed to parse search info:", error);
      }
    }
  }, [location.state]);

  // Initialize passengers array when counts change
  useEffect(() => {
    const totalPassengers =
      passengerCounts.adults +
      passengerCounts.children +
      passengerCounts.infants;
    if (totalPassengers > 0 && passengers.length !== totalPassengers) {
      const newPassengers: PassengerFormData[] = [];

      // Add adults
      for (let i = 0; i < passengerCounts.adults; i++) {
        newPassengers.push({
          id: `adult-${i}`,
          firstName: "",
          lastName: "",
          dateOfBirth: "",
          gender: undefined,
          documentType: "id_card",
          passportNumber: "",
          passportExpiry: "",
          nationality: "VN",
          issuingCountry: "VN",
          type: "adult",
        });
      }

      // Add children
      for (let i = 0; i < passengerCounts.children; i++) {
        newPassengers.push({
          id: `child-${i}`,
          firstName: "",
          lastName: "",
          dateOfBirth: "",
          gender: undefined,
          documentType: "id_card",
          passportNumber: "",
          passportExpiry: "",
          nationality: "VN",
          issuingCountry: "VN",
          type: "child",
        });
      }

      // Add infants
      for (let i = 0; i < passengerCounts.infants; i++) {
        newPassengers.push({
          id: `infant-${i}`,
          firstName: "",
          lastName: "",
          dateOfBirth: "",
          gender: undefined,
          documentType: "id_card",
          passportNumber: "",
          passportExpiry: "",
          nationality: "VN",
          issuingCountry: "VN",
          type: "infant",
        });
      }

      setPassengers(newPassengers);
    }
  }, [passengerCounts, passengers.length]);

  // Navigation handlers
  const handleChangeFlights = () => navigate("/search");

  const handleConfirm = () => {
    if (isAuthenticated && user) {
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

  const handleConfirmBooking = async () => {
    if (!selection || passengers.length === 0) {
      setBookingError("Thông tin đặt chỗ không hợp lệ");
      return;
    }

    setIsBooking(true);
    setBookingError(null);

    try {
      // Create booking payload
      const payload = createBookingPayload(
        selection,
        passengers,
        contactEmail,
        contactPhone,
        contactAddress,
        note,
        addons
      );

      if (DEV_CONFIG.ENABLE_CONSOLE_LOGS && shouldShowDevControls()) {
        console.log("🎫 Creating booking with payload:", payload);
        console.log(
          "📅 Trip type:",
          selection.inbound ? "round-trip" : "one-way"
        );
        if (selection.inbound) {
          console.log("✈️ Outbound flight_id:", selection.outbound.flight_id);
          console.log("🔄 Return flight_id:", selection.inbound.flight_id);
        }
      }

      // Call API
      const response = await createBooking(payload);

      if (response.status) {
        // Success - convert to our BookingRecord format
        const apiBooking = response.data;
        if (apiBooking) {
          const newBookingRecord: BookingRecord = {
            bookingId: apiBooking.booking_id.toString(),
            status:
              apiBooking.status === "pending_payment" ? "PENDING" : "CONFIRMED",
            createdAt: apiBooking.created_at,
            // Set hold expiry to 2 hours from now for pending bookings (as per your requirement)
            holdExpiresAt:
              apiBooking.status === "pending_payment"
                ? new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString()
                : undefined,
            // BookingPayload fields
            tripType: selection.inbound ? "round-trip" : "one-way",
            outboundFlightId: selection.outbound.flight_id,
            inboundFlightId: selection.inbound?.flight_id,
            passengers,
            contact: {
              fullName: `${passengers[0]?.firstName} ${passengers[0]?.lastName}`,
              email: contactEmail,
              phone: contactPhone,
            },
            // Use the same price calculation as in BookingOverview
            totalPrice: selection.totalPrice + addons.extraPrice,
            currency: selection.currency,
            // Set placeholder payment method for pending bookings
            paymentMethod:
              apiBooking.status === "pending_payment" ? "office" : "vnpay",
            note,
            addons,
            addonExtraPrice: addons.extraPrice,
            selectedFlights: {
              outbound: selection.outbound,
              inbound: selection.inbound,
            },
          };

          setBookingRecord(newBookingRecord);

          // Save booking to localStorage
          const existingBookings = loadBookings();
          const updatedBookings = [...existingBookings, newBookingRecord];
          saveBookings(updatedBookings);

          if (DEV_CONFIG.ENABLE_CONSOLE_LOGS && shouldShowDevControls()) {
            console.log("✅ Booking created successfully:", newBookingRecord);
            console.log("💾 Booking saved to localStorage");
            console.log("📊 API Response:", apiBooking);
            console.log("🔍 Booking Status:", newBookingRecord.status);
            console.log("💰 Price Calculation:");
            console.log("  - Selection price:", selection.totalPrice);
            console.log("  - Addons price:", addons.extraPrice);
            console.log(
              "  - Final total:",
              selection.totalPrice + addons.extraPrice
            );
            console.log("  - API returned price:", apiBooking.total_price);
          }

          // Set success state
          setBookingSuccess(true);

          // Auto navigate to My Bookings after successful booking creation
          setTimeout(() => {
            navigate("/my-bookings");
          }, 1500); // Give user 1.5 seconds to see the success state
        } else {
          throw new Error("API không trả về dữ liệu booking");
        }
      } else {
        throw new Error(response.errorMessage || "Lỗi khi tạo đặt chỗ");
      }
    } catch (error) {
      console.error("❌ Booking creation failed:", error);
      let errorMessage = "Có lỗi xảy ra khi tạo đặt chỗ. Vui lòng thử lại.";

      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === "object" && error && "message" in error) {
        errorMessage = String(error.message);
      }

      setBookingError(errorMessage);
    } finally {
      setIsBooking(false);
    }
  };

  // Validation logic
  const validateAllPassengers = () => {
    const expectedTotal =
      passengerCounts.adults +
      passengerCounts.children +
      passengerCounts.infants;
    if (passengers.length !== expectedTotal) return false;

    // Check if contact address is provided
    if (!contactAddress.trim()) return false;

    // Check if first passenger (booker) has phone number
    if (!passengers[0]?.phone?.trim()) return false;

    return passengers.every(
      (p) =>
        p.firstName.trim() &&
        p.lastName.trim() &&
        p.dateOfBirth &&
        p.gender &&
        (p.passportNumber || "").trim() &&
        (!p.type ||
          p.type === "adult" ||
          p.type === "child" ||
          p.type === "infant")
    );
  };

  // Step titles for header
  const stepTitles = [
    "Xác nhận chuyến bay",
    "Thông tin hành khách",
    "Xem tổng quan & Thanh toán",
  ];

  // Calculate current display step
  const displayedStep = showPayment ? 3 : step + 1;

  if (!selection) {
    return (
      <Result
        status="warning"
        title="Chưa có chuyến bay được chọn"
        subTitle="Vui lòng quay lại trang tìm kiếm để chọn chuyến bay của bạn."
        extra={
          <Button onClick={() => navigate("/search")}>Về trang tìm kiếm</Button>
        }
      />
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl space-y-6">
      {/* Step Header */}
      <BookingStepHeader
        currentStep={displayedStep}
        totalSteps={3}
        stepTitles={stepTitles}
        allowStepNavigation={false}
      />

      {/* Progress Bar */}
      <div className="relative h-2 bg-gray-200 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 transition-all duration-500"
          style={{ width: `${(displayedStep / 3) * 100}%` }}
        />
      </div>

      {/* Step 0: Booking Summary */}
      {step === 0 && (
        <BookingSummary
          selection={selection}
          onConfirm={handleConfirm}
          onChangeFlights={handleChangeFlights}
        />
      )}

      {/* Step 1: Passenger Information */}
      {step === 1 && (
        <PassengerInformationStep
          passengers={passengers}
          onPassengerChange={setPassengers}
          passengerCounts={passengerCounts}
          selection={selection}
          addons={addons}
          onAddonsChange={setAddons}
          note={note}
          onNoteChange={setNote}
          contactAddress={contactAddress}
          onContactAddressChange={setContactAddress}
          onBack={() => setStep(0)}
          onNext={() => setStep(2)}
          isValid={validateAllPassengers()}
        />
      )}

      {/* Step 2: Booking Overview */}
      {step === 2 && (
        <>
          {bookingSuccess && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 text-green-500 text-2xl">✅</div>
                <div>
                  <h4 className="font-semibold text-green-800 mb-2">
                    Đặt chỗ thành công!
                  </h4>
                  <p className="text-sm text-green-700 mb-2">
                    Vé của bạn đã được giữ chỗ thành công. Mã đặt chỗ:{" "}
                    <span className="font-medium">
                      {bookingRecord?.bookingId}
                    </span>
                  </p>
                  <p className="text-xs text-green-600">
                    🎫 Đang chuyển đến trang "Đặt chỗ của tôi" để chọn ghế và
                    thanh toán...
                  </p>
                </div>
              </div>
            </div>
          )}

          {bookingError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <div className="flex items-start gap-3">
                <div className="w-5 h-5 text-red-500 mt-0.5">⚠️</div>
                <div>
                  <h4 className="font-medium text-red-800 mb-1">Lỗi đặt chỗ</h4>
                  <p className="text-sm text-red-700">{bookingError}</p>
                </div>
              </div>
            </div>
          )}
          <BookingOverview
            selection={selection}
            passengers={passengers}
            contact={{ email: contactEmail, phone: contactPhone }}
            contactAddress={contactAddress}
            addons={addons}
            totalPrice={selection.totalPrice + addons.extraPrice}
            currency={selection.currency}
            booking={bookingRecord}
            note={note}
            onPay={handleConfirmBooking}
            onFinish={() => navigate("/my-bookings")}
            onBack={() => setStep(1)}
            isBooking={isBooking}
          />
        </>
      )}

      {/* Payment Step (Placeholder) */}
      {showPayment && bookingRecord && (
        <div className="bg-white rounded-lg p-6 shadow-sm border">
          <h3 className="text-lg font-semibold mb-4">Thanh toán</h3>
          <p className="text-gray-600 mb-4">
            Component PaymentStep sẽ được tích hợp ở đây.
          </p>
          <p className="text-sm text-gray-500 mb-6">
            Mã đặt chỗ: {bookingRecord.bookingId}
          </p>
          <div className="flex justify-between">
            <button
              onClick={() => setShowPayment(false)}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors">
              ← Quay lại
            </button>
            <button
              onClick={() => navigate("/my-bookings")}
              className="px-6 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all duration-200 shadow-lg">
              Hoàn thành thanh toán
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingFlow;
