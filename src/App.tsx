import type React from "react";
import { Route, Routes } from "react-router-dom";
import "./App.css";

import Home from "./pages/Home";
import Search from "./pages/Search";
import Booking from "./pages/Booking";
import DebugApi from "./pages/DebugApi";

import Header from "./components/Header";
import Footer from "./components/Footer";
import { useScrollToTop } from "./hooks/useScrollToTop";

const App: React.FC = () => {
  useScrollToTop();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <Header />
      <main className="container mx-auto px-4 py-8 min-h-[calc(100vh-140px)]">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/search" element={<Search />} />
          <Route path="/booking" element={<Booking />} />
          <Route path="/debug" element={<DebugApi />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
};

export default App;
