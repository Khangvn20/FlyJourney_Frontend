import React from "react";
import type {
  BookingRecord,
  PaymentMethod,
} from "../../../shared/types/passenger.types";
import PaymentStep from "../PaymentStep";

interface PaymentStepWrapperProps {
  bookingRecord: BookingRecord;
  selection: {
    totalPrice: number;
    currency: string;
  };
  addons: {
    extraPrice: number;
  };
  paymentMethod: PaymentMethod | null;
  onPaymentMethodChange: (method: PaymentMethod) => void;
  onSuccess: () => void;
  onBack: () => void;
  submitting: boolean;
  onNavigateToSearch: () => void;
}

export const PaymentStepWrapper: React.FC<PaymentStepWrapperProps> = ({
  bookingRecord,
  selection,
  addons,
  paymentMethod,
  onPaymentMethodChange,
  onSuccess,
  onBack,
  submitting,
  onNavigateToSearch,
}) => {
  return (
    <div className="grid gap-8 md:grid-cols-12 mt-6">
      <div className="md:col-span-8 relative space-y-6">
        <div className="relative overflow-hidden rounded-2xl border bg-white/90 backdrop-blur-sm p-5 shadow-sm">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50/70 via-transparent to-indigo-50/70 opacity-60" />
          <div className="relative z-10 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-indigo-600 to-violet-600 text-white text-sm font-bold shadow">
                💳
              </span>
              Khu vực thanh toán
            </h3>
            <span className="text-[11px] text-gray-500">
              Giữ chỗ ➝ Thanh toán
            </span>
          </div>
        </div>

        {submitting && (
          <div className="absolute inset-0 bg-white/60 flex items-center justify-center text-sm font-medium">
            Đang xử lý...
          </div>
        )}

        {bookingRecord.holdExpiresAt &&
        new Date(bookingRecord.holdExpiresAt).getTime() < Date.now() ? (
          <div className="p-4 border border-red-300 bg-red-50 rounded-lg text-sm text-red-700">
            Vé đã hết thời gian giữ chỗ. Vui lòng đặt lại.
            <button
              onClick={onNavigateToSearch}
              className="ml-2 underline font-medium">
              Quay lại tìm kiếm
            </button>
          </div>
        ) : (
          <PaymentStep
            amount={selection.totalPrice + addons.extraPrice}
            currency={selection.currency}
            onSuccess={onSuccess}
            onBack={onBack}
            method={paymentMethod || "vnpay"}
            onMethodChange={onPaymentMethodChange}
          />
        )}
      </div>

      <div className="md:col-span-4 hidden md:block">
        <div className="sticky top-4 space-y-4">
          <div className="relative overflow-hidden rounded-2xl border border-blue-100 bg-white/80 backdrop-blur-sm p-4 shadow-sm">
            <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full bg-blue-200/30 blur-3xl" />
            <div className="relative z-10 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-semibold tracking-wide text-blue-600 uppercase">
                  Thanh toán
                </h4>
                <span className="px-2 py-0.5 rounded-full bg-green-600 text-[10px] text-white font-medium">
                  Đã giữ chỗ
                </span>
              </div>
              <div className="text-[11px] font-medium text-gray-700 leading-relaxed">
                <div>Mã đặt chỗ: {bookingRecord.bookingId}</div>
                <div className="text-green-600">✓ Vé đã được giữ chỗ</div>
              </div>
              <div className="flex items-baseline justify-between pt-2">
                <span className="text-[10px] text-gray-400 font-medium">
                  Tổng thanh toán
                </span>
                <span className="text-lg font-bold text-blue-600">
                  {(selection.totalPrice + addons.extraPrice).toLocaleString(
                    "vi-VN"
                  )}{" "}
                  VND
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
