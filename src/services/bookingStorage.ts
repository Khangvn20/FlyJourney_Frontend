import type {
  BookingRecord,
  BookingPayload,
} from "../shared/types/passenger.types";

const STORAGE_KEY = "userBookings";

export function loadBookings(): BookingRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as BookingRecord[];
  } catch {
    return [];
  }
}

export function saveBookings(list: BookingRecord[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}

export function addBooking(
  payload: BookingPayload,
  bookingId: string
): BookingRecord {
  const record: BookingRecord = {
    ...payload,
    bookingId,
    status: "CONFIRMED",
    createdAt: new Date().toISOString(),
  };
  const list = loadBookings();
  list.unshift(record);
  saveBookings(list);
  return record;
}
