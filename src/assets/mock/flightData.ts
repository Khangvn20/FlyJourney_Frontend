import type {
  Airport,
  FlightClass,
  SpecialRequirement,
} from "../../shared/types/flight.types";

export const airports: Airport[] = [
  // Việt Nam
  { code: "HAN", name: "Sân bay Nội Bài", city: "Hà Nội", country: "Vietnam" },
  {
    code: "SGN",
    name: "Sân bay Tân Sơn Nhất",
    city: "TP. Hồ Chí Minh",
    country: "Vietnam",
  },
  { code: "DAD", name: "Sân bay Đà Nẵng", city: "Đà Nẵng", country: "Vietnam" },
  {
    code: "CXR",
    name: "Sân bay Cam Ranh",
    city: "Nha Trang",
    country: "Vietnam",
  },
  {
    code: "PQC",
    name: "Sân bay Phú Quốc",
    city: "Phú Quốc",
    country: "Vietnam",
  },
  { code: "VCA", name: "Sân bay Cần Thơ", city: "Cần Thơ", country: "Vietnam" },
  {
    code: "HPH",
    name: "Sân bay Cát Bi",
    city: "Hải Phòng",
    country: "Vietnam",
  },
  { code: "HUI", name: "Sân bay Phú Bài", city: "Huế", country: "Vietnam" },
  {
    code: "VDH",
    name: "Sân bay Đồng Hới",
    city: "Đồng Hới",
    country: "Vietnam",
  },
  {
    code: "VDO",
    name: "Sân bay Vân Đồn",
    city: "Quảng Ninh",
    country: "Vietnam",
  },
  {
    code: "VKG",
    name: "Sân bay Rạch Giá",
    city: "Rạch Giá",
    country: "Vietnam",
  },
  { code: "CAH", name: "Sân bay Cà Mau", city: "Cà Mau", country: "Vietnam" },
  { code: "TBB", name: "Sân bay Tuy Hòa", city: "Tuy Hòa", country: "Vietnam" },
  {
    code: "BMV",
    name: "Sân bay Buôn Ma Thuột",
    city: "Buôn Ma Thuột",
    country: "Vietnam",
  },
  { code: "PXU", name: "Sân bay Pleiku", city: "Pleiku", country: "Vietnam" },
  {
    code: "DLI",
    name: "Sân bay Liên Khương",
    city: "Đà Lạt",
    country: "Vietnam",
  },
  {
    code: "UIH",
    name: "Sân bay Phù Cát",
    city: "Quy Nhon",
    country: "Vietnam",
  },
  { code: "VCS", name: "Sân bay Côn Đảo", city: "Côn Đảo", country: "Vietnam" },
];

export const flightClasses: FlightClass[] = [
  {
    value: "economy",
    label: "Phổ thông",
    description: "Ghế tiêu chuẩn với dịch vụ cơ bản",
  },
  {
    value: "premium",
    label: "Phổ thông đặc biệt",
    description: "Ghế rộng hơn với nhiều tiện ích",
  },
  {
    value: "business",
    label: "Thương gia",
    description: "Ghế êm ái, dịch vụ cao cấp",
  },
  {
    value: "first",
    label: "Hạng nhất",
    description: "Dịch vụ và tiện nghi tốt nhất",
  },
];

export const specialRequirements: SpecialRequirement[] = [
  {
    value: "normal",
    label: "Tôi là hành khách thông thường",
    description: "Không có yêu cầu đặc biệt",
  },
  {
    value: "mobility",
    label: "Tôi cần hỗ trợ di chuyển",
    description: "Hỗ trợ xe lăn hoặc di chuyển",
  },
  {
    value: "pregnant",
    label: "Tôi đang mang thai",
    description: "Dịch vụ dành cho phụ nữ có thai",
  },
  {
    value: "medical",
    label: "Tôi có tình trạng y tế cần hỗ trợ",
    description: "Hỗ trợ y tế trong chuyến bay",
  },
  {
    value: "infant-travel",
    label: "Tôi bay cùng trẻ nhỏ",
    description: "Dịch vụ hỗ trợ trẻ em và gia đình",
  },
  {
    value: "other",
    label: "Tôi có yêu cầu đặc biệt khác",
    description: "Các yêu cầu khác",
  },
];
