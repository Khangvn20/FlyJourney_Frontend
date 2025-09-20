import React from "react";
import { Loader2 } from "lucide-react";
import { useInfiniteScroll } from "../../hooks/useInfiniteScroll";
import type {
  FlightSearchResponseData,
  FlightSearchApiResult,
} from "../../shared/types/search-api.types";

interface FlightInfiniteScrollProps {
  searchInfo: FlightSearchResponseData | null;
  filteredFlights: FlightSearchApiResult[];
  onLoadMore?: () => void;
  loading?: boolean;
  // Optional: show other-airline suggestions instead of paging
  suggestionsCount?: number;
  onShowSuggestions?: () => void;
  infoText?: string;
  // Total available flights for hasMore logic
  totalAvailableFlights?: number;
}

const FlightInfiniteScroll: React.FC<FlightInfiniteScrollProps> = ({
  filteredFlights,
  onLoadMore,
  loading = false,
  suggestionsCount = 0,
  onShowSuggestions,
  infoText,
  totalAvailableFlights = 0,
}) => {
  const canShowSuggestions =
    typeof onShowSuggestions === "function" && (suggestionsCount ?? 0) > 0;
  // Check if there's more data available
  const currentlyShowing = filteredFlights.length;
  const hasNextPage =
    !loading &&
    (canShowSuggestions ||
      (currentlyShowing < totalAvailableFlights && !!onLoadMore));

  const { sentinelRef, isNearBottom } = useInfiniteScroll({
    threshold: 0.1,
    rootMargin: "100px",
    hasNextPage,
    isFetchingNextPage: loading,
    fetchNextPage: () => {
      if (import.meta.env?.DEV) {
        console.log("🔄 FlightInfiniteScroll: fetchNextPage called", {
          canShowSuggestions,
          hasOnLoadMore: !!onLoadMore,
        });
      }
      if (canShowSuggestions) {
        onShowSuggestions?.();
      } else {
        onLoadMore?.();
      }
    },
  });

  if (filteredFlights.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4 mt-8">
      {/* Infinite Scroll Sentinel */}
      <div
        ref={sentinelRef}
        className="flex flex-col items-center justify-center py-8">
        {loading && (
          <div className="flex items-center gap-2 text-blue-600">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span className="text-sm">Đang tải thêm chuyến bay...</span>
          </div>
        )}

        {!loading && isNearBottom && hasNextPage && (
          <div className="text-xs text-gray-500">
            {canShowSuggestions
              ? "Tự động tải chuyến bay từ hãng khác..."
              : "Tự động tải thêm chuyến bay..."}
          </div>
        )}

        {!loading && !hasNextPage && filteredFlights.length > 0 && (
          <div className="text-center">
            <div className="text-sm text-gray-500 mb-2">
              {infoText || "Đã hiển thị tất cả chuyến bay có sẵn"}
            </div>
            <div className="w-12 h-px bg-gray-300 mx-auto"></div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FlightInfiniteScroll;
