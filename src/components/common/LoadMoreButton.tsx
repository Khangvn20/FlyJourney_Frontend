import React from "react";
import { Button } from "../ui/button";
import type {
  FlightSearchResponseData,
  FlightSearchApiResult,
} from "../../shared/types/search-api.types";

interface LoadMoreButtonProps {
  searchInfo: FlightSearchResponseData | null;
  filteredFlights: FlightSearchApiResult[];
  onLoadMore?: () => void;
  loading?: boolean;
  // Optional: show other-airline suggestions instead of paging
  suggestionsCount?: number;
  onShowSuggestions?: () => void;
  infoText?: string;
}

const LoadMoreButton: React.FC<LoadMoreButtonProps> = ({
  // Note: we intentionally don't use searchInfo here.
  // Keep it in the props for future UI copy tweaks.
  // Do not destructure to avoid unused variable warnings.
  filteredFlights,
  onLoadMore,
  loading,
  suggestionsCount = 0,
  onShowSuggestions,
  infoText,
}) => {
  if (filteredFlights.length === 0) {
    return null;
  }

  const canShowSuggestions = typeof onShowSuggestions === "function";

  return (
    <div className="text-center mt-8">
      <Button
        variant="outline"
        size="lg"
        onClick={() => {
          if (canShowSuggestions) {
            onShowSuggestions?.();
          } else {
            onLoadMore?.();
          }
        }}
        disabled={loading}>
        {loading
          ? "Đang tải..."
          : canShowSuggestions
          ? `Xem thêm chuyến bay từ hãng khác${
              typeof suggestionsCount === "number" && suggestionsCount > 0
                ? ` (${suggestionsCount})`
                : ""
            }`
          : `Xem thêm chuyến bay`}
      </Button>
      {infoText ? (
        <div className="mt-2 text-xs text-gray-500">{infoText}</div>
      ) : null}
    </div>
  );
};

export default LoadMoreButton;
