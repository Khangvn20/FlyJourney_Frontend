import React, { useState, useEffect } from "react";
import { PackagePlus, Check, ChevronDown, Info } from "lucide-react";
import { SERVICE_OPTIONS } from "./bookingAddons.constants";

export interface BaggageOption {
  id: string;
  label: string;
  extraKg: number; // Additional checked baggage over base allowance
  price: number; // Price in VND
  desc?: string;
}
export interface ServiceOption {
  id: string;
  label: string;
  price: number;
  desc?: string;
}

interface AddonsSelectorProps {
  baseFare: number;
  passengerCounts?: {
    adults: number;
    children: number;
    infants: number;
  };
  onChange: (addons: {
    extraBaggageKg: number;
    services: string[];
    extraPrice: number;
  }) => void;
  value?: { extraBaggageKg?: number; services?: string[] };
}

// constants imported

const AddonsSelector: React.FC<AddonsSelectorProps> = ({
  //baseFare,
  passengerCounts = { adults: 1, children: 0, infants: 0 },
  onChange,
  value,
}) => {
  const [openServices, setOpenServices] = useState(true);
  const [services, setServices] = useState<Set<string>>(
    new Set(value?.services || [])
  );

  const totalPassengers =
    passengerCounts.adults + passengerCounts.children + passengerCounts.infants;
  const servicesList = SERVICE_OPTIONS.filter((s) => services.has(s.id));

  // Only services pricing - baggage is handled per passenger
  const extraPrice =
    servicesList.reduce((s, c) => s + c.price, 0) * totalPassengers;

  useEffect(() => {
    onChange({
      extraBaggageKg: 0, // No longer handled here
      services: Array.from(services),
      extraPrice,
    });
  }, [services, extraPrice, onChange]);

  const toggleService = (id: string) => {
    setServices((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <div className="space-y-5">
      {/* Services Only - Baggage selection is handled individually per passenger */}
      <div className="rounded-xl border bg-white shadow-sm overflow-hidden">
        <button
          type="button"
          onClick={() => setOpenServices((o) => !o)}
          className="w-full flex items-center justify-between px-4 py-3 bg-gradient-to-r from-violet-600 to-indigo-600 text-white">
          <span className="flex items-center gap-2 font-semibold text-sm">
            <PackagePlus className="w-4 h-4" /> Dịch vụ chung
          </span>
          <ChevronDown
            className={`w-4 h-4 transition-transform ${
              openServices ? "rotate-180" : ""
            }`}
          />
        </button>
        <div
          className={`grid transition-[grid-template-rows] ${
            openServices ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
          } duration-300`}>
          <div className="overflow-hidden">
            <div className="p-4 space-y-4">
              <div className="text-[11px] text-gray-600 flex items-start gap-2">
                <Info className="w-3.5 h-3.5 text-indigo-500 flex-shrink-0 mt-0.5" />
                <div>
                  Chọn các dịch vụ bổ sung áp dụng cho tất cả hành khách.
                  <br />
                  <strong>Lưu ý:</strong> Hành lý ký gửi được chọn riêng cho
                  từng hành khách ở phần trên.
                </div>
              </div>
              <div className="grid md:grid-cols-4 gap-3">
                {SERVICE_OPTIONS.map((svc) => {
                  const active = services.has(svc.id);
                  return (
                    <button
                      key={svc.id}
                      type="button"
                      onClick={() => toggleService(svc.id)}
                      className={`relative p-3 rounded-lg border text-left text-xs font-medium transition group ${
                        active
                          ? "border-indigo-500 bg-indigo-50 shadow-sm"
                          : "border-gray-200 hover:border-indigo-400 hover:bg-indigo-50/40"
                      }`}>
                      <div className="flex items-start justify-between gap-2">
                        <span>{svc.label}</span>
                        {active && (
                          <Check className="w-4 h-4 text-indigo-600" />
                        )}
                      </div>
                      <div className="mt-1 text-[10px] text-gray-500">
                        +{svc.price.toLocaleString("vi-VN")} ₫/người
                        {totalPassengers > 1 && (
                          <span className="text-blue-600">
                            {" "}
                            (
                            {(svc.price * totalPassengers).toLocaleString(
                              "vi-VN"
                            )}{" "}
                            ₫ tổng)
                          </span>
                        )}
                      </div>
                      <div
                        className={`absolute inset-0 rounded-lg border-2 pointer-events-none ${
                          active
                            ? "border-indigo-500"
                            : "border-transparent group-hover:border-indigo-300/60"
                        }`}></div>
                    </button>
                  );
                })}
              </div>
              {services.size > 0 && (
                <div className="text-[11px] text-gray-600">
                  Đã chọn: {servicesList.map((s) => s.label).join(", ")}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      {/* Enhanced Summary */}
      {/* <div className="p-4 rounded-lg bg-gradient-to-r from-gray-50 to-gray-100 border space-y-2">
        <div className="text-[11px] text-gray-600">
          Chi tiết phụ thu:
        </div>
        <div className="space-y-1 text-[10px]">
          {baggageOpt.extraKg > 0 && (
            <div className="flex justify-between">
              <span>Hành lý +{baggageOpt.extraKg}kg (cá nhân)</span>
              <span className="font-medium">{baggageOpt.price.toLocaleString("vi-VN")} ₫/người</span>
            </div>
          )}
          {servicesList.map((svc) => (
            <div key={svc.id} className="flex justify-between">
              <span>{svc.label} ({totalPassengers} người)</span>
              <span className="font-medium">{(svc.price * totalPassengers).toLocaleString("vi-VN")} ₫</span>
            </div>
          ))}
        </div>
        <div className="border-t pt-2 flex items-center justify-between">
          <span className="text-[11px] font-semibold">
            Tổng phụ thu:
          </span>
          <b className="text-blue-600 text-sm">
            {extraPrice.toLocaleString("vi-VN")} ₫
          </b>
        </div>
        <div className="text-[10px] text-gray-500 text-center">
          Giá tạm tính: <b className="text-gray-700">{(baseFare + extraPrice).toLocaleString("vi-VN")} ₫</b>
        </div>
      </div> */}
    </div>
  );
};

export default AddonsSelector;
