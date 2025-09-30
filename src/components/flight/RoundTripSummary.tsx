import React from "react";
import { Card, CardContent } from "../ui/card";
import { Button } from "../ui/button";
import {
  CheckCircle2,
  ArrowRight,
  Clock,
  CalendarDays,
  User,
  Users,
  Baby,
} from "lucide-react";
import {
  formatPrice,
  formatDateTime,
  formatDuration,
} from "../../shared/utils/format";
import type { FlightSearchApiResult } from "../../shared/types/search-api.types";
import type { PassengerCounts } from "../../shared/types";

interface RoundTripSummaryProps {
  outbound: FlightSearchApiResult;
  inbound: FlightSearchApiResult;
  passengerCounts: PassengerCounts | null;
  onEditOutbound: () => void;
  onEditInbound: () => void;
  onConfirm: () => void;
}

const RoundTripSummary: React.FC<RoundTripSummaryProps> = ({
  outbound,
  inbound,
  passengerCounts,
  onEditOutbound,
  onEditInbound,
  onConfirm,
}) => {
  const getGrandTotal = (flight: FlightSearchApiResult | null) =>
    flight?.pricing?.grand_total ?? 0;

  const getTaxAndFees = (flight: FlightSearchApiResult | null) => {
    if (!flight) return 0;
    if (typeof flight.tax_and_fees === "number") {
      return flight.tax_and_fees;
    }
    return flight.pricing?.taxes?.adult ?? 0;
  };

  const outboundTotal = getGrandTotal(outbound);
  const inboundTotal = getGrandTotal(inbound);
  const outboundTaxes = getTaxAndFees(outbound);
  const inboundTaxes = getTaxAndFees(inbound);

  const totalPrice = outboundTotal + inboundTotal;
  const totalTaxes = outboundTaxes + inboundTaxes;
  const totalDurationMinutes =
    (outbound?.duration_minutes ?? 0) + (inbound?.duration_minutes ?? 0);

  const priceBreakdown = [
    {
      label: "Chiều đi",
      subtitle: `${outbound.departure_airport_code} → ${outbound.arrival_airport_code}`,
      value: outboundTotal,
      taxes: outboundTaxes,
    },
    {
      label: "Chiều về",
      subtitle: `${inbound.departure_airport_code} → ${inbound.arrival_airport_code}`,
      value: inboundTotal,
      taxes: inboundTaxes,
    },
  ];

  const initialCounts =
    passengerCounts ??
    ({
      adults: 1,
      children: 0,
      infants: 0,
    } satisfies PassengerCounts);

  const totalPassengers =
    (initialCounts.adults ?? 0) +
    (initialCounts.children ?? 0) +
    (initialCounts.infants ?? 0);

  const counts: PassengerCounts =
    totalPassengers > 0
      ? initialCounts
      : {
          adults: 1,
          children: 0,
          infants: 0,
        };

  type PricingKey = "adult" | "child" | "infant";

  const passengerKeyToPricing: Record<keyof PassengerCounts, PricingKey> = {
    adults: "adult",
    children: "child",
    infants: "infant",
  };

  const getPassengerUnitPrice = (
    flight: FlightSearchApiResult | null,
    type: PricingKey
  ) => {
    if (!flight?.pricing) return 0;
    const total = flight.pricing.total_prices?.[type];
    if (typeof total === "number" && total > 0) return total;
    const base = flight.pricing.base_prices?.[type] ?? 0;
    const tax = type === "adult" ? flight.pricing.taxes?.adult ?? 0 : 0;
    return base + tax;
  };

  const passengerItems = (
    ["adults", "children", "infants"] as Array<keyof PassengerCounts>
  )
    .map((key) => {
      const count = counts[key];
      if (!count) return null;
      const pricingKey = passengerKeyToPricing[key];
      const outboundUnit = getPassengerUnitPrice(outbound, pricingKey);
      const inboundUnit = getPassengerUnitPrice(inbound, pricingKey);
      const perPassengerTotal = outboundUnit + inboundUnit;
      const total = perPassengerTotal * count;
      return {
        key,
        label:
          key === "adults"
            ? "Người lớn"
            : key === "children"
            ? "Trẻ em"
            : "Em bé",
        icon: key === "adults" ? User : key === "children" ? Users : Baby,
        count,
        outboundUnit,
        inboundUnit,
        total,
      };
    })
    .filter((item): item is NonNullable<typeof item> => Boolean(item));

  const passengersTotal = passengerItems.reduce(
    (sum, item) => sum + item.total,
    0
  );

  const grandTotal = totalPrice > 0 ? totalPrice : passengersTotal;
  const renderFlight = (
    dir: "outbound" | "inbound",
    flight: FlightSearchApiResult,
    onEdit: () => void
  ) => {
    const departure = formatDateTime(flight.departure_time || "");
    const arrival = formatDateTime(flight.arrival_time || "");
    const duration = flight.duration_minutes
      ? formatDuration(flight.duration_minutes)
      : null;
    const adultBaseWithTax =
      (flight.pricing.base_prices?.adult || 0) +
      (flight.pricing.taxes?.adult || 0);
    const adultDisplayPrice =
      flight.pricing.total_prices?.adult &&
      flight.pricing.total_prices.adult > 0
        ? flight.pricing.total_prices.adult
        : adultBaseWithTax > 0
        ? adultBaseWithTax
        : flight.pricing.grand_total;

    const directionLabel = dir === "outbound" ? "Chiều đi" : "Chiều về";
    const directionBadge =
      dir === "outbound"
        ? "bg-blue-50 text-blue-700 border-blue-200"
        : "bg-indigo-50 text-indigo-700 border-indigo-200";

    return (
      <div className="group flex flex-col gap-4 px-6 py-5 transition-colors hover:bg-blue-50/40">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
            <span
              className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold ${directionBadge}`}>
              <CheckCircle2 className="h-4 w-4" />
              {directionLabel}
            </span>
            <span className="hidden text-slate-400 sm:block">•</span>
            <span className="text-sm font-semibold text-slate-900">
              {flight.flight_number}
            </span>
          </div>
          <span className="inline-flex items-center gap-2 rounded-full bg-orange-50 px-3 py-1 text-xs font-semibold text-orange-600">
            <span className="uppercase tracking-wide text-[10px] text-orange-500">
              Giá vé(đã gồm thuế/phí)
            </span>
            {formatPrice(adultDisplayPrice)}
          </span>
        </div>

        <div className="grid gap-4 text-sm text-slate-600 md:grid-cols-[auto,1fr] md:items-center">
          <div className="flex items-center gap-3 text-base font-semibold text-slate-900">
            <span>{flight.departure_airport_code}</span>
            <ArrowRight className="h-4 w-4 text-blue-500" />
            <span>{flight.arrival_airport_code}</span>
          </div>
          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
            {departure.time && arrival.time && (
              <span className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                {departure.time} – {arrival.time}
              </span>
            )}
            {duration && (
              <span className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                {duration}
              </span>
            )}
            <span className="flex items-center gap-1">
              <CalendarDays className="h-3.5 w-3.5" />
              {departure.date}
            </span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 md:text-sm">
          <span className="text-slate-500">
            {flight.departure_airport} → {flight.arrival_airport}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={onEdit}
            className="ml-auto">
            Thay đổi
          </Button>
        </div>
      </div>
    );
  };

  return (
    <Card className="overflow-hidden rounded-3xl border-none shadow-xl">
      <CardContent className="p-0">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-6 text-white">
          <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/80">
            Tóm tắt chuyến khứ hồi
          </span>
          <div className="mt-3 flex flex-wrap items-center gap-2 text-sm text-white/90">
            <span className="font-semibold text-white">Hoàn tất lựa chọn</span>
            <ArrowRight className="h-4 w-4 text-white/60" />
            <span>Kiểm tra lại thông tin trước khi tiếp tục</span>
          </div>
        </div>

        <div className="divide-y divide-slate-100 bg-white">
          {renderFlight("outbound", outbound, onEditOutbound)}
          {renderFlight("inbound", inbound, onEditInbound)}
        </div>

        <div className="flex flex-col gap-6 bg-gradient-to-r from-blue-50 via-indigo-50 to-white px-6 py-6 md:flex-row md:items-start md:justify-between">
          <div className="flex w-full flex-1 flex-col gap-4 text-sm text-slate-600">
            <div className="rounded-2xl border border-blue-100 bg-white/90 p-5 shadow-sm backdrop-blur">
              <h4 className="text-sm font-semibold text-slate-900">
                Chi tiết giá
              </h4>
              <dl className="mt-4 space-y-3 text-sm">
                {passengerItems.map((item) => {
                  const Icon = item.icon;
                  const legSummaryParts: string[] = [];
                  if (item.outboundUnit > 0) {
                    legSummaryParts.push(
                      `Chiều đi ${formatPrice(item.outboundUnit)}${
                        item.count > 1 ? ` ×${item.count}` : ""
                      }`
                    );
                  }
                  if (item.inboundUnit > 0) {
                    legSummaryParts.push(
                      `Chiều về ${formatPrice(item.inboundUnit)}${
                        item.count > 1 ? ` ×${item.count}` : ""
                      }`
                    );
                  }
                  const legSummary =
                    legSummaryParts.length > 0
                      ? legSummaryParts.join(" • ")
                      : "Đã bao gồm cả hành trình";

                  return (
                    <div
                      key={item.key}
                      className="flex items-center justify-between gap-4 rounded-2xl border border-blue-50 bg-blue-50/70 px-4 py-3 shadow-sm">
                      <div className="flex items-center gap-3">
                        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                          <Icon className="h-5 w-5" />
                        </span>
                        <div>
                          <dt className="text-sm font-semibold text-slate-900">
                            {item.label} × {item.count}
                          </dt>
                          <dd className="text-[12px] text-blue-600/80">
                            {legSummary}
                          </dd>
                        </div>
                      </div>
                      <span className="text-sm font-semibold text-slate-900">
                        {formatPrice(item.total)}
                      </span>
                    </div>
                  );
                })}

                {totalTaxes > 0 && (
                  <div className="flex items-center justify-between gap-4 rounded-2xl border border-orange-100 bg-orange-50/70 px-4 py-3 text-[13px] font-medium text-orange-700">
                    <span>Thuế & phí toàn hành trình</span>
                    <span>{formatPrice(totalTaxes)}</span>
                  </div>
                )}

                <div className="flex items-center justify-between gap-4 rounded-2xl border border-blue-100 bg-white px-4 py-3 text-sm font-semibold text-blue-700 shadow-inner">
                  <span>Tổng</span>
                  <span className="text-base font-bold text-orange-600">
                    {formatPrice(grandTotal)}
                  </span>
                </div>
              </dl>

              <div className="mt-4 grid gap-2 rounded-2xl bg-blue-50/60 p-3 text-[11px] text-blue-700">
                {priceBreakdown.map((item) => (
                  <div
                    key={item.label}
                    className="flex items-center justify-between gap-2">
                    <span>
                      {item.label} • {item.subtitle}
                    </span>
                    <span>{formatPrice(item.value)}</span>
                  </div>
                ))}
              </div>

              <p className="mt-3 text-xs text-slate-500">
                Giá đã bao gồm thuế, phí và hoá đơn VAT.
              </p>
            </div>
          </div>

          <div className="flex w-full max-w-sm flex-col gap-4 rounded-2xl border border-blue-100 bg-white/90 p-5 text-sm text-slate-600 shadow-xl">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wide text-blue-600">
                Tổng giá dự kiến
              </span>
              <p className="mt-2 text-3xl font-bold text-orange-600">
                {formatPrice(grandTotal)}
              </p>
              {totalDurationMinutes > 0 && (
                <p className="mt-3 flex items-center gap-2 text-xs text-blue-700">
                  <Clock className="h-3.5 w-3.5" />
                  Tổng thời gian bay {formatDuration(totalDurationMinutes)}
                </p>
              )}
            </div>

            <Button
              size="lg"
              onClick={onConfirm}
              className="w-full bg-blue-600 text-white shadow-lg shadow-blue-200 transition hover:bg-blue-700">
              Tiếp tục
            </Button>

            <p className="text-xs text-slate-500">
              Nhấn “Tiếp tục” để giữ chỗ và điền thông tin hành khách.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default RoundTripSummary;
