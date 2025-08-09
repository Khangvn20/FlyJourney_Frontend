import type React from "react";
import { useEffect, useState, useRef, useCallback } from "react";
// Adjusted path after moving sections under components/sections
import { airlines } from "../../mocks";

const AirlinesSection: React.FC = () => {
  const [translateX, setTranslateX] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState(0);
  const [dragStartTranslate, setDragStartTranslate] = useState(0);

  const containerRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number>();

  // Configuration for seamless infinite scroll - reduced gap for tighter spacing
  const itemWidth = 180;
  const gap = 24; // Reduced gap for tighter spacing
  const totalItemWidth = itemWidth + gap;

  // Create enough duplicates for truly seamless scrolling
  const duplicatedAirlines = [
    ...airlines,
    ...airlines,
    ...airlines,
    ...airlines,
    ...airlines,
    ...airlines,
  ];

  const singleSetWidth = airlines.length * totalItemWidth;

  // Smooth endless animation without jumps
  const animate = useCallback(() => {
    if (!isHovered && !isDragging) {
      setTranslateX((prev) => {
        const newTranslate = prev - 0.8; // Smooth speed

        // Reset position seamlessly when we've moved one full set
        if (newTranslate <= -singleSetWidth) {
          return newTranslate + singleSetWidth;
        }
        return newTranslate;
      });
    }
    animationRef.current = requestAnimationFrame(animate);
  }, [isHovered, isDragging, singleSetWidth]);

  useEffect(() => {
    animationRef.current = requestAnimationFrame(animate);
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [animate]);

  // Enhanced drag handlers with seamless wrapping
  const handleDragStart = useCallback(
    (clientX: number) => {
      setIsDragging(true);
      setDragStart(clientX);
      setDragStartTranslate(translateX);
    },
    [translateX]
  );

  const handleDragMove = useCallback(
    (clientX: number) => {
      if (!isDragging) return;

      const diff = clientX - dragStart;
      let newTranslate = dragStartTranslate + diff;

      // Seamless wrapping for drag
      if (newTranslate > 0) {
        newTranslate = newTranslate - singleSetWidth;
        setDragStartTranslate(dragStartTranslate - singleSetWidth);
      } else if (newTranslate < -singleSetWidth) {
        newTranslate = newTranslate + singleSetWidth;
        setDragStartTranslate(dragStartTranslate + singleSetWidth);
      }

      setTranslateX(newTranslate);
    },
    [isDragging, dragStart, dragStartTranslate, singleSetWidth]
  );

  const handleDragEnd = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Mouse events
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    handleDragStart(e.clientX);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    handleDragMove(e.clientX);
  };

  // Touch events
  const handleTouchStart = (e: React.TouchEvent) => {
    handleDragStart(e.touches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    e.preventDefault();
    handleDragMove(e.touches[0].clientX);
  };

  // Global mouse events for smooth dragging
  useEffect(() => {
    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (isDragging) handleDragMove(e.clientX);
    };

    const handleGlobalMouseUp = () => {
      if (isDragging) handleDragEnd();
    };

    if (isDragging) {
      document.addEventListener("mousemove", handleGlobalMouseMove);
      document.addEventListener("mouseup", handleGlobalMouseUp);
    }

    return () => {
      document.removeEventListener("mousemove", handleGlobalMouseMove);
      document.removeEventListener("mouseup", handleGlobalMouseUp);
    };
  }, [isDragging, handleDragMove, handleDragEnd]);

  return (
    // Break out of parent container constraints with negative margins
    <section className="py-16 w-screen relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] overflow-hidden bg-gray-50">
      {/* Header section with container */}
      <div className="container mx-auto px-4 text-center mb-12">
        <div className="inline-flex items-center px-4 py-2 bg-blue-100 rounded-full text-blue-700 text-sm font-medium mb-4">
          ✈️ Hãng hàng không Việt Nam
        </div>
        <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
          Đối tác hàng không uy tín
        </h2>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Chúng tôi hợp tác với các hãng hàng không hàng đầu Việt Nam để mang
          đến cho bạn những lựa chọn đa dạng nhất
        </p>
      </div>

      {/* Full width infinite scroll container */}
      <div className="relative w-full">
        {/* Subtle gradient overlays */}
        <div className="absolute left-0 top-0 w-20 h-full bg-gradient-to-r from-gray-50 to-transparent z-10 pointer-events-none"></div>
        <div className="absolute right-0 top-0 w-20 h-full bg-gradient-to-l from-gray-50 to-transparent z-10 pointer-events-none"></div>

        <div className="overflow-hidden py-8">
          <div
            ref={containerRef}
            className="flex items-center cursor-grab active:cursor-grabbing select-none"
            style={{
              transform: `translateX(${translateX}px)`,
              transition: isDragging ? "none" : "none",
              gap: `${gap}px`,
            }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleDragEnd}>
            {duplicatedAirlines.map((airline, index) => (
              <div
                key={`${airline.name}-${index}`}
                className="flex-shrink-0 group"
                style={{ width: `${itemWidth}px` }}>
                <div className="flex items-center justify-center h-16 transition-all duration-300 ease-out hover:scale-110 hover:-translate-y-1">
                  <img
                    src={airline.logo || "/placeholder.svg"}
                    alt={`${airline.name} logo`}
                    className="max-h-full max-w-full object-contain filter group-hover:brightness-110 transition-all duration-300"
                    loading="lazy"
                    draggable={false}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Call-to-action with container */}
      <div className="container mx-auto px-4 text-center mt-12">
        <p className="text-gray-600 mb-6">
          Tìm kiếm và đặt vé máy bay với giá tốt nhất từ các hãng hàng không uy
          tín
        </p>
        <button className="inline-flex items-center px-8 py-3 bg-blue-600 text-white font-semibold rounded-full hover:bg-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5">
          Tìm chuyến bay ngay
          <svg
            className="ml-2 w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17 8l4 4m0 0l-4 4m4-4H3"
            />
          </svg>
        </button>
      </div>
    </section>
  );
};

export default AirlinesSection;
