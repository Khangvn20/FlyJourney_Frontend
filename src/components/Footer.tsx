import type React from "react";
import { Link } from "react-router-dom";
import { Plane, Mail, Phone, MapPin, Code } from "lucide-react";

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg">
                <Plane className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-display font-bold text-white">
                Fly Journey
              </span>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed">
              Nền tảng đặt vé máy bay trực tuyến dành cho sinh viên và mục đích
              học tập.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">Liên Kết Nhanh</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/" className="hover:text-blue-400 transition-colors">
                  Trang Chủ
                </Link>
              </li>
              <li>
                <Link
                  to="/search"
                  className="hover:text-blue-400 transition-colors">
                  Tìm Chuyến Bay
                </Link>
              </li>
              <li>
                <Link
                  to="/booking"
                  className="hover:text-blue-400 transition-colors">
                  Đặt Chỗ Của Tôi
                </Link>
              </li>
              <li>
                <a href="#" className="hover:text-blue-400 transition-colors">
                  Trung Tâm Hỗ Trợ
                </a>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-white font-semibold mb-4">Hỗ Trợ</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#" className="hover:text-blue-400 transition-colors">
                  Dịch Vụ Khách Hàng
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-blue-400 transition-colors">
                  Bảo Hiểm Du Lịch
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-blue-400 transition-colors">
                  Điều Khoản & Điều Kiện
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-blue-400 transition-colors">
                  Chính Sách Bảo Mật
                </a>
              </li>
            </ul>
          </div>

          {/* Contact & Debug */}
          <div>
            <h3 className="text-white font-semibold mb-4">Liên Hệ</h3>
            <div className="space-y-3 text-sm mb-6">
              <div className="flex items-center space-x-2">
                <Phone className="h-4 w-4 text-blue-400" />
                <span>+84 (028) 123-4567</span>
              </div>
              <div className="flex items-center space-x-2">
                <Mail className="h-4 w-4 text-blue-400" />
                <span>support@bayviet.edu.vn</span>
              </div>
              <div className="flex items-center space-x-2">
                <MapPin className="h-4 w-4 text-blue-400" />
                <span>TP. Hồ Chí Minh, Việt Nam</span>
              </div>
            </div>

            {/* Debug Link */}
            <div className="pt-4 border-t border-gray-800">
              <Link
                to="/debug"
                className="flex items-center space-x-2 text-xs text-gray-500 hover:text-blue-400 transition-colors">
                <Code className="h-3 w-3" />
                <span>API Debug (Dev)</span>
              </Link>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-400">
          <p>
            &copy; 2025 Fly Journey. Dự án học tập - Không sử dụng cho mục đích
            thương mại.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
