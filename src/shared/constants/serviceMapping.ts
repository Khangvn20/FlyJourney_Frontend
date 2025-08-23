/**
 * Service mapping constants for booking addons
 * This file ensures consistency between UI constants and API helpers
 */

export interface ServiceMappingItem {
  id: string;
  label: string;
  price: number;
  desc?: string;
  apiDescription: (passengerCount: number) => string;
}

export const SERVICE_MAPPING: ServiceMappingItem[] = [
  {
    id: "seat_selection",
    label: "Chọn chỗ ngồi",
    price: 150000,
    desc: "Chọn vị trí ngồi ưa thích",
    apiDescription: (count: number) =>
      `Dịch vụ chọn chỗ ngồi - ${count} hành khách`,
  },
  {
    id: "priority_boarding",
    label: "Lên máy bay ưu tiên",
    price: 100000,
    desc: "Ưu tiên lên máy bay trước",
    apiDescription: (count: number) =>
      `Lên máy bay ưu tiên - ${count} hành khách`,
  },
  {
    id: "lounge_access",
    label: "Phòng chờ VIP",
    price: 300000,
    desc: "Truy cập phòng chờ VIP sân bay",
    apiDescription: (count: number) =>
      `Phòng chờ VIP sân bay - ${count} hành khách`,
  },
  {
    id: "extra_legroom",
    label: "Ghế khoang rộng",
    price: 250000,
    desc: "Ghế có khoảng chân rộng hơn",
    apiDescription: (count: number) =>
      `Ghế khoang rộng - ${count} hành khách`,
  },
  {
    id: "wifi",
    label: "WiFi trên máy bay",
    price: 80000,
    desc: "Truy cập internet trong chuyến bay",
    apiDescription: (count: number) =>
      `Dịch vụ WiFi trên chuyến bay - ${count} hành khách`,
  },
  {
    id: "meal_upgrade",
    label: "Nâng cấp suất ăn",
    price: 200000,
    desc: "Suất ăn cao cấp với menu đặc biệt",
    apiDescription: (count: number) =>
      `Nâng cấp suất ăn - ${count} hành khách`,
  },
  {
    id: "fast_track",
    label: "Fast Track an ninh",
    price: 120000,
    desc: "Ưu tiên qua cửa an ninh",
    apiDescription: (count: number) =>
      `Fast Track an ninh - ${count} hành khách`,
  },
  {
    id: "travel_insurance",
    label: "Bảo hiểm du lịch",
    price: 50000,
    desc: "Bảo hiểm cơ bản cho chuyến bay",
    apiDescription: (count: number) =>
      `Bảo hiểm du lịch - ${count} hành khách`,
  },
];

/**
 * Get service mapping by ID
 */
export function getServiceMapping(
  serviceId: string
): ServiceMappingItem | undefined {
  return SERVICE_MAPPING.find((service) => service.id === serviceId);
}

/**
 * Generate API description for a service
 */
export function getServiceApiDescription(
  serviceId: string,
  passengerCount: number
): string {
  const mapping = getServiceMapping(serviceId);
  if (mapping) {
    return mapping.apiDescription(passengerCount);
  }
  return ` Dịch vụ bổ sung - ${passengerCount} hành khách`;
}

/**
 * Generate baggage API description
 */
export function getBaggageApiDescription(
  baggageWeight: number,
  passengerIndex: number,
  passengerName: string
): string {
  return ` Hành lý ký gửi thêm ${baggageWeight}kg - Hành khách ${
    passengerIndex + 1
  }: ${passengerName}`;
}
