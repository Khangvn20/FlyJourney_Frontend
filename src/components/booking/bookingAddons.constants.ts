import type { BaggageOption, ServiceOption } from "./AddonsSelector";

export const BAGGAGE_OPTIONS: BaggageOption[] = [
  { id: "none", label: "Không mua thêm", extraKg: 0, price: 0 },
  { id: "bg10", label: "+10kg ký gửi", extraKg: 10, price: 190000 },
  { id: "bg15", label: "+15kg ký gửi", extraKg: 15, price: 260000 },
  { id: "bg20", label: "+20kg ký gửi", extraKg: 20, price: 330000 },
];

export const SERVICE_OPTIONS: ServiceOption[] = [
  { id: "svc_fasttrack", label: "Fast Track an ninh", price: 150000 },
  { id: "svc_meal", label: "Suất ăn nóng", price: 120000 },
  { id: "svc_combo", label: "Combo ăn + nước", price: 180000 },
  { id: "svc_priority", label: "Ưu tiên lên máy bay", price: 90000 },
];
