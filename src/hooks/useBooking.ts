import { useState } from "react";

export const useBooking = () => {
  const [step, setStep] = useState(0);
  const [bookingData, setBookingData] = useState<Record<string, unknown>>({});

  const next = () => setStep((prev) => prev + 1);
  const prev = () => setStep((prev) => Math.max(0, prev - 1));

  return { step, bookingData, setBookingData, next, prev };
};
