import React, { useCallback, useEffect, useState } from "react";
import SimpleSeatMap from "./SimpleSeatMap";
import SeatLegend from "./SeatLegend";
import ForbiddenItemsPanel from "../../components/common/ForbiddenItemsPanel";
import SeatSelectionSummary from "../../components/booking/SeatSelectionSummary";
import { toast } from "../../components/ui/toast";

interface SeatSelectionProps {
  onComplete: (seats: string[]) => void;
  flightId: number;
  /** Maximum seats user can select */
  maxSeats?: number;
}

const SeatSelection: React.FC<SeatSelectionProps> = ({
  onComplete,
  flightId,
  maxSeats = 1,
}) => {
  const [selected, setSelected] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [occupied, setOccupied] = useState<string[]>([]);
  const [seatPrices, setSeatPrices] = useState<Record<string, number>>({});
  const [seatMap, setSeatMap] = useState<
    Record<number, Array<"exit" | "extra" | "business">>
  >({});

  const fetchSeatMap = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem("auth_token");
      const res = await fetch(`/api/v1/checkin/${flightId}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });

      if (res.status === 404) {
        const data = await res.json();
        const msg = data.errorMessage || "Flight not found";
        setError(msg);
        toast({ variant: "destructive", description: msg });
        return;
      }

      if (res.status === 500) {
        const data = await res.json();
        const msg = data.errorMessage || "Internal server error";
        setError(msg);
        toast({ variant: "destructive", description: msg });
        return;
      }

      if (!res.ok) {
        throw new Error("failed");
      }

      const data = await res.json();
      const occupiedSeats =
        data?.data?.confirmed_seats?.map(
          (s: { seat_number: string }) => s.seat_number
        ) || [];
      setOccupied(occupiedSeats);

      const priceMap: Record<string, number> = {};
      const seatPriceList = data?.data?.seat_prices || [];
      (seatPriceList as Array<Record<string, unknown>>).forEach((s) => {
        const id =
          (s.seat_number as string) || (s.seatId as string) || (s.id as string);
        const price = Number(
          (s.price as number) ??
            (s.seat_price as number) ??
            (s.fare as number) ??
            NaN
        );
        if (id && !Number.isNaN(price)) {
          priceMap[id] = price;
        }
      });

      setSeatPrices(priceMap);

      const mapFromApi = data?.data?.seat_map || data?.data?.row_type_map || {};
      const parsedMap: Record<
        number,
        Array<"exit" | "extra" | "business">
      > = {};
      Object.entries(mapFromApi).forEach(([row, attrs]) => {
        if (Array.isArray(attrs)) {
          parsedMap[Number(row)] = (attrs as unknown[])
            .map((a) => String(a))
            .filter((a) => ["exit", "extra", "business"].includes(a)) as Array<
            "exit" | "extra" | "business"
          >;
        }
      });
      setSeatMap(parsedMap);
    } catch {
      const msg = "Không thể tải sơ đồ ghế. Vui lòng thử lại.";
      setError(msg);
      toast({ variant: "destructive", description: msg });
    } finally {
      setLoading(false);
    }
  }, [flightId]);

  useEffect(() => {
    fetchSeatMap();
  }, [fetchSeatMap]);

  const handleSelect = (seatId: string) => {
    setSelected((prev) =>
      prev.includes(seatId)
        ? prev.filter((id) => id !== seatId)
        : [...prev, seatId]
    );
  };

  const handleClear = () => setSelected([]);

  const handleConfirm = () => {
    if (selected.length > 0) {
      onComplete(selected);
    }
  };

  if (loading) {
    return (
      <div
        className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4"
        data-testid="seatmap-loading">
        <div className="max-w-6xl mx-auto">
          {/* Loading header */}
          <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-6 mb-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 bg-slate-200 rounded-lg animate-pulse"></div>
              <div className="h-6 bg-slate-200 rounded w-48 animate-pulse"></div>
            </div>
            <div className="h-4 bg-slate-200 rounded w-full animate-pulse"></div>
          </div>

          {/* Loading content */}
          <div className="grid lg:grid-cols-[320px_1fr_280px] gap-6">
            <div className="space-y-4">
              <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-4">
                <div className="h-32 bg-slate-200 rounded-lg animate-pulse"></div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-6">
              <div className="h-96 bg-slate-200 rounded-lg animate-pulse"></div>
            </div>

            <div className="space-y-4">
              <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-4">
                <div className="h-24 bg-slate-200 rounded-lg animate-pulse"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className="min-h-screen bg-gradient-to-br from-red-50 to-pink-50 p-4"
        data-testid="seatmap-error">
        <div className="max-w-2xl mx-auto pt-20">
          <div className="bg-white rounded-xl shadow-lg border border-red-200 p-8 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">❌</span>
            </div>
            <h2 className="text-xl font-bold text-red-800 mb-2">
              Không thể tải sơ đồ ghế
            </h2>
            <p className="text-red-700 mb-6">{error}</p>
            <button
              type="button"
              onClick={fetchSeatMap}
              className="bg-red-600 hover:bg-red-700 text-white font-medium px-6 py-3 rounded-lg transition-colors duration-200 shadow-md hover:shadow-lg">
              🔄 Thử lại
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                <span className="text-3xl">✈️</span>
                Chọn ghế ngồi
              </h1>
              <p className="text-slate-600 mt-1">
                Chọn ghế phù hợp cho chuyến bay của bạn
              </p>
            </div>
            <div className="hidden md:flex items-center gap-2 text-sm text-slate-600">
              <span>Đã chọn:</span>
              <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-md font-medium">
                {selected.length}/{maxSeats} ghế
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-4">
        <div className="grid lg:grid-cols-[320px_1fr_280px] gap-6">
          {/* Left Sidebar - Legend & Info */}
          <aside className="space-y-6">
            {/* Legend - Always visible on desktop */}
            <div className="hidden lg:block">
              <SeatLegend />
            </div>

            {/* Forbidden Items Panel */}
            <div className="hidden lg:block">
              <ForbiddenItemsPanel />
            </div>

            {/* Mobile status indicator */}
            <div className="lg:hidden bg-white rounded-xl shadow-lg border border-slate-200 p-4">
              <div className="flex items-center justify-between">
                <span className="text-slate-600">Đã chọn:</span>
                <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-md font-medium">
                  {selected.length}/{maxSeats} ghế
                </span>
              </div>
            </div>
          </aside>

          {/* Main Content - Seat Map */}
          <main className="space-y-6">
            {/* Mobile Legend & Info */}
            <div className="lg:hidden space-y-4">
              <SeatLegend />
              <ForbiddenItemsPanel />
            </div>

            {/* Seat Map */}
            <SimpleSeatMap
              selectedSeats={selected}
              onSeatSelect={handleSelect}
              occupiedSeats={occupied}
              seatPrices={seatPrices}
              maxSeats={maxSeats}
              rowAttributes={seatMap}
              totalRowsOverride={30}
            />
          </main>

          {/* Right Sidebar - Summary */}
          <aside className="lg:block">
            <div className="lg:sticky lg:top-24">
              <SeatSelectionSummary
                selectedSeats={selected}
                onClear={handleClear}
                onConfirm={handleConfirm}
                className="w-full"
                seatPrices={seatPrices}
                maxSeats={maxSeats}
              />
            </div>
          </aside>
        </div>

        {/* Mobile Bottom Summary */}
        <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-slate-200 shadow-lg">
          <SeatSelectionSummary
            selectedSeats={selected}
            onClear={handleClear}
            onConfirm={handleConfirm}
            className="w-full rounded-none border-0 shadow-none"
            seatPrices={seatPrices}
            maxSeats={maxSeats}
          />
        </div>

        {/* Mobile padding to prevent content being hidden behind fixed summary */}
        <div className="lg:hidden h-32"></div>
      </div>
    </div>
  );
};

export default SeatSelection;
