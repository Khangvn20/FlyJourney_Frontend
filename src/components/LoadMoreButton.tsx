import React from "react";
import { Button } from "./ui/button";
import type {
  FlightSearchResponseData,
  FlightSearchApiResult,
} from "../shared/types/search-api.types";
import { isOneWayResponse } from "../shared/types/search-api.types";

interface LoadMoreButtonProps {
  searchInfo: FlightSearchResponseData | null;
  filteredFlights: FlightSearchApiResult[];
  onLoadMore?: () => void;
}

const LoadMoreButton: React.FC<LoadMoreButtonProps> = ({
  searchInfo,
  filteredFlights,
  onLoadMore,
}) => {
  if (filteredFlights.length === 0) {
    return null;
  }

  const hasMore =
    searchInfo &&
    isOneWayResponse(searchInfo) &&
    searchInfo.total_count &&
    searchInfo.total_count > filteredFlights.length;

  return (
    <div className="text-center mt-8">
      <Button
        variant="outline"
        size="lg"
        onClick={onLoadMore}
        disabled={!hasMore}>
        Xem thêm chuyến bay (
        {hasMore
          ? `còn ${searchInfo.total_count - filteredFlights.length}`
          : "tất cả"}
        )
      </Button>
    </div>
  );
};

export default LoadMoreButton;
