import React from 'react';
import { Button } from 'antd';
import { ArrowRight, Star, Shield, Clock } from 'lucide-react';

export const Hero: React.FC = () => {
  return (
    <section className="relative min-h-[70vh] flex items-center justify-center overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-blue-900/20 to-slate-800">
        <div className="absolute inset-0 bg-black/20"></div>
        {/* Animated background elements */}
        <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
        <div className="absolute top-1/3 right-1/3 w-1 h-1 bg-blue-300 rounded-full animate-pulse delay-1000"></div>
        <div className="absolute bottom-1/4 left-1/3 w-3 h-3 bg-blue-500 rounded-full animate-pulse delay-500"></div>
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="mb-8">
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
            Discover Your Next
            <span className="block bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">
              Adventure
            </span>
          </h1>
          <p className="text-xl md:text-2xl text-slate-300 mb-8 max-w-2xl mx-auto leading-relaxed">
            Book flights to anywhere in the world with unbeatable prices, 
            premium service, and seamless travel experiences.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
          <Button
            type="primary"
            size="large"
            className="bg-blue-600 hover:bg-blue-700 border-blue-600 h-12 px-8 text-lg font-semibold"
            icon={<ArrowRight className="ml-2" size={20} />}
          >
            Start Your Journey
          </Button>
          <Button
            size="large"
            className="border-slate-600 text-slate-300 hover:text-white hover:border-slate-500 h-12 px-8 text-lg"
          >
            Explore Deals
          </Button>
        </div>

        {/* Trust indicators */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-3xl mx-auto">
          <div className="flex items-center justify-center space-x-3 text-slate-300">
            <div className="bg-blue-600/20 p-3 rounded-full">
              <Star className="h-6 w-6 text-blue-400" />
            </div>
            <div className="text-left">
              <div className="font-semibold text-white">4.8/5 Rating</div>
              <div className="text-sm">Trusted by millions</div>
            </div>
          </div>
          
          <div className="flex items-center justify-center space-x-3 text-slate-300">
            <div className="bg-blue-600/20 p-3 rounded-full">
              <Shield className="h-6 w-6 text-blue-400" />
            </div>
            <div className="text-left">
              <div className="font-semibold text-white">Secure Booking</div>
              <div className="text-sm">256-bit SSL encryption</div>
            </div>
          </div>
          
          <div className="flex items-center justify-center space-x-3 text-slate-300">
            <div className="bg-blue-600/20 p-3 rounded-full">
              <Clock className="h-6 w-6 text-blue-400" />
            </div>
            <div className="text-left">
              <div className="font-semibold text-white">24/7 Support</div>
              <div className="text-sm">Always here for you</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};