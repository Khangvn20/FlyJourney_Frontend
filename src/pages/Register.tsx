import type React from "react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { Home, Plane, CheckCircle, Shield, Zap, Heart } from "lucide-react";
import MultiStepRegistration from "../components/auth/MultiStepRegistration";
import LoginForm from "../components/auth/LoginForm";
import TabNavigation from "../components/layout/TabNavigation";
import type { LoginFormData, AuthTab } from "../shared/types";
import MobileHeader from "../components/layout/MobileHeader";
import { useAuthContext } from "../hooks/useAuthContext";
import { DEV_CONFIG, shouldShowDevControls } from "../shared/config/devConfig";

const Register: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<AuthTab>("register");
  const [isLoading, setIsLoading] = useState(false);
  const [isTabChanging, setIsTabChanging] = useState(false);

  const { login } = useAuthContext();

  const handleTabChange = (newTab: AuthTab) => {
    if (newTab !== activeTab && !isLoading) {
      setIsTabChanging(true);
      setTimeout(() => {
        setActiveTab(newTab);
        setIsTabChanging(false);
      }, 150);
    }
  };

  const handleLoginSubmit = async (
    data: LoginFormData & { rememberMe: boolean }
  ) => {
    setIsLoading(true);
    try {
      const result = await login(data.email, data.password);

      if (result.success) {
        if (DEV_CONFIG.ENABLE_CONSOLE_LOGS && shouldShowDevControls()) {
          console.log("Login successful:", data);
        }
        navigate("/");
      } else {
        if (DEV_CONFIG.ENABLE_CONSOLE_LOGS && shouldShowDevControls()) {
          console.error("Login failed:", result.error);
        }
        // You might want to show an error message here
      }
    } catch (error) {
      if (DEV_CONFIG.ENABLE_CONSOLE_LOGS && shouldShowDevControls()) {
        console.error("Login failed:", error);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = () => {
    // For now, we can either navigate to a forgot password page
    // or show a message that forgot password should be done from the header login
    if (DEV_CONFIG.ENABLE_CONSOLE_LOGS && shouldShowDevControls()) {
      console.log("Forgot password clicked from register page");
    }
    // You could navigate to home and open the login modal
    navigate("/");
  };

  const renderContent = () => {
    return (
      <div className="space-y-6 flex flex-col min-h-full">
        {/* Header */}
        <div className="text-center space-y-3 flex-shrink-0">
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

        {/* Tab Navigation */}
        <div className="flex-shrink-0">
          <TabNavigation
            activeTab={activeTab}
            onTabChange={handleTabChange}
            disabled={isLoading}
          />
        </div>

        {/* Form Content - takes available space */}
        <div className="flex-1 flex flex-col justify-center min-h-[300px]">
          <div className="flex flex-col justify-center">
            {!isTabChanging && (
              <>
                {activeTab === "register" ? (
                  <div
                    style={{
                      opacity: 0,
                      animation: "fadeIn 0.3s ease-in-out forwards",
                    }}>
                    <MultiStepRegistration onSuccess={() => navigate("/")} />
                  </div>
                ) : (
                  <div
                    style={{
                      opacity: 0,
                      animation: "fadeIn 0.3s ease-in-out forwards",
                    }}>
                    <LoginForm
                      onSubmit={handleLoginSubmit}
                      onForgotPassword={handleForgotPassword}
                      isLoading={isLoading}
                    />
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Home Button - Fixed at bottom */}
        <div className="flex-shrink-0 pt-4">
          <Button
            onClick={() => navigate("/")}
            variant="outline"
            className="w-full h-10 border-slate-200 hover:border-blue-300 hover:bg-blue-50 transition-all duration-200 bg-transparent text-slate-600 hover:text-slate-700">
            <Home className="h-4 w-4 mr-2 text-blue-600" />
            <span className="font-medium">Về trang chủ</span>
          </Button>
        </div>
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
                  <div className="min-h-[500px] flex flex-col">
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
