import React, { useMemo } from "react";
import type { PassengerFormData } from "../../../shared/types/passenger.types";
import PassengerInfoCollector from "../PassengerInfoCollector";
import AddonsSelector from "../AddonsSelector";
import { SERVICE_OPTIONS } from "../bookingAddons.constants";
import type { BookingSelection } from "../BookingSummary";

// ===============================
// Helpers
// ===============================
const calculatePassengerBaggageTotals = (passengers: PassengerFormData[]) => {
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

  const smartBaggageDisplay = Object.values(baggageGroups).map((group) => {
    const { passengers, price, extraKg } = group;
    let displayText: string;

    if (passengers.length === 1) {
      displayText = `${passengers[0]}: +${extraKg}kg`;
    } else if (passengers.length <= 3) {
      displayText = `${passengers.join(",")}: +${extraKg}kg`;
    } else {
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
    extraPrice: number; // vẫn giữ để tương thích, nhưng subtotal services sẽ tính lại từ SERVICE_OPTIONS
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
  // 1) Hành lý (theo từng hành khách)
  const { smartBaggageDisplay, totalBaggagePrice } = useMemo(
    () => calculatePassengerBaggageTotals(passengers),
    [passengers]
  );

  // 2) Fare breakdown (giá vé & thuế/phí), Services breakdown
  const {
    totalPassengers,
    taxesAndFees,
    paxAllocation,
    servicesDetail,
    servicesTotal,
    fareTotal,
    grandTotal,
  } = useMemo(() => {
    const totalPassengers =
      passengerCounts.adults +
      passengerCounts.children +
      passengerCounts.infants;

    // Giả định: selection.totalPrice đã bao gồm thuế & phí
    // Ta tách 70% là fare cơ bản, 30% là thuế/phí để hiển thị rõ ràng.
    const baseFareTotal = Math.floor(selection.totalPrice * 0.7);
    const taxesAndFees = selection.totalPrice - baseFareTotal;

    // Phân bổ minh họa theo hệ số (adult:1, child:0.75, infant:0.1)
    const weightAdults = passengerCounts.adults;
    const weightChildren = passengerCounts.children * 0.75;
    const weightInfants = passengerCounts.infants * 0.1;
    const totalWeight = Math.max(
      1,
      weightAdults + weightChildren + weightInfants
    );

    const perUnit = baseFareTotal / totalWeight;

    const adultsFare = Math.floor(perUnit * weightAdults);
    const childrenFare = Math.floor(perUnit * passengerCounts.children * 0.75);
    const infantsFare = Math.floor(perUnit * passengerCounts.infants * 0.1);

    const paxAllocation = {
      adults: adultsFare,
      children: childrenFare,
      infants: infantsFare,
    };

    // Dịch vụ chung: tính lại từ SERVICE_OPTIONS để đảm bảo chính xác
    const servicesDetail = addons.services.map((serviceId) => {
      const service = SERVICE_OPTIONS.find((s) => s.id === serviceId);
      const name = service?.label || serviceId;
      const price = service?.price ?? 50000;
      const subtotal = price * totalPassengers;
      return {
        id: serviceId,
        name,
        unit: price,
        qty: totalPassengers,
        subtotal,
      };
    });

    const servicesTotal = servicesDetail.reduce(
      (sum, s) => sum + s.subtotal,
      0
    );

    const fareTotal = selection.totalPrice; // đã gồm thuế/phí
    const grandTotal = fareTotal + totalBaggagePrice + servicesTotal;

    return {
      totalPassengers,
      baseFareTotal,
      taxesAndFees,
      paxAllocation,
      servicesDetail,
      servicesTotal,
      fareTotal,
      grandTotal,
    };
  }, [
    addons.services,
    passengerCounts,
    selection.totalPrice,
    totalBaggagePrice,
  ]);

  return (
    <div className="grid gap-8 md:grid-cols-12">
      {/* Left content */}
      <div className="md:col-span-8 space-y-6">
        {/* Passenger Information Section */}
        <PassengerInfoCollector
          passengers={passengers}
          onPassengerChange={(index: number, passenger: PassengerFormData) => {
            const updatedPassengers = [...passengers];
            updatedPassengers[index] = passenger;
            onPassengerChange(updatedPassengers);
          }}
          onBatchPassengerChange={(updatedPassengers: PassengerFormData[]) => {
            onPassengerChange(updatedPassengers);
          }}
          passengerCounts={passengerCounts}
          contactAddress={contactAddress}
          onContactAddressChange={onContactAddressChange}
        />

        {/* Addons Selector */}
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

      {/* Right summary */}
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

              {/* Flight routes */}
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

              {/* Passenger Count & Contact */}
              <div className="flex items-center justify-between py-2 border-t border-gray-100">
                <span className="text-xs text-gray-600">Hành khách</span>
                <span className="text-xs font-medium text-gray-700">
                  {totalPassengers} người
                </span>
              </div>

              {passengers[0]?.phone && (
                <div className="flex items-center justify-between py-2 border-t border-gray-100">
                  <span className="text-xs text-gray-600">SĐT liên hệ</span>
                  <span className="text-xs font-medium text-gray-700">
                    {passengers[0].phone}
                  </span>
                </div>
              )}
            </div>

            {/* PRICE GROUPS */}
            <div className="relative z-10 px-4 pb-4">
              <div className="bg-white/70 rounded-xl p-3 space-y-3">
                {/* GROUP 1: GIÁ VÉ (TỔNG) */}
                <div className="rounded-lg border border-blue-100 bg-blue-50/40 p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 font-semibold tracking-wide">
                        GIÁ VÉ (TỔNG)
                      </span>
                    </div>
                    <div className="text-sm font-extrabold text-blue-700">
                      {fareTotal.toLocaleString("vi-VN")} ₫
                    </div>
                  </div>

                  <div className="mt-2 space-y-1.5">
                    {passengerCounts.adults > 0 && (
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-600">
                          Người lớn × {passengerCounts.adults}
                        </span>
                        <span className="font-medium text-gray-800">
                          {paxAllocation.adults.toLocaleString("vi-VN")} ₫
                        </span>
                      </div>
                    )}

                    {passengerCounts.children > 0 && (
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-600">
                          Trẻ em × {passengerCounts.children}
                        </span>
                        <span className="font-medium text-gray-800">
                          {paxAllocation.children.toLocaleString("vi-VN")} ₫
                        </span>
                      </div>
                    )}

                    {passengerCounts.infants > 0 && (
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-600">
                          Trẻ sơ sinh × {passengerCounts.infants}
                        </span>
                        <span className="font-medium text-gray-800">
                          {paxAllocation.infants.toLocaleString("vi-VN")} ₫
                        </span>
                      </div>
                    )}

                    <div className="flex justify-between text-[11px] pt-1 border-t border-gray-200/70 mt-1">
                      <span className="text-gray-600">Thuế & phí</span>
                      <span className="font-medium text-gray-800">
                        {taxesAndFees.toLocaleString("vi-VN")} ₫
                      </span>
                    </div>
                  </div>
                </div>

                {/* GROUP 2: HÀNH LÝ */}
                <div className="rounded-lg border border-amber-100 bg-amber-50/40 p-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-semibold tracking-wide">
                      HÀNH LÝ (TÁCH RIÊNG)
                    </span>
                    <div className="text-sm font-extrabold text-amber-700">
                      {totalBaggagePrice.toLocaleString("vi-VN")} ₫
                    </div>
                  </div>

                  {smartBaggageDisplay.length > 0 ? (
                    <div className="mt-2 space-y-1.5">
                      {smartBaggageDisplay.map((item, index) => (
                        <div
                          key={index}
                          className="flex justify-between text-xs">
                          <span className="text-gray-600">{item.display}</span>
                          <span className="font-medium text-gray-800">
                            {(item.price * item.count).toLocaleString("vi-VN")}{" "}
                            ₫
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="mt-2 text-[11px] text-gray-500">
                      Chưa chọn thêm hành lý.
                    </div>
                  )}
                </div>

                {/* GROUP 3: DỊCH VỤ CHUNG */}
                <div className="rounded-lg border border-emerald-100 bg-emerald-50/40 p-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-semibold tracking-wide">
                      DỊCH VỤ CHUNG
                    </span>
                    <div className="text-sm font-extrabold text-emerald-700">
                      {servicesTotal.toLocaleString("vi-VN")} ₫
                    </div>
                  </div>

                  {servicesDetail.length > 0 ? (
                    <div className="mt-2 space-y-1.5">
                      {servicesDetail.map((s) => (
                        <div
                          key={s.id}
                          className="flex justify-between text-xs">
                          <span className="text-gray-600">
                            {s.name} ({s.qty} người)
                          </span>
                          <span className="font-medium text-gray-800">
                            {s.subtotal.toLocaleString("vi-VN")} ₫
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="mt-2 text-[11px] text-gray-500">
                      Chưa chọn dịch vụ thêm.
                    </div>
                  )}
                </div>

                {/* GRAND TOTAL */}
                <div className="border-t border-gray-200 pt-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-extrabold text-gray-900">
                      Tổng cộng
                    </span>
                    <span className="text-xl font-black text-blue-700 tracking-tight">
                      {grandTotal.toLocaleString("vi-VN")} ₫
                    </span>
                  </div>
                  <div className="text-[10px] text-gray-500 text-right mt-0.5">
                    Đã bao gồm VAT
                  </div>
                </div>
              </div>
            </div>
            {/* /PRICE GROUPS */}
          </div>
        </div>
      </div>
    </div>
  );
};
