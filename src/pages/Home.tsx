import type React from "react";
import { useState, useEffect } from "react";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import FlightSearchForm from "../components/FlightSearchForm";
import { ChevronLeft, ChevronRight, MapPin, Calendar, DollarSign, Plane, Star, Users, Shield, Clock } from "lucide-react";

const Home: React.FC = () => {
  // State cho slideshow hero
  const [currentSlide, setCurrentSlide] = useState(0);

  // Dữ liệu slideshow cho hero section
  const heroSlides = [
    {
      image: "https://images.pexels.com/photos/2161467/pexels-photo-2161467.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080&fit=crop",
      title: "Khám Phá Hạ Long Bay",
      subtitle: "Di sản thế giới với vẻ đẹp huyền bí",
      location: "Quảng Ninh"
    },
    {
      image: "https://images.pexels.com/photos/3225531/pexels-photo-3225531.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080&fit=crop",
      title: "Phố Cổ Hội An",
      subtitle: "Nét đẹp cổ kính giữa lòng Việt Nam",
      location: "Quảng Nam"
    },
    {
      image: "https://images.pexels.com/photos/2161467/pexels-photo-2161467.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080&fit=crop",
      title: "Sapa Mùa Lúa Chín",
      subtitle: "Ruộng bậc thang đẹp nhất Việt Nam",
      location: "Lào Cai"
    },
    {
      image: "https://images.pexels.com/photos/3225531/pexels-photo-3225531.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080&fit=crop",
      title: "Đà Nẵng Hiện Đại",
      subtitle: "Thành phố đáng sống bên bờ biển",
      location: "Đà Nẵng"
    }
  ];

  // Auto slide effect
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [heroSlides.length]);

  // Điểm đến hấp dẫn
  const popularDestinations = [
    {
      id: 1,
      title: "Hồ Chí Minh ✈ Hà Nội",
      subtitle: "Thời gian khởi hành: 06/01/2025 - 03/01/2025",
      price: "299.000 đ",
      image: "https://images.pexels.com/photos/2161467/pexels-photo-2161467.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop",
      badge: "LỊCH BAY SÀI GÒN - HÀ NỘI",
      isLarge: true
    },
    {
      id: 2,
      title: "Hồ Chí Minh ✈ Hà Nội",
      subtitle: "Thời gian khởi hành: 06/01/2025 - 03/01/2025",
      price: "299.000 đ/chiều",
      image: "https://images.pexels.com/photos/3225531/pexels-photo-3225531.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop",
      badge: "LỊCH BAY SÀI GÒN - HÀ NỘI"
    },
    {
      id: 3,
      title: "Hà Nội ✈ Vinh",
      subtitle: "Thời gian khởi hành: 06/01/2025 - 03/01/2025",
      price: "299.000 đ/chiều",
      image: "https://images.pexels.com/photos/2161467/pexels-photo-2161467.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop",
      badge: "LỊCH BAY HÀ NỘI - VINH"
    },
    {
      id: 4,
      title: "Sài Gòn ✈ Phú Quốc",
      subtitle: "Thời gian khởi hành: 06/01/2025 - 03/01/2025",
      price: "299.000 đ/chiều",
      image: "https://images.pexels.com/photos/3225531/pexels-photo-3225531.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop",
      badge: "LỊCH BAY SÀI GÒN - PHÚ QUỐC"
    },
    {
      id: 5,
      title: "Hà Nội ✈ Đà Nẵng",
      subtitle: "Thời gian khởi hành: 06/01/2025 - 03/01/2025",
      price: "686.868 đ/chiều",
      image: "https://images.pexels.com/photos/2161467/pexels-photo-2161467.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop",
      badge: "LỊCH BAY HÀ NỘI - ĐÀ NẴNG"
    }
  ];

  // Tại sao chọn chúng tôi
  const whyChooseUs = [
    {
      icon: <DollarSign className="h-8 w-8 text-blue-600" />,
      title: "Giá vé tốt nhất, ưu đãi hấp dẫn",
      description: "Đặt vé máy bay với giá rẻ nhất thị trường, nhiều chương trình khuyến mãi hấp dẫn"
    },
    {
      icon: <Shield className="h-8 w-8 text-green-600" />,
      title: "Đặt vé dễ dàng, thanh toán đa dạng",
      description: "Giao diện thân thiện, quy trình đặt vé đơn giản, hỗ trợ nhiều hình thức thanh toán"
    },
    {
      icon: <Clock className="h-8 w-8 text-orange-600" />,
      title: "Thông báo tình trạng vé nhanh",
      description: "Cập nhật tình trạng chuyến bay realtime, thông báo nhanh chóng qua email và SMS"
    }
  ];

  // Tin tức du lịch
  const travelNews = [
    {
      id: 1,
      title: "Vietjet đồng hành cùng All gọi thiều và tôi...",
      description: "Hành khách sẽ được tận hưởng Thần Chú Chăm Sóc từ đội ngũ tiếp viên hàng không chuyên nghiệp của Vietjet...",
      image: "https://images.pexels.com/photos/2161467/pexels-photo-2161467.jpeg?auto=compress&cs=tinysrgb&w=400&h=250&fit=crop",
      date: "15/01/2025"
    },
    {
      id: 2,
      title: "Vietnam Airlines khát vọng đưng bay thẳng...",
      description: "Ngày 04/10, đường bay thẳng đầu tiên của Vietnam Airlines từ Hà Nội đến phố cổ Hội An chính thức được khai trương...",
      image: "https://images.pexels.com/photos/3225531/pexels-photo-3225531.jpeg?auto=compress&cs=tinysrgb&w=400&h=250&fit=crop",
      date: "12/01/2025"
    },
    {
      id: 3,
      title: "Chuyến bay mang thông điệp bảo vệ của...",
      description: "Chuyến bay mang ý nghĩa VN1157 từ TP.HCM đi Paris đã khởi hành thành công từ sân bay Tân Sơn Nhất trong hành trình...",
      image: "https://images.pexels.com/photos/2161467/pexels-photo-2161467.jpeg?auto=compress&cs=tinysrgb&w=400&h=250&fit=crop",
      date: "10/01/2025"
    }
  ];

  // Hãng hàng không
  const airlines = [
    { name: "Vietnam Airlines", logo: "https://images.pexels.com/photos/912110/pexels-photo-912110.jpeg?auto=compress&cs=tinysrgb&w=120&h=60&fit=crop" },
    { name: "VietJet Air", logo: "https://images.pexels.com/photos/912110/pexels-photo-912110.jpeg?auto=compress&cs=tinysrgb&w=120&h=60&fit=crop" },
    { name: "Jetstar Pacific", logo: "https://images.pexels.com/photos/912110/pexels-photo-912110.jpeg?auto=compress&cs=tinysrgb&w=120&h=60&fit=crop" },
    { name: "Bamboo Airways", logo: "https://images.pexels.com/photos/912110/pexels-photo-912110.jpeg?auto=compress&cs=tinysrgb&w=120&h=60&fit=crop" },
    { name: "VASCO", logo: "https://images.pexels.com/photos/912110/pexels-photo-912110.jpeg?auto=compress&cs=tinysrgb&w=120&h=60&fit=crop" },
    { name: "Air Mekong", logo: "https://images.pexels.com/photos/912110/pexels-photo-912110.jpeg?auto=compress&cs=tinysrgb&w=120&h=60&fit=crop" }
  ];

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length);
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
                index === currentSlide ? 'opacity-100' : 'opacity-0'
              }`}
            >
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
          className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10 bg-white/20 hover:bg-white/30 rounded-full p-2 transition-all duration-200"
        >
          <ChevronLeft className="h-6 w-6 text-white" />
        </button>
        <button
          onClick={nextSlide}
          className="absolute right-4 top-1/2 transform -translate-y-1/2 z-10 bg-white/20 hover:bg-white/30 rounded-full p-2 transition-all duration-200"
        >
          <ChevronRight className="h-6 w-6 text-white" />
        </button>

        {/* Slide Indicators */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2 z-10">
          {heroSlides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-3 h-3 rounded-full transition-all duration-200 ${
                index === currentSlide ? 'bg-white' : 'bg-white/50'
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
                Khám phá vẻ đẹp Việt Nam với những chuyến bay giá rẻ nhất. 
                Đặt vé dễ dàng, bay thoải mái!
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
              Chúng tôi cam kết mang đến trải nghiệm đặt vé tốt nhất cho khách hàng
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {whyChooseUs.map((item, index) => (
              <Card key={index} className="border-0 shadow-soft hover:shadow-large transition-all duration-300 text-center p-6">
                <CardContent className="space-y-4">
                  <div className="flex justify-center">
                    {item.icon}
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900">
                    {item.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {item.description}
                  </p>
                </CardContent>
              </Card>
            ))}
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
                <span className="text-orange-500 font-medium">Bay Việt cung cấp các chủ đề du lịch mà bạn sẽ thích</span>
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
                  index === 0 ? 'md:col-span-2 md:row-span-2' : ''
                }`}
              >
                <div className="relative">
                  <img
                    src={destination.image}
                    alt={destination.title}
                    className={`w-full object-cover group-hover:scale-105 transition-transform duration-300 ${
                      index === 0 ? 'h-80' : 'h-48'
                    }`}
                  />
                  <div className="absolute top-4 left-4">
                    <Badge className="bg-red-600 text-white hover:bg-red-700 text-xs font-bold px-3 py-1">
                      {destination.badge}
                    </Badge>
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  <div className="absolute bottom-4 left-4 text-white">
                    <h3 className={`font-bold ${index === 0 ? 'text-2xl' : 'text-lg'} mb-1`}>
                      {destination.title}
                    </h3>
                    <p className="text-sm opacity-90 mb-2">
                      {destination.subtitle}
                    </p>
                    <div className="flex items-center space-x-2">
                      <span className={`font-bold text-orange-400 ${index === 0 ? 'text-xl' : 'text-lg'}`}>
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
              Cập nhật tin tức mới nhất về các chương trình khuyến mãi và điểm đến
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {travelNews.map((news) => (
              <Card key={news.id} className="border-0 shadow-soft hover:shadow-large transition-all duration-300 group overflow-hidden">
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
                  <Button variant="link" className="p-0 h-auto mt-3 text-blue-600">
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
              Đối tác hàng không uy tín, chúng tôi cam kết mang đến cho bạn những chuyến bay an toàn và thoải mái
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-soft p-8">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 items-center">
              {airlines.map((airline, index) => (
                <div key={index} className="flex items-center justify-center p-4 hover:bg-gray-50 rounded-lg transition-colors duration-200">
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