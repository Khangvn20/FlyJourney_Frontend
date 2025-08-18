export type PassengerType = "adult" | "child" | "infant";

export interface PassengerFormData {
  id: string;
  type: PassengerType;
  firstName: string;
  lastName: string;
  gender?: "male" | "female" | "other";
  /** passport or id_card (CCCD). Default passport */
  documentType?: "passport" | "id_card";
  dateOfBirth?: string; // ISO date
  nationality?: string;
  issuingCountry?: string; // country issuing passport / ID
  passportNumber?: string;
  passportExpiry?: string; // ISO date
  /** Phone number for this passenger. For the first passenger (booker), this can be auto-filled from user account */
  phone?: string;
  /** Individual baggage selection for this passenger */
  extraBaggage?: {
    option: string; // baggage option ID (none, bg10, bg15, bg20)
    extraKg: number;
    price: number;
  };
}

export interface ContactInfo {
  fullName: string;
  email: string;
  phone?: string;
}

export type PaymentMethod = "vnpay" | "card" | "office";

import type { FlightSearchApiResult } from "./search-api.types";

export interface BookingPayload {
  tripType: "one-way" | "round-trip";
  outboundFlightId: number;
  inboundFlightId?: number;
  passengers: PassengerFormData[];
  contact: ContactInfo;
  totalPrice: number;
  currency: string;
  paymentMethod: PaymentMethod;
  /** Customer note/special request */
  note?: string;
  /** Optional future expansion: selected extra baggage/services */
  addons?: {
    extraBaggageKg?: number; // additional baggage purchased
    services?: string[]; // list of ancillary service codes
  };
  /** Monetary total of addons to allow reconstruction of base fare */
  addonExtraPrice?: number;
  /** Snapshot của dữ liệu chuyến bay lúc đặt (tránh lệ thuộc cache tìm kiếm) */
  selectedFlights?: {
    outbound: FlightSearchApiResult;
    inbound?: FlightSearchApiResult;
  };
}

export interface BookingRecord extends BookingPayload {
  bookingId: string;
  status: "PENDING" | "CONFIRMED" | "CANCELLED";
  createdAt: string;
  /** If status=PENDING this indicates when the hold expires (ISO). */
  holdExpiresAt?: string;
  /** Selected seat IDs after seat selection and payment */
  selectedSeats?: string[];
}
