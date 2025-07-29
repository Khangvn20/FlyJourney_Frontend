import React from "react";
import { Button } from "./ui/button";
import { Home } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface MobileHeaderProps {
  title?: string;
  showHomeButton?: boolean;
}

const MobileHeader: React.FC<MobileHeaderProps> = ({
  title = "Đăng ký tài khoản",
  showHomeButton = true,
}) => {
  const navigate = useNavigate();

  const handleGoHome = () => {
    navigate("/");
  };

  return (
    <div className="md:hidden bg-white/95 backdrop-blur-sm border-b border-gray-100 px-6 py-4 mb-6 shadow-sm">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
          {title}
        </h1>
        {showHomeButton && (
          <Button
            onClick={handleGoHome}
            variant="ghost"
            size="sm"
            className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-all duration-200">
            <Home className="h-5 w-5 mr-1" />
            Trang chủ
          </Button>
        )}
      </div>
    </div>
  );
};

export default MobileHeader;
