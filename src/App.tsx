import type React from "react";
import { Route, Routes } from "react-router-dom";
import "./App.css";

import Home from "./pages/Home";
import Search from "./pages/Search";
import Booking from "./pages/Booking";
import Register from "./pages/Register";
import Blog from "./pages/Blog";
import News from "./pages/News";
import MyBookings from "./pages/MyBookings";
import BookingDetail from "./pages/BookingDetail";

import Header from "./components/layout/Header";
import Footer from "./components/layout/Footer";
import ScrollToTop from "./components/layout/ScrollToTop";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import { useScrollToTop } from "./hooks/useScrollToTop";
import ChatBox from "./components/common/ChatBox";

const App: React.FC = () => {
  useScrollToTop();

  return (
    <>
      <Routes>
        {/* Register page without Header/Footer */}
        <Route path="/register" element={<Register />} />

        {/* Other pages with Header/Footer */}
        <Route
          path="*"
          element={
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
              <Header />
              <main className="container mx-auto px-4 py-8 min-h-[calc(100vh-140px)]">
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/search" element={<Search />} />
                  <Route path="/blog" element={<Blog />} />
                  <Route path="/news" element={<News />} />
                  <Route path="/booking" element={<Booking />} />
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
                </Routes>
              </main>
              <Footer />
            </div>
          }
        />
      </Routes>

      {/* Global ScrollToTop button */}
      <ScrollToTop />
      <ChatBox />
    </>
  );
};

export default App;
