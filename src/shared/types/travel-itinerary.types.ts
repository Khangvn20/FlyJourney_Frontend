export interface TravelItineraryItem {
  day: number;
  title: string;
  description: string;
  activities: string[];
  tips?: string;
}

export interface TravelItinerary {
  id: string;
  title: string;
  description: string;
  duration: string;
  priceRange: {
    min: number;
    max: number;
  };
  currency: string;
  image: string;
  highlights: string[];
  itinerary: TravelItineraryItem[];
  tips: string[];
  includedServices: string[];
  flightPrices: {
    economy: number;
    business: number;
  };
  author: string;
  publishedDate: string;
  readTime: string;
}
