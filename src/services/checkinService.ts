export interface CheckinBooking {
  bookingCode: string;
  flightId: number;
  passengerName: string;
  seat?: string;
  flightNumber: string;
  departureTime: string;
  arrivalTime: string;
  departureAirport: string;
  arrivalAirport: string;
  airlineName: string;
  flightClass: string;
}

export interface CheckinValidatePayload {
  pnr_code: string;
  email: string;
  full_name: string;
}

export interface CheckinValidateResponse {
  data: {
    is_eligible: boolean;
    pnr_code: string;
    flight_id: number;
    flight_number: string;
    departure_time: string;
    arrival_time: string;
    departure_airport: string;
    arrival_airport: string;
    airline_name: string;
    booking_details: Array<{
      booking_detail_id: number;
      passenger_name: string;
      passenger_age: number;
      passenger_gender: string;
      flight_class_name: string;
      seat_number: string | null;
      is_checked_in: boolean;
      id_number: string;
      id_type: string;
    }>;
  };
  status: boolean;
  errorCode: string;
  errorMessage: string;
}

export async function validateCheckin(
  payload: CheckinValidatePayload
): Promise<CheckinBooking> {
  const token = localStorage.getItem("auth_token");
  const res = await fetch(`/api/v1/checkin/validate`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const errBody = await res.text().catch(() => "");
    throw new Error(
      `Validate failed (${res.status}): ${errBody || res.statusText}`
    );
  }

  const data = (await res.json()) as CheckinValidateResponse;
  if (!data?.status) {
    throw new Error(data?.errorMessage || "Validate failed");
  }

  const firstPassenger = data.data.booking_details?.[0] || null;
  return {
    bookingCode: data.data.pnr_code,
    flightId: data.data.flight_id,
    passengerName: firstPassenger?.passenger_name || "",
    seat: firstPassenger?.seat_number || undefined,
    flightNumber: data.data.flight_number,
    departureTime: data.data.departure_time,
    arrivalTime: data.data.arrival_time,
    departureAirport: data.data.departure_airport,
    arrivalAirport: data.data.arrival_airport,
    airlineName: data.data.airline_name,
    flightClass: firstPassenger?.flight_class_name || "economy",
  };
}

export async function submitCheckin(
  _bookingCode: string,
  _seatId: string
): Promise<{ success: boolean }> {
  void _bookingCode;
  void _seatId;
  return new Promise((resolve) =>
    setTimeout(() => resolve({ success: true }), 300)
  );
}
