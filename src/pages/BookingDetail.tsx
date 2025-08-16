import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { loadBookings } from "../services/bookingStorage";
import type { BookingRecord } from "../shared/types/passenger.types";
import BookingOverview from "../components/booking/BookingOverview";
import PaymentFlow from "../components/booking/PaymentFlow";
import { Button } from "../components/ui/button";
import { ArrowLeft, CreditCard, FileText } from "lucide-react";
import type { FlightSearchApiResult } from "../shared/types/search-api.types";

// Placeholder flight builder due to lack of persisted flight details.
const buildPlaceholderFlight = (id: number): FlightSearchApiResult => ({
  flight_id: id,
  flight_number: `#${id}`,
  airline_name: "Unknown Airline",
  airline_id: 0,
  departure_airport: "--",
  departure_airport_code: "---",
  arrival_airport: "--",
  arrival_airport_code: "---",
  departure_time: new Date().toISOString(),
  arrival_time: new Date(Date.now() + 2 * 3600 * 1000).toISOString(),
  duration_minutes: 120,
  stops_count: 0,
  distance: 0,
  flight_class: "ECONOMY",
  total_seats: 0,
  fare_class_details: {
    fare_class_code: "ECON",
    cabin_class: "ECONOMY",
    refundable: false,
    changeable: false,
    baggage_kg: "7kg xách tay + 20kg ký gửi",
    description: "Placeholder flight data",
  },
  pricing: {
    base_prices: { adult: 0, child: 0, infant: 0 },
    total_prices: { adult: 0, child: 0, infant: 0 },
    taxes: { adult: 0 },
    grand_total: 0,
    currency: "VND",
  },
  tax_and_fees: 0,
});

const BookingDetail: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [record, setRecord] = useState<BookingRecord | null>(null);
  const [showPaymentFlow, setShowPaymentFlow] = useState(false);

  useEffect(() => {
    const list = loadBookings();
    const found = list.find((b) => b.bookingId === id) || null;
    setRecord(found);
  }, [id]);

  if (!record) {
    return (
      <div className="space-y-4">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2">
          <ArrowLeft className="w-4 h-4" /> Quay lại
        </Button>
        <div className="p-6 border rounded-xl bg-white shadow-sm text-sm">
          Không tìm thấy đặt chỗ.
        </div>
      </div>
    );
  }

  const selection = {
    tripType: record.tripType,
    outbound:
      record.selectedFlights?.outbound ||
      buildPlaceholderFlight(record.outboundFlightId),
    inbound:
      record.selectedFlights?.inbound ||
      (record.inboundFlightId
        ? buildPlaceholderFlight(record.inboundFlightId)
        : undefined),
    totalPrice: record.totalPrice,
    currency: record.currency,
  } as const;

  // Handle PaymentFlow flow
  if (showPaymentFlow && record) {
    return (
      <PaymentFlow
        booking={record}
        onCancel={() => setShowPaymentFlow(false)}
      />
    );
  }

  return (
    <div className="space-y-6">
      <Button
        variant="ghost"
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-2">
        <ArrowLeft className="w-4 h-4" /> Quay lại
      </Button>

      {/* Customer Note Card - Hiển thị ghi chú khách hàng nếu có */}
      {record.note && (
        <div className="bg-white rounded-lg border p-6 shadow-sm">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-orange-700">
            <FileText className="w-5 h-5" />
            Ghi chú của khách hàng
          </h3>
          <div className="bg-orange-50 rounded-lg p-4">
            <p className="text-gray-700 italic">"{record.note}"</p>
          </div>
        </div>
      )}

      {/* Booking Overview - Đã có thông tin liên hệ ở dưới */}
      <BookingOverview
        selection={selection}
        passengers={record.passengers}
        contact={{
          email: record.contact.email,
          phone: record.contact.phone,
          name: record.contact.fullName,
        }}
        addons={{
          extraBaggageKg: record.addons?.extraBaggageKg || 0,
          services: record.addons?.services || [],
          extraPrice: record.addonExtraPrice || 0,
        }}
        totalPrice={record.totalPrice}
        currency={record.currency}
        booking={record}
        onFinish={() => navigate("/my-bookings")}
        note={record.note} // Truyền note xuống BookingOverview
      />

      {/* Payment Action for PENDING bookings */}
      {record.status === "PENDING" && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-6">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0">
              <CreditCard className="w-8 h-8 text-amber-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-amber-800 mb-2">
                Hoàn tất đặt vé
              </h3>
              <p className="text-amber-700 mb-4">
                Vé của bạn đang được giữ chỗ. Vui lòng chọn ghế và thanh toán để
                hoàn tất đặt vé.
              </p>
              <div className="flex gap-3">
                <Button
                  onClick={() => setShowPaymentFlow(true)}
                  className="bg-amber-600 hover:bg-amber-700 text-white">
                  Chọn ghế và thanh toán
                </Button>
                <Button
                  variant="outline"
                  onClick={() => navigate("/my-bookings")}>
                  Quay lại danh sách
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingDetail;
