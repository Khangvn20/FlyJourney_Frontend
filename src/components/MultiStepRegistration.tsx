import React, { useState } from "react";
import RegisterForm from "./RegisterForm";
import OTPInput from "./OTPInput";
import SuccessMessage from "./SuccessMessage";
import { useAuthContext } from "../hooks/useAuthContext";
import type { RegisterFormData } from "../shared/types/auth.types";
import type { ConfirmRegisterRequest } from "../shared/types/backend-api.types";

type RegistrationStep = "form" | "otp" | "success";

interface MultiStepRegistrationProps {
  onSuccess?: () => void;
}

const MultiStepRegistration: React.FC<MultiStepRegistrationProps> = ({
  onSuccess,
}) => {
  const [currentStep, setCurrentStep] = useState<RegistrationStep>("form");
  const [registrationData, setRegistrationData] =
    useState<RegisterFormData | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>("");

  const { register, confirmRegister, login, loading } = useAuthContext();

  const handleRegisterSubmit = async (formData: RegisterFormData) => {
    setErrorMessage("");
    setRegistrationData(formData);

    try {
      const result = await register(formData);

      if (result.success) {
        // Registration successful, move to OTP step
        setCurrentStep("otp");
      } else {
        setErrorMessage(result.error || "Đăng ký thất bại");
      }
    } catch (error) {
      setErrorMessage("Có lỗi xảy ra khi đăng ký");
      console.error("Registration error:", error);
    }
  };

  const handleOTPComplete = async (otp: string) => {
    if (!registrationData) {
      setErrorMessage("Dữ liệu đăng ký không hợp lệ");
      return;
    }

    setErrorMessage("");

    try {
      const confirmData: ConfirmRegisterRequest = {
        name: registrationData.name,
        email: registrationData.email,
        otp: otp,
        phone: registrationData.phone,
        password: registrationData.password,
      };

      const result = await confirmRegister(confirmData);

      if (result.success) {
        // OTP confirmation successful, now auto login
        try {
          const loginResult = await login(registrationData.email, registrationData.password);
          if (loginResult.success) {
            console.log("✅ Auto login successful after registration");
            setCurrentStep("success");
            // Auto redirect after 3 seconds
            setTimeout(() => {
              onSuccess?.();
            }, 3000);
          } else {
            // OTP success but login failed, still go to success but user needs to login manually
            setCurrentStep("success");
            setTimeout(() => {
              onSuccess?.();
            }, 3000);
          }
        } catch (loginError) {
          console.error("Auto login failed:", loginError);
          // Still go to success step
          setCurrentStep("success");
          setTimeout(() => {
            onSuccess?.();
          }, 3000);
        }
      } else {
        setErrorMessage(result.error || "Mã OTP không đúng hoặc đã hết hạn");
      }
    } catch (error) {
      setErrorMessage("Có lỗi xảy ra khi xác thực OTP");
      console.error("OTP confirmation error:", error);
    }
  };

  const handleResendOTP = async () => {
    if (!registrationData) return;

    setErrorMessage("");
    try {
      const result = await register(registrationData);
      if (result.success) {
        setErrorMessage("");
        // Could show a success message for resend
      } else {
        setErrorMessage(result.error || "Không thể gửi lại mã OTP");
      }
    } catch {
      setErrorMessage("Có lỗi xảy ra khi gửi lại OTP");
    }
  };

  const handleBackToForm = () => {
    setCurrentStep("form");
    setErrorMessage("");
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case "form":
        return (
          <div className="space-y-4">
            <RegisterForm
              onSubmit={handleRegisterSubmit}
              isLoading={loading}
              initialData={registrationData || {}}
            />
            {errorMessage && (
              <div className="text-red-600 text-sm text-center bg-red-50 p-3 rounded-md border border-red-200">
                {errorMessage}
              </div>
            )}
          </div>
        );

      case "otp":
        return (
          <div className="space-y-4">
            <div className="text-center space-y-2">
              <h3 className="text-lg font-semibold text-gray-800">
                Xác thực email
              </h3>
              <p className="text-sm text-gray-600">
                Chúng tôi đã gửi mã xác thực 6 số đến email:{" "}
                <span className="font-medium text-blue-600">
                  {registrationData?.email}
                </span>
              </p>
            </div>

            <OTPInput
              length={6}
              onComplete={handleOTPComplete}
              onResend={handleResendOTP}
              email={registrationData?.email || ""}
              isLoading={loading}
            />

            {errorMessage && (
              <div className="text-red-600 text-sm text-center bg-red-50 p-3 rounded-md border border-red-200">
                {errorMessage}
              </div>
            )}

            <div className="text-center">
              <button
                onClick={handleBackToForm}
                className="text-sm text-blue-600 hover:text-blue-700 underline"
                disabled={loading}>
                ← Quay lại form đăng ký
              </button>
            </div>
          </div>
        );

      case "success":
        return (
          <div className="space-y-4">
            <SuccessMessage
              title="Đăng ký thành công!"
              message="Tài khoản của bạn đã được tạo thành công. Bạn sẽ được chuyển đến trang đăng nhập trong 3 giây..."
            />
            <div className="text-center">
              <button
                onClick={onSuccess}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                Tiếp tục đăng nhập
              </button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Progress indicator */}
      <div className="mb-6">
        <div className="flex items-center justify-center space-x-4">
          <div
            className={`flex items-center ${
              currentStep === "form"
                ? "text-blue-600"
                : currentStep === "otp" || currentStep === "success"
                ? "text-green-600"
                : "text-gray-400"
            }`}>
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                currentStep === "form"
                  ? "bg-blue-100"
                  : currentStep === "otp" || currentStep === "success"
                  ? "bg-green-100"
                  : "bg-gray-100"
              }`}>
              1
            </div>
            <span className="ml-2 text-sm font-medium">Thông tin</span>
          </div>

          <div
            className={`w-8 h-0.5 ${
              currentStep === "otp" || currentStep === "success"
                ? "bg-green-600"
                : "bg-gray-300"
            }`}></div>

          <div
            className={`flex items-center ${
              currentStep === "otp"
                ? "text-blue-600"
                : currentStep === "success"
                ? "text-green-600"
                : "text-gray-400"
            }`}>
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                currentStep === "otp"
                  ? "bg-blue-100"
                  : currentStep === "success"
                  ? "bg-green-100"
                  : "bg-gray-100"
              }`}>
              2
            </div>
            <span className="ml-2 text-sm font-medium">Xác thực</span>
          </div>

          <div
            className={`w-8 h-0.5 ${
              currentStep === "success" ? "bg-green-600" : "bg-gray-300"
            }`}></div>

          <div
            className={`flex items-center ${
              currentStep === "success" ? "text-green-600" : "text-gray-400"
            }`}>
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                currentStep === "success" ? "bg-green-100" : "bg-gray-100"
              }`}>
              3
            </div>
            <span className="ml-2 text-sm font-medium">Hoàn thành</span>
          </div>
        </div>
      </div>

      {/* Step content */}
      {renderCurrentStep()}
    </div>
  );
};

export default MultiStepRegistration;
