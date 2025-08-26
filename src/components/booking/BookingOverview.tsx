import React, { useEffect, useState, useMemo } from "react";
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
import { formatDateTime } from "../../shared/utils/format";
import { Button } from "../ui/button";
import { SERVICE_OPTIONS } from "./bookingAddons.constants";

interface BookingOverviewProps {
  selection: BookingSelection;
  passengers: PassengerFormData[];
  contact: { email: string; phone?: string; name?: string };
  addons: { extraBaggageKg: number; services: string[]; extraPrice: number };
  currency: string;
  booking: BookingRecord | null;
  onFinish?: () => void;
  onPay?: () => void; // trigger to open payment methods or confirm booking
  onBack?: () => void; // go back to previous step
  contactAddress?: string;
  note?: string;
  isBooking?: boolean; // loading state during booking creation
}

const BookingOverview: React.FC<BookingOverviewProps> = ({
  selection,
  passengers,
  contact,
  addons,
  currency,
  booking,
  onFinish,
  onPay,
  onBack,
  contactAddress,
  note,
  isBooking = false,
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

  const {
    baseFare,
    surcharges,
    baggageTotal,
    baggageKg,
    servicesTotal,
  } = useMemo(() => {
    const flights = [
      selection.outbound,
      ...(selection.tripType === "round-trip" && selection.inbound
        ? [selection.inbound]
        : []),
    ];
    const counts = passengers.reduce(
      (acc, p) => {
        if (p.type === "adult") acc.adults++;
        else if (p.type === "child") acc.children++;
        else if (p.type === "infant") acc.infants++;
        return acc;
      },
      { adults: 0, children: 0, infants: 0 }
    );
    const baseFare = flights.reduce((sum, flight) => {
      const bp = flight.pricing?.base_prices || {};
      return (
        sum +
        (bp.adult || 0) * counts.adults +
        (bp.child || 0) * counts.children +
        (bp.infant || 0) * counts.infants
      );
    }, 0);
    const surcharges = selection.totalPrice - baseFare;
    const baggageTotal = passengers.reduce(
      (sum, p) => sum + (p.extraBaggage?.price || 0),
      0
    );
    const baggageKg = passengers.reduce(
      (sum, p) => sum + (p.extraBaggage?.extraKg || 0),
      0
    );
    const servicesTotal = addons.services.reduce((sum, id) => {
      const svc = SERVICE_OPTIONS.find((s) => s.id === id);
      return sum + (svc?.price || 0) * passengers.length;
    }, 0);
    return {
      baseFare,
      surcharges,
      baggageTotal,
      baggageKg,
      servicesTotal,
    };
  }, [selection, passengers, addons.services]);

  const finalTotal = selection.totalPrice + baggageTotal + servicesTotal;

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
              <TicketCheck className="w-6 h-6 text-blue-600" /> Thông tin vé máy
              bay
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
              {finalTotal.toLocaleString("vi-VN")} {currency}
            </div>
          </div>
        </div>
      </div>
      {/* Price Breakdown */}
      <div className="rounded-2xl border bg-white p-6 shadow-sm">
        <h3 className="text-base font-semibold mb-3 flex items-center gap-2">
          <Boxes className="w-4 h-4 text-blue-600" /> Chi tiết giá
        </h3>
        <div className="space-y-1 text-sm">
          <div className="flex justify-between">
            <span>Giá gốc</span>
            <span>
              {baseFare.toLocaleString("vi-VN")} {currency}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Phụ phí</span>
            <span>
              {surcharges.toLocaleString("vi-VN")} {currency}
            </span>
          </div>
          {baggageTotal > 0 && (
            <div className="flex justify-between">
              <span>Hành lý</span>
              <span>
                {baggageTotal.toLocaleString("vi-VN")} {currency}
              </span>
            </div>
          )}
          {servicesTotal > 0 && (
            <div className="flex justify-between">
              <span>Dịch vụ</span>
              <span>
                {servicesTotal.toLocaleString("vi-VN")} {currency}
              </span>
            </div>
          )}
          <div className="border-t pt-2 mt-2 flex justify-between font-semibold">
            <span>Tổng cuối</span>
            <span>
              {finalTotal.toLocaleString("vi-VN")} {currency}
            </span>
          </div>
        </div>
      </div>
      {/* Segments - improved timeline style */}
      <div className="space-y-6">
        {segs.map((f, idx) => {
          const dep = formatDateTime(f.departure_time);
          const arr = formatDateTime(f.arrival_time);
          const durationH = (f.duration_minutes / 60).toFixed(1);
          return (
            <div
              key={f.flight_id}
              className="relative rounded-2xl border bg-white p-5 shadow-sm overflow-hidden">
              <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_90%_15%,rgba(59,130,246,0.10),transparent_60%)]" />
              <div className="relative z-10 flex items-start gap-4">
                <div className="flex flex-col items-center" aria-hidden>
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow text-white font-semibold text-[11px]">
                    {idx === 0 ? "OUT" : "IN"}
                  </div>
                  <div className="flex-1 w-px bg-gradient-to-b from-blue-200 to-indigo-300 my-2" />
                </div>
                <div className="flex-1 space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2 text-sm font-semibold text-gray-800">
                      <Plane className="w-4 h-4 text-blue-600" />
                      {idx === 0 ? "Chuyến bay đi" : "Chuyến bay về"}
                      <span className="px-2 py-0.5 rounded-full bg-blue-50 text-[10px] font-medium text-blue-600 border border-blue-200">
                        {f.flight_class}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-[11px] text-gray-500">
                      <span className="inline-flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-gray-400" />{" "}
                        {durationH}h
                      </span>
                      <span className="hidden sm:inline text-gray-300">|</span>
                      <span className="inline-flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-emerald-500" />
                        {f.stops_count === 0
                          ? "Bay thẳng"
                          : `${f.stops_count} điểm dừng`}
                      </span>
                      <span className="hidden sm:inline text-gray-300">|</span>
                      <span className="inline-flex items-center gap-1">
                        {f.airline_name}
                      </span>
                    </div>
                  </div>
                  <div className="grid md:grid-cols-3 gap-6 items-start text-sm">
                    <div className="space-y-1">
                      <div className="font-semibold text-gray-900 flex items-center gap-2">
                        <span className="text-lg tracking-tight">
                          {dep.time}
                        </span>
                        <span className="text-xs px-1.5 py-0.5 rounded bg-gray-100 text-gray-600 font-medium">
                          {f.departure_airport_code}
                        </span>
                      </div>
                      <div className="text-[11px] text-gray-500">
                        {dep.date}
                      </div>
                      <div className="text-[11px] text-gray-600 line-clamp-2">
                        {f.departure_airport}
                      </div>
                    </div>
                    <div className="hidden md:flex items-center justify-center relative">
                      <div className="w-full max-w-[160px] flex flex-col items-center gap-1">
                        <div className="h-1 w-full bg-gradient-to-r from-blue-500 via-indigo-500 to-violet-500 rounded-full relative overflow-hidden">
                          <div className="absolute inset-0 bg-white/20 animate-pulse" />
                        </div>
                        <div className="text-[10px] text-gray-500 font-medium tracking-wide">
                          {durationH}h hành trình
                        </div>
                        <div className="text-[10px] text-gray-400">
                          Chuyến {f.flight_number}
                        </div>
                      </div>
                    </div>
                    <div className="space-y-1 md:text-right">
                      <div className="font-semibold text-gray-900 flex md:justify-end items-center gap-2">
                        <span className="text-lg tracking-tight">
                          {arr.time}
                        </span>
                        <span className="text-xs px-1.5 py-0.5 rounded bg-gray-100 text-gray-600 font-medium">
                          {f.arrival_airport_code}
                        </span>
                      </div>
                      <div className="text-[11px] text-gray-500">
                        {arr.date}
                      </div>
                      <div className="text-[11px] text-gray-600 line-clamp-2">
                        {f.arrival_airport}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      {/* Passengers enhanced */}
      <div className="rounded-2xl border bg-white p-6 space-y-4 shadow-sm">
        <div className="flex items-center gap-2 text-sm font-semibold text-gray-800">
          <Users className="w-4 h-4 text-blue-600" /> Hành khách
          <span className="text-[10px] font-medium text-gray-400">
            {passengers.length} tổng
          </span>
        </div>
        <div className="grid md:grid-cols-2 gap-3">
          {passengers.map((p, i) => (
            <div
              key={p.id}
              className="relative rounded-xl border bg-gradient-to-br from-gray-50 to-white px-4 py-3 flex flex-col gap-1 text-[12px] overflow-hidden group">
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition pointer-events-none bg-[radial-gradient(circle_at_85%_20%,rgba(59,130,246,0.12),transparent_55%)]" />
              <div className="flex items-center justify-between gap-2 z-10 relative">
                <span className="font-semibold text-gray-800 flex items-center gap-2">
                  <User className="w-3.5 h-3.5 text-blue-500" /> {i + 1}.{" "}
                  {p.lastName?.toUpperCase()} {p.firstName}
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-blue-50 text-blue-600 border border-blue-100">
                  {p.type.toUpperCase()}
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-gray-500 z-10 relative">
                {p.gender && (
                  <span>
                    Giới tính:{" "}
                    {p.gender === "male"
                      ? "Nam"
                      : p.gender === "female"
                      ? "Nữ"
                      : "Khác"}
                  </span>
                )}
                {p.dateOfBirth && <span>SN: {p.dateOfBirth}</span>}
                {p.nationality && <span>QT: {p.nationality}</span>}
                {p.documentType && (
                  <span>
                    {p.documentType === "passport" ? "Hộ chiếu" : "CCCD"}
                  </span>
                )}
                {p.passportNumber && <span>Mã: {p.passportNumber}</span>}
              </div>
            </div>
          ))}
        </div>
      </div>
      {/* Contact improved */}
      <div className="rounded-2xl border bg-white p-6 space-y-4 shadow-sm">
        <div className="flex items-center gap-2 font-semibold text-gray-800 text-sm">
          <Mail className="w-4 h-4 text-blue-600" /> Thông tin liên hệ
        </div>
        <div className="grid lg:grid-cols-3 gap-4 text-[12px]">
          {contact.name && (
            <div className="flex items-center gap-2 bg-blue-50 rounded-lg px-3 py-2">
              <User className="w-3.5 h-3.5 text-blue-600" />
              <span className="font-medium text-blue-700">{contact.name}</span>
            </div>
          )}
          <div className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2">
            <Mail className="w-3.5 h-3.5 text-gray-400" />
            <span className="font-medium text-gray-700 break-all">
              {contact.email}
            </span>
          </div>
          <div className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2">
            <Phone className="w-3.5 h-3.5 text-gray-400" />
            <span>{contact.phone || "-"}</span>
          </div>
        </div>
        {(contactAddress || note) && (
          <div className="space-y-3 text-[12px]">
            {contactAddress && (
              <div className="rounded-lg bg-gray-50 px-3 py-2">
                <span className="font-medium text-gray-700">📍 Địa chỉ:</span>{" "}
                <span className="text-gray-600">{contactAddress}</span>
              </div>
            )}
            {note && (
              <div className="rounded-lg bg-orange-50 px-3 py-2 border border-orange-100">
                <span className="font-medium text-orange-700">
                  📝 Ghi chú khách hàng:
                </span>{" "}
                <span className="text-gray-700 italic">"{note}"</span>
              </div>
            )}
          </div>
        )}
      </div>
      {/* Fare included services & Addons combined */}
      {(selection.outbound?.fare_class_details ||
        baggageTotal > 0 ||
        addons.services.length > 0) && (
        <div className="grid md:grid-cols-2 gap-6">
          {selection.outbound?.fare_class_details && (
            <div className="rounded-2xl border bg-white p-6 shadow-sm flex flex-col h-full">
              <div className="flex items-center gap-2 font-semibold text-gray-800 text-sm mb-4">
                <ShieldCheck className="w-4 h-4 text-blue-600" />
                <span>Dịch vụ đi kèm hạng vé</span>
                <span className="text-[10px] font-medium text-gray-400">
                  OUTBOUND
                </span>
              </div>
              <div className="grid grid-cols-2 gap-4 text-[12px] flex-1">
                <div className="rounded-lg border bg-gray-50 p-3 flex flex-col gap-1">
                  <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide">
                    Hành lý
                  </span>
                  <span className="font-medium text-gray-800">
                    {selection.outbound.fare_class_details.baggage_kg}
                  </span>
                </div>
                <div className="rounded-lg border bg-gray-50 p-3 flex flex-col gap-1">
                  <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide">
                    Hoàn vé
                  </span>
                  <span className="font-medium text-gray-800">
                    {selection.outbound.fare_class_details.refundable
                      ? "Có"
                      : "Không"}
                  </span>
                </div>
                <div className="rounded-lg border bg-gray-50 p-3 flex flex-col gap-1">
                  <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide">
                    Đổi vé
                  </span>
                  <span className="font-medium text-gray-800">
                    {selection.outbound.fare_class_details.changeable
                      ? "Có"
                      : "Không"}
                  </span>
                </div>
                {selection.outbound.fare_class_details.description && (
                  <div className="rounded-lg border bg-gray-50 p-3 flex flex-col gap-1 col-span-2">
                    <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide">
                      Mô tả
                    </span>
                    <span className="text-gray-700 leading-snug">
                      {selection.outbound.fare_class_details.description}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}
          {(baggageTotal > 0 || addons.services.length > 0) && (
            <div className="rounded-2xl border bg-white p-6 shadow-sm flex flex-col h-full">
              <div className="flex items-center gap-2 font-semibold text-gray-800 text-sm mb-4">
                <Boxes className="w-4 h-4 text-blue-600" />
                <span>Dịch vụ mua thêm</span>
              </div>
              <div className="flex flex-wrap gap-2 text-[11px] mb-4">
                {baggageKg > 0 && (
                  <span className="px-3 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200 font-medium">
                    +{baggageKg}kg hành lý
                  </span>
                )}
                {addons.services.map((serviceId) => {
                  const service = SERVICE_OPTIONS.find(
                    (o) => o.id === serviceId
                  );
                  const label = service?.label || serviceId;
                  const price = service?.price || 0;
                  return (
                    <span
                      key={serviceId}
                      className="px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 font-medium flex items-center gap-1">
                      {label}
                      <span className="text-[10px] opacity-75">
                        ({(price * passengers.length).toLocaleString("vi-VN")}{" "}
                        ₫)
                      </span>
                    </span>
                  );
                })}
              </div>
              <div className="mt-auto text-[12px] font-medium text-gray-700 flex items-center gap-2">
                <span className="text-gray-500">Tổng phụ thu:</span>
                <span className="text-base font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 text-transparent bg-clip-text">
                  +{(baggageTotal + servicesTotal).toLocaleString("vi-VN")} {currency}
                </span>
              </div>
            </div>
          )}
        </div>
      )}
      {/* Actions */}
      <div className="flex flex-wrap gap-3 justify-between pt-2">
        {/* Left side - Back button */}
        <div>
          {onBack && (
            <Button variant="outline" onClick={onBack} className="shadow-sm">
              ← Quay lại bước trước
            </Button>
          )}
        </div>

        {/* Right side - Main actions */}
        <div className="flex gap-3">
          {booking?.status !== "CONFIRMED" && onPay && (
            <>
              <Button
                variant="ghost"
                onClick={onFinish}
                className="shadow-sm"
                disabled={isBooking}>
                Trang chủ
              </Button>
              <Button
                onClick={onPay}
                disabled={isBooking}
                className="bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 hover:from-blue-700 hover:via-indigo-700 hover:to-violet-700 shadow-md shadow-blue-500/30 disabled:opacity-50 disabled:cursor-not-allowed">
                {isBooking ? (
                  <span className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Đang xử lý...
                  </span>
                ) : booking ? (
                  "Thanh toán"
                ) : (
                  "Xác nhận đặt chỗ"
                )}
              </Button>
            </>
          )}
          {booking?.status === "CONFIRMED" && (
            <>
              <Button variant="ghost" onClick={onFinish} className="shadow-sm">
                Trang chủ
              </Button>
              <Button
                onClick={onFinish}
                className="bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 shadow-md shadow-emerald-500/30">
                Về đơn của tôi
              </Button>
            </>
          )}
        </div>
      </div>
      <style>{`@keyframes fadeIn {from {opacity:0;transform:translateY(8px);} to {opacity:1;transform:translateY(0);} }`}</style>
    </div>
  );
};

export default BookingOverview;
