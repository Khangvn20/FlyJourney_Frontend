"use client";

import type React from "react";
import { useEffect, useState, useMemo } from "react";
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
import { getServiceMapping } from "../../shared/constants/serviceMapping";
import { PriceDebugger } from "../../shared/utils/priceDebugger";
import {
  formatAirportFromApiData,
  formatAirportNameOnly,
} from "../../shared/constants/airportMapping";
import { getAirportTimeBadge } from "../../shared/utils/airportUtils";
import {
  DEV_CONFIG,
  shouldShowDevControls,
} from "../../shared/config/devConfig";

interface BookingOverviewProps {
  selection: BookingSelection;
  passengers: PassengerFormData[];
  contact: { email: string; phone?: string; name?: string };
  addons: { extraBaggageKg: number; services: string[]; extraPrice: number };
  currency: string;
  booking: BookingRecord | null;
  onFinish?: () => void;
  onPay?: () => void;
  onBack?: () => void;
  contactAddress?: string;
  note?: string;
  isBooking?: boolean;
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

  const { baggageTotal, baggageKg, servicesTotal } = useMemo(() => {
    let baggageTotal = passengers.reduce(
      (sum, p) => sum + (p.extraBaggage?.price || 0),
      0
    );
    let baggageKg = passengers.reduce(
      (sum, p) => sum + (p.extraBaggage?.extraKg || 0),
      0
    );
    let servicesTotal = addons.services.reduce((sum, id) => {
      const svc = SERVICE_OPTIONS.find((s) => s.id === id);
      return sum + (svc?.price || 0) * passengers.length;
    }, 0);

    if (booking?.backendAncillaries && booking.backendAncillaries.length > 0) {
      const apiBaggage = booking.backendAncillaries.filter(
        (a) => a.type === "baggage"
      );
      const apiServices = booking.backendAncillaries.filter(
        (a) => a.type !== "baggage"
      );
      const apiBaggageTotal = apiBaggage.reduce(
        (s, a) => s + (a.price || 0),
        0
      );
      const apiBaggageKg = apiBaggage.reduce(
        (s, a) => s + (a.quantity || 0),
        0
      );
      const apiServicesTotal = apiServices.reduce(
        (s, a) => s + (a.price || 0),
        0
      );
      baggageTotal = apiBaggageTotal || baggageTotal;
      baggageKg = apiBaggageKg || baggageKg;
      servicesTotal = apiServicesTotal || servicesTotal;
    }

    return { baggageTotal, baggageKg, servicesTotal };
  }, [selection, passengers, addons.services, booking?.backendAncillaries]);

  const finalTotal = selection.totalPrice;
  const derivedTicketFare = Math.max(
    finalTotal - baggageTotal - servicesTotal,
    0
  );

  return (
    <div className="space-y-8 animate-[fadeIn_.5s_ease-out]">
      <div className="relative overflow-hidden rounded-3xl border-2 border-blue-100/60 bg-gradient-to-br from-white via-blue-50/30 to-indigo-50/40 backdrop-blur-sm p-8 shadow-xl shadow-blue-100/50">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,rgba(59,130,246,0.15),transparent_50%),radial-gradient(circle_at_80%_70%,rgba(99,102,241,0.12),transparent_50%)]" />
        <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full bg-gradient-to-br from-blue-200/40 to-indigo-200/30 blur-3xl" />
        <div className="absolute -bottom-16 -left-16 w-72 h-72 rounded-full bg-gradient-to-tr from-indigo-200/40 to-violet-200/30 blur-3xl" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="space-y-3">
            <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-700 via-indigo-600 to-violet-700 text-transparent bg-clip-text flex items-center gap-3">
              <div className="p-2 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 shadow-lg shadow-blue-500/30">
                <TicketCheck className="w-7 h-7 text-white" />
              </div>
              Thông tin vé máy bay
            </h2>
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
              <span className="inline-flex items-center gap-2 font-semibold px-3 py-1.5 rounded-lg bg-white/80 shadow-sm border border-gray-200/60">
                <Hash className="w-4 h-4 text-blue-500" />
                <span className="text-gray-500">Mã:</span> {booking?.bookingId}
              </span>
              <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/80 shadow-sm border border-gray-200/60">
                <Calendar className="w-4 h-4 text-indigo-500" />
                {booking && new Date(booking.createdAt).toLocaleString("vi-VN")}
              </span>
              {booking?.status === "PENDING" && holdRemaining && (
                <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold shadow-lg shadow-amber-500/40 animate-pulse">
                  <Clock className="w-4 h-4" />
                  Giữ chỗ: {holdRemaining}
                </span>
              )}
            </div>
          </div>
          <div className="text-right space-y-2">
            {booking?.status && (
              <div className="flex justify-end">
                <span
                  className={`px-4 py-1.5 rounded-full text-xs font-bold tracking-wider shadow-md ${
                    booking.status === "CONFIRMED"
                      ? "bg-gradient-to-r from-emerald-500 to-green-500 text-white shadow-emerald-500/40"
                      : booking.status === "PENDING"
                      ? "bg-gradient-to-r from-amber-400 to-orange-400 text-white shadow-amber-500/40"
                      : "bg-gradient-to-r from-red-500 to-rose-500 text-white shadow-red-500/40"
                  }`}>
                  {booking.status}
                </span>
              </div>
            )}
            <div className="text-xs uppercase tracking-widest text-gray-500 font-semibold">
              Tổng giá
            </div>
            <div className="text-4xl font-black bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 text-transparent bg-clip-text">
              {finalTotal.toLocaleString("vi-VN")} {currency}
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border-2 border-gray-100 bg-gradient-to-br from-white to-gray-50/50 p-7 shadow-lg">
        <h3 className="text-lg font-bold mb-5 flex items-center gap-3 text-gray-800">
          <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-500 shadow-md shadow-blue-500/30">
            <Boxes className="w-5 h-5 text-white" />
          </div>
          Chi tiết giá
        </h3>
        <div className="space-y-3 text-sm">
          <div className="flex justify-between items-center py-2 px-4 rounded-lg bg-white border border-gray-100 shadow-sm">
            <span className="font-medium text-gray-700">Giá vé</span>
            <span className="font-semibold text-gray-900">
              {derivedTicketFare.toLocaleString("vi-VN")} {currency}
            </span>
          </div>
          {baggageTotal > 0 && (
            <div className="flex justify-between items-center py-2 px-4 rounded-lg bg-amber-50/50 border border-amber-100 shadow-sm">
              <span className="font-medium text-amber-800">Hành lý</span>
              <span className="font-semibold text-amber-900">
                {baggageTotal.toLocaleString("vi-VN")} {currency}
              </span>
            </div>
          )}
          {servicesTotal > 0 && (
            <div className="flex justify-between items-center py-2 px-4 rounded-lg bg-indigo-50/50 border border-indigo-100 shadow-sm">
              <span className="font-medium text-indigo-800">Dịch vụ</span>
              <span className="font-semibold text-indigo-900">
                {servicesTotal.toLocaleString("vi-VN")} {currency}
              </span>
            </div>
          )}
          <div className="border-t-2 pt-4 mt-4 flex justify-between items-center py-3 px-4 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 shadow-md">
            <span className="font-bold text-gray-900 text-base">Tổng cuối</span>
            <span className="font-black text-xl bg-gradient-to-r from-blue-700 to-indigo-700 text-transparent bg-clip-text">
              {finalTotal.toLocaleString("vi-VN")} {currency}
            </span>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {segs.map((f, idx) => {
          const dep = formatDateTime(f.departure_time);
          const arr = formatDateTime(f.arrival_time);
          const durationH = (f.duration_minutes / 60).toFixed(1);
          const depBadge = getAirportTimeBadge(
            f.departure_airport,
            f.departure_airport_code
          );
          const arrBadge = getAirportTimeBadge(
            f.arrival_airport,
            f.arrival_airport_code
          );
          return (
            <div
              key={f.flight_id}
              className="relative rounded-3xl border-2 border-gray-100 bg-gradient-to-br from-white via-gray-50/30 to-blue-50/20 p-6 shadow-xl hover:shadow-2xl transition-shadow duration-300 overflow-hidden group">
              <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_85%_20%,rgba(59,130,246,0.12),transparent_55%)] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="absolute -top-20 -right-20 w-48 h-48 rounded-full bg-gradient-to-br from-blue-200/30 to-indigo-200/20 blur-3xl group-hover:scale-150 transition-transform duration-700" />
              <div className="relative z-10 flex items-start gap-5">
                <div className="flex flex-col items-center" aria-hidden>
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 via-indigo-600 to-violet-600 flex items-center justify-center shadow-lg shadow-blue-500/40 text-white font-bold text-sm group-hover:scale-110 transition-transform duration-300">
                    {idx === 0 ? "OUT" : "IN"}
                  </div>
                  <div className="flex-1 w-0.5 bg-gradient-to-b from-blue-300 via-indigo-300 to-violet-300 my-3 rounded-full" />
                </div>
                <div className="flex-1 space-y-5">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-3 text-base font-bold text-gray-900">
                      <div className="p-1.5 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-500 shadow-md">
                        <Plane className="w-5 h-5 text-white" />
                      </div>
                      {idx === 0 ? "Chuyến bay đi" : "Chuyến bay về"}
                      <span className="px-3 py-1 rounded-full bg-gradient-to-r from-blue-100 to-indigo-100 text-xs font-bold text-blue-700 border-2 border-blue-200 shadow-sm">
                        {f.flight_class}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-gray-600 font-medium">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white shadow-sm border border-gray-200">
                        <Clock className="w-4 h-4 text-indigo-500" />
                        {durationH}h
                      </span>
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white shadow-sm border border-gray-200">
                        <span className="w-2.5 h-2.5 rounded-full bg-gradient-to-r from-emerald-500 to-green-500 shadow-sm" />
                        {f.stops_count === 0
                          ? "Bay thẳng"
                          : `${f.stops_count} điểm dừng`}
                      </span>
                      <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white shadow-sm border border-gray-200">
                        {f.airline_name}
                      </span>
                    </div>
                  </div>
                  <div className="grid md:grid-cols-3 gap-8 items-start text-sm">
                    <div className="space-y-2">
                      <div className="font-bold text-gray-900 flex items-center gap-2.5">
                        <span className="text-2xl tracking-tight">
                          {dep.time}
                        </span>
                        <span className="text-xs px-2.5 py-1 rounded-lg bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-700 font-bold border border-blue-200 shadow-sm">
                          {depBadge}
                        </span>
                      </div>
                      <div className="text-xs text-gray-500 font-medium">
                        {dep.date}
                      </div>
                      <div className="text-xs text-gray-700 font-medium line-clamp-2">
                        {depBadge
                          ? formatAirportNameOnly(f.departure_airport) !== "---"
                            ? formatAirportNameOnly(f.departure_airport)
                            : formatAirportFromApiData(
                                f.departure_airport,
                                f.departure_airport_code
                              )
                          : formatAirportFromApiData(
                              f.departure_airport,
                              f.departure_airport_code
                            )}
                      </div>
                    </div>
                    <div className="hidden md:flex items-center justify-center relative">
                      <div className="w-full max-w-[180px] flex flex-col items-center gap-2">
                        <div className="h-1.5 w-full bg-gradient-to-r from-blue-500 via-indigo-500 to-violet-500 rounded-full relative overflow-hidden shadow-md">
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-[shimmer_2s_infinite]" />
                        </div>
                        <div className="text-xs text-gray-600 font-bold tracking-wide">
                          {durationH}h hành trình
                        </div>
                        <div className="text-xs text-gray-500 font-medium px-2.5 py-0.5 rounded-full bg-gray-100 border border-gray-200">
                          Chuyến {f.flight_number}
                        </div>
                      </div>
                    </div>
                    <div className="space-y-2 md:text-right">
                      <div className="font-bold text-gray-900 flex md:justify-end items-center gap-2.5">
                        <span className="text-2xl tracking-tight">
                          {arr.time}
                        </span>
                        <span className="text-xs px-2.5 py-1 rounded-lg bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-700 font-bold border border-blue-200 shadow-sm">
                          {arrBadge}
                        </span>
                      </div>
                      <div className="text-xs text-gray-500 font-medium">
                        {arr.date}
                      </div>
                      <div className="text-xs text-gray-700 font-medium line-clamp-2">
                        {arrBadge
                          ? formatAirportNameOnly(f.arrival_airport) !== "---"
                            ? formatAirportNameOnly(f.arrival_airport)
                            : formatAirportFromApiData(
                                f.arrival_airport,
                                f.arrival_airport_code
                              )
                          : formatAirportFromApiData(
                              f.arrival_airport,
                              f.arrival_airport_code
                            )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="rounded-2xl border-2 border-gray-100 bg-gradient-to-br from-white to-gray-50/50 p-7 space-y-5 shadow-lg">
        <div className="flex items-center gap-3 text-base font-bold text-gray-900">
          <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-500 shadow-md shadow-blue-500/30">
            <Users className="w-5 h-5 text-white" />
          </div>
          Hành khách
          <span className="text-xs font-bold text-gray-500 px-3 py-1 rounded-full bg-gray-100 border border-gray-200">
            {passengers.length} tổng
          </span>
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          {passengers.map((p, i) => (
            <div
              key={p.id}
              className="relative rounded-xl border-2 border-gray-100 bg-gradient-to-br from-white via-blue-50/20 to-indigo-50/20 px-5 py-4 flex flex-col gap-2 text-sm overflow-hidden group hover:shadow-lg hover:border-blue-200 transition-all duration-300">
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none bg-[radial-gradient(circle_at_80%_20%,rgba(59,130,246,0.15),transparent_50%)]" />
              <div className="flex items-center justify-between gap-3 z-10 relative">
                <span className="font-bold text-gray-900 flex items-center gap-2.5">
                  <div className="p-1.5 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-500 shadow-sm">
                    <User className="w-4 h-4 text-white" />
                  </div>
                  {i + 1}. {p.lastName?.toUpperCase()} {p.firstName}
                </span>
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-700 border-2 border-blue-200 shadow-sm">
                  {p.type.toUpperCase()}
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-gray-600 z-10 relative font-medium">
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

      <div className="rounded-2xl border-2 border-gray-100 bg-gradient-to-br from-white to-gray-50/50 p-7 space-y-5 shadow-lg">
        <div className="flex items-center gap-3 font-bold text-gray-900 text-base">
          <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-500 shadow-md shadow-blue-500/30">
            <Mail className="w-5 h-5 text-white" />
          </div>
          Thông tin liên hệ
        </div>
        <div className="grid lg:grid-cols-3 gap-4 text-sm">
          {contact.name && (
            <div className="flex items-center gap-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl px-4 py-3 border-2 border-blue-100 shadow-sm">
              <div className="p-1.5 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-500 shadow-sm">
                <User className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-blue-800">{contact.name}</span>
            </div>
          )}
          <div className="flex items-center gap-3 bg-white rounded-xl px-4 py-3 border-2 border-gray-100 shadow-sm">
            <div className="p-1.5 rounded-lg bg-gray-100">
              <Mail className="w-4 h-4 text-gray-600" />
            </div>
            <span className="font-semibold text-gray-800 break-all">
              {contact.email}
            </span>
          </div>
          <div className="flex items-center gap-3 bg-white rounded-xl px-4 py-3 border-2 border-gray-100 shadow-sm">
            <div className="p-1.5 rounded-lg bg-gray-100">
              <Phone className="w-4 h-4 text-gray-600" />
            </div>
            <span className="font-semibold text-gray-800">
              {contact.phone || "-"}
            </span>
          </div>
        </div>
        {(contactAddress || note) && (
          <div className="space-y-3 text-sm">
            {contactAddress && (
              <div className="rounded-xl bg-gradient-to-r from-gray-50 to-blue-50/30 px-4 py-3 border-2 border-gray-100 shadow-sm">
                <span className="font-bold text-gray-800">📍 Địa chỉ:</span>{" "}
                <span className="text-gray-700">{contactAddress}</span>
              </div>
            )}
            {note && (
              <div className="rounded-xl bg-gradient-to-r from-orange-50 to-amber-50 px-4 py-3 border-2 border-orange-200 shadow-sm">
                <span className="font-bold text-orange-800">
                  📝 Ghi chú khách hàng:
                </span>{" "}
                <span className="text-gray-800 italic font-medium">
                  "{note}"
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      {(selection.outbound?.fare_class_details ||
        baggageTotal > 0 ||
        addons.services.length > 0) && (
        <div className="grid md:grid-cols-2 gap-6">
          {selection.outbound?.fare_class_details && (
            <div className="rounded-2xl border-2 border-gray-100 bg-gradient-to-br from-white to-gray-50/50 p-7 shadow-lg flex flex-col h-full">
              <div className="flex items-center gap-3 font-bold text-gray-900 text-base mb-5">
                <div className="p-2 rounded-lg bg-gradient-to-br from-emerald-500 to-green-500 shadow-md shadow-emerald-500/30">
                  <ShieldCheck className="w-5 h-5 text-white" />
                </div>
                <span>Dịch vụ đi kèm hạng vé</span>
                <span className="text-xs font-bold text-gray-500 px-2.5 py-1 rounded-full bg-gray-100 border border-gray-200">
                  OUTBOUND
                </span>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm flex-1">
                <div className="rounded-xl border-2 border-gray-100 bg-gradient-to-br from-white to-blue-50/30 p-4 flex flex-col gap-2 shadow-sm">
                  <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Hành lý
                  </span>
                  <span className="font-bold text-gray-900 text-base">
                    {selection.outbound.fare_class_details.baggage_kg}
                  </span>
                </div>
                <div className="rounded-xl border-2 border-gray-100 bg-gradient-to-br from-white to-blue-50/30 p-4 flex flex-col gap-2 shadow-sm">
                  <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Hoàn vé
                  </span>
                  <span className="font-bold text-gray-900 text-base">
                    {selection.outbound.fare_class_details.refundable
                      ? "Có"
                      : "Không"}
                  </span>
                </div>
                <div className="rounded-xl border-2 border-gray-100 bg-gradient-to-br from-white to-blue-50/30 p-4 flex flex-col gap-2 shadow-sm">
                  <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Đổi vé
                  </span>
                  <span className="font-bold text-gray-900 text-base">
                    {selection.outbound.fare_class_details.changeable
                      ? "Có"
                      : "Không"}
                  </span>
                </div>
                {selection.outbound.fare_class_details.description && (
                  <div className="rounded-xl border-2 border-gray-100 bg-gradient-to-br from-white to-blue-50/30 p-4 flex flex-col gap-2 col-span-2 shadow-sm">
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                      Mô tả
                    </span>
                    <span className="text-gray-800 leading-relaxed font-medium">
                      {selection.outbound.fare_class_details.description}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}
          {(baggageTotal > 0 ||
            addons.services.length > 0 ||
            (booking?.backendAncillaries?.length || 0) > 0) && (
            <div className="rounded-2xl border-2 border-gray-100 bg-gradient-to-br from-white to-gray-50/50 p-7 shadow-lg flex flex-col h-full">
              <div className="flex items-center gap-3 font-bold text-gray-900 text-base mb-5">
                <div className="p-2 rounded-lg bg-gradient-to-br from-amber-500 to-orange-500 shadow-md shadow-amber-500/30">
                  <Boxes className="w-5 h-5 text-white" />
                </div>
                <span>Dịch vụ mua thêm</span>
              </div>
              <div className="flex flex-wrap gap-3 text-xs mb-5">
                {baggageKg > 0 && (
                  <span className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-100 to-orange-100 text-amber-800 border-2 border-amber-200 font-bold shadow-sm">
                    +{baggageKg}kg hành lý
                  </span>
                )}
                {addons.services.map((serviceId) => {
                  const serviceMapping = getServiceMapping(serviceId);
                  const service = SERVICE_OPTIONS.find(
                    (o) => o.id === serviceId
                  );
                  const label =
                    serviceMapping?.label || service?.label || serviceId;
                  const price = serviceMapping?.price || service?.price || 0;
                  return (
                    <span
                      key={serviceId}
                      className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-100 to-violet-100 text-indigo-800 border-2 border-indigo-200 font-bold flex items-center gap-2 shadow-sm">
                      {label}
                      <span className="text-xs opacity-80">
                        ({(price * passengers.length).toLocaleString("vi-VN")}{" "}
                        ₫)
                      </span>
                    </span>
                  );
                })}
              </div>
              <div className="mt-auto text-sm font-bold text-gray-800 flex items-center gap-3 px-4 py-3 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 shadow-sm">
                <span className="text-gray-600">Tổng phụ thu:</span>
                <span className="text-lg font-black bg-gradient-to-r from-blue-700 to-indigo-700 text-transparent bg-clip-text">
                  +{(baggageTotal + servicesTotal).toLocaleString("vi-VN")}{" "}
                  {currency}
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      <div className="flex flex-wrap gap-4 justify-between pt-4">
        <div>
          {onBack && (
            <Button
              variant="outline"
              onClick={onBack}
              className="shadow-md hover:shadow-lg transition-shadow border-2 font-semibold bg-transparent">
              ← Quay lại bước trước
            </Button>
          )}
        </div>

        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={() => {
              const logs = PriceDebugger.getDebugLogs();

              if (logs.length === 0) {
                alert(
                  "❌ No debug logs available. Please complete a booking first."
                );
                return;
              }

              const latest = logs[logs.length - 1];

              const hasBackendIssue =
                latest.backend && latest.comparison?.issue === "backend_higher";

              const message = hasBackendIssue
                ? `🚨 BACKEND PRICE ISSUE DETECTED!\n\n📤 Frontend Sent: ${
                    latest.payload?.totalPrice?.toLocaleString() || "N/A"
                  } VND\n📥 Backend Returned: ${
                    latest.backend?.totalPrice?.toLocaleString() || "N/A"
                  } VND\n⚠️ Difference: +${
                    latest.comparison?.difference?.toLocaleString() || "N/A"
                  } VND\n📊 Increase: ${
                    latest.comparison?.percentageDifference || "N/A"
                  }\n\n🔍 Check Console for detailed breakdown!`
                : `✅ Price Analysis:\n\n📤 Frontend Sent: ${
                    latest.payload?.totalPrice?.toLocaleString() || "N/A"
                  } VND\n📥 Backend Returned: ${
                    latest.backend?.totalPrice?.toLocaleString() || "N/A"
                  } VND\n${
                    latest.comparison?.difference !== 0
                      ? `⚠️ Difference: ${
                          latest.comparison?.difference?.toLocaleString() ||
                          "N/A"
                        } VND`
                      : "✅ No difference detected"
                  }`;

              alert(message);

              if (DEV_CONFIG.ENABLE_CONSOLE_LOGS && shouldShowDevControls()) {
                console.group("🔍 PRICE DEBUG ANALYSIS");
                console.log("Latest Debug Log:", latest);
                console.log("All Debug Logs:", logs);
                console.log("Export Data:", PriceDebugger.exportLogs());
                console.groupEnd();
              }

              if (
                hasBackendIssue &&
                DEV_CONFIG.ENABLE_CONSOLE_LOGS &&
                shouldShowDevControls()
              ) {
                console.group("🚨 BACKEND PRICE INFLATION ANALYSIS");
                console.log(
                  "This indicates backend is recalculating prices incorrectly!"
                );
                console.log("Possible causes:");
                console.log(
                  "1. Backend recalculating flight prices from database"
                );
                console.log("2. Backend double-counting ancillaries");
                console.log("3. Backend applying additional fees/taxes");
                console.log("4. Backend using different pricing logic");
                console.log("\n💡 Next steps:");
                console.log("1. Check backend flight pricing logic");
                console.log("2. Verify ancillary calculation in backend");
                console.log("3. Compare frontend vs backend pricing formulas");
                console.groupEnd();
              }
            }}
            className="shadow-md text-xs border-2 font-semibold"
            title="Analyze Price Issues">
            🔍 Analyze
          </Button>
          {booking?.status !== "CONFIRMED" && onPay && (
            <>
              <Button
                variant="ghost"
                onClick={onFinish}
                className="shadow-md hover:shadow-lg transition-shadow font-semibold"
                disabled={isBooking}>
                Trang chủ
              </Button>
              <Button
                onClick={onPay}
                disabled={isBooking}
                className="bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 hover:from-blue-700 hover:via-indigo-700 hover:to-violet-700 shadow-xl shadow-blue-500/40 hover:shadow-2xl hover:shadow-blue-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 font-bold text-base px-8">
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
              <Button
                variant="ghost"
                onClick={onFinish}
                className="shadow-md hover:shadow-lg transition-shadow font-semibold">
                Trang chủ
              </Button>
              <Button
                onClick={onFinish}
                className="bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 shadow-xl shadow-emerald-500/40 hover:shadow-2xl hover:shadow-emerald-500/50 transition-all duration-300 font-bold text-base px-8">
                Về đơn của tôi
              </Button>
            </>
          )}
        </div>
      </div>
      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(12px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }
      `}</style>
    </div>
  );
};

export default BookingOverview;
