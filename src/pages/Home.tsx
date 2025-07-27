import type React from "react";
import { useState, useEffect } from "react";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import FlightSearchForm from "../components/FlightSearchForm";
import {
  ChevronLeft,
  ChevronRight,
  MapPin,
  Calendar,
  DollarSign,
  Plane,
  Shield,
  Clock,
} from "lucide-react";
import {
  heroSlides,
  popularDestinations,
  whyChooseUs,
  travelNews,
  airlines,
} from "../assets/mock";

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
                src={slide.image}
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
              Vì sao chọn Bay Việt?
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
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div>
              <div className="flex items-center space-x-2 mb-2">
                <Plane className="h-6 w-6 text-orange-500" />
                <span className="text-orange-500 font-medium">
                  Bay Việt cung cấp các chủ đề du lịch mà bạn sẽ thích
                </span>
              </div>
              <h2 className="text-3xl md:text-4xl font-display font-bold text-gray-900">
                Điểm đến hấp dẫn
              </h2>
            </div>
            <Button variant="outline" className="hidden md:flex">
              Xem thêm
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {popularDestinations.map((destination, index) => (
              <Card
                key={destination.id}
                className={`border-0 shadow-soft hover:shadow-large transition-all duration-300 group overflow-hidden ${
                  index === 0 ? "md:col-span-2 md:row-span-2" : ""
                }`}>
                <div className="relative">
                  <img
                    src={destination.image}
                    alt={destination.title}
                    className={`w-full object-cover group-hover:scale-105 transition-transform duration-300 ${
                      index === 0 ? "h-80" : "h-48"
                    }`}
                  />
                  <div className="absolute top-4 left-4">
                    <Badge className="bg-red-600 text-white hover:bg-red-700 text-xs font-bold px-3 py-1">
                      {destination.badge}
                    </Badge>
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  <div className="absolute bottom-4 left-4 text-white">
                    <h3
                      className={`font-bold ${
                        index === 0 ? "text-2xl" : "text-lg"
                      } mb-1`}>
                      {destination.title}
                    </h3>
                    <p className="text-sm opacity-90 mb-2">
                      {destination.subtitle}
                    </p>
                    <div className="flex items-center space-x-2">
                      <span
                        className={`font-bold text-orange-400 ${
                          index === 0 ? "text-xl" : "text-lg"
                        }`}>
                        {destination.price}
                      </span>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Tin tức nổi bật */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-display font-bold text-gray-900 mb-4">
              Tin tức nổi bật
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Cập nhật tin tức mới nhất về các chương trình khuyến mãi và điểm
              đến
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {travelNews.map((news) => (
              <Card
                key={news.id}
                className="border-0 shadow-soft hover:shadow-large transition-all duration-300 group overflow-hidden">
                <div className="relative">
                  <img
                    src={news.image}
                    alt={news.title}
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-2 text-sm text-gray-500 mb-3">
                    <Calendar className="h-4 w-4" />
                    <span>{news.date}</span>
                  </div>
                  <h3 className="font-semibold text-gray-900 text-lg mb-3 line-clamp-2">
                    {news.title}
                  </h3>
                  <p className="text-gray-600 text-sm line-clamp-3 leading-relaxed">
                    {news.description}
                  </p>
                  <Button
                    variant="link"
                    className="p-0 h-auto mt-3 text-blue-600">
                    Xem thêm →
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Các hãng bay nổi bật */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-display font-bold text-gray-900 mb-4">
              Các hãng bay nổi bật
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Đối tác hàng không uy tín, chúng tôi cam kết mang đến cho bạn
              những chuyến bay an toàn và thoải mái
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-soft p-8">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 items-center">
              {airlines.map((airline, index) => (
                <div
                  key={index}
                  className="flex items-center justify-center p-4 hover:bg-gray-50 rounded-lg transition-colors duration-200">
                  <img
                    src={airline.logo}
                    alt={airline.name}
                    className="h-12 w-auto object-contain filter grayscale hover:grayscale-0 transition-all duration-200"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

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
