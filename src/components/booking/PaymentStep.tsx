import React, { useState } from "react";
import { Button } from "../ui/button";
import {
  CreditCard,
  QrCode,
  Building2,
  ChevronLeft,
  ShieldCheck,
  Loader2,
} from "lucide-react";

interface PaymentStepProps {
  amount: number;
  currency: string;
  onSuccess: () => void;
  onBack: () => void;
  onMethodChange: (m: PaymentMethod) => void;
  method: PaymentMethod;
}
import type { PaymentMethod } from "../../shared/types/passenger.types";

const methods: {
  id: PaymentMethod;
  label: string;
  desc: string;
  icon: React.ReactNode;
  hint?: string;
}[] = [
  {
    id: "vnpay",
    label: "VNPay",
    desc: "QR / Ứng dụng ngân hàng",
    icon: <QrCode className="w-5 h-5" />,
    hint: "Không mất phí thêm",
  },
  {
    id: "card",
    label: "Thẻ ngân hàng",
    desc: "Visa / Master / ATM nội địa",
    icon: <CreditCard className="w-5 h-5" />,
    hint: "Xử lý tức thì",
  },
  {
    id: "office",
    label: "Tại văn phòng",
    desc: "Thanh toán trực tiếp Quận 1",
    icon: <Building2 className="w-5 h-5" />,
    hint: "Giữ chỗ 24h",
  },
];

const PaymentStep: React.FC<PaymentStepProps> = ({
  amount,
  currency,
  onSuccess,
  onBack,
  onMethodChange,
  method,
}) => {
  const [processing, setProcessing] = useState(false);
  const handlePay = () => {
    setProcessing(true);
    setTimeout(() => {
      setProcessing(false);
      onSuccess();
    }, 1200);
  };
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-blue-600" /> Thanh toán an toàn
        </h3>
        {processing && (
          <span className="text-xs px-2 py-1 rounded bg-blue-100 text-blue-600 animate-pulse">
            Đang xử lý...
          </span>
        )}
      </div>
      <div className="p-5 rounded-xl border bg-white shadow-sm space-y-6 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_80%_20%,rgba(59,130,246,0.08),transparent_60%)]" />
        {/* Amount Summary */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 relative z-10">
          <div>
            <span className="text-xs uppercase tracking-wide text-gray-500 font-medium">
              Tổng thanh toán
            </span>
            <div className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 text-transparent bg-clip-text">
              {amount.toLocaleString("vi-VN")} {currency}
            </div>
          </div>
          <div className="flex items-center gap-2 text-[11px] text-gray-500">
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded bg-gray-100">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-500" /> Bảo mật SSL
            </span>
            <span className="hidden sm:inline">|</span>
            <span>Không lưu thông tin thẻ.</span>
          </div>
        </div>
        {/* Methods */}
        <div className="space-y-4 relative z-10">
          <p className="text-xs text-gray-600 font-medium">Chọn phương thức:</p>
          <div className="grid md:grid-cols-3 gap-4">
            {methods.map((m) => {
              const active = method === m.id;
              return (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => onMethodChange(m.id)}
                  disabled={processing}
                  className={`group relative p-4 rounded-xl border text-left transition-all outline-none focus-visible:ring-2 focus-visible:ring-blue-400 ${
                    active
                      ? "border-blue-500 bg-blue-50 shadow-sm ring-1 ring-blue-200"
                      : "border-gray-200 hover:border-blue-300 hover:bg-blue-50/60"
                  }`}>
                  <div className="flex items-start justify-between gap-2">
                    <span
                      className={`p-2 rounded-md bg-gradient-to-br ${
                        active
                          ? "from-blue-600 to-indigo-600 text-white"
                          : "from-gray-100 to-gray-200 text-gray-600 group-hover:from-blue-100 group-hover:to-indigo-100 group-hover:text-blue-600"
                      }`}>
                      {m.icon}
                    </span>
                    {active && (
                      <span className="text-blue-600 text-xs font-semibold">
                        Đã chọn ✓
                      </span>
                    )}
                  </div>
                  <div className="mt-3 font-semibold text-sm text-gray-800 leading-snug">
                    {m.label}
                  </div>
                  <div className="text-[11px] mt-1 text-gray-500 leading-snug min-h-[28px]">
                    {m.desc}
                  </div>
                  {m.hint && (
                    <div
                      className={`mt-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium ${
                        active
                          ? "bg-blue-600 text-white"
                          : "bg-gray-100 text-gray-600 group-hover:bg-blue-100 group-hover:text-blue-700"
                      }`}>
                      {m.hint}
                    </div>
                  )}
                  <div
                    className={`absolute inset-0 rounded-xl border-2 pointer-events-none transition-opacity ${
                      active
                        ? "border-blue-500/60 opacity-100"
                        : "opacity-0 group-hover:opacity-40 border-blue-300"
                    }`}></div>
                </button>
              );
            })}
          </div>
          {method === "office" && (
            <div className="text-[11px] p-3 rounded-lg bg-amber-50/80 border border-amber-200 text-amber-800 backdrop-blur-sm">
              Vui lòng đến <b>Văn phòng Fly Journey</b>: 123 Nguyễn Huệ, P.Bến
              Nghé, Q.1, TP.HCM trong vòng <b>24h</b> để hoàn tất thanh toán.
              Sau thời gian này giữ chỗ sẽ tự hủy.
            </div>
          )}
        </div>
        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 pt-2 relative z-10">
          <Button
            variant="ghost"
            onClick={onBack}
            disabled={processing}
            className="sm:w-auto w-full inline-flex items-center gap-2">
            <ChevronLeft className="w-4 h-4" /> Quay lại
          </Button>
          <Button
            onClick={handlePay}
            disabled={processing}
            className="sm:w-auto w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 inline-flex items-center gap-2">
            {processing && <Loader2 className="w-4 h-4 animate-spin" />}
            {processing
              ? "Đang xử lý..."
              : method === "office"
              ? "Xác nhận giữ chỗ"
              : "Thanh toán"}
          </Button>
        </div>
      </div>
      {/* Small note */}
      <p className="text-[10px] text-gray-500 text-center max-w-md mx-auto">
        Bằng việc tiếp tục bạn đồng ý với các{" "}
        <span className="underline cursor-pointer hover:text-blue-600">
          Điều khoản & Chính sách hoàn hủy
        </span>{" "}
        của chúng tôi.
      </p>
    </div>
  );
};
export default PaymentStep;
