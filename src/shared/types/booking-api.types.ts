// Booking API Types
import type { BackendResponse } from "./backend-api.types";

export interface BookingAncillaryRequest {
  type: string; // e.g. "baggage", "meal"
  description: string;
  quantity: number;
  price: number; // VND
}

export interface BookingPassengerDetailRequest {
  passenger_age: number; // derived from DOB
  passenger_gender: string; // "male" | "female" | "other"
  flight_class_id: number; // selected fare class id
  price: number; // base price per passenger (incl taxes)
  last_name: string;
  first_name: string;
  date_of_birth: string; // dd/MM/yyyy (request format)
  id_type: string; // passport | id_card | other
  id_number: string;
  expiry_date: string; // dd/MM/yyyy
  issuing_country: string;
  nationality: string;
}

export interface BookingCreateRequest {
  flight_id: number;
  contact_email: string;
  contact_phone: string;
  contact_address: string;
  note?: string;
  total_price: number;
  details: BookingPassengerDetailRequest[];
  ancillaries?: BookingAncillaryRequest[];
}

export interface BookingAncillaryResponse extends BookingAncillaryRequest {
  ancillary_id: number;
  booking_detail_id: number;
  created_at: string;
}

export interface BookingPassengerDetailResponse {
  booking_detail_id: number;
  booking_id: number;
  passenger_age: number;
  passenger_gender: string;
  flight_class_id: number;
  seat_id: number | null;
  price: number;
  last_name: string;
  first_name: string;
  date_of_birth: string; // ISO date in response
  id_type: string;
  id_number: string;
  expiry_date: string; // ISO date
  issuing_country: string;
  nationality: string;
}

export interface BookingCreateResponseData {
  booking_id: number;
  user_id: number;
  flight_id: number;
  booking_date: string;
  contact_email: string;
  contact_phone: string;
  contact_address: string;
  note?: string;
  status: string; // e.g. pending_payment
  total_price: number;
  created_at: string;
  updated_at: string;
  check_in_status: string; // not_checked_in
  details: BookingPassengerDetailResponse[];
  payment: unknown | null;
  ancillaries: BookingAncillaryResponse[];
}

export type BookingCreateResponse = BackendResponse<BookingCreateResponseData>;
