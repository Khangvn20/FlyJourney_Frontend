"use client";

import type React from "react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import {
  Home,
  Plane,
  CheckCircle,
  ArrowLeft,
  Shield,
  Zap,
  Heart,
} from "lucide-react";
import OTPInput from "../components/OTPInput";
import RegisterForm from "../components/RegisterForm";
import LoginForm from "../components/LoginForm";
import SuccessMessage from "../components/SuccessMessage";
import TabNavigation from "../components/TabNavigation";
import type {
  RegisterFormData,
  LoginFormData,
  AuthStep,
  AuthTab,
} from "../shared/types";
import DevControls from "../components/DevControls";
import MobileHeader from "../components/MobileHeader";

const Register: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<AuthTab>("register");
  const [currentStep, setCurrentStep] = useState<AuthStep>("form");
  const [isLoading, setIsLoading] = useState(false);
  const [isTabChanging, setIsTabChanging] = useState(false);

  const [registerData, setRegisterData] = useState<RegisterFormData>({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const handleTabChange = (newTab: AuthTab) => {
    if (newTab !== activeTab && !isLoading) {
      setIsTabChanging(true);
      setTimeout(() => {
        setActiveTab(newTab);
        setIsTabChanging(false);
      }, 150);
    }
  };

  const handleRegisterSubmit = async (data: RegisterFormData) => {
    setIsLoading(true);
    try {
      setRegisterData(data);
      await new Promise((resolve) => setTimeout(resolve, 1500));
      setCurrentStep("otp");
      console.log("Registration initiated:", {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
      });
    } catch (error) {
      console.error("Registration failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoginSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      console.log("Login submitted:", data);
      navigate("/");
    } catch (error) {
      console.error("Login failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOTPComplete = async (otp: string) => {
    setIsLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      console.log("OTP verification complete:", { ...registerData, otp });
      setCurrentStep("success");
    } catch (error) {
      console.error("OTP verification failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOTPResend = async () => {
    console.log("Resending OTP to:", registerData.email);
    await new Promise((resolve) => setTimeout(resolve, 1000));
  };

  const handleBackToForm = () => {
    setCurrentStep("form");
  };

  const handleGoHome = () => {
    navigate("/");
  };

  const handleSkipToOTP = () => {
    setRegisterData({
      firstName: "Test",
      lastName: "User",
      email: "test@example.com",
      password: "password123",
      confirmPassword: "password123",
    });
    setCurrentStep("otp");
  };

  const renderContent = () => {
    if (currentStep === "success") {
      return (
        <div className="space-y-8 flex flex-col justify-center min-h-full py-8">
          <SuccessMessage
            title="🎉 Chúc mừng!"
            message="Tài khoản của bạn đã được tạo thành công. Chào mừng bạn đến với Fly Journey!"
          />

          <div className="space-y-4">
            <Button
              onClick={handleGoHome}
              className="w-full h-14 bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 hover:from-blue-700 hover:via-blue-800 hover:to-indigo-800 text-white font-semibold shadow-xl hover:shadow-2xl transform hover:scale-[1.02] transition-all duration-300">
              <Home className="h-5 w-5 mr-3" />
              Khám phá ngay
            </Button>
            <Button
              onClick={() => handleTabChange("login")}
              variant="outline"
              className="w-full h-12 border-slate-200 hover:border-blue-300 hover:bg-blue-50 transition-all duration-200">
              <span className="text-slate-700 font-medium">Đăng nhập</span>
            </Button>
          </div>
        </div>
      );
    }

    if (currentStep === "otp") {
      return (
        <div className="space-y-8 flex flex-col justify-center min-h-full py-8">
          <Button
            onClick={handleBackToForm}
            variant="ghost"
            className="self-start -ml-2 text-slate-600 hover:text-slate-900"
            disabled={isLoading}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Quay lại
          </Button>

          <OTPInput
            length={6}
            email={registerData.email}
            onComplete={handleOTPComplete}
            onResend={handleOTPResend}
            isLoading={isLoading}
          />
          <DevControls
            showBackButton={true}
            onBack={handleBackToForm}
            disabled={isLoading}
          />
        </div>
      );
    }

    return (
      <div className="space-y-3 flex flex-col justify-center min-h-full py-6">
        <div className="text-center space-y-3">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            {activeTab === "register"
              ? "Tạo tài khoản mới"
              : "Chào mừng trở lại"}
          </h1>
          <p className="text-slate-600 text-base max-w-md mx-auto leading-relaxed">
            {activeTab === "register"
              ? "Tham gia cùng chúng tôi để khám phá thế giới"
              : "Tiếp tục hành trình của bạn với Fly Journey"}
          </p>
        </div>

        <TabNavigation
          activeTab={activeTab}
          onTabChange={handleTabChange}
          disabled={isLoading}
        />

        <div className="flex-1 flex flex-col justify-center">
          <div className="flex flex-col justify-center">
            {!isTabChanging && (
              <>
                {activeTab === "register" ? (
                  <div
                    style={{
                      opacity: 0,
                      animation: "fadeIn 0.3s ease-in-out forwards",
                    }}>
                    <RegisterForm
                      onSubmit={handleRegisterSubmit}
                      isLoading={isLoading}
                    />
                  </div>
                ) : (
                  <div
                    style={{
                      opacity: 0,
                      animation: "fadeIn 0.3s ease-in-out forwards",
                    }}>
                    <LoginForm
                      onSubmit={handleLoginSubmit}
                      isLoading={isLoading}
                    />
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Nút về trang chủ gần hơn - loại bỏ margin-top */}
        <div>
          <Button
            onClick={handleGoHome}
            variant="outline"
            className="w-full h-10 border-slate-200 hover:border-blue-300 hover:bg-blue-50 transition-all duration-200 bg-transparent text-slate-600 hover:text-slate-700">
            <Home className="h-4 w-4 mr-2 text-blue-600" />
            <span className="font-medium">Về trang chủ</span>
          </Button>
        </div>

        <DevControls
          showSkipToOTP={activeTab === "register"}
          onSkipToOTP={handleSkipToOTP}
          disabled={isLoading}
        />
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 relative overflow-hidden">
      <MobileHeader
        title={activeTab === "register" ? "Đăng ký tài khoản" : "Đăng nhập"}
        showHomeButton={true}
      />

      {/* Add CSS animation */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>

      {/* Background decorations */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-20 w-32 h-32 bg-blue-200/30 rounded-full blur-xl" />
        <div className="absolute bottom-20 right-20 w-40 h-40 bg-indigo-200/30 rounded-full blur-xl" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-200/20 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10">
        <div className="container mx-auto px-4 py-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center max-w-7xl mx-auto">
            {/* Left Side - Enhanced Branding */}
            <div className="hidden lg:block space-y-12">
              <Link to="/" className="flex items-center space-x-4 group">
                <div className="p-4 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl group-hover:from-blue-700 group-hover:to-indigo-700 transition-all duration-300 shadow-xl">
                  <Plane className="h-10 w-10 text-white" />
                </div>
                <span className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent group-hover:from-blue-700 group-hover:to-indigo-700 transition-all duration-300">
                  Fly Journey
                </span>
              </Link>

              <div className="space-y-6">
                <h1 className="text-5xl font-bold text-slate-800 leading-tight">
                  Khám phá thế giới
                  <span className="block text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text">
                    cùng chúng tôi
                  </span>
                </h1>
                <p className="text-xl text-slate-600 leading-relaxed">
                  Đặt vé máy bay nhanh chóng, tiện lợi với hàng ngàn chuyến bay
                  mỗi ngày. Trải nghiệm du lịch chưa bao giờ dễ dàng đến thế.
                </p>
              </div>

              <div className="space-y-6">
                <div className="flex items-center space-x-4 group">
                  <div className="p-3 bg-green-100 rounded-full group-hover:scale-110 transition-transform duration-200">
                    <CheckCircle className="h-6 w-6 text-green-600" />
                  </div>
                  <span className="text-lg text-slate-700 font-medium">
                    Giá vé minh bạch, không phí ẩn
                  </span>
                </div>
                <div className="flex items-center space-x-4 group">
                  <div className="p-3 bg-blue-100 rounded-full group-hover:scale-110 transition-transform duration-200">
                    <Shield className="h-6 w-6 text-blue-600" />
                  </div>
                  <span className="text-lg text-slate-700 font-medium">
                    Bảo mật thông tin tuyệt đối
                  </span>
                </div>
                <div className="flex items-center space-x-4 group">
                  <div className="p-3 bg-purple-100 rounded-full group-hover:scale-110 transition-transform duration-200">
                    <Zap className="h-6 w-6 text-purple-600" />
                  </div>
                  <span className="text-lg text-slate-700 font-medium">
                    Hỗ trợ 24/7 tận tâm
                  </span>
                </div>
                <div className="flex items-center space-x-4 group">
                  <div className="p-3 bg-pink-100 rounded-full group-hover:scale-110 transition-transform duration-200">
                    <Heart className="h-6 w-6 text-pink-600" />
                  </div>
                  <span className="text-lg text-slate-700 font-medium">
                    Đổi trả vé linh hoạt
                  </span>
                </div>
              </div>
            </div>

            {/* Right Side - Enhanced Form */}
            <div className="w-full max-w-lg mx-auto lg:mx-0 flex items-center justify-center min-h-screen lg:min-h-0">
              <Card className="shadow-2xl border-0 backdrop-blur-sm bg-white/95 w-full overflow-hidden">
                <CardContent className="px-8 py-8">
                  <div className="min-h-[550px] flex flex-col justify-center">
                    {renderContent()}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
