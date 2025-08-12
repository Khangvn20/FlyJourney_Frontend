import React, { useEffect, useState } from "react";
import type { BookingSelection } from "./BookingSummary";
import type {
  PassengerFormData,
  BookingRecord,
} from "../../shared/types/passenger.types";
import {
  Plane,
  Clock,
  Calendar,
  Users,
  Hash,
  Mail,
  Phone,
  User,
  TicketCheck,
  Boxes,
  ShieldCheck,
} from "lucide-react";
import { formatDateTime } from "../../services/flightApiService";
import { Button } from "../ui/button";

interface BookingOverviewProps {
  selection: BookingSelection;
  passengers: PassengerFormData[];
  contact: { name: string; email: string; phone?: string };
  addons: { extraBaggageKg: number; services: string[]; extraPrice: number };
  totalPrice: number;
  currency: string;
  booking: BookingRecord | null;
  paymentMethod: string;
  onFinish?: () => void;
}

const localizedPayment = (m: string) =>
  m === "vnpay"
    ? "VNPay QR"
    : m === "card"
    ? "Thẻ ngân hàng"
    : "Tại văn phòng (giữ chỗ)";

const BookingOverview: React.FC<BookingOverviewProps> = ({
  selection,
  passengers,
  contact,
  addons,
  totalPrice,
  currency,
  booking,
  paymentMethod,
  onFinish,
}) => {
  const segs = [
    selection.outbound,
    ...(selection.tripType === "round-trip" && selection.inbound
      ? [selection.inbound]
      : []),
  ];

  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 60 * 1000);
    return () => clearInterval(id);
  }, []);

  const holdRemaining = (() => {
    if (booking?.holdExpiresAt) {
      const diff = new Date(booking.holdExpiresAt).getTime() - now;
      if (diff <= 0) return "Hết hạn";
      const h = Math.floor(diff / (1000 * 60 * 60));
      const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      return `${h}h ${m}m`;
    }
    return null;
  })();

  return (
    <div className="space-y-8 animate-[fadeIn_.4s_ease]">
      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl border bg-white/80 backdrop-blur-sm p-6 shadow-sm">
        <div className="absolute inset-0 opacity-70 bg-[radial-gradient(circle_at_15%_20%,rgba(59,130,246,0.18),transparent_60%)]" />
        <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-blue-200/30 blur-3xl" />
        <div className="absolute -bottom-12 -left-12 w-56 h-56 rounded-full bg-indigo-200/30 blur-3xl" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="space-y-2">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-700 to-indigo-700 text-transparent bg-clip-text flex items-center gap-2">
              <TicketCheck className="w-6 h-6 text-blue-600" /> Thông tin đơn
              hàng
            </h2>
            <div className="flex flex-wrap items-center gap-3 text-xs text-gray-600">
              <span className="inline-flex items-center gap-1 font-medium">
                <Hash className="w-3.5 h-3.5 text-gray-400" /> Mã:{" "}
                {booking?.bookingId}
              </span>
              <span className="inline-flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-gray-400" />{" "}
                {booking && new Date(booking.createdAt).toLocaleString("vi-VN")}
              </span>
              <span className="inline-flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-gray-400" />{" "}
                {localizedPayment(paymentMethod)}
              </span>
              {booking?.status === "PENDING" && holdRemaining && (
                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 text-white font-medium shadow">
                  Giữ chỗ: {holdRemaining}
                </span>
              )}
            </div>
          </div>
          <div className="text-right space-y-1">
            {booking?.status && (
              <div className="flex justify-end">
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-semibold tracking-wide ${
                    booking.status === "CONFIRMED"
                      ? "bg-green-100 text-green-700"
                      : booking.status === "PENDING"
                      ? "bg-amber-100 text-amber-700"
                      : "bg-red-100 text-red-700"
                  }`}>
                  {booking.status}
                </span>
              </div>
            )}
            <div className="text-xs uppercase tracking-wide text-gray-500">
              Tổng giá
            </div>
            <div className="text-3xl font-extrabold text-gray-900">
              {totalPrice.toLocaleString("vi-VN")} {currency}
            </div>
            {addons.extraPrice > 0 && (
              <div className="text-[11px] text-gray-500">
                Giá gốc:{" "}
                {(totalPrice - addons.extraPrice).toLocaleString("vi-VN")}{" "}
                {currency} • Phụ thu: +
                {addons.extraPrice.toLocaleString("vi-VN")} {currency}
              </div>
            )}
          </div>
        </div>
      </div>
      {/* Segments */}
      <div className="space-y-5">
        {segs.map((f, idx) => {
          const dep = formatDateTime(f.departure_time);
          const arr = formatDateTime(f.arrival_time);
          const durationH = (f.duration_minutes / 60).toFixed(1);
          return (
            <div
              key={f.flight_id}
              className="rounded-xl border bg-white shadow-sm p-4 flex flex-col gap-4 relative overflow-hidden">
              <div className="absolute inset-0 pointer-events-none bg-gradient-to-br from-white via-blue-50/30 to-indigo-50/30 opacity-0 hover:opacity-100 transition" />
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                  <Plane className="w-4 h-4 text-blue-600" />{" "}
                  {idx === 0 ? "Chuyến bay đi" : "Chuyến bay về"}
                </div>
                <div className="text-[11px] text-gray-500 flex items-center gap-2">
                  <span className="inline-flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-gray-400" /> {durationH}h
                  </span>
                  <span>|</span>
                  <span>Hạng: {f.flight_class}</span>
                </div>
              </div>
              <div className="grid md:grid-cols-3 gap-4 text-sm">
                <div className="space-y-1">
                  <div className="font-semibold text-gray-800">
                    {dep.time} • {f.departure_airport_code}
                  </div>
                  <div className="text-[11px] text-gray-500">{dep.date}</div>
                  <div className="text-[11px] text-gray-600">
                    {f.departure_airport}
                  </div>
                </div>
                <div className="flex items-center justify-center">
                  <div className="text-center text-[11px] text-gray-500">
                    <div className="font-medium text-gray-700">
                      {f.airline_name}
                    </div>
                    <div>Số hiệu: {f.flight_number}</div>
                    <div>
                      {f.stops_count === 0
                        ? "Bay thẳng"
                        : `${f.stops_count} điểm dừng`}
                    </div>
                  </div>
                </div>
                <div className="space-y-1 md:text-right">
                  <div className="font-semibold text-gray-800">
                    {arr.time} • {f.arrival_airport_code}
                  </div>
                  <div className="text-[11px] text-gray-500">{arr.date}</div>
                  <div className="text-[11px] text-gray-600">
                    {f.arrival_airport}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      {/* Passengers */}
      <div className="rounded-xl border bg-white shadow-sm p-5 space-y-4 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none bg-gradient-to-tr from-blue-50/50 to-transparent opacity-0 hover:opacity-100 transition" />
        <div className="flex items-center gap-2 text-sm font-semibold text-gray-800">
          <Users className="w-4 h-4 text-blue-600" /> Hành khách
        </div>
        <div className="space-y-2 text-sm">
          {passengers.map((p, i) => (
            <div
              key={p.id}
              className="flex flex-wrap items-center justify-between gap-2 text-[12px] border rounded-md px-3 py-2 bg-gray-50">
              <span className="font-medium flex items-center gap-2">
                <User className="w-3.5 h-3.5 text-gray-400" /> {i + 1}.{" "}
                {p.lastName?.toUpperCase()} {p.firstName}
              </span>
              <span className="text-gray-500">{p.type.toUpperCase()}</span>
            </div>
          ))}
        </div>
      </div>
      {/* Contact */}
      <div className="rounded-xl border bg-white shadow-sm p-5 space-y-3 text-sm">
        <div className="flex items-center gap-2 font-semibold text-gray-800">
          <Mail className="w-4 h-4 text-blue-600" /> Thông tin liên hệ
        </div>
        <div className="grid md:grid-cols-3 gap-3 text-[12px]">
          <div className="flex items-center gap-2">
            <User className="w-3.5 h-3.5 text-gray-400" /> {contact.name}
          </div>
          <div className="flex items-center gap-2">
            <Mail className="w-3.5 h-3.5 text-gray-400" /> {contact.email}
          </div>
          <div className="flex items-center gap-2">
            <Phone className="w-3.5 h-3.5 text-gray-400" />{" "}
            {contact.phone || "-"}
          </div>
        </div>
      </div>
      {/* Addons */}
      {(addons.extraPrice > 0 ||
        addons.extraBaggageKg > 0 ||
        addons.services.length > 0) && (
        <div className="rounded-xl border bg-white shadow-sm p-5 space-y-4 text-sm relative overflow-hidden">
          <div className="absolute inset-0 pointer-events-none bg-gradient-to-tr from-violet-50/50 to-transparent opacity-0 hover:opacity-100 transition" />
          <div className="flex items-center gap-2 font-semibold text-gray-800">
            <Boxes className="w-4 h-4 text-blue-600" /> Dịch vụ thêm
          </div>
          <ul className="list-disc pl-5 text-[12px] text-gray-600 space-y-1">
            {addons.extraBaggageKg > 0 && (
              <li>Hành lý mua thêm: +{addons.extraBaggageKg}kg</li>
            )}
            {addons.services.map((s) => (
              <li key={s}>{s}</li>
            ))}
            <li>
              Tổng phụ thu: +{addons.extraPrice.toLocaleString("vi-VN")}{" "}
              {currency}
            </li>
          </ul>
        </div>
      )}
      {/* Actions */}
      <div className="flex flex-wrap gap-3 justify-end pt-2">
        <Button variant="ghost" onClick={onFinish} className="shadow-sm">
          Trang chủ
        </Button>
        <Button
          onClick={onFinish}
          className="bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 hover:from-blue-700 hover:via-indigo-700 hover:to-violet-700 shadow-md shadow-blue-500/30">
          Hoàn tất
        </Button>
      </div>
      <style>{`@keyframes fadeIn {from {opacity:0;transform:translateY(8px);} to {opacity:1;transform:translateY(0);} }`}</style>
    </div>
  );
};

export default BookingOverview;
