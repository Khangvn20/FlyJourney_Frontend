import React, { useState } from 'react';
import { ConfigProvider, theme } from 'antd';
import { Header } from '../shared/components/layout/Header';
import { Hero } from '../shared/components/layout/Hero';
import { FlightSearchForm } from '../features/flight-search';
import { PopularDestinations } from '../shared/components/layout/PopularDestinations';
import { Features } from '../shared/components/layout/Features';
import { Footer } from '../shared/components/layout/Footer';
import FlightResults from '../components/FlightResults';
import BookingFlow from '../components/BookingFlow';
import { Flight } from '../shared/types';

const { darkAlgorithm } = theme;

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
            <section className="py-12 px-4 sm:px-6 lg:px-8 -mt-20 relative z-20">
              <div className="max-w-4xl mx-auto">
                <FlightSearchForm onSearch={handleSearch} />
              </div>
            </section>
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