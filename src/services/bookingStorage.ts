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
  const now = new Date();
  const isHold = payload.paymentMethod === "office"; // office = pay later at office (hold 2h)
  const record: BookingRecord = {
    ...payload,
    bookingId,
    status: isHold ? "PENDING" : "CONFIRMED",
    createdAt: now.toISOString(),
    holdExpiresAt: isHold
      ? new Date(now.getTime() + 2 * 60 * 60 * 1000).toISOString() // 2h hold window
      : undefined,
  };
  const list = loadBookings();
  list.unshift(record);
  saveBookings(list);
  return record;
}
