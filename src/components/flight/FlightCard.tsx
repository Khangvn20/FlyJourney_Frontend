import React from "react";
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
} from "lucide-react";
import {
  formatPrice,
  formatDateTime,
  formatDuration,
} from "../../shared/utils/format";
import type { FlightSearchApiResult } from "../../shared/types/search-api.types";

interface FlightCardProps {
  flight: FlightSearchApiResult;
  isExpanded: boolean;
  onToggleDetails: () => void;
  onSelect: () => void;
  sortBy: string;
  airlineLogo: string;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isSelected?: boolean;
}

const FlightCard: React.FC<FlightCardProps> = ({
  flight,
  isExpanded,
  onToggleDetails,
  onSelect,
  sortBy,
  airlineLogo,
  activeTab,
  setActiveTab,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  isSelected: _isSelected,
}) => {
  const departureTime = formatDateTime(flight.departure_time);
  const arrivalTime = formatDateTime(flight.arrival_time);
  const duration = formatDuration(flight.duration_minutes);

  return (
    <Card className="hover:shadow-md transition-shadow border border-gray-200">
      <CardContent className="p-0">
        {/* Main Flight Info */}
        <div className="p-4">
          <div className="flex items-center justify-between">
            {/* Flight Info */}
            <div className="flex items-center flex-1 gap-8">
              {/* Airline */}
              <div className="flex flex-col items-center min-w-[80px]">
                <div className="h-10 w-16 flex items-center justify-center mb-1">
                  <img
                    src={airlineLogo}
                    alt={flight.airline_name}
                    className="h-8 w-auto object-contain"
                    loading="lazy"
                  />
                </div>
                <div className="text-xs font-medium text-center">
                  {flight.flight_number}
                </div>
                <div className="text-xs text-gray-500 text-center">
                  {flight.fare_class_details.cabin_class}
                </div>
                <div className="text-xs text-blue-600 text-center">
                  {flight.fare_class_details.baggage_kg}
                </div>
              </div>

              {/* Flight Times */}
              <div className="flex flex-col md:flex-row md:items-center md:justify-center flex-1 gap-4">
                <div className="flex items-center justify-center gap-8">
                  <div className="text-center">
                    <div
                      className={`text-xl font-bold ${
                        sortBy === "departure"
                          ? "text-green-600 bg-green-50 px-2 py-1 rounded"
                          : ""
                      }`}>
                      {departureTime.time}
                      {sortBy === "departure" && (
                        <span className="text-xs ml-1">🕐</span>
                      )}
                    </div>
                    <div className="text-sm text-gray-600">
                      {flight.departure_airport_code}
                    </div>
                    <div className="text-xs text-gray-500">
                      {flight.departure_airport}
                    </div>
                  </div>

                  <div className="flex flex-col items-center">
                    <div
                      className={`text-xs text-gray-500 mb-1 ${
                        sortBy === "duration"
                          ? "font-bold text-green-600 bg-green-50 px-2 py-1 rounded"
                          : ""
                      }`}>
                      {duration}
                      {sortBy === "duration" && (
                        <span className="text-xs ml-1">⏱️</span>
                      )}
                    </div>
                    <div className="flex items-center">
                      <div className="h-px bg-gray-300 w-16"></div>
                      <ArrowRight className="h-4 w-4 text-gray-400 mx-1" />
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {flight.stops_count === 0
                        ? "Bay thẳng"
                        : `${flight.stops_count} điểm dừng`}
                    </div>
                  </div>

                  <div className="text-center">
                    <div className="text-xl font-bold">{arrivalTime.time}</div>
                    <div className="text-sm text-gray-600">
                      {flight.arrival_airport_code}
                    </div>
                    <div className="text-xs text-gray-500">
                      {flight.arrival_airport}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Price and Actions */}
            <div className="flex flex-col items-end space-y-2 min-w-[140px]">
              <div className="text-right">
                <div
                  className={`text-xl font-bold ${
                    sortBy === "price"
                      ? "text-green-600 bg-green-50 px-2 py-1 rounded"
                      : "text-orange-600"
                  }`}>
                  {formatPrice(flight.pricing.grand_total)}
                  {sortBy === "price" && (
                    <span className="text-xs ml-1">📊</span>
                  )}
                </div>
                <div className="text-xs text-gray-500">
                  {flight.fare_class_details.refundable
                    ? "Hoàn tiền"
                    : "Không hoàn tiền"}{" "}
                  •{" "}
                  {flight.fare_class_details.changeable
                    ? "Đổi được"
                    : "Không đổi"}
                </div>
              </div>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onToggleDetails}
                  className="px-3">
                  {isExpanded ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </Button>
                <Button
                  size="sm"
                  onClick={onSelect}
                  className="bg-blue-600 hover:bg-blue-700 px-6">
                  Đặt chỗ
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Expanded Details */}
        {isExpanded && (
          <div className="border-t border-gray-200 bg-gray-50">
            <div className="p-4 space-y-4">
              {/* Flight Details Header */}
              <div className="flex items-center justify-between">
                <h4 className="text-lg font-semibold text-gray-900 flex items-center">
                  <Info className="h-5 w-5 mr-2 text-blue-600" />
                  Chi tiết chuyến bay
                </h4>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onToggleDetails}
                  className="text-gray-500 hover:text-gray-700">
                  Thu gọn
                </Button>
              </div>

              {/* Tab Navigation */}
              <div className="flex border-b border-gray-200">
                <button
                  onClick={() => setActiveTab("flight")}
                  className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === "flight"
                      ? "border-blue-600 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700"
                  }`}>
                  <Clock className="h-4 w-4 inline mr-2" />
                  Chuyến bay
                </button>
                <button
                  onClick={() => setActiveTab("pricing")}
                  className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === "pricing"
                      ? "border-blue-600 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700"
                  }`}>
                  <CreditCard className="h-4 w-4 inline mr-2" />
                  Giá vé
                </button>
                <button
                  onClick={() => setActiveTab("conditions")}
                  className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === "conditions"
                      ? "border-blue-600 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700"
                  }`}>
                  <Luggage className="h-4 w-4 inline mr-2" />
                  Điều kiện vé
                </button>
              </div>

              {/* Tab Content */}
              <div className="mt-4">
                {/* Flight Tab */}
                {activeTab === "flight" && (
                  <div className="grid md:grid-cols-2 gap-6">
                    {/* Flight Information */}
                    <div className="bg-white rounded-lg p-4 border border-gray-200">
                      <h5 className="font-semibold text-gray-900 mb-3 flex items-center">
                        <Clock className="h-4 w-4 mr-2 text-blue-600" />
                        Thông tin chuyến bay
                      </h5>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Mã chuyến bay:</span>
                          <span className="font-medium">
                            {flight.flight_number}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">
                            Hãng hàng không:
                          </span>
                          <span className="font-medium">
                            {flight.airline_name}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Hạng vé:</span>
                          <span className="font-medium">
                            {flight.flight_class}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Thời gian bay:</span>
                          <span className="font-medium">{duration}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Số điểm dừng:</span>
                          <span className="font-medium">
                            {flight.stops_count === 0
                              ? "Bay thẳng"
                              : `${flight.stops_count} điểm dừng`}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Schedule Information */}
                    <div className="bg-white rounded-lg p-4 border border-gray-200">
                      <h5 className="font-semibold text-gray-900 mb-3 flex items-center">
                        <Calendar className="h-4 w-4 mr-2 text-blue-600" />
                        Lịch trình
                      </h5>
                      <div className="space-y-3">
                        <div className="flex items-start space-x-3">
                          <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <span className="font-medium text-gray-900">
                                Khởi hành
                              </span>
                              <span className="text-lg font-bold text-gray-900">
                                {departureTime.time}
                              </span>
                            </div>
                            <div className="text-sm text-gray-600">
                              {departureTime.date} •{" "}
                              {flight.departure_airport_code} -{" "}
                              {flight.departure_airport}
                            </div>
                          </div>
                        </div>
                        <div className="ml-1 border-l-2 border-dashed border-gray-300 h-8"></div>
                        <div className="flex items-start space-x-3">
                          <div className="w-2 h-2 bg-orange-500 rounded-full mt-2"></div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <span className="font-medium text-gray-900">
                                Đến nơi
                              </span>
                              <span className="text-lg font-bold text-gray-900">
                                {arrivalTime.time}
                              </span>
                            </div>
                            <div className="text-sm text-gray-600">
                              {arrivalTime.date} • {flight.arrival_airport_code}{" "}
                              - {flight.arrival_airport}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Pricing Tab */}
                {activeTab === "pricing" && (
                  <div className="grid md:grid-cols-2 gap-6">
                    {/* Fare Details */}
                    <div className="bg-white rounded-lg p-4 border border-gray-200">
                      <h5 className="font-semibold text-gray-900 mb-3 flex items-center">
                        <CreditCard className="h-4 w-4 mr-2 text-blue-600" />
                        Chi tiết giá vé
                      </h5>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">
                            Giá cơ bản (Người lớn):
                          </span>
                          <span className="font-medium">
                            {formatPrice(flight.pricing.base_prices.adult)}
                          </span>
                        </div>
                        {flight.pricing.base_prices.child > 0 && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">
                              Giá cơ bản (Trẻ em):
                            </span>
                            <span className="font-medium">
                              {formatPrice(flight.pricing.base_prices.child)}
                            </span>
                          </div>
                        )}
                        <div className="flex justify-between">
                          <span className="text-gray-600">Thuế và phí:</span>
                          <span className="font-medium">
                            {formatPrice(flight.pricing.taxes.adult)}
                          </span>
                        </div>
                        <div className="border-t border-gray-200 pt-2 mt-2">
                          <div className="flex justify-between font-semibold text-base">
                            <span className="text-gray-900">Tổng cộng:</span>
                            <span className="text-orange-600">
                              {formatPrice(flight.pricing.grand_total)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Price Breakdown */}
                    <div className="bg-white rounded-lg p-4 border border-gray-200">
                      <h5 className="font-semibold text-gray-900 mb-3">
                        Phân tích giá
                      </h5>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">
                            Tổng giá (Người lớn):
                          </span>
                          <span className="font-medium">
                            {formatPrice(flight.pricing.total_prices.adult)}
                          </span>
                        </div>
                        {flight.pricing.total_prices.child > 0 && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">
                              Tổng giá (Trẻ em):
                            </span>
                            <span className="font-medium">
                              {formatPrice(flight.pricing.total_prices.child)}
                            </span>
                          </div>
                        )}
                        {flight.pricing.total_prices.infant > 0 && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">
                              Tổng giá (Em bé):
                            </span>
                            <span className="font-medium">
                              {formatPrice(flight.pricing.total_prices.infant)}
                            </span>
                          </div>
                        )}
                        <div className="text-xs text-gray-500 mt-2">
                          * Giá bao gồm tất cả thuế và phí
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Conditions Tab */}
                {activeTab === "conditions" && (
                  <div className="grid md:grid-cols-2 gap-6">
                    {/* Services & Baggage */}
                    <div className="bg-white rounded-lg p-4 border border-gray-200">
                      <h5 className="font-semibold text-gray-900 mb-3 flex items-center">
                        <Luggage className="h-4 w-4 mr-2 text-blue-600" />
                        Dịch vụ & Hành lý
                      </h5>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Hạng ghế:</span>
                          <span className="font-medium">
                            {flight.fare_class_details.cabin_class}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">
                            Hành lý xách tay:
                          </span>
                          <span className="font-medium">7kg (tiêu chuẩn)</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Hành lý ký gửi:</span>
                          <span className="font-medium">
                            {flight.fare_class_details.baggage_kg}
                          </span>
                        </div>
                        <div className="text-xs text-gray-500 mt-2">
                          {flight.fare_class_details.description}
                        </div>
                      </div>
                    </div>

                    {/* Terms & Conditions */}
                    <div className="bg-white rounded-lg p-4 border border-gray-200">
                      <h5 className="font-semibold text-gray-900 mb-3 flex items-center">
                        <Users className="h-4 w-4 mr-2 text-blue-600" />
                        Điều kiện vé
                      </h5>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Hoàn vé:</span>
                          <span
                            className={`font-medium ${
                              flight.fare_class_details.refundable
                                ? "text-green-600"
                                : "text-red-600"
                            }`}>
                            {flight.fare_class_details.refundable
                              ? "Được hoàn"
                              : "Không hoàn"}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Đổi vé:</span>
                          <span
                            className={`font-medium ${
                              flight.fare_class_details.changeable
                                ? "text-green-600"
                                : "text-red-600"
                            }`}>
                            {flight.fare_class_details.changeable
                              ? "Được đổi"
                              : "Không đổi"}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Mã hạng vé:</span>
                          <span className="font-medium">
                            {flight.fare_class_details.fare_class_code}
                          </span>
                        </div>
                        <div className="text-xs text-gray-500 mt-2">
                          💡 Lưu ý: Điều kiện có thể thay đổi theo chính sách
                          hãng hàng không
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                <div className="text-sm text-gray-600">
                  💡 Mẹo: Đặt ngay để đảm bảo có chỗ với giá tốt nhất
                </div>
                <div className="flex space-x-3">
                  <Button variant="outline" onClick={onToggleDetails}>
                    Thu gọn
                  </Button>
                  <Button
                    className="bg-orange-600 hover:bg-orange-700 px-8"
                    onClick={onSelect}>
                    Đặt chỗ ngay - {formatPrice(flight.pricing.grand_total)}
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
