import type {
  Airport,
} from "../shared/types";

export const airports: Airport[] = [
  // Quốc tế (11)
  {
    code: "SGN",
    name: "Tân Sơn Nhất",
    city: "Ho Chi Minh City",
    country: "Vietnam",
  },
  { code: "HAN", name: "Nội Bài", city: "Hanoi", country: "Vietnam" },
  { code: "DAD", name: "Đà Nẵng", city: "Da Nang", country: "Vietnam" },
  { code: "CXR", name: "Cam Ranh", city: "Nha Trang", country: "Vietnam" },
  { code: "PQC", name: "Phú Quốc", city: "Phu Quoc", country: "Vietnam" },
  { code: "VCA", name: "Cần Thơ", city: "Can Tho", country: "Vietnam" },
  { code: "HPH", name: "Cát Bi", city: "Hai Phong", country: "Vietnam" },
  { code: "HUI", name: "Phú Bài", city: "Hue", country: "Vietnam" },
  { code: "DLI", name: "Liên Khương", city: "Da Lat", country: "Vietnam" },
  { code: "VII", name: "Vinh", city: "Vinh", country: "Vietnam" },
  { code: "VDO", name: "Vân Đồn", city: "Ha Long", country: "Vietnam" },
  // Nội địa (11)
  { code: "UIH", name: "Phù Cát", city: "Quy Nhon", country: "Vietnam" },
  { code: "VDH", name: "Đồng Hới", city: "Dong Hoi", country: "Vietnam" },
  { code: "THD", name: "Thọ Xuân", city: "Thanh Hoa", country: "Vietnam" },
  { code: "VCL", name: "Chu Lai", city: "Nui Thanh", country: "Vietnam" },
  { code: "TBB", name: "Tuy Hòa", city: "Tuy Hoa", country: "Vietnam" },
  { code: "PXU", name: "Pleiku", city: "Pleiku", country: "Vietnam" },
  {
    code: "BMV",
    name: "Buôn Ma Thuột",
    city: "Buon Ma Thuot",
    country: "Vietnam",
  },
  {
    code: "DIN",
    name: "Điện Biên Phủ",
    city: "Dien Bien Phu",
    country: "Vietnam",
  },
  { code: "VKG", name: "Rạch Giá", city: "Rach Gia", country: "Vietnam" },
  { code: "CAH", name: "Cà Mau", city: "Ca Mau", country: "Vietnam" },
  { code: "VCS", name: "Côn Đảo", city: "Con Dao", country: "Vietnam" },
];

export const airportMeta: Record<
  string,
  { type: "international" | "domestic"; active: boolean }
> = {
  SGN: { type: "international", active: true },
  HAN: { type: "international", active: true },
  DAD: { type: "international", active: true },
  CXR: { type: "international", active: true },
  PQC: { type: "international", active: true },
  VCA: { type: "international", active: true },
  HPH: { type: "international", active: true },
  HUI: { type: "international", active: true },
  DLI: { type: "international", active: true },
  VII: { type: "international", active: true },
  VDO: { type: "international", active: true },
  UIH: { type: "domestic", active: true },
  VDH: { type: "domestic", active: true },
  THD: { type: "domestic", active: true },
  VCL: { type: "domestic", active: true },
  TBB: { type: "domestic", active: true },
  PXU: { type: "domestic", active: true },
  BMV: { type: "domestic", active: true },
  DIN: { type: "domestic", active: true },
  VKG: { type: "domestic", active: true },
  CAH: { type: "domestic", active: true },
  VCS: { type: "domestic", active: true },
};

export const AIRPORT_COUNTS = {
  total: airports.length,
  international: airports.filter(
    (a) => airportMeta[a.code].type === "international"
  ).length,
  domestic: airports.filter((a) => airportMeta[a.code].type === "domestic")
    .length,
};

export const FlightClass = [
  { value: "all", label: "Tất cả hạng vé", description: "Hiển thị mọi lựa chọn" },
  { value: "economy", label: "Economy", description: "Tiết kiệm, phổ biến" },
  {
    value: "premium-economy",
    label: "Premium Economy",
    description: "Rộng hơn, linh hoạt",
  },
  { value: "business", label: "Business", description: "Ưu tiên, ghế rộng" },
  { value: "first", label: "First", description: "Cao cấp nhất" },
];

export const SpecialRequirement = [
  { value: "none", label: "Không có" },
  { value: "wheelchair", label: "Hỗ trợ xe lăn" },
  { value: "special-meal", label: "Suất ăn đặc biệt" },
  { value: "infant-bassinet", label: "Nôi cho em bé" },
];
