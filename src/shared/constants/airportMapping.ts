/**
 * Airport code to city name mapping for Vietnam airports
 * Format: { code: city_name }
 */
export const AIRPORT_TO_CITY_MAPPING: Record<string, string> = {
  // Ho Chi Minh City airports
  SGN: "TP. Hồ Chí Minh",
  // Some backends may incorrectly use TSN for Tan Son Nhat (SGN)
  // Keep mapping to city to satisfy list view "city (CODE)" requirement
  TSN: "TP. Hồ Chí Minh",

  // Hanoi airports
  HAN: "Hà Nội",
  // Some backends may provide NOI for Noi Bai
  NOI: "Hà Nội",

  // Da Nang
  DAD: "Đà Nẵng",

  // Nha Trang
  CXR: "Nha Trang",
  KHA: "Nha Trang",

  // Phu Quoc
  PQC: "Phú Quốc",

  // Can Tho
  VCA: "Cần Thơ",

  // Hai Phong
  HPH: "Hải Phòng",

  // Hue
  HUI: "Huế",

  // Quy Nhon
  UIH: "Quy Nhon",

  // Da Lat
  DLI: "Đà Lạt",

  // Buon Ma Thuot
  BMV: "Buôn Ma Thuột",

  // Pleiku
  PXU: "Pleiku",

  // Vinh
  VII: "Vinh",

  // Ca Mau
  CAH: "Cà Mau",

  // Rach Gia
  VKG: "Rạch Giá",

  // Con Dao
  VCS: "Côn Đảo",

  // International airports that might be used
  BKK: "Bangkok",
  SIN: "Singapore",
  KUL: "Kuala Lumpur",
  MNL: "Manila",
  ICN: "Seoul",
  NRT: "Tokyo",
};

/**
 * Airport name (cleaned) to IATA code mapping.
 * Used to derive codes when API only returns airport names.
 */
export const AIRPORT_NAME_TO_CODE_MAPPING: Record<string, string> = {
  // Vietnam
  "TAN SON NHAT": "SGN",
  "TÂN SƠN NHẤT": "SGN",
  "NOI BAI": "HAN",
  "NỘI BÀI": "HAN",
  "DA NANG": "DAD",
  "ĐÀ NẴNG": "DAD",
  "CAM RANH": "CXR",
  "PHU QUOC": "PQC",
  "PHÚ QUỐC": "PQC",
  "CAN THO": "VCA",
  "CẦN THƠ": "VCA",
  "HAI PHONG": "HPH",
  "HẢI PHÒNG": "HPH",
  HUE: "HUI",
  HUẾ: "HUI",
  "QUY NHON": "UIH",
  "QUY NHƠN": "UIH",
  "DA LAT": "DLI",
  "ĐÀ LẠT": "DLI",
  "BUON MA THUOT": "BMV",
  "BUÔN MA THUỘT": "BMV",
  PLEIKU: "PXU",
  VINH: "VII",
  "CA MAU": "CAH",
  "CÀ MAU": "CAH",
  "RACH GIA": "VKG",
  "RẠCH GIÁ": "VKG",
  "CON DAO": "VCS",
  "CÔN ĐẢO": "VCS",
};

/**
 * Get city name from airport code
 * @param airportCode - Airport IATA code (e.g., 'HAN', 'SGN')
 * @returns City name or the airport code if not found
 */
export function getCityFromAirportCode(airportCode: string): string {
  if (!airportCode) return "";

  const upperCode = airportCode.toUpperCase();
  return AIRPORT_TO_CITY_MAPPING[upperCode] || upperCode;
}

/**
 * Format airport display as "City (CODE)"
 * @param airportCode - Airport IATA code
 * @returns Formatted string like "Hà Nội (HAN)" or just the code if city not found
 */
export function formatAirportDisplay(airportCode: string): string {
  if (!airportCode) return "---";

  const upperCode = airportCode.toUpperCase();
  const cityName = AIRPORT_TO_CITY_MAPPING[upperCode];

  if (cityName) {
    return `${cityName} (${upperCode})`;
  }

  // Fallback: just return the code
  return upperCode;
}

/**
 * Format airport display using API response data
 * Transform API data to user-friendly format
 * @param airportName - Full airport name from API (e.g., "Sân Bay Tân Sơn Nhất")
 * @param airportCode - Airport IATA code from API (e.g., "TSN")
 * @param showOnlyCity - If true, shows only city name (used in MyBookings)
 * @returns Formatted string from API data
 */
export function formatAirportFromApiData(
  airportName?: string,
  airportCode?: string,
  showOnlyCity: boolean = false
): string {
  // Normalize and validate code (treat placeholders like '---' as empty)
  const rawCode = (airportCode || "").toUpperCase();
  const validCode = /^[A-Z]{3}$/.test(rawCode) ? rawCode : "";
  const normalized = normalizeIataCode(validCode);
  const code = normalized || deriveAirportCodeFromName(airportName) || "";
  const cleanName = airportName ? cleanAirportName(airportName) : "";

  // If we should show city preference (list view)
  if (showOnlyCity) {
    if (code) {
      const city = AIRPORT_TO_CITY_MAPPING[code] || cleanName || code;
      return `${city} (${code})`;
    }
    // No valid code: show only the cleaned name (avoid '(---)')
    return cleanName || "---";
  }

  // Detailed view: prefer airport name + code if available
  if (cleanName && code) return `${cleanName} (${code})`;
  if (cleanName) return cleanName;
  if (code) return formatAirportDisplay(code);
  return "---";
}

/**
 * Clean airport name from API response
 * Remove redundant words, standardize format
 * @param rawName - Raw airport name from API
 * @returns Cleaned airport name
 */
function cleanAirportName(rawName: string): string {
  if (!rawName) return "";

  let cleaned = rawName.trim();

  // Remove common prefixes/suffixes that might be redundant
  cleaned = cleaned
    .replace(/^Sân [Bb]ay\s+/i, "") // Remove "Sân bay" prefix
    .replace(/\s+Airport$/i, "") // Remove "Airport" suffix
    .replace(/\s+International$/i, "") // Remove "International" suffix
    .replace(/\s+Domestic$/i, "") // Remove "Domestic" suffix
    .replace(/\s+Quốc [Tt]ế$/i, "") // Remove "Quốc tế" suffix
    .replace(/\s+Nội [Bb]ài$/i, "") // Remove "Nội bài" suffix
    .trim();

  // Convert common airport names to shorter forms
  const airportTransforms: Record<string, string> = {
    "Tân Sơn Nhất": "Tân Sơn Nhất",
    "Nội Bài": "Nội Bài",
    "Cam Ranh": "Cam Ranh",
    "Đà Nẵng": "Đà Nẵng",
    "Phú Quốc": "Phú Quốc",
    "Cần Thơ": "Cần Thơ",
    Pleiku: "Pleiku",
    "Buôn Ma Thuột": "Buôn Ma Thuột",
  };

  // Check if cleaned name matches any transform
  for (const [key, value] of Object.entries(airportTransforms)) {
    if (cleaned.toLowerCase().includes(key.toLowerCase())) {
      return value;
    }
  }

  // If after cleaning it's too short, return original
  if (cleaned.length < 3) {
    return rawName;
  }

  return cleaned;
}

/**
 * Format only the airport name (without appending IATA code), cleaned and user-friendly.
 */
export function formatAirportNameOnly(airportName?: string): string {
  if (!airportName) return "---";
  const cleaned = cleanAirportName(airportName);
  return cleaned || "---";
}

/**
 * Format route display using pure API response data
 * @param departureAirportName - Departure airport name from API
 * @param departureCode - Departure airport code from API
 * @param arrivalAirportName - Arrival airport name from API
 * @param arrivalCode - Arrival airport code from API
 * @param showCityNames - Whether to show city names (for MyBookings list)
 * @returns Formatted route string from API data
 */
export function formatRouteFromApiData(
  departureAirportName?: string,
  departureCode?: string,
  arrivalAirportName?: string,
  arrivalCode?: string,
  showCityNames: boolean = false
): string {
  const departure = formatAirportFromApiData(
    departureAirportName,
    departureCode,
    showCityNames
  );
  const arrival = formatAirportFromApiData(
    arrivalAirportName,
    arrivalCode,
    showCityNames
  );

  return `${departure} → ${arrival}`;
}

/**
 * Try to derive IATA code from an airport name.
 */
export function deriveAirportCodeFromName(
  airportName?: string
): string | undefined {
  if (!airportName) return undefined;
  const cleaned = cleanAirportName(airportName).toUpperCase();
  // Exact match first
  if (AIRPORT_NAME_TO_CODE_MAPPING[cleaned]) {
    return AIRPORT_NAME_TO_CODE_MAPPING[cleaned];
  }
  // Partial contains match
  for (const [key, val] of Object.entries(AIRPORT_NAME_TO_CODE_MAPPING)) {
    if (cleaned.includes(key)) return val;
  }
  return undefined;
}

/**
 * Normalize/alias IATA codes to desired canonical form.
 * - Maps backend variants like TSN -> SGN, NOI -> HAN
 * - Returns empty string for invalid placeholders
 */
export function normalizeIataCode(code?: string): string {
  if (!code) return "";
  const upper = code.toUpperCase().trim();
  if (!/^[A-Z]{3}$/.test(upper)) return "";
  const alias: Record<string, string> = {
    TSN: "SGN", // Tan Son Nhat (Ho Chi Minh City)
    NOI: "HAN", // Noi Bai (Ha Noi)
  };
  return alias[upper] || upper;
}
