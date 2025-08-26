import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, loading, token } = useAuth();
  const location = useLocation();

  // Show loading while checking authentication
  if (loading || (token && !isAuthenticated)) {
    return (
      <div className="py-20 flex flex-col items-center justify-center gap-5 text-center">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <div className="space-y-2">
          <h3 className="text-base font-semibold text-gray-800">
            Đang xác thực...
          </h3>
          <p className="text-xs text-gray-500">
            Vui lòng chờ trong giây lát
          </p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    // Redirect to home and save the attempted location
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
