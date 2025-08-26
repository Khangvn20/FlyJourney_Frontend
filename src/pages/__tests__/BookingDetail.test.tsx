import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { describe, it, expect, vi } from 'vitest';
import BookingDetail from '../BookingDetail';

vi.mock('../../services/bookingStorage', () => ({
  loadBookings: () => [],
}));

const navigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return {
    ...actual,
    useNavigate: () => navigate,
  };
});

describe('BookingDetail Page', () => {
  it('shows not found message and navigates back', () => {
    const { getByText } = render(
      <MemoryRouter initialEntries={['/booking/123']}>
        <Routes>
          <Route path="/booking/:id" element={<BookingDetail />} />
        </Routes>
      </MemoryRouter>
    );

    expect(getByText('Không tìm thấy đặt chỗ.')).toBeInTheDocument();
    fireEvent.click(getByText('Quay lại'));
    expect(navigate).toHaveBeenCalledWith(-1);
  });
});

