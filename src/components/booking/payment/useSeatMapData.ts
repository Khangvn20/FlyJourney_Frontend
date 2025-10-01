import { useEffect, useState } from "react";
import { buildApiUrl } from "../../../shared/constants/apiConfig";

export type RowAttr = "exit" | "extra" | "business";

export function useSeatMapData(flightId?: number, token?: string | null) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [occupiedSeats, setOccupiedSeats] = useState<string[]>([]);
  const [seatPrices, setSeatPrices] = useState<Record<string, number>>({});
  const [rowAttributes, setRowAttributes] = useState<Record<number, RowAttr[]>>(
    {}
  );

  useEffect(() => {
    if (!flightId) return;
    let cancelled = false;
    const fetchSeats = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch(buildApiUrl(`/checkin/${flightId}`), {
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        });
        if (!res.ok) throw new Error("failed");
        const data = await res.json();

        // Occupied seats
        const occupied =
          data?.data?.confirmed_seats?.map(
            (s: { seat_number: string }) => s.seat_number
          ) || [];
        if (!cancelled) setOccupiedSeats(occupied);

        // Seat prices
        const priceMap: Record<string, number> = {};
        const seatPriceList = data?.data?.seat_prices || [];
        (seatPriceList as Array<Record<string, unknown>>).forEach((s) => {
          const id =
            (s.seat_number as string) ||
            (s.seatId as string) ||
            (s.id as string);
          const price = Number(
            (s.price as number) ??
              (s.seat_price as number) ??
              (s.fare as number) ??
              NaN
          );
          if (id && !Number.isNaN(price)) priceMap[id] = price;
        });
        if (!cancelled) setSeatPrices(priceMap);

        // Row attributes
        const mapFromApi =
          data?.data?.seat_map || data?.data?.row_type_map || {};
        const parsed: Record<number, RowAttr[]> = {};
        Object.entries(mapFromApi).forEach(([row, attrs]) => {
          if (Array.isArray(attrs)) {
            parsed[Number(row)] = (attrs as unknown[])
              .map((a) => String(a))
              .filter((a) =>
                ["exit", "extra", "business"].includes(a)
              ) as RowAttr[];
          }
        });
        if (!cancelled) setRowAttributes(parsed);
      } catch {
        if (!cancelled) setError("Không thể tải sơ đồ ghế. Vui lòng thử lại.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchSeats();
    return () => {
      cancelled = true;
    };
  }, [flightId, token]);

  return { loading, error, occupiedSeats, seatPrices, rowAttributes } as const;
}
