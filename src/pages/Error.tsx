import { useNavigate } from "react-router-dom";

const ErrorPage: React.FC = () => {
  const navigate = useNavigate();
  
  const handleGoHome = () => {
    navigate("/");
    // Force refresh to ensure proper rendering
    window.location.href = "/";
  };
  
  return (
    <div className="flex h-screen flex-col items-center justify-center gap-4 text-center">
      <h1 className="text-3xl font-bold text-red-500">Đã xảy ra lỗi</h1>
      <p className="text-gray-600">Vui lòng tải lại trang hoặc thử lại sau.</p>
      <button
        className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition"
        onClick={handleGoHome}>
        Quay về trang chủ
      </button>
    </div>
  );
};

export default ErrorPage;
