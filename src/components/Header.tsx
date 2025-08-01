import type React from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Plane, Menu, X, Globe, User } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import LoginModalNew from "./LoginModalNew";
import { useAuth } from "../hooks/useAuth";
import { UserMenu } from "./UserMenu";

const Header: React.FC = () => {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const { user } = useAuth();
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(event.target as Node)
      ) {
        setIsUserMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const navItems = [
    { path: "/", label: "Trang Chủ" },
    { path: "/search", label: "Tìm Chuyến Bay" },
    { path: "/blog", label: "Blog Du Lịch" },
    { path: "/news", label: "Tin Tức" },
  ];

  return (
    <header className="bg-white shadow-soft border-b border-gray-100 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 group">
            <div className="p-2 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg group-hover:from-blue-700 group-hover:to-indigo-700 transition-all duration-200">
              <Plane className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-display font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Fly Journey
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  location.pathname === item.path
                    ? "bg-blue-50 text-blue-700 shadow-sm"
                    : "text-gray-600 hover:text-blue-600 hover:bg-gray-50"
                }`}>
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center space-x-3">
            <Button
              variant="ghost"
              size="sm"
              disabled
              className="opacity-50 cursor-not-allowed">
              <Globe className="h-4 w-4 mr-2" />
              VN
            </Button>

            {user ? (
              <div className="relative" ref={userMenuRef}>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center space-x-2">
                  <User className="h-4 w-4" />
                  <span>Xin chào, {user.name}</span>
                </Button>

                <UserMenu
                  isOpen={isUserMenuOpen}
                  onClose={() => setIsUserMenuOpen(false)}
                />
              </div>
            ) : (
              <>
                <LoginModalNew>
                  <Button variant="ghost" size="sm">
                    Đăng Nhập
                  </Button>
                </LoginModalNew>

                <Link to="/register">
                  <Button
                    size="sm"
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
                    Đăng Ký
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="sm"
            className="md:hidden"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
            {isMobileMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </Button>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-100 animate-fade-in">
            <nav className="flex flex-col space-y-2">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                    location.pathname === item.path
                      ? "bg-blue-50 text-blue-700"
                      : "text-gray-600 hover:text-blue-600 hover:bg-gray-50"
                  }`}
                  onClick={() => setIsMobileMenuOpen(false)}>
                  {item.label}
                </Link>
              ))}
              <div className="flex flex-col space-y-2 pt-4 border-t border-gray-100">
                {user ? (
                  <div className="space-y-2">
                    <div className="px-4 py-2 text-sm text-gray-600 border-b">
                      Xin chào,{" "}
                      <span className="font-semibold">{user.name}</span>
                    </div>
                    <UserMenu
                      isOpen={true}
                      onClose={() => setIsMobileMenuOpen(false)}
                    />
                  </div>
                ) : (
                  <>
                    <LoginModalNew>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="justify-start">
                        Đăng Nhập
                      </Button>
                    </LoginModalNew>

                    <Link to="/register">
                      <Button
                        size="sm"
                        className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
                        Đăng Ký
                      </Button>
                    </Link>
                  </>
                )}
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
