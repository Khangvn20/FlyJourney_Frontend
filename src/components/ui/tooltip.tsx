import React, { ReactNode, useRef, useState } from "react";
import { cn } from "../../shared/utils";

interface TooltipProps {
  content: ReactNode;
  children: ReactNode;
  className?: string;
}

const Tooltip: React.FC<TooltipProps> = ({ content, children, className }) => {
  const [open, setOpen] = useState(false);
  const touchTimeout = useRef<number>();

  const handleTouchStart = () => {
    touchTimeout.current = window.setTimeout(() => setOpen(true), 500);
  };

  const handleTouchEnd = () => {
    window.clearTimeout(touchTimeout.current);
    setOpen(false);
  };

  return (
    <div
      className={cn("relative inline-block", className)}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onFocus={() => setOpen(true)}
      onBlur={() => setOpen(false)}
      onClick={() => setOpen(false)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchEnd}
    >
      {children}
      {open && (
        <div
          role="tooltip"
          className="pointer-events-none absolute z-50 -top-2 left-1/2 -translate-x-1/2 -translate-y-full whitespace-nowrap rounded bg-gray-900 px-2 py-1 text-xs text-white shadow-lg"
        >
          {content}
          <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900" />
        </div>
      )}
    </div>
  );
};

export default Tooltip;
