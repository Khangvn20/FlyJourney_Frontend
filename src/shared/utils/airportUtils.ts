import {
  deriveAirportCodeFromName,
  normalizeIataCode,
} from "../constants/airportMapping";
/**
 * Get airport code for display next to flight times
 * @param airportCode - Airport code from API
 * @returns Formatted code or empty string
 */
export function getAirportCodeForTime(airportCode?: string): string {
  if (!airportCode) return "";
  const code = airportCode.toUpperCase().trim();
  if (!/^[A-Z]{3}$/.test(code)) return "";
  // Inline minimal aliasing to avoid import cycles; keep in sync with normalizeIataCode
  if (code === "TSN") return "SGN";
  if (code === "NOI") return "HAN";
  return code;
}

/**
 * Derive a proper IATA code to show next to time using either provided code or airport name.
 * Falls back to name->code mapping if the code is missing.
 */
export function getAirportTimeBadge(name?: string, code?: string): string {
  // Prefer given code (normalized)
  const normalized = normalizeIataCode(code || "");
  if (normalized) return normalized;
  // Try derive from name
  const derived = deriveAirportCodeFromName(name);
  return normalizeIataCode(derived || "");
}
