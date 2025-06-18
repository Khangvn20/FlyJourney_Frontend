import React from 'react';
import { Card } from 'antd';
import { MapPin, Star } from 'lucide-react';

export const PopularDestinations: React.FC = () => {
  const destinations = [
    {
      id: 1,
      city: 'Paris',
      country: 'France',
      image: 'https://images.pexels.com/photos/338515/pexels-photo-338515.jpeg?auto=compress&cs=tinysrgb&w=800',
      price: 'From $599',
      rating: 4.8,
      description: 'City of Light and Love'
    },
    {
      id: 2,
      city: 'Tokyo',
      country: 'Japan',
      image: 'https://images.pexels.com/photos/2506923/pexels-photo-2506923.jpeg?auto=compress&cs=tinysrgb&w=800',
      price: 'From $899',
      rating: 4.9,
      description: 'Modern metropolis meets tradition'
    },
    {
      id: 3,
      city: 'New York',
      country: 'USA',
      image: 'https://images.pexels.com/photos/290386/pexels-photo-290386.jpeg?auto=compress&cs=tinysrgb&w=800',
      price: 'From $399',
      rating: 4.7,
      description: 'The city that never sleeps'
    },
    {
      id: 4,
      city: 'London',
      country: 'UK',
      image: 'https://images.pexels.com/photos/460672/pexels-photo-460672.jpeg?auto=compress&cs=tinysrgb&w=800',
      price: 'From $699',
      rating: 4.6,
      description: 'Rich history and culture'
    },
    {
      id: 5,
      city: 'Dubai',
      country: 'UAE',
      image: 'https://images.pexels.com/photos/1115804/pexels-photo-1115804.jpeg?auto=compress&cs=tinysrgb&w=800',
      price: 'From $799',
      rating: 4.8,
      description: 'Luxury and innovation'
    },
    {
      id: 6,
      city: 'Sydney',
      country: 'Australia',
      image: 'https://images.pexels.com/photos/995765/pexels-photo-995765.jpeg?auto=compress&cs=tinysrgb&w=800',
      price: 'From $1199',
      rating: 4.9,
      description: 'Harbor city beauty'
    }
  ];

  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Popular Destinations
          </h2>
          <p className="text-xl text-slate-300 max-w-2xl mx-auto">
            Discover amazing places around the world with unbeatable flight deals
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {destinations.map((destination) => (
            <Card
              key={destination.id}
              className="bg-slate-800/90 border-slate-700 overflow-hidden hover:border-blue-500 transition-all duration-300 cursor-pointer group"
              cover={
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={destination.image}
                    alt={destination.city}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                  <div className="absolute top-4 right-4 bg-black/50 backdrop-blur-sm rounded-full px-3 py-1 flex items-center space-x-1">
                    <Star className="h-4 w-4 text-yellow-400 fill-current" />
                    <span className="text-white text-sm font-medium">{destination.rating}</span>
                  </div>
                </div>
              }
            >
              <div className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-xl font-bold text-white mb-1">{destination.city}</h3>
                    <div className="flex items-center text-slate-400 mb-2">
                      <MapPin className="h-4 w-4 mr-1" />
                      <span className="text-sm">{destination.country}</span>
                    </div>
                    <p className="text-slate-300 text-sm">{destination.description}</p>
                  </div>
                </div>
                
                <div className="flex items-center justify-between pt-3 border-t border-slate-600">
                  <span className="text-blue-400 font-semibold">{destination.price}</span>
                  <button className="text-blue-400 hover:text-blue-300 text-sm font-medium transition-colors">
                    View Flights →
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};