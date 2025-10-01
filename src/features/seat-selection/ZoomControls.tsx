import React, { useRef } from "react";
import { Plus, Minus, RotateCcw } from "lucide-react";

interface ZoomControlsProps {
  scale: number;
  setScale: React.Dispatch<React.SetStateAction<number>>;
  children: React.ReactNode;
}

const ZoomControls: React.FC<ZoomControlsProps> = ({
  scale,
  setScale,
  children,
}) => {
  const lastDistance = useRef<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const zoomIn = () => setScale((s) => Math.min(2, s + 0.1));
  const zoomOut = () => setScale((s) => Math.max(0.5, s - 0.1));
  const resetZoom = () => setScale(1);

  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    if (e.touches.length === 2) {
      const t1 = e.touches[0];
      const t2 = e.touches[1];
      lastDistance.current = Math.hypot(
        t1.pageX - t2.pageX,
        t1.pageY - t2.pageY
      );
    }
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (e.touches.length === 2 && lastDistance.current) {
      e.preventDefault(); // Prevent default zoom behavior
      const t1 = e.touches[0];
      const t2 = e.touches[1];
      const dist = Math.hypot(t1.pageX - t2.pageX, t1.pageY - t2.pageY);
      const delta = dist - lastDistance.current;
      setScale((s) => Math.min(2, Math.max(0.5, s + delta / 200)));
      lastDistance.current = dist;
    }
  };

  const handleTouchEnd = () => {
    lastDistance.current = null;
  };

  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      const delta = e.deltaY < 0 ? 0.1 : -0.1;
      setScale((s) => Math.min(2, Math.max(0.5, s + delta)));
    }
  };

  return (
    <div className="relative bg-gradient-to-br from-slate-50 to-blue-50 rounded-2xl overflow-hidden shadow-xl border border-slate-200">
      {/* Enhanced Zoom Controls */}
      <div className="absolute top-4 right-4 z-10 flex flex-col bg-white/95 backdrop-blur-sm rounded-xl shadow-lg border border-slate-200 overflow-hidden">
        <button
          type="button"
          onClick={zoomIn}
          aria-label="Phóng to"
          className="p-3 hover:bg-blue-50 active:bg-blue-100 transition-colors duration-200 border-b border-slate-200 group"
          disabled={scale >= 2}>
          <Plus className="h-5 w-5 text-slate-600 group-hover:text-blue-600 transition-colors" />
        </button>

        <button
          type="button"
          onClick={resetZoom}
          aria-label="Về mức zoom gốc"
          className="p-3 hover:bg-green-50 active:bg-green-100 transition-colors duration-200 border-b border-slate-200 group">
          <RotateCcw className="h-5 w-5 text-slate-600 group-hover:text-green-600 transition-colors" />
        </button>

        <button
          type="button"
          onClick={zoomOut}
          aria-label="Thu nhỏ"
          className="p-3 hover:bg-red-50 active:bg-red-100 transition-colors duration-200 group"
          disabled={scale <= 0.5}>
          <Minus className="h-5 w-5 text-slate-600 group-hover:text-red-600 transition-colors" />
        </button>
      </div>

      {/* Zoom Level Indicator */}
      <div className="absolute top-4 left-4 z-10 bg-white/95 backdrop-blur-sm rounded-lg shadow-md border border-slate-200 px-3 py-2">
        <div className="text-xs font-medium text-slate-600">
          Zoom: {Math.round(scale * 100)}%
        </div>
      </div>

      {/* Instructions for mobile */}
      <div className="absolute bottom-4 left-4 right-4 z-10 bg-white/90 backdrop-blur-sm rounded-lg shadow-md border border-slate-200 p-3 md:hidden">
        <div className="text-xs text-slate-600 text-center">
          👆 Dùng 2 ngón tay để phóng to/thu nhỏ
        </div>
      </div>

      {/* Seat map container */}
      <div
        ref={containerRef}
        className="relative min-h-[400px] max-h-[600px] overflow-auto p-6"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={handleTouchEnd}
        onWheel={handleWheel}
        style={{
          touchAction: "pan-x pan-y",
          scrollbarWidth: "thin",
          scrollbarColor: "#cbd5e1 transparent",
        }}>
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-[0.02]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-600 via-transparent to-transparent"></div>
        </div>

        <div
          className="relative w-full mx-auto transition-transform duration-200 ease-out"
          style={{
            transform: `scale(${scale})`,
            transformOrigin: "top center",
            minWidth: "fit-content",
          }}>
          {children}
        </div>
      </div>
    </div>
  );
};

export default ZoomControls;
