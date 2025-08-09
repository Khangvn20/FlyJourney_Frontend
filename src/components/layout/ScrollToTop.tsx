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
      className={`fixed bottom-8 right-8 z-50 transition-all duration-500 ease-out ${
        isVisible
          ? "translate-y-0 opacity-100 scale-100"
          : "translate-y-12 opacity-0 scale-90 pointer-events-none"
      }`}>
      <button
        onClick={scrollToTop}
        className="group p-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 focus:outline-none focus:ring-4 focus:ring-blue-300/50"
        aria-label="Scroll to top">
        <ArrowUp
          className={`h-6 w-6 transition-all duration-300 group-hover:-translate-y-0.5 ${
            animateArrow ? "animate-bounce" : ""
          }`}
        />

        {/* Ripple effect on hover */}
        <div className="absolute inset-0 rounded-full bg-white/20 scale-0 group-hover:scale-100 transition-transform duration-300"></div>
      </button>
    </div>
  );
};

export default ScrollToTop;
