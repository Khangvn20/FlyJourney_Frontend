export type PassengerType = "adult" | "child" | "infant";

export interface PassengerFormData {
  id: string;
  type: PassengerType;
  firstName: string;
  lastName: string;
  gender?: "male" | "female" | "other";
  dateOfBirth?: string; // ISO date
  nationality?: string;
  passportNumber?: string;
  passportExpiry?: string; // ISO date
}

export interface ContactInfo {
  fullName: string;
  email: string;
  phone?: string;
}

export type PaymentMethod = "vnpay" | "card" | "office";

export interface BookingPayload {
  tripType: "one-way" | "round-trip";
  outboundFlightId: number;
  inboundFlightId?: number;
  passengers: PassengerFormData[];
  contact: ContactInfo;
  totalPrice: number;
  currency: string;
  paymentMethod: PaymentMethod;
}

export interface BookingRecord extends BookingPayload {
  bookingId: string;
  status: "PENDING" | "CONFIRMED" | "CANCELLED";
  createdAt: string;
}
