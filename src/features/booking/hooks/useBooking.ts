import { useState, useCallback } from 'react';
import { BookingState, BookingFormData } from '../types';
import { Flight } from '../../../shared/types';
import { generateBookingReference } from '../../../shared/utils';

export const useBooking = (flight: Flight | null) => {
  const [state, setState] = useState<BookingState>({
    currentStep: 0,
    flight,
    passengers: [],
    payment: null,
    loading: false,
    error: null,
  });

  const nextStep = useCallback(() => {
    setState(prev => ({
      ...prev,
      currentStep: Math.min(prev.currentStep + 1, 2)
    }));
  }, []);

  const prevStep = useCallback(() => {
    setState(prev => ({
      ...prev,
      currentStep: Math.max(prev.currentStep - 1, 0)
    }));
  }, []);

  const completeBooking = useCallback(async (bookingData: BookingFormData) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const bookingReference = generateBookingReference();
      
      setState(prev => ({
        ...prev,
        passengers: bookingData.passengers,
        payment: bookingData.payment,
        bookingReference,
        loading: false,
        currentStep: 2, // Move to confirmation step
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Booking failed'
      }));
    }
  }, []);

  const resetBooking = useCallback(() => {
    setState({
      currentStep: 0,
      flight,
      passengers: [],
      payment: null,
      loading: false,
      error: null,
    });
  }, [flight]);

  return {
    ...state,
    nextStep,
    prevStep,
    completeBooking,
    resetBooking,
  };
};