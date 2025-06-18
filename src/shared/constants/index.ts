// Application constants
export const APP_CONFIG = {
  APP_NAME: 'FlyJourney',
  VERSION: '1.0.0',
  API_BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api',
} as const;

export const ROUTES = {
  HOME: '/',
  SEARCH_RESULTS: '/search',
  BOOKING: '/booking',
  PROFILE: '/profile',
  LOGIN: '/login',
  REGISTER: '/register',
} as const;

export const CITIES = [
  { code: 'HAN', name: 'Hà Nội', country: 'Việt Nam' },
  { code: 'SGN', name: 'Hồ Chí Minh', country: 'Việt Nam' },
  { code: 'DAD', name: 'Đà Nẵng', country: 'Việt Nam' },
  { code: 'CXR', name: 'Nha Trang', country: 'Việt Nam' },
  { code: 'HPH', name: 'Hải Phòng', country: 'Việt Nam' },
  { code: 'HUI', name: 'Huế', country: 'Việt Nam' },
  { code: 'PQC', name: 'Phú Quốc', country: 'Việt Nam' },
  { code: 'DLI', name: 'Đà Lạt', country: 'Việt Nam' },
  { code: 'VCA', name: 'Cần Thơ', country: 'Việt Nam' },
  { code: 'UIH', name: 'Quy Nhơn', country: 'Việt Nam' },
  { code: 'VDO', name: 'Vân Đồn', country: 'Việt Nam' },
  { code: 'VCS', name: 'Côn Đảo', country: 'Việt Nam' },
  { code: 'BMV', name: 'Buôn Ma Thuột', country: 'Việt Nam' },
  { code: 'VCL', name: 'Chu Lai', country: 'Việt Nam' },
  { code: 'THD', name: 'Thanh Hóa', country: 'Việt Nam' },
  { code: 'VKG', name: 'Rạch Giá', country: 'Việt Nam' },
  { code: 'CAH', name: 'Cà Mau', country: 'Việt Nam' },
  { code: 'TBB', name: 'Tuy Hòa', country: 'Việt Nam' },
  { code: 'VII', name: 'Vinh', country: 'Việt Nam' },
  { code: 'DIN', name: 'Điện Biên Phủ', country: 'Việt Nam' },
  { code: 'PXU', name: 'Pleiku', country: 'Việt Nam' },
] as const;

export const FLIGHT_CLASSES = [
  { value: 'economy', label: 'Phổ thông' },
  { value: 'premium-economy', label: 'Phổ thông đặc biệt' },
  { value: 'business', label: 'Thương gia' },
  { value: 'first', label: 'Hạng nhất' },
] as const;

export const AMENITY_ICONS = {
  wifi: 'Wifi',
  meals: 'Utensils',
  entertainment: 'Star',
  'extra-legroom': 'Luggage',
} as const;