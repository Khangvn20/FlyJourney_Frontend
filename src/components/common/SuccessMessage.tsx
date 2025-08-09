import type React from "react";
import { CheckCircle, Sparkles } from "lucide-react";

interface SuccessMessageProps {
  title?: string;
  message: string;
  show?: boolean;
}

const SuccessMessage: React.FC<SuccessMessageProps> = ({
  title,
  message,
  show = true,
}) => {
  if (!show) return null;

  return (
    <div className="text-center space-y-8 animate-in fade-in duration-500">
      {/* Success Icon */}
      <div className="relative mx-auto w-24 h-24">
        <div className="absolute inset-0 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full animate-pulse" />
        <div className="relative w-full h-full bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center shadow-2xl">
          <CheckCircle className="w-12 h-12 text-white" />
        </div>

        {/* Floating particles */}
        <div className="absolute -top-2 -right-2">
          <Sparkles className="w-6 h-6 text-yellow-500 animate-bounce" />
        </div>
        <div className="absolute -bottom-2 -left-2">
          <Sparkles className="w-4 h-4 text-blue-500 animate-bounce delay-300" />
        </div>
      </div>

      {/* Content */}
      <div className="space-y-4">
        {title && (
          <h2 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
            {title}
          </h2>
        )}
        <div className="max-w-md mx-auto">
          <p className="text-lg text-slate-600 leading-relaxed">{message}</p>
        </div>
      </div>

      {/* Decorative elements */}
      <div className="flex justify-center space-x-1">
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className={`w-2 h-2 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full animate-bounce`}
            style={{ animationDelay: `${i * 0.2}s` }}
          />
        ))}
      </div>
    </div>
  );
};

export default SuccessMessage;
