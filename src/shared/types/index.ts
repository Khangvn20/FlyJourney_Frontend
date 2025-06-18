// Global type definitions
export interface Flight {
  id: string;
  airline: string;
  flightNumber: string;
  departure: {
    city: string;
    airport: string;
    code: string;
    time: string;
    date: string;
  };
  arrival: {
    city: string;
    airport: string;
    code: string;
    time: string;
    date: string;
  };
  duration: string;
  price: number;
  stops: number;
  aircraft: string;
  amenities: string[];
}

export interface SearchData {
  from: string;
  to: string;
  departureDate?: string;
  returnDate?: string;
  passengers: number;
  class: string;
  tripType: 'roundtrip' | 'oneway' | 'multicity';
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  avatar?: string;
}

export interface BookingData {
  flight: Flight;
  passengers: PassengerInfo[];
  payment: PaymentInfo;
  totalPrice: number;
}

export interface PassengerInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  gender: string;
  passportNumber: string;
  nationality: string;
}

export interface PaymentInfo {
  cardNumber: string;
  expiryMonth: number;
  expiryYear: number;
  cvv: string;
  cardholderName: string;
  billingAddress: {
    address: string;
    city: string;
    country: string;
    postalCode: string;
  };
}