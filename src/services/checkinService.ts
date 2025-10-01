import { buildApiUrl } from "../shared/constants/apiConfig";

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
  bookingId?: number; // Add booking ID from API
  bookingDetailId?: number; // Add booking detail ID from API
}

export interface CheckinValidatePayload {
  pnr_code: string;
  email: string;
  full_name: string;
}

export interface CheckinValidateResponse {
  data: {
    is_eligible: boolean;
    error_message?: string;
    pnr_code: string;
    booking_id: number;
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
  const res = await fetch(buildApiUrl("/checkin/validate"), {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(payload),
  });

  let responseData;
  try {
    // Try to parse the response directly as JSON
    responseData = await res.json();
    console.log("API response:", responseData);
  } catch {
    // If JSON parsing fails, try to get the raw text
    const rawText = await res.text().catch(() => "");
    console.error("Failed to parse response as JSON:", rawText);
    throw new Error(`Invalid response format: ${rawText}`);
  }

  if (!res.ok) {
    console.error("API returned non-OK status:", res.status, res.statusText);
    throw new Error(
      `Validate failed (${res.status}): ${
        JSON.stringify(responseData) || res.statusText
      }`
    );
  }

  const data = responseData as CheckinValidateResponse;
  console.log("Validate API response data:", data);
  // Check basic response status
  if (!data?.status) {
    console.error("API response indicates failure:", data);
    throw new Error(data?.errorMessage || "Validate failed");
  }

  // Check if we have actual data in the response
  if (!data.data) {
    console.error("API response missing data object:", data);
    throw new Error("Không tìm thấy thông tin chuyến bay");
  }

  // Check if the booking is eligible for check-in
  if (data.data.is_eligible === false) {
    console.log("Booking not eligible for check-in:", data.data.error_message);
    throw new Error(
      data.data.error_message || "Booking is not eligible for check-in"
    );
  }

  try {
    const firstPassenger = data.data.booking_details?.[0] || null;
    if (!firstPassenger) {
      console.error("No passenger details found in response:", data);
      throw new Error("Không tìm thấy thông tin hành khách");
    }

    // Verify we have the necessary data
    if (!data.data.booking_id) {
      console.error("Missing booking_id in response:", data);
      throw new Error("Thiếu thông tin mã đặt chỗ");
    }

    // Create the booking object to return
    const booking = {
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
      bookingId: data.data.booking_id, // Make sure to include the booking_id
      bookingDetailId: firstPassenger?.booking_detail_id, // Include booking_detail_id
    };

    console.log("Created booking object:", booking);
    return booking;
  } catch (error) {
    console.error(
      "Error processing API response data:",
      error instanceof Error ? error.message : String(error)
    );
    throw new Error("Lỗi khi xử lý dữ liệu từ máy chủ");
  }
}

export interface CheckinOnlinePayload {
  booking_id: number;
  checkins: Array<{
    booking_detail_id: number;
    seat_number: string;
  }>;
}

export interface CheckinOnlineResponse {
  data: {
    booking_id: number;
    flight_number: string;
    checkin_time: string;
    boarding_time: string;
    checked_in_count: number;
    boarding_passes: Array<{
      booking_detail_id: number;
      passenger_name: string;
      boarding_pass_code: string;
      seat_number: string;
      flight_class_name: string;
      checkin_time: string;
      status: string;
      flight_class_id: number;
    }>;
  };
  status: boolean;
  errorCode: string;
  errorMessage: string;
}

export async function submitCheckin(
  bookingDetailId: number,
  seatNumber: string,
  bookingId: number
): Promise<CheckinOnlineResponse> {
  const token = localStorage.getItem("auth_token");
  const payload: CheckinOnlinePayload = {
    booking_id: bookingId,
    checkins: [
      {
        booking_detail_id: bookingDetailId,
        seat_number: seatNumber,
      },
    ],
  };

  console.log("Submitting check-in with payload:", JSON.stringify(payload));

  const res = await fetch(`/api/v1/checkin/online`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(payload),
  });

  let responseData;
  try {
    // Try to parse the response directly as JSON
    responseData = await res.json();
    console.log("Check-in API response:", responseData);
  } catch {
    // If JSON parsing fails, try to get the raw text
    const rawText = await res.text().catch(() => "");
    console.error("Failed to parse check-in response as JSON:", rawText);
    throw new Error(`Invalid check-in response format: ${rawText}`);
  }

  if (!res.ok) {
    console.error(
      "Check-in API returned non-OK status:",
      res.status,
      res.statusText
    );
    throw new Error(
      `Check-in failed (${res.status}): ${
        JSON.stringify(responseData) || res.statusText
      }`
    );
  }

  if (!responseData?.status) {
    // For "already checked-in" error, we want to check if the response has that specific indicator
    if (responseData?.errorCode === "ALREADY_CHECKED_IN") {
      console.log("Passenger already checked in:", responseData);
      throw new Error("ALREADY_CHECKED_IN");
    }

    console.error("Check-in API response indicates failure:", responseData);
    throw new Error(responseData?.errorMessage || "Check-in failed");
  }

  return responseData;
}
