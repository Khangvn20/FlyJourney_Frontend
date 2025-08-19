import type { BaggageOption, ServiceOption } from "./AddonsSelector";
import { SERVICE_MAPPING } from "../../shared/constants/serviceMapping";

export const BAGGAGE_OPTIONS: BaggageOption[] = [
  { id: "none", label: "Không mua thêm", extraKg: 0, price: 0 },
  { id: "bg10", label: "+10kg ký gửi", extraKg: 10, price: 190000 },
  { id: "bg15", label: "+15kg ký gửi", extraKg: 15, price: 260000 },
  { id: "bg20", label: "+20kg ký gửi", extraKg: 20, price: 330000 },
];

// Use shared service mapping to ensure consistency
export const SERVICE_OPTIONS: ServiceOption[] = SERVICE_MAPPING.map(
  (service) => ({
    id: service.id,
    label: service.label,
    price: service.price,
    desc: service.desc,
  })
);
