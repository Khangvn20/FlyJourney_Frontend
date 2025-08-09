import type React from "react";
import { Route, Routes } from "react-router-dom";
import "./App.css";

import Home from "./pages/Home";
import Search from "./pages/Search";
import Booking from "./pages/Booking";
import Register from "./pages/Register";
import Blog from "./pages/Blog";
import News from "./pages/News";
import DebugApi from "./pages/DebugApi";
import ApiTest from "./pages/ApiTest";

import Header from "./components/layout/Header";
import Footer from "./components/layout/Footer";
import ScrollToTop from "./components/layout/ScrollToTop";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import { useScrollToTop } from "./hooks/useScrollToTop";

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
                  <Route
                    path="/booking"
                    element={
                      <ProtectedRoute>
                        <Booking />
                      </ProtectedRoute>
                    }
                  />
                  <Route path="/debug" element={<DebugApi />} />
                  <Route path="/api-test" element={<ApiTest />} />
                </Routes>
              </main>
              <Footer />
            </div>
          }
        />
      </Routes>

      {/* Global ScrollToTop button */}
      <ScrollToTop />
    </>
  );
};

export default App;
