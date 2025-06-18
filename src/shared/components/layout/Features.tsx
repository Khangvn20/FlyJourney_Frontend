import React from 'react';
import { Card } from 'antd';
import { Shield, Clock, CreditCard, Headphones, Star, Globe } from 'lucide-react';

export const Features: React.FC = () => {
  const features = [
    {
      icon: <Shield className="h-8 w-8" />,
      title: 'Secure Booking',
      description: 'Your personal and payment information is protected with bank-level security.',
      color: 'text-green-400'
    },
    {
      icon: <Clock className="h-8 w-8" />,
      title: '24/7 Support',
      description: 'Our customer service team is available around the clock to assist you.',
      color: 'text-blue-400'
    },
    {
      icon: <CreditCard className="h-8 w-8" />,
      title: 'Flexible Payment',
      description: 'Multiple payment options including installments and various credit cards.',
      color: 'text-purple-400'
    },
    {
      icon: <Star className="h-8 w-8" />,
      title: 'Best Price Guarantee',
      description: 'Find a lower price elsewhere? We\'ll match it and give you extra savings.',
      color: 'text-yellow-400'
    },
    {
      icon: <Headphones className="h-8 w-8" />,
      title: 'Premium Experience',
      description: 'Enjoy priority booking, exclusive deals, and personalized recommendations.',
      color: 'text-red-400'
    },
    {
      icon: <Globe className="h-8 w-8" />,
      title: 'Global Coverage',
      description: 'Access to flights from 500+ airlines to over 1000 destinations worldwide.',
      color: 'text-cyan-400'
    }
  ];

  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 bg-slate-800/50">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Why Choose FlyJourney?
          </h2>
          <p className="text-xl text-slate-300 max-w-2xl mx-auto">
            Experience the future of flight booking with our premium features and world-class service
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <Card
              key={index}
              className="bg-slate-800/90 border-slate-700 hover:border-blue-500 transition-all duration-300 hover:transform hover:scale-105"
            >
              <div className="p-6">
                <div className={`${feature.color} mb-4`}>
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">
                  {feature.title}
                </h3>
                <p className="text-slate-300 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </Card>
          ))}
        </div>

        {/* Stats Section */}
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div>
            <div className="text-3xl md:text-4xl font-bold text-blue-400 mb-2">10M+</div>
            <div className="text-slate-300">Happy Travelers</div>
          </div>
          <div>
            <div className="text-3xl md:text-4xl font-bold text-blue-400 mb-2">500+</div>
            <div className="text-slate-300">Airlines</div>
          </div>
          <div>
            <div className="text-3xl md:text-4xl font-bold text-blue-400 mb-2">1000+</div>
            <div className="text-slate-300">Destinations</div>
          </div>
          <div>
            <div className="text-3xl md:text-4xl font-bold text-blue-400 mb-2">24/7</div>
            <div className="text-slate-300">Support</div>
          </div>
        </div>
      </div>
    </section>
  );
};