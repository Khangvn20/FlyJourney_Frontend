import type React from "react";
import { useState, useEffect } from "react";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import FlightSearchForm from "../components/flight/FlightSearchForm";
import PopularDestinations from "../components/sections/PopularDestinations";
import TravelNews from "../components/sections/TravelNews";
import AirlinesSection from "../components/sections/AirlinesSection";
import {
  ChevronLeft,
  ChevronRight,
  MapPin,
  DollarSign,
  Shield,
  Clock,
} from "lucide-react";
import { heroSlides, whyChooseUs } from "../mocks";

const Home: React.FC = () => {
  // State cho slideshow hero
  const [currentSlide, setCurrentSlide] = useState(0);

  // Auto slide effect
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
  };

  const prevSlide = () => {
    setCurrentSlide(
      (prev) => (prev - 1 + heroSlides.length) % heroSlides.length
    );
  };

  return (
    <div className="space-y-16">
      {/* Hero Section với Slideshow */}
      <section className="relative h-[600px] overflow-hidden">
        {/* Slideshow Background */}
        <div className="absolute inset-0">
          {heroSlides.map((slide, index) => (
            <div
              key={index}
              className={`absolute inset-0 transition-opacity duration-1000 ${
                index === currentSlide ? "opacity-100" : "opacity-0"
              }`}>
              <img
                src={slide.image || "/placeholder.svg"}
                alt={slide.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/40" />
            </div>
          ))}
        </div>

        {/* Navigation Arrows */}
        <button
          onClick={prevSlide}
          className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10 bg-white/20 hover:bg-white/30 rounded-full p-2 transition-all duration-200">
          <ChevronLeft className="h-6 w-6 text-white" />
        </button>
        <button
          onClick={nextSlide}
          className="absolute right-4 top-1/2 transform -translate-y-1/2 z-10 bg-white/20 hover:bg-white/30 rounded-full p-2 transition-all duration-200">
          <ChevronRight className="h-6 w-6 text-white" />
        </button>

        {/* Slide Indicators */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2 z-10">
          {heroSlides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-3 h-3 rounded-full transition-all duration-200 ${
                index === currentSlide ? "bg-white" : "bg-white/50"
              }`}
            />
          ))}
        </div>

        {/* Hero Content */}
        <div className="absolute inset-0 flex items-center justify-center z-10">
          <div className="text-center text-white space-y-6 max-w-4xl px-4">
            <div className="space-y-4 animate-slide-up">
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-display font-bold leading-tight">
                Bay Khắp Việt Nam
                <span className="block text-yellow-400">
                  Giá Rẻ - Chọn Ngay Hôm Nay
                </span>
              </h1>
              <p className="text-xl md:text-2xl opacity-90 leading-relaxed">
                Khám phá vẻ đẹp Việt Nam với những chuyến bay giá rẻ nhất. Đặt
                vé dễ dàng, bay thoải mái!
              </p>
            </div>

            {/* Current Slide Info */}
            <div className="flex items-center justify-center space-x-4 text-lg">
              <MapPin className="h-5 w-5" />
              <span>{heroSlides[currentSlide].location}</span>
              <span>•</span>
              <span>{heroSlides[currentSlide].title}</span>
            </div>
          </div>
        </div>
      </section>

      {/* Search Form */}
      <section className="relative -mt-20 z-20">
        <FlightSearchForm />
      </section>

      {/* Tại sao chọn chúng tôi */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-display font-bold text-gray-900 mb-4">
              Vì sao chọn Fly Journey?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Chúng tôi cam kết mang đến trải nghiệm đặt vé tốt nhất cho khách
              hàng
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {whyChooseUs.map((item, index) => {
              const IconComponent =
                item.iconType === "dollar"
                  ? DollarSign
                  : item.iconType === "shield"
                  ? Shield
                  : Clock;

              return (
                <Card
                  key={index}
                  className="border-0 shadow-soft hover:shadow-large transition-all duration-300 text-center p-6">
                  <CardContent className="space-y-4">
                    <div className="flex justify-center">
                      <IconComponent className={`h-8 w-8 ${item.iconColor}`} />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900">
                      {item.title}
                    </h3>
                    <p className="text-gray-600 leading-relaxed">
                      {item.description}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Điểm đến hấp dẫn */}
      <PopularDestinations />

      {/* Tin tức nổi bật */}
      <TravelNews />

      {/* Các hãng bay nổi bật - Full width, breaks out of container */}
      <AirlinesSection />

      {/* Newsletter Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl p-12 text-white text-center">
            <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">
              Đăng Ký Nhận Thông Tin
            </h2>
            <p className="text-xl mb-8 opacity-90">
              Nhận thông báo về các chương trình khuyến mãi và ưu đãi đặc biệt
            </p>
            <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Nhập email của bạn"
                className="flex-1 px-4 py-3 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white/50"
              />
              <Button className="bg-white text-blue-600 hover:bg-gray-100 px-6 py-3 font-semibold">
                Đăng Ký
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
