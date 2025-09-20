import React from 'react';
import { render, waitFor, act } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import Search from '../Search';
import type {
  FlightSearchApiResult,
  RoundTripFlightSearchApiResponse,
} from '../../shared/types/search-api.types';

vi.mock('../../components/flight/FlightSearchForm', () => ({ default: () => null }));
vi.mock('../../components/flight/FilterSidebar', () => ({ default: () => null }));
vi.mock('../../components/flight/OneWayFlightList', () => ({ default: () => null }));
vi.mock('../../components/flight/FlightResultsOverview', () => ({ default: () => null }));
vi.mock('../../components/common/LoadMoreButton', () => ({ default: () => null }));
vi.mock('../../components/flight/FlightCardSkeleton', () => ({ default: () => null }));
vi.mock('../../components/flight/MonthOverviewHeatmap', () => ({ default: () => null }));

const navigate = vi.fn();
vi.mock('react-router-dom', () => ({
  useNavigate: () => navigate,
}));

interface CapturedProps {
  activeTab: 'outbound' | 'inbound';
  setActiveTab: (tab: 'outbound' | 'inbound') => void;
  onFlightSelect: (flight: FlightSearchApiResult) => void;
}

let capturedProps: CapturedProps;
vi.mock('../../components/flight/RoundTripFlightList', () => ({
  __esModule: true,
  default: (props: CapturedProps) => {
    capturedProps = props;
    return null;
  },
}));

describe('Search flight selection', () => {
  it('navigates to booking when inbound then outbound flights selected', async () => {
    const outboundFlight: FlightSearchApiResult = {
      flight_id: 1,
      flight_number: 'F1',
      airline_name: 'Airline A',
      airline_id: 1,
      departure_airport_code: 'AAA',
      arrival_airport_code: 'BBB',
      departure_airport: 'Airport A',
      arrival_airport: 'Airport B',
      departure_time: '2025-01-01T10:00:00Z',
      arrival_time: '2025-01-01T12:00:00Z',
      duration_minutes: 120,
      stops_count: 0,
      distance: 1000,
      flight_class: 'economy',
      total_seats: 100,
      fare_class_details: {
        fare_class_code: 'Y',
        cabin_class: 'Economy',
        refundable: true,
        changeable: true,
        baggage_kg: '20',
        description: 'Economy',
      },
      pricing: {
        base_prices: { adult: 100, child: 100, infant: 100 },
        total_prices: { adult: 100, child: 100, infant: 100 },
        taxes: { adult: 10 },
        grand_total: 110,
        currency: 'USD',
      },
      tax_and_fees: 10,
    };

    const inboundFlight: FlightSearchApiResult = { ...outboundFlight, flight_id: 2 };

    const roundTripData: RoundTripFlightSearchApiResponse = {
      arrival_airport: 'BBB',
      departure_airport: 'AAA',
      departure_date: '2025-01-01',
      return_date: '2025-01-10',
      flight_class: 'economy',
      limit: 1,
      page: 1,
      passengers: { adults: 1, children: 0, infants: 0 },
      outbound_search_results: [outboundFlight],
      outbound_total_count: 1,
      outbound_total_pages: 1,
      inbound_search_results: [inboundFlight],
      inbound_total_count: 1,
      inbound_total_pages: 1,
      sort_by: 'price',
      sort_order: 'asc',
    };

    sessionStorage.setItem('tripType', 'round-trip');
    sessionStorage.setItem('flightSearchResults', JSON.stringify(roundTripData));

    render(<Search />);

    await waitFor(() => expect(capturedProps.activeTab).toBe('outbound'));

    act(() => {
      capturedProps.setActiveTab('inbound');
    });
    await waitFor(() => expect(capturedProps.activeTab).toBe('inbound'));

    act(() => {
      capturedProps.onFlightSelect(inboundFlight);
    });
    await waitFor(() => expect(capturedProps.activeTab).toBe('outbound'));

    act(() => {
      capturedProps.onFlightSelect(outboundFlight);
    });

    await waitFor(() => expect(navigate).toHaveBeenCalledWith('/booking', expect.anything()));
  });
});

