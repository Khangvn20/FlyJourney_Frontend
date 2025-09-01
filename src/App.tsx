import type React from "react";
import { Route, Routes, Outlet } from "react-router-dom";
import "./App.css";

import Home from "./pages/Home";
import Search from "./pages/Search";
import Booking from "./pages/Booking";
import Register from "./pages/Register";
import Blog from "./pages/Blog";
import News from "./pages/News";
import MyBookings from "./pages/MyBookings";
import BookingDetail from "./pages/BookingDetail";
import ErrorPage from "./pages/Error";
import Checkin from "./pages/Checkin";

import Header from "./components/layout/Header";
import Footer from "./components/layout/Footer";
import ScrollToTop from "./components/layout/ScrollToTop";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import { useScrollToTop } from "./hooks/useScrollToTop";
import ChatBox from "./components/common/ChatBox";
import { useLocation } from "react-router-dom";
import DebugConsole from "./components/dev/DebugConsole";
import { shouldShowDevControls } from "./shared/config/devConfig";

const Layout: React.FC = () => (
  <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
    <Header />
    <main className="container mx-auto px-4 py-8 min-h-[calc(100vh-140px)]">
      <Outlet />
    </main>
    <Footer />
  </div>
);

const App: React.FC = () => {
  useScrollToTop();
  const location = useLocation();

  // Define valid paths to avoid hardcoding in isErrorPage logic
  const validPaths = [
    "/",
    "/search",
    "/blog",
    "/news",
    "/booking",
    "/checkin",
    "/register",
    "/my-bookings",
  ];

  // Xác định nếu đang ở trang error dựa trên route matching của React Router
  // Nếu route không match bất kỳ route nào được định nghĩa, React Router sẽ render route "*"
  const isErrorPage = !validPaths.some(
    (path) =>
      location.pathname === path ||
      location.pathname.startsWith("/my-bookings/")
  );

  return (
    <>
      <Routes>
        {/* Register page without Header/Footer */}
        <Route path="/register" element={<Register />} />
        {/* Main app routes with Header/Footer */}
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/search" element={<Search />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/news" element={<News />} />
          <Route path="/booking" element={<Booking />} />
          <Route path="/checkin" element={<Checkin />} />
          <Route
            path="/my-bookings/:id"
            element={
              <ProtectedRoute>
                <BookingDetail />
              </ProtectedRoute>
            }
          />
          <Route
            path="/my-bookings"
            element={
              <ProtectedRoute>
                <MyBookings />
              </ProtectedRoute>
            }
          />
        </Route>
        {/* Error page for unmatched routes (no header/footer) */}
        <Route path="*" element={<ErrorPage />} />
      </Routes>

      {/* Global ScrollToTop button */}
      <ScrollToTop />
      {/* Ẩn ChatBox khi ở trang lỗi */}
      {!isErrorPage && <ChatBox />}
      {/* Global Debug Console (visible only when dev controls are NOT hidden) */}
      {shouldShowDevControls() ? <DebugConsole /> : null}
    </>
  );
};

export default App;
