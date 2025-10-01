/* eslint-disable react-refresh/only-export-components */
import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";

interface ToastOptions {
  description: string;
  variant?: "default" | "destructive";
}

export const toast = (options: ToastOptions) => {
  window.dispatchEvent(new CustomEvent("fj-toast", { detail: options }));
};

export const ToastContainer: React.FC = () => {
  const [toasts, setToasts] = useState<{ id: number; opts: ToastOptions }[]>([]);

  useEffect(() => {
    const handler = (e: Event) => {
      const opts = (e as CustomEvent<ToastOptions>).detail;
      const id = Date.now();
      setToasts((prev) => [...prev, { id, opts }]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 3000);
    };
    window.addEventListener("fj-toast", handler);
    return () => window.removeEventListener("fj-toast", handler);
  }, []);

  return createPortal(
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {toasts.map(({ id, opts }) => (
        <div
          key={id}
          className={`px-4 py-2 rounded shadow text-sm text-white ${
            opts.variant === "destructive" ? "bg-red-500" : "bg-gray-800"
          }`}
        >
          {opts.description}
        </div>
      ))}
    </div>,
    document.body,
  );
};
