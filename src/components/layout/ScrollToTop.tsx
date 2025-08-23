import React, { useState, useEffect } from "react";
import { ArrowUp } from "lucide-react";

const ScrollToTop: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [animateArrow, setAnimateArrow] = useState(false);

  // Check scroll position
  useEffect(() => {
    const toggleVisibility = () => {
      const scrolled = document.documentElement.scrollTop;
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      const scrollPercentage =
        (scrolled / (documentHeight - windowHeight)) * 100;

      setIsVisible(scrollPercentage > 30);
    };

    window.addEventListener("scroll", toggleVisibility);
    return () => window.removeEventListener("scroll", toggleVisibility);
  }, []);

  // Arrow animation loop every 10 seconds
  useEffect(() => {
    if (!isVisible) return;

    const animationInterval = setInterval(() => {
      setAnimateArrow(true);
      setTimeout(() => setAnimateArrow(false), 1000); // Animation lasts 1 second
    }, 10000); // Every 10 seconds

    return () => clearInterval(animationInterval);
  }, [isVisible]);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <div
      className={`fixed bottom-6 left-6 z-[9998] transition-all duration-500 ease-out ${
        isVisible
          ? "translate-y-0 opacity-100 scale-100"
          : "translate-y-12 opacity-0 scale-90 pointer-events-none"
      }`}>
      <button
        onClick={scrollToTop}
        className="group relative p-3 bg-gradient-to-tr from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-110 focus:outline-none focus:ring-4 focus:ring-indigo-300/50 border border-white/20"
        aria-label="Scroll to top">
        <ArrowUp
          className={`h-5 w-5 transition-all duration-300 group-hover:-translate-y-1 ${
            animateArrow ? "animate-bounce" : ""
          }`}
        />

        {/* Progress indicator ring */}
        <div className="absolute -inset-1 rounded-2xl border-2 border-transparent bg-gradient-to-tr from-indigo-400/30 to-purple-500/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

        {/* Ripple effect on hover */}
        <div className="absolute inset-0 rounded-2xl bg-white/10 scale-0 group-hover:scale-110 transition-transform duration-300"></div>
      </button>

      {/* Tooltip */}
      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-1 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap">
        Lên đầu trang
        <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
      </div>
    </div>
  );
};

export default ScrollToTop;
