import React, { useState, useEffect, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Result } from "antd";
import { useAuthContext } from "../../hooks/useAuthContext";
import BookingSummary from "./BookingSummary";
import type { BookingSelection } from "./BookingSummary";
import BookingOverview from "./BookingOverview";
import { Button } from "../ui/button";
import { SERVICE_OPTIONS } from "./bookingAddons.constants";
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
import { PriceValidator } from "../../shared/utils/priceValidation";
import { PriceDebugger } from "../../shared/utils/priceDebugger";

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
  const [contactName, setContactName] = useState("");
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

  const baggageTotal = useMemo(
    () => passengers.reduce((sum, p) => sum + (p.extraBaggage?.price || 0), 0),
    [passengers]
  );

  if (DEV_CONFIG.ENABLE_CONSOLE_LOGS && shouldShowDevControls()) {
    console.log("🔍 BAGGAGE TOTAL CALCULATION:", {
      baggageTotal,
      passengers: passengers.map((p) => ({
        name: `${p.firstName} ${p.lastName}`,
        extraBaggage: p.extraBaggage,
      })),
    });
  }

  const servicesTotal = useMemo(() => {
    const totalPassengers =
      passengerCounts.adults +
      passengerCounts.children +
      passengerCounts.infants;

    if (DEV_CONFIG.ENABLE_CONSOLE_LOGS && shouldShowDevControls()) {
      console.log("🔍 SERVICES TOTAL CALCULATION:", {
        totalPassengers,
        passengerCounts,
        addonsServices: addons.services,
        serviceOptions: SERVICE_OPTIONS.map((s) => ({
          id: s.id,
          price: s.price,
        })),
      });
    }

    const total = addons.services.reduce((sum, id) => {
      const svc = SERVICE_OPTIONS.find((s) => s.id === id);
      const servicePrice = svc ? svc.price * totalPassengers : 0;
      if (DEV_CONFIG.ENABLE_CONSOLE_LOGS && shouldShowDevControls()) {
        console.log(`🔍 Service ${id}:`, {
          found: !!svc,
          price: svc?.price,
          totalPassengers,
          servicePrice,
        });
      }
      return sum + servicePrice;
    }, 0);

    if (DEV_CONFIG.ENABLE_CONSOLE_LOGS && shouldShowDevControls()) {
      console.log("🔍 SERVICES TOTAL RESULT:", total);
    }
    return total;
  }, [addons.services, passengerCounts]);

  const addonsTotal = baggageTotal + servicesTotal;
  const addonsWithPrice = useMemo(
    () => ({ ...addons, extraPrice: addonsTotal }),
    [addons, addonsTotal]
  );
  const totalPriceWithAddons = useMemo(
    () => (selection ? selection.totalPrice : 0) + addonsTotal,
    [selection, addonsTotal]
  );

  if (DEV_CONFIG.ENABLE_CONSOLE_LOGS && shouldShowDevControls()) {
    console.log("🔍 FINAL PRICE CALCULATIONS:", {
      selectionPrice: selection?.totalPrice || 0,
      baggageTotal,
      servicesTotal,
      addonsTotal,
      totalPriceWithAddons,
      currency: selection?.currency,
    });
  }

  // Load selection from route state or sessionStorage
  useEffect(() => {
    const stateSel = (location.state as { bookingSelection?: BookingSelection })
      ?.bookingSelection;
    if (stateSel) {
      setSelection(stateSel);
      sessionStorage.setItem("bookingSelection", JSON.stringify(stateSel));

      // Set passenger counts from bookingSelection if available
      if (stateSel.passengers) {
        const counts = {
          adults: Math.min(stateSel.passengers.adults || 1, 8),
          children: Math.min(stateSel.passengers.children || 0, 8),
          infants: Math.min(stateSel.passengers.infants || 0, 8),
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
        return; // Don't need to load from searchInfo
      }
    } else {
      const stored = sessionStorage.getItem("bookingSelection");
      if (stored) {
        try {
          const parsedSelection = JSON.parse(stored) as BookingSelection;
          setSelection(parsedSelection);

          // Set passenger counts from stored selection if available
          if (parsedSelection.passengers) {
            const counts = {
              adults: Math.min(parsedSelection.passengers.adults || 1, 8),
              children: Math.min(parsedSelection.passengers.children || 0, 8),
              infants: Math.min(parsedSelection.passengers.infants || 0, 8),
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
            return; // Don't need to load from searchInfo
          }
        } catch {
          /* ignore */
        }
      }
    }

    // Fallback: Load passenger counts from search info only if not available in bookingSelection
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
        if (DEV_CONFIG.ENABLE_CONSOLE_LOGS && shouldShowDevControls()) {
          console.error("Failed to parse search info:", error);
        }
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

  const handleConfirmBooking = async () => {
    if (!selection || passengers.length === 0) {
      setBookingError("Thông tin đặt chỗ không hợp lệ");
      return;
    }

    setIsBooking(true);
    setBookingError(null);

    try {
      // COMPREHENSIVE PRICE VALIDATION USING UTILITY
      const priceValidation = PriceValidator.validatePriceCalculation(
        selection,
        passengers,
        baggageTotal,
        servicesTotal,
        totalPriceWithAddons,
        "pre_booking_validation"
      );

      if (!priceValidation.isValid) {
        if (DEV_CONFIG.ENABLE_CONSOLE_LOGS && shouldShowDevControls()) {
          console.error("❌ PRICE VALIDATION FAILED:", priceValidation.errors);
        }
        setBookingError(`Lỗi tính giá: ${priceValidation.errors.join(", ")}`);
        return;
      }

      if (priceValidation.warnings.length > 0) {
        if (DEV_CONFIG.ENABLE_CONSOLE_LOGS && shouldShowDevControls()) {
          console.warn(
            "⚠️ Price validation warnings:",
            priceValidation.warnings
          );
        }
      }

      // Create booking payload
      const payload = createBookingPayload(
        selection,
        passengers,
        contactName,
        contactEmail,
        contactPhone,
        contactAddress,
        note,
        addonsWithPrice
      );

      // PRICE CONSISTENCY CHECK
      const payloadPriceAudit = {
        timestamp: new Date().toISOString(),
        step: "payload_creation",
        payloadTotalPrice: payload.total_price,
        frontendTotal: totalPriceWithAddons,
        selectionPrice: selection.totalPrice,
        addonsPrice: addonsWithPrice.extraPrice,
        baggageTotal,
        servicesTotal,
        addonsTotal,
        difference: Math.abs(payload.total_price - totalPriceWithAddons),
      };

      if (DEV_CONFIG.ENABLE_CONSOLE_LOGS && shouldShowDevControls()) {
        console.log("🔍 PRICE AUDIT TRAIL - PAYLOAD:", payloadPriceAudit);
      }

      // Validate payload price matches frontend calculation
      if (Math.abs(payload.total_price - totalPriceWithAddons) > 0.01) {
        const payloadError = `Payload price mismatch: payload=${payload.total_price}, frontend=${totalPriceWithAddons}`;
        if (DEV_CONFIG.ENABLE_CONSOLE_LOGS && shouldShowDevControls()) {
          console.error("❌ PAYLOAD PRICE VALIDATION FAILED:", payloadError);
        }
        setBookingError(`Lỗi tạo payload: ${payloadError}`);
        return;
      }

      if (DEV_CONFIG.ENABLE_CONSOLE_LOGS && shouldShowDevControls()) {
        console.log("🎫 Creating booking with validated payload:", payload);
        console.log("💰 COMPREHENSIVE PRICE BREAKDOWN:");
        console.log("  ✅ Price validation passed");
        console.log("  - selection.totalPrice:", selection.totalPrice);
        console.log("  - baggageTotal:", baggageTotal);
        console.log("  - servicesTotal:", servicesTotal);
        console.log("  - addonsTotal:", addonsTotal);
        console.log(
          "  - totalPriceWithAddons (frontend calc):",
          totalPriceWithAddons
        );
        console.log(
          "  - payload.total_price (validated):",
          payload.total_price
        );
        console.log("  - currency:", selection.currency);
        console.log("  - passenger breakdown:", {
          adults: passengerCounts.adults,
          children: passengerCounts.children,
          infants: passengerCounts.infants,
          total: passengers.length,
        });
        console.log("  - flight details:", {
          outbound: {
            flight_id: selection.outbound.flight_id,
            flight_number: selection.outbound.flight_number,
            pricing: selection.outbound.pricing,
          },
          inbound: selection.inbound
            ? {
                flight_id: selection.inbound.flight_id,
                flight_number: selection.inbound.flight_number,
                pricing: selection.inbound.pricing,
              }
            : null,
        });
        console.log("  - addons breakdown:", {
          services: addons.services,
          extraBaggageKg: addons.extraBaggageKg,
          individualBaggage: passengers.map((p) => ({
            passenger: `${p.firstName} ${p.lastName}`,
            baggage: p.extraBaggage,
          })),
        });
      }

      // Call API with audit logging
      if (DEV_CONFIG.ENABLE_CONSOLE_LOGS && shouldShowDevControls()) {
        console.log("📡 SENDING BOOKING REQUEST:", {
          timestamp: new Date().toISOString(),
          userId: user?.id,
          payloadSize: JSON.stringify(payload).length,
          totalPrice: payload.total_price,
          expectedPrice: totalPriceWithAddons,
          priceMatch: payload.total_price === totalPriceWithAddons,
        });
      }

      const response = await createBooking(payload);

      // COMPREHENSIVE API RESPONSE VALIDATION
      if (DEV_CONFIG.ENABLE_CONSOLE_LOGS && shouldShowDevControls()) {
        console.log("📡 BOOKING API RESPONSE RECEIVED:", {
          timestamp: new Date().toISOString(),
          status: response.status,
          hasData: !!response.data,
          responseSize: JSON.stringify(response).length,
          apiTotalPrice: response.data?.total_price,
          frontendSentPrice: payload.total_price,
          priceDifference: response.data
            ? response.data.total_price - payload.total_price
            : 0,
        });
      }

      if (response.status) {
        // Success - convert to our BookingRecord format
        const apiBooking = response.data;
        if (apiBooking) {
          // BACKEND PRICE ISSUE DETECTED - Log detailed analysis
          const backendIssue = {
            timestamp: new Date().toISOString(),
            bookingId: apiBooking.booking_id,
            issue: "BACKEND_PRICE_INFLATION",
            frontendSent: payload.total_price,
            backendReturned: apiBooking.total_price,
            difference: apiBooking.total_price - payload.total_price,
            percentageIncrease:
              (
                ((apiBooking.total_price - payload.total_price) /
                  payload.total_price) *
                100
              ).toFixed(2) + "%",
            breakdown: {
              flightPrice: selection.totalPrice,
              baggageTotal,
              servicesTotal,
              addonsTotal,
              expectedTotal: totalPriceWithAddons,
            },
            ancillariesFromResponse: apiBooking.ancillaries?.map((a) => ({
              type: a.type,
              description: a.description,
              quantity: a.quantity,
              price: a.price,
            })),
          };

          if (DEV_CONFIG.ENABLE_CONSOLE_LOGS && shouldShowDevControls()) {
            console.error("🚨 BACKEND PRICE INFLATION DETECTED:", backendIssue);
          }

          // Use PriceDebugger for structured logging
          PriceDebugger.logPriceIssue({
            timestamp: new Date().toISOString(),
            bookingId: apiBooking.booking_id.toString(),
            step: "api_response_received",
            frontend: {
              selectionPrice: selection.totalPrice,
              baggageTotal,
              servicesTotal,
              addonsTotal,
              totalPriceWithAddons,
            },
            backend: {
              totalPrice: apiBooking.total_price,
              status: apiBooking.status,
            },
            payload: {
              totalPrice: payload.total_price,
            },
            comparison: {
              difference: apiBooking.total_price - payload.total_price,
              percentageDifference:
                (
                  ((apiBooking.total_price - payload.total_price) /
                    payload.total_price) *
                  100
                ).toFixed(2) + "%",
              issue:
                apiBooking.total_price > payload.total_price
                  ? "backend_higher"
                  : apiBooking.total_price < payload.total_price
                  ? "backend_lower"
                  : "match",
            },
          });
          // CRITICAL PRICE VALIDATION AGAINST API RESPONSE USING UTILITY
          const apiPriceValidation = PriceValidator.validateApiResponsePrice(
            totalPriceWithAddons,
            apiBooking.total_price || 0,
            apiBooking.booking_id.toString(),
            selection.currency
          );

          if (apiPriceValidation.shouldInvestigate) {
            // Log detailed breakdown for debugging when investigation is needed
            if (DEV_CONFIG.ENABLE_CONSOLE_LOGS && shouldShowDevControls()) {
              console.error("💰 DETAILED PRICE BREAKDOWN FOR INVESTIGATION:", {
                selection: {
                  totalPrice: selection.totalPrice,
                  outboundPricing: selection.outbound.pricing,
                  inboundPricing: selection.inbound?.pricing,
                },
                addons: {
                  baggageTotal,
                  servicesTotal,
                  addonsTotal,
                  individualBaggage: passengers.map((p) => p.extraBaggage),
                },
                calculations: {
                  frontendTotal: totalPriceWithAddons,
                  payloadTotal: payload.total_price,
                  apiTotal: apiBooking.total_price,
                },
                validationResult: apiPriceValidation,
                backendIssueDetected: {
                  frontendSent: payload.total_price,
                  backendReturned: apiBooking.total_price,
                  difference: apiBooking.total_price - payload.total_price,
                  percentageIncrease:
                    (
                      ((apiBooking.total_price - payload.total_price) /
                        payload.total_price) *
                      100
                    ).toFixed(2) + "%",
                },
              });
            }
          }

          const priceDifference = apiPriceValidation.auditLog
            .difference as number;

          // FORCE USE FRONTEND CALCULATED PRICE TO MAINTAIN CONSISTENCY
          // This prevents user confusion when seeing different prices in My Bookings
          const useFrontendPrice = true; // Set to false to use API price
          const finalPrice = useFrontendPrice
            ? totalPriceWithAddons
            : apiBooking.total_price || totalPriceWithAddons;

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
              fullName: contactName,
              email: contactEmail,
              phone: contactPhone,
            },
            // IMPORTANT: Use frontend calculated price to maintain consistency with what user saw
            // This prevents confusion when user sees different price in My Bookings
            totalPrice: finalPrice,
            currency: selection.currency,
            // Set placeholder payment method for pending bookings
            paymentMethod:
              apiBooking.status === "pending_payment" ? "office" : "vnpay",
            note,
            addons: addonsWithPrice,
            addonExtraPrice: addonsTotal,
            selectedFlights: {
              outbound: selection.outbound,
              inbound: selection.inbound,
            },
          };

          // FINAL BOOKING RECORD VALIDATION
          const finalAudit = {
            timestamp: new Date().toISOString(),
            step: "final_booking_record",
            bookingId: newBookingRecord.bookingId,
            recordTotalPrice: newBookingRecord.totalPrice,
            apiTotalPrice: apiBooking.total_price,
            frontendCalculatedPrice: totalPriceWithAddons,
            consistencyMaintained:
              newBookingRecord.totalPrice === totalPriceWithAddons,
            status: newBookingRecord.status,
            priceSource: useFrontendPrice ? "frontend" : "api",
          };

          if (DEV_CONFIG.ENABLE_CONSOLE_LOGS && shouldShowDevControls()) {
            console.log("🔍 PRICE AUDIT TRAIL - FINAL RECORD:", finalAudit);
          }

          setBookingRecord(newBookingRecord);

          // Save booking to localStorage with audit
          const existingBookings = loadBookings();
          const updatedBookings = [...existingBookings, newBookingRecord];
          saveBookings(updatedBookings);

          if (DEV_CONFIG.ENABLE_CONSOLE_LOGS && shouldShowDevControls()) {
            console.log("💾 BOOKING SAVED TO LOCALSTORAGE:", {
              timestamp: new Date().toISOString(),
              bookingId: newBookingRecord.bookingId,
              totalBookings: updatedBookings.length,
              savedPrice: newBookingRecord.totalPrice,
              priceSource: useFrontendPrice
                ? "frontend_calculated"
                : "api_response",
            });
          }

          if (DEV_CONFIG.ENABLE_CONSOLE_LOGS && shouldShowDevControls()) {
            console.log("✅ Booking created successfully:", newBookingRecord);
            console.log("📊 Complete API Response:", apiBooking);
            console.log("🔍 Booking Status:", newBookingRecord.status);
            console.log("💰 COMPREHENSIVE PRICE AUDIT SUMMARY:");
            console.log("  ✅ Frontend calculation:", totalPriceWithAddons);
            console.log("  📤 Sent to API:", payload.total_price);
            console.log("  📥 API returned:", apiBooking.total_price);
            console.log("  💾 Saved in record:", newBookingRecord.totalPrice);
            console.log(
              "  🎯 Price consistency maintained:",
              newBookingRecord.totalPrice === totalPriceWithAddons
            );
            console.log(
              "  📊 Price source used:",
              useFrontendPrice ? "frontend_calculation" : "api_response"
            );

            if (priceDifference > 1) {
              console.log("  ⚠️ DISCREPANCY DETECTED - Investigation needed");
            } else {
              console.log("  ✅ Price validation passed");
            }
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
      if (DEV_CONFIG.ENABLE_CONSOLE_LOGS && shouldShowDevControls()) {
        console.error("❌ Booking creation failed:", error);
      }
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

    // Check if contact information is provided
    if (!contactName.trim()) return false;
    if (!contactEmail.trim()) return false;
    if (!contactPhone.trim()) return false;
    if (!contactAddress.trim()) return false;

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
          contactName={contactName}
          contactEmail={contactEmail}
          contactPhone={contactPhone}
          contactAddress={contactAddress}
          onContactNameChange={setContactName}
          onContactEmailChange={setContactEmail}
          onContactPhoneChange={setContactPhone}
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
            contact={{
              name: contactName,
              email: contactEmail,
              phone: contactPhone,
            }}
            contactAddress={contactAddress}
            addons={addonsWithPrice}
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
