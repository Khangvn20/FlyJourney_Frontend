import type React from "react";
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
  Plane,
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

    return (
      <div className="group rounded-xl border border-border bg-card p-6 transition-all hover:shadow-md">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
              <Plane className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">
                {directionLabel}
              </p>
              <p className="text-xs text-muted-foreground">
                {flight.flight_number}
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Giá vé
            </p>
            <p className="text-lg font-bold text-primary">
              {formatPrice(adultDisplayPrice)}
            </p>
          </div>
        </div>

        <div className="mb-4 flex items-center gap-4">
          <div className="flex-1">
            <p className="text-2xl font-bold text-foreground">
              {flight.departure_airport_code}
            </p>
            <p className="text-sm text-muted-foreground">
              {departure.time || "—"}
            </p>
          </div>
          <div className="flex flex-col items-center gap-1">
            <ArrowRight className="h-5 w-5 text-accent" />
            {duration && (
              <p className="text-xs text-muted-foreground">{duration}</p>
            )}
          </div>
          <div className="flex-1 text-right">
            <p className="text-2xl font-bold text-foreground">
              {flight.arrival_airport_code}
            </p>
            <p className="text-sm text-muted-foreground">
              {arrival.time || "—"}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4">
          <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <CalendarDays className="h-3.5 w-3.5" />
              {departure.date}
            </span>
            <span className="hidden sm:inline">•</span>
            <span className="text-foreground">
              {flight.departure_airport} → {flight.arrival_airport}
            </span>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={onEdit}
            className="text-primary hover:bg-primary/5 hover:text-primary bg-transparent">
            Thay đổi
          </Button>
        </div>
      </div>
    );
  };

  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-6">
        <div className="mb-2 flex items-center gap-2">
          <CheckCircle2 className="h-5 w-5 text-primary" />
          <h1 className="text-2xl font-bold text-foreground">
            Tóm tắt chuyến khứ hồi
          </h1>
        </div>
        <p className="text-sm text-muted-foreground">
          Kiểm tra lại thông tin trước khi tiếp tục
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          {renderFlight("outbound", outbound, onEditOutbound)}
          {renderFlight("inbound", inbound, onEditInbound)}

          <Card className="border-border bg-card">
            <CardContent className="p-6">
              <h3 className="mb-4 text-lg font-semibold text-foreground">
                Chi tiết giá
              </h3>

              <div className="space-y-3">
                {passengerItems.map((item) => {
                  const Icon = item.icon;
                  const outboundPrice =
                    item.outboundUnit > 0
                      ? formatPrice(item.outboundUnit)
                      : null;
                  const inboundPrice =
                    item.inboundUnit > 0 ? formatPrice(item.inboundUnit) : null;

                  return (
                    <div
                      key={item.key}
                      className="rounded-lg border border-border bg-background p-4">
                      <div className="mb-3 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary">
                            <Icon className="h-5 w-5 text-secondary-foreground" />
                          </div>
                          <div>
                            <p className="font-semibold text-foreground">
                              {item.label}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {item.count} khách
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-muted-foreground">Tổng</p>
                          <p className="text-lg font-bold text-foreground">
                            {formatPrice(item.total)}
                          </p>
                        </div>
                      </div>

                      {(outboundPrice || inboundPrice) && (
                        <div className="grid gap-2 sm:grid-cols-2">
                          {outboundPrice && (
                            <div className="flex items-center justify-between rounded-md bg-secondary px-3 py-2 text-xs">
                              <span className="font-medium text-secondary-foreground">
                                Chiều đi
                              </span>
                              <span className="font-semibold text-secondary-foreground">
                                {outboundPrice}
                                {item.count > 1 && (
                                  <span className="ml-1 text-muted-foreground">
                                    × {item.count}
                                  </span>
                                )}
                              </span>
                            </div>
                          )}
                          {inboundPrice && (
                            <div className="flex items-center justify-between rounded-md bg-secondary px-3 py-2 text-xs">
                              <span className="font-medium text-secondary-foreground">
                                Chiều về
                              </span>
                              <span className="font-semibold text-secondary-foreground">
                                {inboundPrice}
                                {item.count > 1 && (
                                  <span className="ml-1 text-muted-foreground">
                                    × {item.count}
                                  </span>
                                )}
                              </span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {priceBreakdown.length > 0 && (
                <div className="mt-6 space-y-3 border-t border-border pt-4">
                  <h4 className="text-sm font-semibold text-foreground">
                    Tổng giá theo chặng
                  </h4>
                  {priceBreakdown.map((item) => {
                    const baseFare = Math.max(item.value - item.taxes, 0);
                    return (
                      <div
                        key={item.label}
                        className="rounded-lg border border-border bg-muted p-4">
                        <div className="mb-2 flex items-center justify-between">
                          <div>
                            <p className="text-sm font-semibold text-foreground">
                              {item.label}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {item.subtitle}
                            </p>
                          </div>
                          <p className="text-lg font-bold text-foreground">
                            {formatPrice(item.value)}
                          </p>
                        </div>
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>Giá vé: {formatPrice(baseFare)}</span>
                          <span>Thuế & phí: {formatPrice(item.taxes)}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {totalTaxes > 0 && (
                <div className="mt-4 rounded-lg border border-accent/20 bg-accent/5 p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-foreground">
                      Tổng thuế & phí
                    </span>
                    <span className="text-base font-bold text-accent">
                      {formatPrice(totalTaxes)}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Đã bao gồm tất cả phụ phí cho mọi hành khách
                  </p>
                </div>
              )}

              <p className="mt-4 text-xs text-muted-foreground">
                Giá đã bao gồm thuế, phí và hoá đơn VAT
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-1">
          <Card className="sticky top-6 border-border bg-card shadow-lg">
            <CardContent className="p-6">
              <div className="mb-6">
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Tổng thanh toán
                </p>
                <p className="text-4xl font-bold text-primary">
                  {formatPrice(grandTotal)}
                </p>
                {totalDurationMinutes > 0 && (
                  <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span>
                      Tổng thời gian bay {formatDuration(totalDurationMinutes)}
                    </span>
                  </div>
                )}
              </div>

              <Button
                size="lg"
                onClick={onConfirm}
                className="w-full bg-primary text-primary-foreground shadow-md transition-all hover:bg-primary/90 hover:shadow-lg">
                Tiếp tục
              </Button>

              <p className="mt-4 text-center text-xs text-muted-foreground">
                Nhấn "Tiếp tục" để giữ chỗ và điền thông tin hành khách
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default RoundTripSummary;
