import { FlightSearchFormData } from '../types';
import { Flight } from '../../../shared/types';

class FlightSearchService {
  async searchFlights(searchData: FlightSearchFormData): Promise<Flight[]> {
    // Simulate API call
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([]);
      }, 1000);
    });
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