import type { FlightClass } from "../shared/types/flight-api.types";
import type {
  FlightSearchApiResult,
  FlightSearchResponseData,
} from "../shared/types/search-api.types";

export type SafeObj = Record<string, unknown>;
export type FlightSortBy = "price" | "departure" | "duration";
export type FlightSortOrder = "asc" | "desc";

export interface PerDayFlightsGroup {
  day: string;
  flights: FlightSearchApiResult[];
}

export interface MonthBucketSummary {
  key: string;
  month: number;
  year: number;
  label: string;
  shortLabel: string;
  totalCalendarDays: number;
  loadedDays: number;
  groups: PerDayFlightsGroup[];
}

export interface MonthRangeMeta {
  startMonth: number;
  startYear: number;
  endMonth: number;
  endYear: number;
  monthsCount: number;
  totalDays: number;
  loadedDays: number;
  loading: boolean;
  phase?: "outbound" | "inbound" | "done";
}

export interface MonthAggregatedData {
  arrival_airport: string;
  arrival_date: string;
  departure_airport: string;
  departure_date: string;
  flight_class: string;
  limit: number;
  page: number;
  passengers: { adults: number; children: number; infants: number };
  search_results: FlightSearchApiResult[];
  sort_by: string;
  sort_order: string;
  total_count: number;
  total_pages: number;
  per_day_results: PerDayFlightsGroup[];
}

export interface MonthAggregatedWrapper {
  status: boolean;
  data: MonthAggregatedData;
  meta: MonthRangeMeta;
  errorCode?: string;
  errorMessage?: string;
}

export const normalizeAirlineSlug = (value: string | null | undefined) =>
  (value ?? "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

const FLIGHT_CLASS_VALUES: FlightClass[] = [
  "all",
  "economy",
  "premium_economy",
  "business",
  "first",
];

const FLIGHT_CLASS_ALIASES: Record<string, FlightClass> = {
  all: "all",
  economy: "economy",
  economy_class: "economy",
  premium: "premium_economy",
  premium_economy: "premium_economy",
  premiumeconomy: "premium_economy",
  premium_class: "premium_economy",
  premium_economy_class: "premium_economy",
  premiumeconomy_class: "premium_economy",
  business: "business",
  business_class: "business",
  first: "first",
  first_class: "first",
};

const SORT_BY_VALUES: FlightSortBy[] = ["price", "departure", "duration"];

export function getStr(o: SafeObj, k: string): string | undefined {
  const v = o[k];
  return typeof v === "string" ? v : undefined;
}

export function getNum(o: SafeObj, k: string): number | undefined {
  const v = o[k];
  return typeof v === "number" ? v : undefined;
}

export function getObj(o: SafeObj, k: string): SafeObj | undefined {
  const v = o[k];
  return v && typeof v === "object" && !Array.isArray(v)
    ? (v as SafeObj)
    : undefined;
}

function getArr<T = unknown>(o: SafeObj, k: string): T[] | undefined {
  const v = o[k];
  return Array.isArray(v) ? (v as T[]) : undefined;
}

export function toFlightClass(value: string): FlightClass {
  const normalized = value?.toLowerCase?.().trim() ?? "";
  if (!normalized) return "economy";

  const sanitized = normalized.replace(/[\s-]+/g, "_");
  return (
    FLIGHT_CLASS_ALIASES[sanitized] ??
    FLIGHT_CLASS_ALIASES[normalized] ??
    "economy"
  );
}

export function toSortBy(v: string): FlightSortBy | undefined {
  return SORT_BY_VALUES.includes(v as FlightSortBy)
    ? (v as FlightSortBy)
    : undefined;
}

export function toSortOrder(v: string): FlightSortOrder | undefined {
  return v === "asc" || v === "desc" ? (v as FlightSortOrder) : undefined;
}

export function isMonthAggregatedWrapper(
  v: unknown
): v is MonthAggregatedWrapper {
  if (!v || typeof v !== "object") return false;
  const obj = v as SafeObj;
  const data = getObj(obj, "data");
  const meta = getObj(obj, "meta");
  if (!data || !meta) return false;
  const perDay = data["per_day_results"];
  const hasRangeMeta =
    typeof meta["startMonth"] === "number" &&
    typeof meta["startYear"] === "number" &&
    typeof meta["endMonth"] === "number" &&
    typeof meta["endYear"] === "number" &&
    typeof meta["monthsCount"] === "number" &&
    typeof meta["totalDays"] === "number" &&
    typeof meta["loadedDays"] === "number" &&
    typeof meta["loading"] === "boolean";
  return Array.isArray(perDay) && hasRangeMeta;
}

export function isDirectFlightData(v: unknown): v is FlightSearchResponseData {
  if (!v || typeof v !== "object") return false;
  const obj = v as SafeObj;
  return (
    "search_results" in obj ||
    "outbound_search_results" in obj ||
    "inbound_search_results" in obj
  );
}

export function extractNestedRoundTrip(data: unknown): {
  outbound: FlightSearchApiResult[];
  inbound: FlightSearchApiResult[];
} | null {
  if (!data || typeof data !== "object") return null;
  const root = data as SafeObj;
  const sr = getObj(root, "search_results");
  if (!sr) return null;
  const outbound = getArr<FlightSearchApiResult>(sr, "outbound_flights");
  const inbound = getArr<FlightSearchApiResult>(sr, "inbound_flights");
  if (outbound && inbound) return { outbound, inbound };
  return null;
}

export { FLIGHT_CLASS_VALUES, SORT_BY_VALUES };
