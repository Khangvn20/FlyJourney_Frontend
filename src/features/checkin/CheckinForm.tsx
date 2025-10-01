import React, { useState } from "react";
import {
  Search,
  User,
  Hash,
  AlertCircle,
  CheckCircle,
  CreditCard,
} from "lucide-react";

interface CheckinFormProps {
  onSubmit: (pnrCode: string, email: string, fullName: string) => void;
  loading?: boolean;
  error?: string | null;
  onDevTest?: () => void;
}

const CheckinForm: React.FC<CheckinFormProps> = ({
  onSubmit,
  loading = false,
  error = null,
  onDevTest,
}) => {
  const [pnrCode, setPnrCode] = useState("");
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const isFormValid =
    pnrCode.trim().length >= 6 &&
    email.trim().includes("@") &&
    fullName.trim().length >= 2;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isFormValid && !loading) {
      // Submit with original PNR code without cleaning
      onSubmit(pnrCode.trim().toUpperCase(), email.trim(), fullName.trim());
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header Section */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl shadow-lg mb-4">
            <CreditCard className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Check-in Online
          </h1>
          <p className="text-gray-600 leading-relaxed">
            Nhập thông tin đặt chỗ để bắt đầu quá trình check-in
          </p>
        </div>

        {/* Main Form Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          {/* Card Header */}
          <div className="bg-gradient-to-r from-blue-500 to-indigo-600 px-6 py-4">
            <h2 className="text-xl font-semibold text-white flex items-center gap-2">
              <Search className="h-5 w-5" />
              Tìm kiếm chuyến bay
            </h2>
          </div>

          {/* Form Content */}
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* PNR Code Field */}
            <div className="space-y-2">
              <label
                htmlFor="pnrCode"
                className="block text-sm font-semibold text-gray-700">
                Mã đặt chỗ (PNR) *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Hash
                    className={`h-5 w-5 transition-colors ${
                      focusedField === "pnrCode"
                        ? "text-blue-500"
                        : "text-gray-400"
                    }`}
                  />
                </div>
                <input
                  id="pnrCode"
                  type="text"
                  value={pnrCode}
                  onChange={(e) => setPnrCode(e.target.value.toUpperCase())}
                  onFocus={() => setFocusedField("pnrCode")}
                  onBlur={() => setFocusedField(null)}
                  placeholder="VD: ABC123"
                  className={`w-full pl-10 pr-4 py-3 border-2 rounded-xl transition-all duration-200 ${
                    focusedField === "pnrCode"
                      ? "border-blue-500 ring-2 ring-blue-200 bg-blue-50/50"
                      : "border-gray-200 hover:border-gray-300"
                  } focus:outline-none`}
                  maxLength={10}
                  required
                />
              </div>
              <p className="text-xs text-gray-500 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                Mã gồm 6-10 ký tự
              </p>
            </div>

            {/* Email Field */}
            <div className="space-y-2">
              <label
                htmlFor="email"
                className="block text-sm font-semibold text-gray-700">
                Email đặt vé *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User
                    className={`h-5 w-5 transition-colors ${
                      focusedField === "email"
                        ? "text-blue-500"
                        : "text-gray-400"
                    }`}
                  />
                </div>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onFocus={() => setFocusedField("email")}
                  onBlur={() => setFocusedField(null)}
                  placeholder="VD: example@gmail.com"
                  className={`w-full pl-10 pr-4 py-3 border-2 rounded-xl transition-all duration-200 ${
                    focusedField === "email"
                      ? "border-blue-500 ring-2 ring-blue-200 bg-blue-50/50"
                      : "border-gray-200 hover:border-gray-300"
                  } focus:outline-none`}
                  required
                />
              </div>
              <p className="text-xs text-gray-500 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                Email dùng khi đặt vé máy bay
              </p>
            </div>

            {/* Full Name Field */}
            <div className="space-y-2">
              <label
                htmlFor="fullName"
                className="block text-sm font-semibold text-gray-700">
                Họ tên đầy đủ *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User
                    className={`h-5 w-5 transition-colors ${
                      focusedField === "fullName"
                        ? "text-blue-500"
                        : "text-gray-400"
                    }`}
                  />
                </div>
                <input
                  id="fullName"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  onFocus={() => setFocusedField("fullName")}
                  onBlur={() => setFocusedField(null)}
                  placeholder="VD: Nguyễn Văn An"
                  className={`w-full pl-10 pr-4 py-3 border-2 rounded-xl transition-all duration-200 ${
                    focusedField === "fullName"
                      ? "border-blue-500 ring-2 ring-blue-200 bg-blue-50/50"
                      : "border-gray-200 hover:border-gray-300"
                  } focus:outline-none`}
                  required
                />
              </div>
              <p className="text-xs text-gray-500 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                Nhập họ tên như trên vé máy bay
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                <div className="flex items-center gap-2 text-red-800">
                  <AlertCircle className="h-5 w-5 text-red-500" />
                  <span className="font-medium">Lỗi</span>
                </div>
                <p className="text-red-700 mt-1 text-sm">{error}</p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={!isFormValid || loading}
              className={`w-full py-3 px-4 rounded-xl font-semibold text-white transition-all duration-200 transform ${
                !isFormValid || loading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl"
              }`}>
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Đang tìm kiếm...</span>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2">
                  <Search className="h-5 w-5" />
                  <span>Tìm chuyến bay</span>
                </div>
              )}
            </button>

            {/* Form Validation Indicators */}
            {(pnrCode || email || fullName) && (
              <div className="flex items-center justify-center gap-4 text-xs">
                <div
                  className={`flex items-center gap-1 ${
                    pnrCode.trim().length >= 6
                      ? "text-green-600"
                      : "text-gray-400"
                  }`}>
                  <CheckCircle className="h-3 w-3" />
                  <span>Mã PNR</span>
                </div>
                <div
                  className={`flex items-center gap-1 ${
                    email.trim().includes("@")
                      ? "text-green-600"
                      : "text-gray-400"
                  }`}>
                  <CheckCircle className="h-3 w-3" />
                  <span>Email</span>
                </div>
                <div
                  className={`flex items-center gap-1 ${
                    fullName.trim().length >= 2
                      ? "text-green-600"
                      : "text-gray-400"
                  }`}>
                  <CheckCircle className="h-3 w-3" />
                  <span>Họ tên</span>
                </div>
              </div>
            )}

            {/* Dev Test Button */}
            {onDevTest && (
              <div className="pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={onDevTest}
                  className="w-full py-2 px-4 bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium rounded-lg transition-colors duration-200">
                  🔧 Test với dữ liệu mẫu
                </button>
              </div>
            )}
          </form>
        </div>

        {/* Help Section */}
        <div className="mt-6 bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200 p-4">
          <h3 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-blue-500" />
            Cần hỗ trợ?
          </h3>
          <div className="space-y-2 text-sm text-gray-600">
            <p>• Mã PNR được gửi qua email sau khi đặt vé thành công</p>
            <p>• Email phải trùng với email đã dùng để đặt vé</p>
            <p>• Họ tên phải khớp chính xác với thông tin trên vé máy bay</p>
            <p>• Check-in mở cửa 24 giờ trước giờ khởi hành dự kiến</p>
          </div>
        </div>

        {/* Security Notice */}
        <div className="mt-4 text-center">
          <p className="text-xs text-gray-500">
            🔒 Thông tin của bạn được bảo mật theo tiêu chuẩn quốc tế
          </p>
        </div>
      </div>
    </div>
  );
};

export default CheckinForm;
