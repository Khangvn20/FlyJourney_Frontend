export interface MockBooking {
  bookingCode: string;
  flightId: string;
  passengerName: string;
  seat?: string;
}

export async function fetchBooking(
  bookingCode: string,
  lastName: string,
): Promise<MockBooking> {
  return new Promise((resolve) =>
    setTimeout(
      () =>
        resolve({
          bookingCode,
          flightId: "FJ123",
          passengerName: `${lastName} Demo`,
          seat: undefined,
        }),
      300,
    ),
  );
}

export async function submitCheckin(
  _bookingCode: string,
  _seatId: string,
): Promise<{ success: boolean }> {
  void _bookingCode;
  void _seatId;
  return new Promise((resolve) =>
    setTimeout(() => resolve({ success: true }), 300),
  );
}
