import React, { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Mail, ArrowLeft, KeyRound, Shield, Eye, EyeOff } from "lucide-react";
import {
  validatePassword,
  getPasswordStrength,
} from "../utils/userMenuValidation";

interface ForgotPasswordFormProps {
  onSubmit: (data: {
    email: string;
    newPassword?: string;
    otp?: string;
  }) => Promise<void>;
  isLoading?: boolean;
  onBack: () => void;
}

type ForgotPasswordStep = "email" | "otpAndPassword";

const ForgotPasswordForm: React.FC<ForgotPasswordFormProps> = ({
  onSubmit,
  isLoading = false,
  onBack,
}) => {
  const [step, setStep] = useState<ForgotPasswordStep>("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordTouched, setPasswordTouched] = useState(false);
  const [confirmPasswordTouched, setConfirmPasswordTouched] = useState(false);

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await onSubmit({ email });
      setStep("otpAndPassword");
    } catch (error) {
      console.error("Reset password email failed:", error);
    }
  };

  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      alert("Mật khẩu không khớp!");
      return;
    }
    if (otp.length !== 6) {
      alert("Vui lòng nhập đúng 6 số OTP!");
      return;
    }

    // Validate password strength
    const passwordValidation = validatePassword(newPassword);
    if (!passwordValidation.isValid) {
      alert(passwordValidation.message);
      return;
    }

    try {
      await onSubmit({ email, newPassword, otp });
    } catch (error) {
      console.error("Reset password failed:", error);
    }
  };

  // Get password validation and strength
  const passwordValidation = validatePassword(newPassword);
  const passwordStrength = getPasswordStrength(newPassword);
  const isPasswordValid = passwordValidation.isValid;
  const isConfirmValid = confirmPassword && newPassword === confirmPassword;

  const renderEmailStep = () => (
    <div className="h-full flex flex-col justify-between">
      <form onSubmit={handleEmailSubmit} className="space-y-6">
        <div className="text-center space-y-4 mb-8">
          <div className="w-20 h-20 bg-gradient-to-br from-orange-100 to-red-100 rounded-full flex items-center justify-center mx-auto shadow-lg">
            <KeyRound className="w-10 h-10 text-orange-600" />
          </div>
          <div className="space-y-2">
            <h3 className="text-2xl font-bold text-gray-900">Quên mật khẩu?</h3>
            <p className="text-gray-600 max-w-sm mx-auto leading-relaxed">
              Đừng lo lắng! Nhập email của bạn và chúng tôi sẽ gửi mã xác thực
              để khôi phục tài khoản
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label
              htmlFor="reset-email"
              className="text-sm font-semibold text-slate-700 flex items-center gap-2">
              <Mail className="h-4 w-4 text-orange-600" />
              Địa chỉ email
            </Label>
            <div className="relative group">
              <Input
                id="reset-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="example@email.com"
                className="h-12 pl-4 pr-4 text-base border-2 border-slate-200 focus:border-orange-400 focus:ring-4 focus:ring-orange-100 transition-all duration-300 rounded-xl bg-white/80 backdrop-blur-sm"
                disabled={isLoading}
                required
              />
              {email && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-4 pt-2">
          <Button
            type="submit"
            disabled={isLoading || !email}
            className="w-full h-12 bg-gradient-to-r from-orange-500 via-orange-600 to-red-600 hover:from-orange-600 hover:via-orange-700 hover:to-red-700 text-white font-semibold text-base rounded-xl shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-300 disabled:transform-none disabled:hover:scale-100">
            {isLoading ? (
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Đang gửi mã xác thực...</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 justify-center">
                <Mail className="w-5 h-5" />
                <span>Gửi mã xác thực</span>
              </div>
            )}
          </Button>

          <Button
            type="button"
            variant="ghost"
            onClick={onBack}
            className="w-full h-12 flex items-center justify-center gap-2 text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded-xl transition-all duration-200">
            <ArrowLeft className="w-4 h-4" />
            <span>Quay lại đăng nhập</span>
          </Button>
        </div>
      </form>
    </div>
  );

  const renderOtpAndPasswordStep = () => (
    <div className="h-full flex flex-col justify-between">
      <form onSubmit={handleResetSubmit} className="space-y-6">
        <div className="text-center space-y-4 mb-6">
          <div className="w-20 h-20 bg-gradient-to-br from-green-100 to-emerald-100 rounded-full flex items-center justify-center mx-auto shadow-lg">
            <Shield className="w-10 h-10 text-green-600" />
          </div>
          <div className="space-y-2">
            <h3 className="text-2xl font-bold text-gray-900">
              Tạo mật khẩu mới
            </h3>
            <p className="text-gray-600 max-w-sm mx-auto leading-relaxed">
              Nhập mã OTP và mật khẩu mới cho tài khoản
              <br />
              <span className="font-semibold text-green-700 bg-green-50 px-2 py-1 rounded-md mt-1 inline-block">
                {email}
              </span>
            </p>
          </div>
        </div>

        <div className="space-y-5">
          {/* OTP Input */}
          <div className="space-y-3">
            <Label
              htmlFor="otp-input"
              className="text-sm font-semibold text-slate-700 flex items-center gap-2">
              <Shield className="h-4 w-4 text-green-600" />
              Mã xác thực OTP
            </Label>
            <div className="relative">
              <Input
                id="otp-input"
                type="text"
                value={otp}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, "").slice(0, 6);
                  setOtp(value);
                }}
                placeholder="• • • • • •"
                className="h-14 text-center text-2xl font-mono tracking-[0.5em] border-2 border-slate-200 focus:border-green-400 focus:ring-4 focus:ring-green-100 transition-all duration-300 rounded-xl bg-green-50/50 backdrop-blur-sm"
                disabled={isLoading}
                required
                maxLength={6}
              />
              {otp.length === 6 && (
                <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                  <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                    <svg
                      className="w-4 h-4 text-white"
                      fill="currentColor"
                      viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                </div>
              )}
            </div>
            <p className="text-xs text-gray-500 flex items-center gap-2">
              <Mail className="w-3 h-3" />
              Mã OTP đã được gửi đến email của bạn
            </p>
          </div>

          {/* New Password */}
          <div className="space-y-3">
            <Label
              htmlFor="new-password"
              className="text-sm font-semibold text-slate-700 flex items-center gap-2">
              <KeyRound className="h-4 w-4 text-green-600" />
              Mật khẩu mới
            </Label>
            <div className="relative group">
              <Input
                id="new-password"
                type={showPassword ? "text" : "password"}
                value={newPassword}
                onChange={(e) => {
                  setNewPassword(e.target.value);
                  setPasswordTouched(true);
                }}
                placeholder="Nhập mật khẩu mới (tối thiểu 8 ký tự)"
                className="pr-12 h-12 border-2 border-slate-200 focus:border-green-400 focus:ring-4 focus:ring-green-100 transition-all duration-300 rounded-xl bg-white/80 backdrop-blur-sm"
                disabled={isLoading}
                required
                minLength={8}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-green-600 transition-colors p-1 rounded-md hover:bg-green-50"
                disabled={isLoading}>
                {showPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>
            {/* Password Strength Indicator */}
            {newPassword && passwordTouched && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-gray-600">
                    Độ mạnh mật khẩu:
                  </span>
                  <span
                    className={`text-xs font-semibold ${passwordStrength.color}`}>
                    {passwordStrength.label}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all duration-300 ${
                      passwordStrength.score === 0
                        ? "w-0"
                        : passwordStrength.score === 1
                        ? "w-1/5 bg-red-500"
                        : passwordStrength.score === 2
                        ? "w-2/5 bg-orange-500"
                        : passwordStrength.score === 3
                        ? "w-3/5 bg-yellow-500"
                        : passwordStrength.score === 4
                        ? "w-4/5 bg-blue-500"
                        : "w-full bg-green-500"
                    }`}
                  />
                </div>
                <div className="space-y-1 text-xs">
                  <div
                    className={`flex items-center gap-2 ${
                      newPassword.length >= 8
                        ? "text-green-600"
                        : "text-gray-400"
                    }`}>
                    {newPassword.length >= 8 ? "✓" : "○"} Ít nhất 8 ký tự
                  </div>
                  <div
                    className={`flex items-center gap-2 ${
                      /(?=.*[a-z])/.test(newPassword)
                        ? "text-green-600"
                        : "text-gray-400"
                    }`}>
                    {/(?=.*[a-z])/.test(newPassword) ? "✓" : "○"} Ít nhất 1 chữ
                    thường
                  </div>
                  <div
                    className={`flex items-center gap-2 ${
                      /(?=.*[A-Z])/.test(newPassword)
                        ? "text-green-600"
                        : "text-gray-400"
                    }`}>
                    {/(?=.*[A-Z])/.test(newPassword) ? "✓" : "○"} Ít nhất 1 chữ
                    hoa
                  </div>
                  <div
                    className={`flex items-center gap-2 ${
                      /(?=.*\d)/.test(newPassword)
                        ? "text-green-600"
                        : "text-gray-400"
                    }`}>
                    {/(?=.*\d)/.test(newPassword) ? "✓" : "○"} Ít nhất 1 số
                  </div>
                  <div
                    className={`flex items-center gap-2 ${
                      /(?=.*[!@#$%^&*(),.?":{}|<>])/.test(newPassword)
                        ? "text-green-600"
                        : "text-gray-400"
                    }`}>
                    {/(?=.*[!@#$%^&*(),.?":{}|<>])/.test(newPassword)
                      ? "✓"
                      : "○"}{" "}
                    Ít nhất 1 ký tự đặc biệt
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Confirm Password */}
          <div className="space-y-3">
            <Label
              htmlFor="confirm-password"
              className="text-sm font-semibold text-slate-700 flex items-center gap-2">
              <KeyRound className="h-4 w-4 text-green-600" />
              Xác nhận mật khẩu
            </Label>
            <div className="relative group">
              <Input
                id="confirm-password"
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  setConfirmPasswordTouched(true);
                }}
                placeholder="Nhập lại mật khẩu mới"
                className="pr-12 h-12 border-2 border-slate-200 focus:border-green-400 focus:ring-4 focus:ring-green-100 transition-all duration-300 rounded-xl bg-white/80 backdrop-blur-sm"
                disabled={isLoading}
                required
                minLength={8}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-green-600 transition-colors p-1 rounded-md hover:bg-green-50"
                disabled={isLoading}>
                {showConfirmPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>
            {/* Enhanced Password Match Validation */}
            {confirmPasswordTouched && confirmPassword && (
              <div
                className={`flex items-center gap-2 text-sm p-3 rounded-lg transition-all duration-200 ${
                  isConfirmValid
                    ? "bg-green-50 text-green-700 border border-green-200"
                    : "bg-red-50 text-red-700 border border-red-200"
                }`}>
                <div
                  className={`w-5 h-5 rounded-full flex items-center justify-center ${
                    isConfirmValid ? "bg-green-500" : "bg-red-500"
                  }`}>
                  {isConfirmValid ? (
                    <svg
                      className="w-3 h-3 text-white"
                      fill="currentColor"
                      viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  ) : (
                    <svg
                      className="w-3 h-3 text-white"
                      fill="currentColor"
                      viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                </div>
                <span className="font-medium">
                  {isConfirmValid
                    ? "Mật khẩu khớp nhau"
                    : "Mật khẩu không khớp"}
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-4 pt-2">
          <Button
            type="submit"
            disabled={
              isLoading ||
              !otp ||
              otp.length !== 6 ||
              !newPassword ||
              !confirmPassword ||
              newPassword !== confirmPassword ||
              !isPasswordValid
            }
            className="w-full h-12 bg-gradient-to-r from-green-500 via-green-600 to-emerald-600 hover:from-green-600 hover:via-green-700 hover:to-emerald-700 text-white font-semibold text-base rounded-xl shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-300 disabled:transform-none disabled:hover:scale-100">
            {isLoading ? (
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Đang cập nhật mật khẩu...</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 justify-center">
                <Shield className="w-5 h-5" />
                <span>Xác nhận đổi mật khẩu</span>
              </div>
            )}
          </Button>

          <Button
            type="button"
            variant="ghost"
            onClick={() => setStep("email")}
            className="w-full h-12 flex items-center justify-center gap-2 text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded-xl transition-all duration-200">
            <ArrowLeft className="w-4 h-4" />
            <span>Quay lại</span>
          </Button>
        </div>
      </form>
    </div>
  );

  return (
    <div className="h-[600px] flex flex-col">
      {step === "email" && renderEmailStep()}
      {step === "otpAndPassword" && renderOtpAndPasswordStep()}
    </div>
  );
};

export default ForgotPasswordForm;
