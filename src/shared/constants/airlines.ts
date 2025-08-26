/**
 * Airline mapping constants
 * Based on database airline IDs
 */

export interface AirlineInfo {
  id: number;
  name: string;
  code: string;
  logo?: string;
}

export const AIRLINES: Record<string, AirlineInfo> = {
  VIETNAM: {
    id: 1,
    name: "Vietnam Airlines",
    code: "VN",
    logo: "/airlines/vietnam-airlines.png",
  },
  VIETJET: {
    id: 2,
    name: "VietJet Air",
    code: "VJ",
    logo: "/airlines/vietjet-airlines.png",
  },
  AIRASIA: {
    id: 3,
    name: "Air Asia",
    code: "AK",
    logo: "/airlines/airasia-airlines.png",
  },
  PACIFIC: {
    id: 4,
    name: "Pacific Airlines",
    code: "BL",
    logo: "/airlines/pacific-airlines.png",
  },
  BAMBOO: {
    id: 5,
    name: "Bamboo Airways",
    code: "QH",
    logo: "/airlines/bamboo-airlines.png",
  },
  VIETRAVEL: {
    id: 6,
    name: "Vietravel",
    code: "VU",
    logo: "/airlines/vietravel-airlines.png",
  },
};

export const AIRLINE_LIST = Object.values(AIRLINES);

export const getAirlineById = (id: number): AirlineInfo | undefined => {
  return AIRLINE_LIST.find((airline) => airline.id === id);
};

export const getAirlineByName = (name: string): AirlineInfo | undefined => {
  return AIRLINE_LIST.find((airline) =>
    airline.name.toLowerCase().includes(name.toLowerCase())
  );
};

export const getAirlineByCode = (code: string): AirlineInfo | undefined => {
  return AIRLINE_LIST.find(
    (airline) => airline.code.toLowerCase() === code.toLowerCase()
  );
};

/**
 * Detect airline from flight number
 * Examples: VJ1374 → VietJet Air, VN123 → Vietnam Airlines
 */
export const getAirlineFromFlightNumber = (flightNumber: string): AirlineInfo | undefined => {
  if (!flightNumber) return undefined;
  
  // Extract airline code from flight number (first 2-3 characters)
  const code = flightNumber.match(/^([A-Z]{2,3})/)?.[1];
  if (!code) return undefined;
  
  // Map common flight codes to our airlines
  const codeMapping: Record<string, string> = {
    'VJ': 'VIETJET',
    'AK': 'AIRASIA',
    'BL': 'PACIFIC',
    'QH': 'BAMBOO',
    'VU': 'VIETRAVEL',
    'VN': 'VIETNAM'
  };
  
  const airlineKey = codeMapping[code];
  return airlineKey ? AIRLINES[airlineKey] : undefined;
};
