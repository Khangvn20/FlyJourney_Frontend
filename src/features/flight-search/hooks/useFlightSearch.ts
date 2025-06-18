import { useState, useCallback } from 'react';
import { FlightSearchFormData, FlightSearchState } from '../types';
import { flightSearchService } from '../services/flightSearchApi';

export const useFlightSearch = () => {
  const [state, setState] = useState<FlightSearchState>({
    searchData: null,
    filters: {
      priceRange: [200, 1500],
      stops: [],
      airlines: [],
    },
    loading: false,
    error: null,
  });

  const searchFlights = useCallback(async (searchData: FlightSearchFormData) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      // In a real app, this would call the API
      await flightSearchService.searchFlights(searchData);
      setState(prev => ({ 
        ...prev, 
        searchData, 
        loading: false 
      }));
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        loading: false, 
        error: error instanceof Error ? error.message : 'Search failed' 
      }));
    }
  }, []);

  const updateFilters = useCallback((filters: Partial<FlightSearchState['filters']>) => {
    setState(prev => ({
      ...prev,
      filters: { ...prev.filters, ...filters }
    }));
  }, []);

  const clearSearch = useCallback(() => {
    setState({
      searchData: null,
      filters: {
        priceRange: [200, 1500],
        stops: [],
        airlines: [],
      },
      loading: false,
      error: null,
    });
  }, []);

  return {
    ...state,
    searchFlights,
    updateFilters,
    clearSearch,
  };
};