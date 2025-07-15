import { FlightSearchFormData } from '../types';
import { Flight } from '../../../shared/types';

class FlightSearchService {
  async searchFlights(searchData: any): Promise<any> {
    // Build request body for roundtrip
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';
    const body = {
      departure_airport: searchData.departure_airport,
      arrival_airport: searchData.arrival_airport,
      departure_date: searchData.departure_date,
      return_date: searchData.return_date,
      flight_class: searchData.flight_class,
      passengers: searchData.passengers,
      page: searchData.page || 1,
      limit: searchData.limit || 10,
      sort_by: searchData.sort_by || 'departure_time',
      sort_order: searchData.sort_order || 'ASC'
    };
    
    console.log('Final API Request Body:', body);
    
    const response = await fetch(`${apiUrl}/flights/search/roundtrip`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });
    const res = await response.json();
    if (!response.ok || !res.status) {
      throw new Error(res.errorMessage || 'Không tìm thấy chuyến bay phù hợp');
    }
    return res.data;
  }

  async getPopularDestinations(): Promise<any[]> {
    // Simulate API call
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([]);
      }, 500);
    });
  }
}

export const flightSearchService = new FlightSearchService();