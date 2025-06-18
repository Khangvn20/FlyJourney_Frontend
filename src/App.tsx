import React, { useState } from 'react';
import { ConfigProvider, theme } from 'antd';
import Header from './components/Header';
import Hero from './components/Hero';
import FlightSearch from './components/FlightSearch';
import PopularDestinations from './components/PopularDestinations';
import Features from './components/Features';
import Footer from './components/Footer';
import FlightResults from './components/FlightResults';
import BookingFlow from './components/BookingFlow';

const { darkAlgorithm } = theme;

export interface Flight {
  id: string;
  airline: string;
  flightNumber: string;
  departure: {
    city: string;
    airport: string;
    code: string;
    time: string;
    date: string;
  };
  arrival: {
    city: string;
    airport: string;
    code: string;
    time: string;
    date: string;
  };
  duration: string;
  price: number;
  stops: number;
  aircraft: string;
  amenities: string[];
}

function App() {
  const [currentView, setCurrentView] = useState<'home' | 'results' | 'booking'>('home');
  const [searchData, setSearchData] = useState<any>(null);
  const [selectedFlight, setSelectedFlight] = useState<Flight | null>(null);

  const handleSearch = (data: any) => {
    setSearchData(data);
    setCurrentView('results');
  };

  const handleFlightSelect = (flight: Flight) => {
    setSelectedFlight(flight);
    setCurrentView('booking');
  };

  const handleBackToHome = () => {
    setCurrentView('home');
    setSearchData(null);
    setSelectedFlight(null);
  };

  const handleBackToResults = () => {
    setCurrentView('results');
    setSelectedFlight(null);
  };

  return (
    <ConfigProvider
      theme={{
        algorithm: darkAlgorithm,
        token: {
          colorPrimary: '#3b82f6',
          colorBgBase: '#0f172a',
          colorBgContainer: '#1e293b',
          colorBorder: '#334155',
          colorText: '#f1f5f9',
          colorTextSecondary: '#cbd5e1',
          borderRadius: 12,
        },
      }}
    >
      <div className="min-h-screen bg-slate-900">
        <Header onLogoClick={handleBackToHome} />
        
        {currentView === 'home' && (
          <>
            <Hero />
            <FlightSearch onSearch={handleSearch} />
            <PopularDestinations />
            <Features />
          </>
        )}
        
        {currentView === 'results' && (
          <FlightResults 
            searchData={searchData} 
            onFlightSelect={handleFlightSelect}
            onBackToHome={handleBackToHome}
          />
        )}
        
        {currentView === 'booking' && selectedFlight && (
          <BookingFlow 
            flight={selectedFlight}
            onBack={handleBackToResults}
          />
        )}
        
        <Footer />
      </div>
    </ConfigProvider>
  );
}

export default App;