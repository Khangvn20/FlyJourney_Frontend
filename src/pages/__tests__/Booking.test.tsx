import React from 'react';
import { render } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import Booking from '../Booking';

vi.mock('../../components/booking/BookingFlow', () => ({
  __esModule: true,
  default: () => <div>Mock Booking Flow</div>,
}));

describe('Booking Page', () => {
  it('renders BookingFlow component', () => {
    const { getByText } = render(<Booking />);
    expect(getByText('Mock Booking Flow')).toBeInTheDocument();
  });
});

