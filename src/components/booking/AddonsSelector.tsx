import React, { useState, useEffect } from "react";
import { PackagePlus, Briefcase, Check, ChevronDown, Info } from "lucide-react";

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
  onChange: (addons: {
    extraBaggageKg: number;
    services: string[];
    extraPrice: number;
  }) => void;
  value?: { extraBaggageKg?: number; services?: string[] };
}

// Mock catalog (could later be fetched per airline / route)
const BAGGAGE_OPTIONS: BaggageOption[] = [
  { id: "none", label: "Không mua thêm", extraKg: 0, price: 0 },
  { id: "bg10", label: "+10kg ký gửi", extraKg: 10, price: 190000 },
  { id: "bg15", label: "+15kg ký gửi", extraKg: 15, price: 260000 },
  { id: "bg20", label: "+20kg ký gửi", extraKg: 20, price: 330000 },
];

const SERVICE_OPTIONS: ServiceOption[] = [
  { id: "svc_fasttrack", label: "Fast Track an ninh", price: 150000 },
  { id: "svc_meal", label: "Suất ăn nóng", price: 120000 },
  { id: "svc_combo", label: "Combo ăn + nước", price: 180000 },
  { id: "svc_priority", label: "Ưu tiên lên máy bay", price: 90000 },
];

const AddonsSelector: React.FC<AddonsSelectorProps> = ({
  baseFare,
  onChange,
  value,
}) => {
  const [openBaggage, setOpenBaggage] = useState(true);
  const [openServices, setOpenServices] = useState(true);
  const [baggage, setBaggage] = useState<string>(
    value?.extraBaggageKg
      ? BAGGAGE_OPTIONS.find((o) => o.extraKg === value.extraBaggageKg)?.id ||
          "none"
      : "none"
  );
  const [services, setServices] = useState<Set<string>>(
    new Set(value?.services || [])
  );

  const baggageOpt =
    BAGGAGE_OPTIONS.find((b) => b.id === baggage) || BAGGAGE_OPTIONS[0];
  const servicesList = SERVICE_OPTIONS.filter((s) => services.has(s.id));
  const extraPrice =
    baggageOpt.price + servicesList.reduce((s, c) => s + c.price, 0);

  useEffect(() => {
    onChange({
      extraBaggageKg: baggageOpt.extraKg,
      services: Array.from(services),
      extraPrice,
    });
  }, [baggageOpt, services, extraPrice, onChange]);

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
      {/* Baggage */}
      <div className="rounded-xl border bg-white shadow-sm overflow-hidden">
        <button
          type="button"
          onClick={() => setOpenBaggage((o) => !o)}
          className="w-full flex items-center justify-between px-4 py-3 bg-gradient-to-r from-sky-600 to-blue-600 text-white">
          <span className="flex items-center gap-2 font-semibold text-sm">
            <Briefcase className="w-4 h-4" /> Hành lý (Upsell)
          </span>
          <ChevronDown
            className={`w-4 h-4 transition-transform ${
              openBaggage ? "rotate-180" : ""
            }`}
          />
        </button>
        <div
          className={`grid transition-[grid-template-rows] ${
            openBaggage ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
          } duration-300`}>
          <div className="overflow-hidden">
            <div className="p-4 space-y-4">
              <div className="text-[11px] text-gray-600 flex items-start gap-2">
                <Info className="w-3.5 h-3.5 text-sky-500" /> Giá đã gồm 7kg
                xách tay + 20kg ký gửi cơ bản (ví dụ). Mua thêm để tiết kiệm nếu
                có hành lý vượt mức.
              </div>
              <div className="grid md:grid-cols-4 gap-3">
                {BAGGAGE_OPTIONS.map((opt) => {
                  const active = opt.id === baggage;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setBaggage(opt.id)}
                      className={`relative p-3 rounded-lg border text-left text-xs font-medium transition group ${
                        active
                          ? "border-blue-500 bg-blue-50 shadow-sm"
                          : "border-gray-200 hover:border-blue-400 hover:bg-blue-50/40"
                      }`}>
                      <div className="flex items-start justify-between gap-2">
                        <span>{opt.label}</span>
                        {active && <Check className="w-4 h-4 text-blue-600" />}
                      </div>
                      <div className="mt-1 text-[10px] text-gray-500">
                        {opt.price === 0
                          ? "Đã bao gồm"
                          : `+${opt.price.toLocaleString("vi-VN")} VND`}
                      </div>
                      <div
                        className={`absolute inset-0 rounded-lg border-2 pointer-events-none ${
                          active
                            ? "border-blue-500"
                            : "border-transparent group-hover:border-blue-300/60"
                        }`}></div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Services */}
      <div className="rounded-xl border bg-white shadow-sm overflow-hidden">
        <button
          type="button"
          onClick={() => setOpenServices((o) => !o)}
          className="w-full flex items-center justify-between px-4 py-3 bg-gradient-to-r from-violet-600 to-indigo-600 text-white">
          <span className="flex items-center gap-2 font-semibold text-sm">
            <PackagePlus className="w-4 h-4" /> Dịch vụ thêm
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
                        +{svc.price.toLocaleString("vi-VN")} VND
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
      {/* Summary */}
      <div className="p-4 rounded-lg bg-gradient-to-r from-gray-50 to-gray-100 border text-[11px] flex flex-wrap items-center gap-4">
        <span>
          Tổng phụ thu:{" "}
          <b className="text-blue-600">
            {extraPrice.toLocaleString("vi-VN")} VND
          </b>
        </span>
        <span className="text-gray-400">|</span>
        <span>
          Giá tạm tính:{" "}
          <b>{(baseFare + extraPrice).toLocaleString("vi-VN")} VND</b>
        </span>
      </div>
    </div>
  );
};

export default AddonsSelector;
