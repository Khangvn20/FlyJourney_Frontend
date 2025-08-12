import React from "react";

interface FlightCardSkeletonProps {
  variant?: "default" | "compact";
}

const FlightCardSkeleton: React.FC<FlightCardSkeletonProps> = ({
  variant = "default",
}) => {
  const height = variant === "compact" ? "h-24" : "h-32";
  return (
    <div
      className={`relative overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm ${height}`}>
      <div className="absolute inset-0 bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 animate-[shimmer_1.6s_infinite] bg-[length:200%_100%]" />
      <div className="relative h-full flex items-center px-4 gap-6">
        <div className="w-20 flex flex-col items-center gap-2">
          <div className="h-8 w-16 rounded bg-gray-300" />
          <div className="h-3 w-14 rounded bg-gray-200" />
          <div className="h-2 w-12 rounded bg-gray-200" />
        </div>
        <div className="flex-1 flex items-center justify-center gap-8">
          <div className="text-center space-y-2">
            <div className="h-5 w-16 mx-auto rounded bg-gray-300" />
            <div className="h-3 w-10 mx-auto rounded bg-gray-200" />
            <div className="h-2 w-20 mx-auto rounded bg-gray-100" />
          </div>
          <div className="flex flex-col items-center gap-2">
            <div className="h-3 w-24 rounded bg-gray-200" />
            <div className="flex items-center gap-2">
              <div className="h-px w-16 bg-gray-300" />
              <div className="h-4 w-4 rounded-full bg-gray-300" />
            </div>
            <div className="h-2 w-16 rounded bg-gray-100" />
          </div>
          <div className="text-center space-y-2">
            <div className="h-5 w-16 mx-auto rounded bg-gray-300" />
            <div className="h-3 w-10 mx-auto rounded bg-gray-200" />
            <div className="h-2 w-20 mx-auto rounded bg-gray-100" />
          </div>
        </div>
        <div className="w-40 flex flex-col items-end gap-3">
          <div className="h-6 w-28 rounded bg-gray-300" />
          <div className="flex gap-2">
            <div className="h-8 w-10 rounded-md bg-gray-200" />
            <div className="h-8 w-24 rounded-md bg-gray-300" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default FlightCardSkeleton;
