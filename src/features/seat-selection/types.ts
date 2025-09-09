export interface SeatData {
  id: string;
  row: number;
  seat: string;
  status: "available" | "selected" | "occupied" | "unavailable";
  price: number;
  class: "economy" | "premium" | "business" | "first";
  isExitRow?: boolean;
  isExtraLegroom?: boolean;
}

export interface SeatInfo {
  seat_number: string;
  class?: "economy" | "premium" | "business" | "first";
  attributes?: string[];
}
