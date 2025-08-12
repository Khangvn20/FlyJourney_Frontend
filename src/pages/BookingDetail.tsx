import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { loadBookings } from "../services/bookingStorage";
import type { BookingRecord } from "../shared/types/passenger.types";
import BookingOverview from "../components/booking/BookingOverview";
import { Button } from "../components/ui/button";
import { ArrowLeft } from "lucide-react";
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

  return (
    <div className="space-y-4">
      <Button
        variant="ghost"
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-2">
        <ArrowLeft className="w-4 h-4" /> Quay lại
      </Button>
      <BookingOverview
        selection={selection}
        passengers={record.passengers}
        contact={{
          name: record.contact.fullName,
          email: record.contact.email,
          phone: record.contact.phone,
        }}
        addons={{
          extraBaggageKg: record.addons?.extraBaggageKg || 0,
          services: record.addons?.services || [],
          extraPrice: record.addonExtraPrice || 0,
        }}
        totalPrice={record.totalPrice}
        currency={record.currency}
        booking={record}
        paymentMethod={record.paymentMethod}
        onFinish={() => navigate("/my-bookings")}
      />
    </div>
  );
};

export default BookingDetail;
