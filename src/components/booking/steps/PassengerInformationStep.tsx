import React, { useMemo } from "react";
import type { PassengerFormData } from "../../../shared/types/passenger.types";
import PassengerInfoCollector from "../PassengerInfoCollector";
import AddonsSelector from "../AddonsSelector";
import type { BookingSelection } from "../BookingSummary";

// Helper function to calculate total baggage cost from individual passenger selections
const calculatePassengerBaggageTotals = (passengers: PassengerFormData[]) => {
  // Group passengers by baggage type for smarter display
  const baggageGroups: {
    [key: string]: { passengers: string[]; price: number; extraKg: number };
  } = {};

  passengers.forEach((passenger, index) => {
    const passengerTitle = index === 0 ? "Người đặt" : `HK${index + 1}`;
    const baggage = passenger.extraBaggage;

    if (baggage && baggage.extraKg > 0) {
      const key = `${baggage.extraKg}kg-${baggage.price}`;
      if (!baggageGroups[key]) {
        baggageGroups[key] = {
          passengers: [],
          price: baggage.price,
          extraKg: baggage.extraKg,
        };
      }
      baggageGroups[key].passengers.push(passengerTitle);
    }
  });

  // Create smart display format
  const smartBaggageDisplay = Object.values(baggageGroups).map((group) => {
    const { passengers, price, extraKg } = group;
    let displayText: string;

    if (passengers.length === 1) {
      // Single passenger: "Người đặt: +15kg"
      displayText = `${passengers[0]}: +${extraKg}kg`;
    } else if (passengers.length <= 3) {
      // Few passengers: "HK2,HK3: +10kg"
      displayText = `${passengers.join(",")}: +${extraKg}kg`;
    } else {
      // Many passengers: "4 người: +15kg (HK2,HK3,HK4,HK5)"
      displayText = `${
        passengers.length
      } người: +${extraKg}kg (${passengers.join(",")})`;
    }

    return {
      display: displayText,
      price,
      count: passengers.length,
    };
  });

  const totalBaggagePrice = passengers.reduce((total, passenger) => {
    return total + (passenger.extraBaggage?.price || 0);
  }, 0);

  return { smartBaggageDisplay, totalBaggagePrice };
};

interface PassengerInformationStepProps {
  passengers: PassengerFormData[];
  onPassengerChange: (passengers: PassengerFormData[]) => void;
  passengerCounts: {
    adults: number;
    children: number;
    infants: number;
  };
  selection: BookingSelection;
  addons: {
    extraBaggageKg: number;
    services: string[];
    extraPrice: number;
  };
  onAddonsChange: (addons: {
    extraBaggageKg: number;
    services: string[];
    extraPrice: number;
  }) => void;
  note?: string;
  onNoteChange?: (note: string) => void;
  contactAddress?: string;
  onContactAddressChange?: (address: string) => void;
  onBack: () => void;
  onNext: () => void;
  isValid: boolean;
}

export const PassengerInformationStep: React.FC<
  PassengerInformationStepProps
> = ({
  passengers,
  onPassengerChange,
  passengerCounts,
  selection,
  addons,
  onAddonsChange,
  note,
  onNoteChange,
  contactAddress,
  onContactAddressChange,
  onBack,
  onNext,
  isValid,
}) => {
  // Calculate individual passenger baggage totals
  const { smartBaggageDisplay, totalBaggagePrice } = useMemo(
    () => calculatePassengerBaggageTotals(passengers),
    [passengers]
  );
  return (
    <div className="grid gap-8 md:grid-cols-12">
      <div className="md:col-span-8 space-y-6">
        {/* Passenger Information Section */}
        <PassengerInfoCollector
          passengers={passengers}
          onPassengerChange={(index: number, passenger: PassengerFormData) => {
            console.log(
              `🔧 PassengerInformationStep: Updating passenger ${index}:`,
              passenger
            );
            const updatedPassengers = [...passengers];
            updatedPassengers[index] = passenger;
            onPassengerChange(updatedPassengers);
          }}
          onBatchPassengerChange={(updatedPassengers: PassengerFormData[]) => {
            console.log(
              `🔧 PassengerInformationStep: Batch updating all passengers:`,
              updatedPassengers.length
            );
            onPassengerChange(updatedPassengers);
          }}
          passengerCounts={passengerCounts}
          contactAddress={contactAddress}
          onContactAddressChange={onContactAddressChange}
        />

        {/* Addons Selector for general services */}
        <div className="relative overflow-hidden rounded-2xl border bg-white/90 backdrop-blur-sm p-5 shadow-sm">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-50/70 via-transparent to-indigo-50/70 opacity-60" />
          <div className="relative z-10">
            <AddonsSelector
              baseFare={selection.totalPrice}
              passengerCounts={passengerCounts}
              onChange={onAddonsChange}
              value={{
                extraBaggageKg: addons.extraBaggageKg,
                services: addons.services,
              }}
            />
          </div>
        </div>

        {/* Customer Note Section */}
        <div className="relative overflow-hidden rounded-2xl border bg-white/90 backdrop-blur-sm p-5 shadow-sm">
          <div className="absolute inset-0 bg-gradient-to-br from-green-50/70 via-transparent to-emerald-50/70 opacity-60" />
          <div className="relative z-10 space-y-4">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-emerald-600 to-green-600 text-white text-sm font-bold shadow">
                💬
              </span>
              <h3 className="text-lg font-semibold text-gray-900">
                Ghi chú yêu cầu
              </h3>
              <span className="text-[11px] text-gray-500">(Tùy chọn)</span>
            </div>

            <div className="space-y-2">
              <label
                htmlFor="customer-note"
                className="block text-sm font-medium text-gray-700">
                Yêu cầu đặc biệt từ khách hàng
              </label>
              <textarea
                id="customer-note"
                value={note || ""}
                onChange={(e) => onNoteChange?.(e.target.value)}
                placeholder="Ví dụ: Không hút thuốc, yêu cầu ghế cửa sổ, cần hỗ trợ di chuyển, ăn chay..."
                className="w-full p-3 border border-gray-200 rounded-lg text-sm placeholder-gray-400 focus:border-emerald-500 focus:ring-emerald-500 resize-none"
                rows={3}
                maxLength={500}
              />
              <div className="flex justify-between text-xs text-gray-500">
                <span>
                  Ghi chú sẽ được gửi đến hãng hàng không và nhân viên hỗ trợ
                </span>
                <span>{(note || "").length}/500</span>
              </div>
            </div>
          </div>
        </div>

        {/* Validation Messages */}
        {passengers.length === 0 && (
          <div className="p-4 border border-yellow-300 bg-yellow-50 rounded-lg text-sm text-yellow-700">
            Đang tải thông tin hành khách...
          </div>
        )}

        {!contactAddress?.trim() && (
          <div className="p-4 border border-red-300 bg-red-50 rounded-lg text-sm text-red-700">
            ⚠️ Vui lòng nhập địa chỉ liên hệ của người đặt vé để tiếp tục
          </div>
        )}

        {!passengers[0]?.phone?.trim() && (
          <div className="p-4 border border-red-300 bg-red-50 rounded-lg text-sm text-red-700">
            ⚠️ Vui lòng nhập số điện thoại của người đặt vé để tiếp tục
          </div>
        )}

        {passengers.some(
          (passenger, index) => index > 0 && !passenger.phone?.trim()
        ) && (
          <div className="p-4 border border-yellow-300 bg-yellow-50 rounded-lg text-sm text-yellow-700">
            💡 Khuyến khích nhập số điện thoại cho các hành khách khác để liên
            hệ khẩn cấp
          </div>
        )}

        {!selection.outbound.flight_class_id && (
          <div className="p-4 border border-red-300 bg-red-50 rounded-lg text-sm text-red-700">
            Thiếu mã hạng vé – vui lòng tìm lại chuyến bay.
            <button onClick={onBack} className="underline font-medium ml-1">
              Quay lại tìm kiếm
            </button>
          </div>
        )}

        {/* Navigation */}
        <div className="flex justify-between pt-4">
          <button
            onClick={onBack}
            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors">
            ← Quay lại
          </button>

          <button
            onClick={onNext}
            disabled={!isValid}
            className={`px-6 py-2 rounded-lg transition-all duration-200 shadow-lg ${
              isValid
                ? "bg-gradient-to-r from-indigo-600 to-violet-600 text-white hover:from-indigo-700 hover:to-violet-700"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }`}>
            Xem tổng quan →
          </button>
        </div>
      </div>

      {/* Side Summary */}
      <div className="md:col-span-4 hidden md:block">
        <div className="sticky top-4 space-y-4">
          <div className="relative overflow-hidden rounded-2xl border border-blue-100 bg-gradient-to-br from-white to-blue-50/30 backdrop-blur-sm shadow-lg">
            <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full bg-blue-200/30 blur-3xl" />

            {/* Header */}
            <div className="relative z-10 p-4 pb-0">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-bold text-gray-800 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                  Chi tiết đặt vé
                </h4>
                {selection.tripType === "round-trip" && (
                  <span className="px-2 py-1 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 text-xs text-white font-medium shadow-sm">
                    Khứ hồi
                  </span>
                )}
              </div>

              {/* Flight Routes */}
              <div className="space-y-2 mb-4">
                <div className="flex items-center text-sm font-medium text-gray-700">
                  <span className="flex-1">
                    {selection.outbound.departure_airport_code} →{" "}
                    {selection.outbound.arrival_airport_code}
                  </span>
                  <span className="text-xs text-gray-500">
                    {new Date(
                      selection.outbound.departure_time
                    ).toLocaleDateString("vi-VN", {
                      day: "2-digit",
                      month: "2-digit",
                    })}
                  </span>
                </div>
                {selection.tripType === "round-trip" && selection.inbound && (
                  <div className="flex items-center text-sm font-medium text-gray-700">
                    <span className="flex-1">
                      {selection.inbound.departure_airport_code} →{" "}
                      {selection.inbound.arrival_airport_code}
                    </span>
                    <span className="text-xs text-gray-500">
                      {new Date(
                        selection.inbound.departure_time
                      ).toLocaleDateString("vi-VN", {
                        day: "2-digit",
                        month: "2-digit",
                      })}
                    </span>
                  </div>
                )}
              </div>

              {/* Passenger Count */}
              <div className="flex items-center justify-between py-2 border-t border-gray-100">
                <span className="text-xs text-gray-600">Hành khách</span>
                <span className="text-xs font-medium text-gray-700">
                  {passengerCounts.adults +
                    passengerCounts.children +
                    passengerCounts.infants}{" "}
                  người
                </span>
              </div>

              {/* Contact Phone */}
              {passengers[0]?.phone && (
                <div className="flex items-center justify-between py-2 border-t border-gray-100">
                  <span className="text-xs text-gray-600">SĐT liên hệ</span>
                  <span className="text-xs font-medium text-gray-700">
                    {passengers[0].phone}
                  </span>
                </div>
              )}
            </div>

            {/* Price Breakdown */}
            <div className="relative z-10 px-4 pb-4">
              <div className="bg-white/60 rounded-xl p-3 space-y-2">
                <h5 className="text-xs font-semibold text-gray-700 mb-2">
                  Chi tiết giá vé
                </h5>

                {/* Base Flight Prices */}
                <div className="space-y-1.5">
                  {passengerCounts.adults > 0 && (
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-600">
                        Người lớn × {passengerCounts.adults}
                      </span>
                      <span className="font-medium text-gray-800">
                        {Math.floor(
                          ((selection.totalPrice * 0.7) /
                            (passengerCounts.adults +
                              passengerCounts.children * 0.75 +
                              passengerCounts.infants * 0.1)) *
                            passengerCounts.adults
                        ).toLocaleString("vi-VN")}{" "}
                        ₫
                      </span>
                    </div>
                  )}

                  {passengerCounts.children > 0 && (
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-600">
                        Trẻ em × {passengerCounts.children}
                      </span>
                      <span className="font-medium text-gray-800">
                        {Math.floor(
                          ((selection.totalPrice * 0.7) /
                            (passengerCounts.adults +
                              passengerCounts.children * 0.75 +
                              passengerCounts.infants * 0.1)) *
                            passengerCounts.children *
                            0.75
                        ).toLocaleString("vi-VN")}{" "}
                        ₫
                      </span>
                    </div>
                  )}

                  {passengerCounts.infants > 0 && (
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-600">
                        Trẻ sơ sinh × {passengerCounts.infants}
                      </span>
                      <span className="font-medium text-gray-800">
                        {Math.floor(
                          ((selection.totalPrice * 0.7) /
                            (passengerCounts.adults +
                              passengerCounts.children * 0.75 +
                              passengerCounts.infants * 0.1)) *
                            passengerCounts.infants *
                            0.1
                        ).toLocaleString("vi-VN")}{" "}
                        ₫
                      </span>
                    </div>
                  )}

                  {/* Taxes & Fees */}
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-600">Thuế & phí</span>
                    <span className="font-medium text-gray-800">
                      {Math.floor(selection.totalPrice * 0.3).toLocaleString(
                        "vi-VN"
                      )}{" "}
                      ₫
                    </span>
                  </div>
                </div>

                {/* Baggage & Services Section */}
                {(totalBaggagePrice > 0 || addons.services.length > 0) && (
                  <>
                    <div className="border-t border-gray-200 pt-2 mt-2">
                      <h6 className="text-xs font-semibold text-gray-700 mb-1.5">
                        Dịch vụ thêm
                      </h6>

                      {/* Individual Passenger Baggage Details - Smart Display */}
                      {smartBaggageDisplay.length > 0 && (
                        <div className="space-y-1.5">
                          <div className="text-[10px] font-medium text-blue-700 uppercase tracking-wide">
                            Hành lý cá nhân
                          </div>
                          {smartBaggageDisplay.map((item, index) => (
                            <div
                              key={index}
                              className="flex justify-between text-xs py-0.5">
                              <span className="text-gray-600">
                                {item.display}
                              </span>
                              <span className="font-medium text-gray-800">
                                {(item.price * item.count).toLocaleString(
                                  "vi-VN"
                                )}{" "}
                                ₫
                              </span>
                            </div>
                          ))}
                        </div>
                      )}

                      {addons.services.length > 0 && (
                        <div className="space-y-1.5 pt-2">
                          <div className="text-[10px] font-medium text-green-700 uppercase tracking-wide">
                            Dịch vụ chung
                          </div>
                          {addons.services.map((service, index) => {
                            // Map service IDs to display names and prices
                            const serviceMap: Record<
                              string,
                              { name: string; price: number }
                            > = {
                              svc_fasttrack: {
                                name: "Fast Track an ninh",
                                price: 150000,
                              },
                              svc_meal: { name: "Suất ăn nóng", price: 120000 },
                              svc_combo: {
                                name: "Combo ăn + nước",
                                price: 180000,
                              },
                              svc_priority: {
                                name: "Ưu tiên lên máy bay",
                                price: 90000,
                              },
                            };

                            const serviceInfo = serviceMap[service] || {
                              name: service,
                              price: 150000,
                            };
                            const totalPassengers =
                              passengerCounts.adults +
                              passengerCounts.children +
                              passengerCounts.infants;

                            return (
                              <div
                                key={index}
                                className="flex justify-between text-xs py-0.5">
                                <span className="text-gray-600">
                                  {serviceInfo.name} ({totalPassengers} người)
                                </span>
                                <span className="font-medium text-gray-800">
                                  {(
                                    serviceInfo.price * totalPassengers
                                  ).toLocaleString("vi-VN")}{" "}
                                  ₫
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </>
                )}

                {/* Total */}
                <div className="border-t border-gray-200 pt-2 mt-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-gray-800">
                      Tổng cộng
                    </span>
                    <span className="text-lg font-bold text-blue-600">
                      {(
                        selection.totalPrice +
                        totalBaggagePrice +
                        addons.extraPrice
                      ).toLocaleString("vi-VN")}{" "}
                      ₫
                    </span>
                  </div>
                  <div className="text-[10px] text-gray-500 text-right mt-0.5">
                    Đã bao gồm VAT
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
