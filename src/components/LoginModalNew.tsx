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
import type { LoginFormData } from "../shared/types";

interface LoginModalProps {
  children: React.ReactNode;
}

const LoginModalNew: React.FC<LoginModalProps> = ({ children }) => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleLoginSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    try {
      // Simulate API call for login
      await new Promise((resolve) => setTimeout(resolve, 1500));

      console.log("Login submitted:", data);

      // Close modal and navigate to home
      setIsOpen(false);
      navigate("/");
    } catch (error) {
      console.error("Login failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[450px] max-h-[90vh] overflow-y-auto">
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
          <LoginForm onSubmit={handleLoginSubmit} isLoading={isLoading} />
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
      </DialogContent>
    </Dialog>
  );
};

export default LoginModalNew;
