import type React from "react";
import type { FlightCardProps } from "../../shared/types/flight-card.types";
import {
  CABIN_CLASS_LABELS,
  SORT_LABELS,
} from "../../shared/constants/flight.constants";
import { Card, CardContent } from "../ui/card";
import { Button } from "../ui/button";
import {
  ChevronDown,
  ChevronUp,
  ArrowRight,
  Info,
  Clock,
  CreditCard,
  Luggage,
  Calendar,
  Users,
  Plane,
  MapPin,
  Shield,
  Zap,
} from "lucide-react";

const formatPrice = (amount: number): string => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    minimumFractionDigits: 0,
  }).format(amount);
};

const formatDateTime = (dateString: string) => {
  const date = new Date(dateString);
  return {
    time: date.toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
    }),
    date: date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }),
  };
};

const formatDuration = (minutes: number): string => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours}h ${mins}m`;
};

// constants and types moved to ./types and ./constants for clarity

const FlightCard: React.FC<FlightCardProps> = ({
  flight,
  isExpanded,
  onToggleDetails,
  onSelect,
  sortBy,
  airlineLogo,
  activeTab,
  setActiveTab,
  isSelected = false,
}) => {
  const safeFare = flight.fare_class_details || {
    fare_class_code: "",
    cabin_class: flight.flight_class || "economy",
    refundable: false,
    changeable: false,
    baggage_kg: "20kg",
    description: "",
    refund_change_policy: "",
  };

  const safePricing = flight.pricing || {
    base_prices: { adult: 0, child: 0, infant: 0 },
    total_prices: { adult: 0, child: 0, infant: 0 },
    taxes: { adult: 0 },
    grand_total: 0,
    currency: "VND",
  };

  const adultDisplayPrice =
    safePricing.total_prices.adult > 0
      ? safePricing.total_prices.adult
      : safePricing.grand_total;

  const departureTime = formatDateTime(flight.departure_time);
  const arrivalTime = formatDateTime(flight.arrival_time);
  const duration = formatDuration(flight.duration_minutes);
  const cabinLabel =
    CABIN_CLASS_LABELS[safeFare.cabin_class] ||
    CABIN_CLASS_LABELS[flight.flight_class];

  return (
    <Card
      className={`relative overflow-hidden transition-all duration-300 ease-out hover:shadow-medium group ${
        isSelected
          ? "border-2 border-primary shadow-soft bg-white"
          : "border border-gray-200 hover:border-primary/30 bg-white hover:shadow-soft"
      }`}
      style={{ borderRadius: "12px" }}>
      {/* <div className="absolute top-4 right-4">
        <Star className="h-5 w-5 text-gray-300 group-hover:text-primary transition-colors duration-300" />
      </div> */}

      <CardContent className="p-0">
        <div className="p-5">
          <div className="grid gap-6 lg:grid-cols-[210px_minmax(0,1fr)_140px] items-center">
            <div className="space-y-3">
              <div className="w-full h-16 bg-gray-50 rounded-lg p-3 flex items-center justify-center border border-gray-100">
                <img
                  src={airlineLogo}
                  alt={`Hãng hàng không ${flight.airline_name}`}
                  className="w-full h-full object-contain"
                  loading="lazy"
                />
              </div>

              <div className="flex flex-wrap gap-1.5 justify-center">
                <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-blue-50 text-blue-700 rounded-md border border-blue-100">
                  <Plane className="h-3 w-3" />
                  {flight.flight_number}
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-gray-50 text-gray-700 rounded-md border border-gray-100">
                  <Users className="h-3 w-3" />
                  {cabinLabel}
                </span>
              </div>
            </div>

            <div className="flex flex-col items-center space-y-3">
              <div className="flex w-full items-center justify-between gap-6">
                <div className="text-center">
                  <div className="text-xl font-bold text-gray-900 mb-0.5 font-display">
                    {departureTime.time}
                  </div>
                  <div className="text-sm font-medium text-gray-600 mb-0.5 flex items-center gap-1 justify-center">
                    <MapPin className="h-3 w-3 text-blue-600" />
                    {flight.departure_airport_code}
                  </div>
                  <div className="text-xs text-gray-500 max-w-32 leading-tight">
                    {flight.departure_airport}
                  </div>
                </div>

                <div className="flex flex-col items-center space-y-2 px-4">
                  <div className="text-sm font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">
                    {duration}
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                    <div className="w-16 h-0.5 bg-gray-300 rounded-full"></div>
                    <div className="p-0.5 bg-blue-600 rounded-full">
                      <ArrowRight className="h-3 w-3 text-white" />
                    </div>
                    <div className="w-16 h-0.5 bg-gray-300 rounded-full"></div>
                    <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                  </div>
                  <div className="text-center">
                    {flight.stops_count === 0 ? (
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-md font-medium">
                        <Zap className="inline h-3 w-3 mr-1" />
                        Bay thẳng
                      </span>
                    ) : (
                      <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded-md font-medium">
                        {flight.stops_count} điểm dừng
                      </span>
                    )}
                  </div>
                </div>

                <div className="text-center">
                  <div className="text-xl font-bold text-gray-900 mb-0.5 font-display">
                    {arrivalTime.time}
                  </div>
                  <div className="text-sm font-medium text-gray-600 mb-0.5 flex items-center gap-1 justify-center">
                    <MapPin className="h-3 w-3 text-blue-600" />
                    {flight.arrival_airport_code}
                  </div>
                  <div className="text-xs text-gray-500 max-w-32 leading-tight">
                    {flight.arrival_airport}
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-2 text-right lg:text-right lg:max-w-[140px] mx-auto lg:mx-0">
              <div className="rounded-3xl border-blue-100 bg-blue-50/60 p-1.5">
                <div className="flex justify-end mb-2">
                  <span className="text-xs text-gray-600 px-2 py-1 bg-gray-100 rounded-md">
                    Sắp xếp: {SORT_LABELS[sortBy] ?? sortBy ?? "Mặc định"}
                  </span>
                </div>
                <div className="text-lg font-bold text-orange-600 mb-0.5 font-display">
                  {formatPrice(adultDisplayPrice)}
                </div>
                <div className="text-sm text-gray-600 font-medium">/khách</div>

                <div className="flex flex-wrap justify-end gap-1.5 mt-3">
                  <span
                    className={`text-xs px-2 py-1 rounded-md font-medium ${
                      safeFare.refundable
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}>
                    <Shield className="inline h-3 w-3 mr-1" />
                    {safeFare.refundable ? "Hoàn được" : "Không hoàn"}
                  </span>
                  <span
                    className={`text-xs px-2 py-1 rounded-md font-medium ${
                      safeFare.changeable
                        ? "bg-blue-100 text-blue-700"
                        : "bg-gray-100 text-gray-600"
                    }`}>
                    {safeFare.changeable ? "Đổi được" : "Không đổi"}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 justify-end">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onToggleDetails}
                  className="rounded-lg h-9 px-3 border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all duration-200 bg-transparent">
                  {isExpanded ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </Button>
                <Button
                  onClick={onSelect}
                  className="rounded-lg h-9 min-w-28 bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-soft hover:shadow-medium transition-all duration-200">
                  Đặt vé
                </Button>
              </div>
            </div>
          </div>
        </div>

        {isExpanded && (
          <div className="border-t border-gray-100 bg-gray-50/50 animate-fade-in">
            <div className="p-6 space-y-6">
              <div className="flex items-center justify-between">
                <h4 className="text-xl font-bold text-gray-900 flex items-center gap-3 font-display">
                  <div className="p-2 bg-blue-600 rounded-lg">
                    <Info className="h-5 w-5 text-white" />
                  </div>
                  Chi tiết chuyến bay
                </h4>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onToggleDetails}
                  className="text-gray-500 hover:text-gray-700 rounded-lg">
                  Thu gọn
                </Button>
              </div>

              <div className="border-b border-gray-200">
                <nav className="flex space-x-1">
                  {[
                    { id: "flight", label: "Lịch trình", icon: Clock },
                    { id: "pricing", label: "Chi tiết giá", icon: CreditCard },
                    { id: "conditions", label: "Điều kiện", icon: Luggage },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`py-3 px-4 border-b-2 font-medium text-sm transition-all duration-200 flex items-center gap-2 rounded-t-lg ${
                        activeTab === tab.id
                          ? "border-blue-600 text-blue-600 bg-blue-50"
                          : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 hover:bg-gray-50"
                      }`}>
                      <tab.icon className="h-4 w-4" />
                      {tab.label}
                    </button>
                  ))}
                </nav>
              </div>

              <div className="mt-6">
                {activeTab === "flight" && (
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-soft">
                      <h5 className="font-semibold text-gray-900 mb-4 flex items-center gap-2 font-display">
                        <Clock className="h-4 w-4 text-blue-600" />
                        Thông tin chuyến bay
                      </h5>
                      <div className="space-y-3">
                        {[
                          {
                            label: "Số hiệu chuyến bay",
                            value: flight.flight_number,
                          },
                          {
                            label: "Hãng hàng không",
                            value: flight.airline_name,
                          },
                          { label: "Hạng ghế", value: cabinLabel },
                          { label: "Thời gian bay", value: duration },
                          {
                            label: "Điểm dừng",
                            value:
                              flight.stops_count === 0
                                ? "Bay thẳng"
                                : `${flight.stops_count} điểm dừng`,
                          },
                        ].map((item, index) => (
                          <div
                            key={index}
                            className="flex justify-between py-2 border-b border-gray-100 last:border-b-0">
                            <span className="text-gray-600 text-sm">
                              {item.label}:
                            </span>
                            <span className="font-medium text-gray-900 text-sm">
                              {item.value}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-soft">
                      <h5 className="font-semibold text-gray-900 mb-4 flex items-center gap-2 font-display">
                        <Calendar className="h-4 w-4 text-blue-600" />
                        Lịch trình chuyến bay
                      </h5>
                      <div className="space-y-4">
                        <div className="flex items-start space-x-3 p-3 bg-green-50 rounded-lg border border-green-200">
                          <div className="w-3 h-3 bg-green-500 rounded-full mt-2"></div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-medium text-green-700">
                                Khởi hành
                              </span>
                              <span className="text-lg font-semibold text-green-700">
                                {departureTime.time}
                              </span>
                            </div>
                            <div className="text-sm text-green-600">
                              {departureTime.date} •{" "}
                              {flight.departure_airport_code} -{" "}
                              {flight.departure_airport}
                            </div>
                          </div>
                        </div>

                        <div className="ml-6 border-l-2 border-dashed border-slate-300 h-6"></div>

                        <div className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                          <div className="w-3 h-3 bg-blue-500 rounded-full mt-2"></div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-medium text-blue-700">
                                Đến nơi
                              </span>
                              <span className="text-lg font-semibold text-blue-700">
                                {arrivalTime.time}
                              </span>
                            </div>
                            <div className="text-sm text-blue-600">
                              {arrivalTime.date} • {flight.arrival_airport_code}{" "}
                              - {flight.arrival_airport}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === "pricing" && (
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-soft">
                      <h5 className="font-semibold text-gray-900 mb-4 flex items-center gap-2 font-display">
                        <CreditCard className="h-4 w-4 text-blue-600" />
                        Chi tiết giá vé
                      </h5>
                      <div className="space-y-3">
                        {[
                          {
                            label: "Giá vé cơ bản (Người lớn)",
                            value: formatPrice(safePricing.base_prices.adult),
                          },
                          ...(safePricing.base_prices.child > 0
                            ? [
                                {
                                  label: "Giá vé cơ bản (Trẻ em)",
                                  value: formatPrice(
                                    safePricing.base_prices.child
                                  ),
                                },
                              ]
                            : []),
                          {
                            label: "Thuế & Phí",
                            value: formatPrice(safePricing.taxes.adult),
                          },
                        ].map((item, index) => (
                          <div
                            key={index}
                            className="flex justify-between py-2 border-b border-gray-100 last:border-b-0">
                            <span className="text-gray-600 text-sm">
                              {item.label}:
                            </span>
                            <span className="font-medium text-gray-900 text-sm">
                              {item.value}
                            </span>
                          </div>
                        ))}

                        <div className="border-t-2 border-blue-100 pt-3 mt-4">
                          <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                            <span className="font-semibold text-gray-900">
                              Tổng cộng:
                            </span>
                            <span className="text-xl font-bold text-blue-600">
                              {formatPrice(safePricing.grand_total)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-soft">
                      <h5 className="font-semibold text-gray-900 mb-4 flex items-center gap-2 font-display">
                        <CreditCard className="h-4 w-4 text-blue-600" />
                        Phân tích giá
                      </h5>
                      <div className="space-y-3">
                        {[
                          {
                            label: "Tổng giá (Người lớn)",
                            value: formatPrice(safePricing.total_prices.adult),
                          },
                          ...(safePricing.total_prices.child > 0
                            ? [
                                {
                                  label: "Tổng giá (Trẻ em)",
                                  value: formatPrice(
                                    safePricing.total_prices.child
                                  ),
                                },
                              ]
                            : []),
                          ...(safePricing.total_prices.infant > 0
                            ? [
                                {
                                  label: "Tổng giá (Em bé)",
                                  value: formatPrice(
                                    safePricing.total_prices.infant
                                  ),
                                },
                              ]
                            : []),
                        ].map((item, index) => (
                          <div
                            key={index}
                            className="flex justify-between py-2 border-b border-gray-100 last:border-b-0">
                            <span className="text-gray-600 text-sm">
                              {item.label}:
                            </span>
                            <span className="font-medium text-gray-900 text-sm">
                              {item.value}
                            </span>
                          </div>
                        ))}

                        <div className="text-sm text-gray-500 mt-4 p-3 bg-gray-50 rounded-lg">
                          <strong className="text-gray-700">Lưu ý:</strong> Tất
                          cả giá đã bao gồm thuế và phí áp dụng
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === "conditions" && (
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-soft">
                      <h5 className="font-semibold text-gray-900 mb-4 flex items-center gap-2 font-display">
                        <Luggage className="h-4 w-4 text-blue-600" />
                        Dịch vụ & Hành lý
                      </h5>
                      <div className="space-y-3">
                        {[
                          { label: "Hạng cabin", value: cabinLabel },
                          {
                            label: "Hành lý xách tay",
                            value: "7kg (tiêu chuẩn)",
                          },
                          {
                            label: "Hành lý ký gửi",
                            value: safeFare.baggage_kg,
                          },
                        ].map((item, index) => (
                          <div
                            key={index}
                            className="flex justify-between py-2 border-b border-gray-100 last:border-b-0">
                            <span className="text-gray-600 text-sm">
                              {item.label}:
                            </span>
                            <span className="font-medium text-gray-900 text-sm">
                              {item.value}
                            </span>
                          </div>
                        ))}

                        {safeFare.description && (
                          <div className="rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-600 mt-4">
                            <strong className="text-slate-700">Mô tả:</strong>{" "}
                            {safeFare.description}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-soft">
                      <h5 className="font-semibold text-gray-900 mb-4 flex items-center gap-2 font-display">
                        <Users className="h-4 w-4 text-blue-600" />
                        Điều kiện vé
                      </h5>
                      <div className="space-y-3">
                        <div className="flex justify-between py-2 border-b border-gray-100">
                          <span className="text-gray-600 text-sm">
                            Có hoàn tiền:
                          </span>
                          <span
                            className={`text-sm font-medium px-2 py-1 rounded-full ${
                              safeFare.refundable
                                ? "text-green-700 bg-green-100"
                                : "text-red-700 bg-red-100"
                            }`}>
                            {safeFare.refundable ? "✓ Có" : "✗ Không"}
                          </span>
                        </div>

                        <div className="flex justify-between py-2 border-b border-gray-100">
                          <span className="text-gray-600 text-sm">
                            Có thể đổi:
                          </span>
                          <span
                            className={`text-sm font-medium px-2 py-1 rounded-full ${
                              safeFare.changeable
                                ? "text-blue-700 bg-blue-100"
                                : "text-gray-600 bg-gray-100"
                            }`}>
                            {safeFare.changeable ? "✓ Có" : "✗ Không"}
                          </span>
                        </div>

                        <div className="flex justify-between py-2 border-b border-gray-100">
                          <span className="text-gray-600 text-sm">
                            Mã hạng vé:
                          </span>
                          <span className="font-medium text-gray-900 text-sm">
                            {safeFare.fare_class_code}
                          </span>
                        </div>

                        {safeFare.refund_change_policy && (
                          <div className="rounded-lg bg-blue-50 px-3 py-3 text-sm text-blue-700 mt-4 border border-blue-200">
                            <span className="block font-medium text-blue-800 mb-2">
                              Chính sách hoàn tiền & đổi vé
                            </span>
                            <span className="leading-relaxed">
                              {safeFare.refund_change_policy}
                            </span>
                          </div>
                        )}

                        <div className="text-sm text-gray-500 mt-4 p-3 bg-orange-50 rounded-lg border border-orange-200">
                          <strong className="text-orange-700">
                            Quan trọng:
                          </strong>{" "}
                          Điều kiện có thể thay đổi theo chính sách của hãng
                          hàng không. Vui lòng kiểm tra trước khi đặt vé.
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between pt-6 border-t border-gray-200">
                <div className="text-sm text-blue-700 bg-blue-50 px-4 py-2 rounded-lg border border-blue-100">
                  <strong>💡 Mẹo:</strong> Đặt vé ngay để đảm bảo chỗ ngồi với
                  giá tốt nhất
                </div>
                <div className="flex space-x-3">
                  <Button
                    variant="outline"
                    onClick={onToggleDetails}
                    className="px-6 py-2 rounded-lg font-medium border-gray-200 hover:border-blue-300 hover:bg-blue-50 bg-transparent">
                    Thu gọn
                  </Button>
                  <Button
                    className="bg-blue-600 hover:bg-blue-700 px-6 py-2 font-semibold rounded-lg text-white shadow-soft hover:shadow-medium transition-all duration-200"
                    onClick={onSelect}>
                    🎫 Đặt vé ngay - {formatPrice(adultDisplayPrice)}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default FlightCard;
