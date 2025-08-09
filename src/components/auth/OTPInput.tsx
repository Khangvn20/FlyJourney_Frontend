import type React from "react";
import { useState, useRef, useEffect } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { RotateCcw, Mail, Clock, Shield } from "lucide-react";

interface OTPInputProps {
  length: number;
  onComplete: (otp: string) => void;
  onResend: () => void;
  email: string;
  isLoading?: boolean;
}

const OTPInput: React.FC<OTPInputProps> = ({
  length,
  onComplete,
  onResend,
  email,
  isLoading = false,
}) => {
  const [otp, setOtp] = useState<string[]>(new Array(length).fill(""));
  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    let interval: number;
    if (timer > 0 && !canResend) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else if (timer === 0) {
      setCanResend(true);
    }
    return () => clearInterval(interval);
  }, [timer, canResend]);

  const handleChange = (element: HTMLInputElement, index: number) => {
    const value = element.value;

    if (!/^\d?$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < length - 1 && inputRefs.current[index + 1]) {
      inputRefs.current[index + 1]?.focus();
    }

    const otpString = newOtp.join("");
    if (otpString.length === length) {
      onComplete(otpString);
    }
  };

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    index: number
  ) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }

    if (e.key === "Backspace" && otp[index]) {
      const newOtp = [...otp];
      newOtp[index] = "";
      setOtp(newOtp);
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text");
    const pastedNumbers = pastedData.replace(/\D/g, "").slice(0, length);

    if (pastedNumbers.length > 0) {
      const newOtp = new Array(length).fill("");
      for (let i = 0; i < pastedNumbers.length; i++) {
        newOtp[i] = pastedNumbers[i];
      }
      setOtp(newOtp);

      const lastIndex = Math.min(pastedNumbers.length - 1, length - 1);
      inputRefs.current[lastIndex]?.focus();

      if (pastedNumbers.length === length) {
        onComplete(pastedNumbers);
      }
    }
  };

  const handleResend = () => {
    setTimer(60);
    setCanResend(false);
    setOtp(new Array(length).fill(""));
    inputRefs.current[0]?.focus();
    onResend();
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="mx-auto w-20 h-20 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center shadow-lg">
          <Mail className="h-10 w-10 text-white" />
        </div>
        <div className="space-y-2">
          <h3 className="text-2xl font-bold text-slate-900">Xác thực Email</h3>
          <p className="text-slate-600">
            Chúng tôi đã gửi mã xác thực {length} số đến
          </p>
          <div className="inline-flex items-center gap-2 bg-blue-50 px-4 py-2 rounded-full">
            <Shield className="h-4 w-4 text-blue-600" />
            <span className="text-sm font-semibold text-blue-700">{email}</span>
          </div>
        </div>
      </div>

      {/* OTP Input Fields */}
      <div className="space-y-6">
        <div className="flex justify-center gap-3">
          {otp.map((digit, index) => (
            <Input
              key={index}
              ref={(el) => (inputRefs.current[index] = el)}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(e.target, index)}
              onKeyDown={(e) => handleKeyDown(e, index)}
              onPaste={handlePaste}
              className="w-14 h-16 text-center text-2xl font-bold border-2 border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 rounded-xl"
              disabled={isLoading}
            />
          ))}
        </div>

        {/* Timer and Resend */}
        <div className="text-center space-y-4">
          {!canResend ? (
            <div className="flex items-center justify-center gap-2 text-slate-500">
              <Clock className="h-4 w-4" />
              <span className="text-sm font-medium">
                Gửi lại mã sau {formatTime(timer)}
              </span>
            </div>
          ) : (
            <Button
              variant="outline"
              onClick={handleResend}
              className="inline-flex items-center gap-2 border-blue-200 text-blue-700 hover:bg-blue-50 hover:border-blue-300 font-semibold transition-all duration-200 bg-transparent">
              <RotateCcw className="h-4 w-4" />
              Gửi lại mã xác thực
            </Button>
          )}
        </div>
      </div>

      {/* Enhanced Instructions */}
      <div className="bg-gradient-to-r from-slate-50 to-blue-50 rounded-2xl p-6 border border-slate-200">
        <h4 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
          <svg
            className="w-4 h-4 text-blue-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          Hướng dẫn xác thực
        </h4>
        <div className="grid md:grid-cols-2 gap-3 text-xs text-slate-600">
          <div className="flex items-start gap-2">
            <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-1.5 flex-shrink-0" />
            <span>Nhập mã {length} số từ email của bạn</span>
          </div>
          <div className="flex items-start gap-2">
            <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-1.5 flex-shrink-0" />
            <span>Mã có hiệu lực trong 10 phút</span>
          </div>
          <div className="flex items-start gap-2">
            <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-1.5 flex-shrink-0" />
            <span>Có thể dán mã từ clipboard</span>
          </div>
          <div className="flex items-start gap-2">
            <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-1.5 flex-shrink-0" />
            <span>Kiểm tra thư mục spam nếu cần</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OTPInput;
