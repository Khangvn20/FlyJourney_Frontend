import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { useNavigate } from "react-router-dom";
import LoginForm from "./LoginForm";
import ForgotPasswordForm from "./ForgotPasswordForm";
import { useAuth } from "../hooks/useAuth";
import { authService } from "../services/authService";
import type { LoginFormData } from "../shared/types";

interface LoginModalProps {
  children: React.ReactNode;
}

type ModalView = "login" | "forgotPassword" | "success";

const LoginModalNew: React.FC<LoginModalProps> = ({ children }) => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentView, setCurrentView] = useState<ModalView>("login");
  const [resetEmail, setResetEmail] = useState("");

  const handleLoginSubmit = async (
    data: LoginFormData & { rememberMe: boolean }
  ) => {
    setIsLoading(true);
    try {
      // Call the actual login function from useAuth
      await login(data.email, data.password);

      console.log("Login submitted:", data);

      // Close modal after successful login
      setIsOpen(false);
      setCurrentView("login");
      // Navigate to home or stay on current page
      navigate("/");
    } catch (error) {
      console.error("Login failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPasswordSubmit = async (data: {
    email: string;
    newPassword?: string;
    otp?: string;
  }) => {
    setIsLoading(true);
    try {
      if (data.newPassword && data.otp) {
        // Confirm reset password
        const response = await authService.confirmResetPassword({
          email: data.email,
          new_password: data.newPassword,
          otp: data.otp,
        });

        if (response.status) {
          setCurrentView("success");
          setResetEmail(data.email);
        } else {
          throw new Error(response.errorMessage || "Đặt lại mật khẩu thất bại");
        }
      } else {
        // Send reset password email
        const response = await authService.resetPassword(data.email);

        if (response.status) {
          setResetEmail(data.email);
          // Don't change view here, let ForgotPasswordForm handle the flow
        } else {
          throw new Error(response.errorMessage || "Gửi email thất bại");
        }
      }
    } catch (error) {
      console.error("Forgot password failed:", error);
      // You might want to show error message to user here
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToLogin = () => {
    setCurrentView("login");
  };

  const handleForgotPassword = () => {
    setCurrentView("forgotPassword");
  };

  const handleModalClose = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      // Reset view when modal closes
      setCurrentView("login");
      setResetEmail("");
    }
  };

  const renderLoginView = () => (
    <>
      <DialogHeader className="space-y-3">
        <div className="flex justify-center">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full flex items-center justify-center shadow-lg">
            <svg
              className="w-8 h-8 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
              />
            </svg>
          </div>
        </div>
        <DialogTitle className="text-2xl font-bold text-center bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
          Chào mừng trở lại
        </DialogTitle>
        <p className="text-center text-gray-600">
          Tiếp tục hành trình của bạn với Fly Journey
        </p>
      </DialogHeader>

      <div className="py-4">
        <LoginForm
          onSubmit={handleLoginSubmit}
          onForgotPassword={handleForgotPassword}
          isLoading={isLoading}
        />
      </div>

      {/* Register Link */}
      <div className="text-center pt-4 border-t border-gray-100">
        <p className="text-sm text-gray-600">
          Chưa có tài khoản?{" "}
          <button
            onClick={() => {
              setIsOpen(false);
              navigate("/register");
            }}
            className="text-blue-600 hover:text-blue-700 font-medium hover:underline">
            Đăng ký ngay
          </button>
        </p>
      </div>
    </>
  );

  const renderForgotPasswordView = () => (
    <>
      <DialogHeader className="space-y-3">
        <DialogTitle className="text-2xl font-bold text-center bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
          Khôi phục mật khẩu
        </DialogTitle>
      </DialogHeader>

      <div className="py-4">
        <ForgotPasswordForm
          onSubmit={handleForgotPasswordSubmit}
          onBack={handleBackToLogin}
          isLoading={isLoading}
        />
      </div>
    </>
  );

  const renderSuccessView = () => (
    <>
      <DialogHeader className="space-y-3">
        <div className="flex justify-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
            <svg
              className="w-8 h-8 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
        </div>
        <DialogTitle className="text-2xl font-bold text-center text-green-600">
          Thành công!
        </DialogTitle>
        <p className="text-center text-gray-600">
          Mật khẩu của bạn đã được cập nhật thành công. <br />
          {resetEmail && (
            <>
              Email: <span className="font-medium">{resetEmail}</span>
              <br />
            </>
          )}
          Bạn có thể đăng nhập với mật khẩu mới ngay bây giờ.
        </p>
      </DialogHeader>

      <div className="py-4 space-y-3">
        <button
          onClick={handleBackToLogin}
          className="w-full h-11 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-lg transition-all duration-200">
          Đăng nhập ngay
        </button>
      </div>
    </>
  );

  return (
    <Dialog open={isOpen} onOpenChange={handleModalClose}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[450px] max-h-[90vh] overflow-y-auto">
        {currentView === "login" && renderLoginView()}
        {currentView === "forgotPassword" && renderForgotPasswordView()}
        {currentView === "success" && renderSuccessView()}
      </DialogContent>
    </Dialog>
  );
};

export default LoginModalNew;
