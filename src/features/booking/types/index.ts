import { Flight, PassengerInfo, PaymentInfo } from '../../../shared/types';

export interface BookingStep {
  key: string;
  title: string;
  icon: React.ReactNode;
  completed: boolean;
}

export interface BookingState {
  currentStep: number;
  flight: Flight | null;
  passengers: PassengerInfo[];
  payment: PaymentInfo | null;
  loading: boolean;
  error: string | null;
  bookingReference?: string;
}

export interface BookingFormData {
  passengers: PassengerInfo[];
  payment: PaymentInfo;
}