import type React from "react";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
// Adjusted paths after relocation: ui now in sibling directory
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { ArrowRight, Calendar, Users, MapPin, Play, Pause } from "lucide-react";
import { popularDestinations } from "../../mocks";

interface DestinationItem {
  id: string | number;
  title: string;
  subtitle: string;
  badge?: string;
  price?: string;
  image?: string;
}

// Function to standardize city names
const standardizeCityName = (cityName: string): string => {
  const cityMap: { [key: string]: string } = {
    "Hồ Chí Minh": "TP Hồ Chí Minh",
    Hồ: "TP Hồ Chí Minh",
    HCM: "TP Hồ Chí Minh",
    "Sài Gòn": "TP Hồ Chí Minh",
    Sài: "TP Hồ Chí Minh",
    "Hà Nội": "Hà Nội",
    Hà: "Hà Nội",
    "Đà Nẵng": "Đà Nẵng",
    Đà: "Đà Nẵng",
    "Phú Quốc": "Phú Quốc",
    Phú: "Phú Quốc",
    "Nha Trang": "Nha Trang",
    Nha: "Nha Trang",
    Vinh: "Vinh",
  };
  return cityMap[cityName] || cityName;
};

const parseDestination = (title: string) => {
  const parts = title.split(/[-→✈]/);
  if (parts.length >= 2) {
    const departure = standardizeCityName(parts[0].trim());
    const arrival = standardizeCityName(parts[1].trim());
    return { departure, arrival };
  }
  return { departure: "TP Hồ Chí Minh", arrival: "Hà Nội" };
};

const PopularDestinations: React.FC = () => {
  const [currentSet, setCurrentSet] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [progress, setProgress] = useState(0);

  // Auto rotation every 15 seconds
  useEffect(() => {
    if (!isPlaying) return;

    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          setCurrentSet((prevSet) => (prevSet + 1) % 2);
          return 0;
        }
        return prev + 100 / 150; // 15 seconds = 150 intervals of 100ms
      });
    }, 100);

    return () => clearInterval(progressInterval);
  }, [isPlaying]);

  const togglePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  // Get current 5 destinations
  const currentDestinations = popularDestinations.slice(
    currentSet * 5,
    (currentSet + 1) * 5
  );

  return (
    <section className="py-20 bg-gradient-to-br from-slate-50 to-blue-50 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute top-20 left-10 w-32 h-32 bg-blue-200/20 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-20 right-10 w-40 h-40 bg-purple-200/20 rounded-full blur-3xl animate-pulse delay-1000"></div>

      <div className="px-6 relative z-10">
        {/* Header Section */}
        <div className="text-center mb-16">
          <div className="space-y-6">
            <span className="inline-block px-6 py-3 bg-white/80 backdrop-blur-sm text-blue-700 rounded-full text-sm font-semibold tracking-wide uppercase border border-blue-200/50 shadow-sm">
              Khám phá Việt Nam
            </span>

            <h2 className="text-5xl md:text-6xl font-bold text-gray-900">
              Điểm đến{" "}
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                tuyệt vời
              </span>
            </h2>

            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Khám phá vẻ đẹp thiên nhiên và văn hóa phong phú của đất nước Việt
              Nam
            </p>

            {/* Auto-rotation Controls */}
            <div className="flex items-center justify-center space-x-4 mt-8">
              <button
                onClick={togglePlayPause}
                className="flex items-center space-x-2 px-4 py-2 bg-white/90 backdrop-blur-sm rounded-full shadow-md hover:shadow-lg transition-all duration-300 border border-gray-200/50">
                {isPlaying ? (
                  <Pause className="h-4 w-4 text-gray-700" />
                ) : (
                  <Play className="h-4 w-4 text-gray-700" />
                )}
                <span className="text-sm font-medium text-gray-700">
                  {isPlaying ? "Tạm dừng" : "Tiếp tục"}
                </span>
              </button>

              <div className="flex items-center space-x-2">
                <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-100 ease-linear"
                    style={{ width: `${progress}%` }}></div>
                </div>
                <span className="text-xs text-gray-500 font-medium">
                  {currentSet + 1}/2
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Destinations Grid - 30%-40%-30% Layout */}
        <div className="flex flex-col lg:flex-row gap-6 mb-16">
          {/* Left Side - 30% width */}
          <div className="w-full lg:w-[30%] space-y-6">
            {currentDestinations
              .slice(0, 2)
              .map((destination: DestinationItem) => (
                <Link key={destination.id} to="/blog" className="block group">
                  <Card className="relative overflow-hidden bg-white rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-700 border-0 transform hover:-translate-y-2 h-[262px]">
                    <div className="relative h-full">
                      <img
                        src={destination.image || "/placeholder.svg"}
                        alt={destination.title}
                        className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                      />

                      {/* Route Badge - Fixed positioning */}
                      <div className="absolute top-4 left-4 z-20">
                        <div className="bg-black/70 backdrop-blur-sm px-3 py-2 rounded-lg shadow-lg">
                          <span className="text-xs font-bold text-white uppercase tracking-wide">
                            {destination.badge}
                          </span>
                        </div>
                      </div>

                      {/* Location Pin - Only on Hover */}
                      <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20">
                        <div className="p-2 bg-white/20 backdrop-blur-md border border-white/30 rounded-full">
                          <MapPin className="h-4 w-4 text-white" />
                        </div>
                      </div>

                      {/* Gradient Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent z-10" />

                      {/* Content */}
                      <div className="absolute bottom-0 left-0 right-0 p-5 text-white z-20">
                        {/* Route Display - Always Visible */}
                        <div className="text-center mb-4">
                          <h3 className="text-lg font-bold leading-tight">
                            {parseDestination(destination.title).departure} →{" "}
                            {parseDestination(destination.title).arrival}
                          </h3>
                        </div>

                        {/* Details - Show on Hover */}
                        <div className="opacity-0 group-hover:opacity-100 transition-all duration-300 space-y-3">
                          <div className="flex items-center justify-center space-x-4 text-white/90 text-sm">
                            <div className="flex items-center space-x-1">
                              <Calendar className="h-3 w-3" />
                              <span>{destination.subtitle}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Users className="h-3 w-3" />
                              <span>2-4 người</span>
                            </div>
                          </div>

                          <div className="flex items-center justify-between">
                            <div className="text-center">
                              <div className="text-white/70 text-xs">
                                Giá từ
                              </div>
                              <div className="text-xl font-bold text-orange-400">
                                {destination.price}
                              </div>
                            </div>

                            <div className="transform translate-x-4 group-hover:translate-x-0 transition-transform duration-300">
                              <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-pink-500 rounded-full flex items-center justify-center shadow-lg">
                                <ArrowRight className="h-5 w-5 text-white" />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                </Link>
              ))}
          </div>

          {/* Center - 40% width */}
          <div className="w-full lg:w-[40%]">
            {currentDestinations[2] && (
              <Link to="/blog" className="block group">
                <Card className="relative overflow-hidden bg-white rounded-3xl shadow-2xl hover:shadow-3xl transition-all duration-700 border-0 transform hover:-translate-y-3 h-full">
                  <div className="relative h-[548px]">
                    {" "}
                    {/* Fixed height to match 2 side cards combined */}
                    <img
                      src={currentDestinations[2].image || "/placeholder.svg"}
                      alt={currentDestinations[2].title}
                      className="w-full h-full object-cover object-center transition-transform duration-1000 group-hover:scale-105"
                    />
                    {/* Simplified Premium Badge - Top */}
                    <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-20">
                      <div className="bg-gradient-to-r from-red-500 to-orange-500 px-3 py-1 rounded-full shadow-lg">
                        <span className="text-xs font-bold text-white uppercase tracking-wider">
                          Nổi bật
                        </span>
                      </div>
                    </div>
                    {/* Route Badge - Simplified */}
                    <div className="absolute top-14 left-4 right-4 z-20">
                      <div className="bg-black/80 backdrop-blur-sm px-3 py-2 rounded-lg shadow-lg text-center">
                        <span className="text-xs font-bold text-white uppercase tracking-wide">
                          {currentDestinations[2].badge}
                        </span>
                      </div>
                    </div>
                    {/* Simplified Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent z-10" />
                    {/* Simplified Content - Bottom positioned */}
                    <div className="absolute bottom-0 left-0 right-0 p-6 text-white z-20">
                      {/* Route Display - Simplified */}
                      <div className="text-center mb-4">
                        <h3 className="text-2xl font-bold mb-2">
                          {
                            parseDestination(currentDestinations[2].title)
                              .departure
                          }{" "}
                          →{" "}
                          {
                            parseDestination(currentDestinations[2].title)
                              .arrival
                          }
                        </h3>
                        <div className="text-white/80 text-sm">
                          Tuyến đường phổ biến nhất
                        </div>
                      </div>

                      {/* Quick Info - Simplified */}
                      <div className="grid grid-cols-2 gap-3 mb-4">
                        <div className="bg-white/15 backdrop-blur-sm rounded-lg p-3 text-center">
                          <Calendar className="h-4 w-4 mx-auto mb-1 text-orange-400" />
                          <div className="text-xs text-white/70">Khởi hành</div>
                          <div className="text-sm font-semibold">
                            {currentDestinations[2].subtitle}
                          </div>
                        </div>
                        <div className="bg-white/15 backdrop-blur-sm rounded-lg p-3 text-center">
                          <Users className="h-4 w-4 mx-auto mb-1 text-pink-400" />
                          <div className="text-xs text-white/70">
                            Hành khách
                          </div>
                          <div className="text-sm font-semibold">2-4 người</div>
                        </div>
                      </div>

                      {/* Price and CTA - Simplified */}
                      <div className="bg-white/15 backdrop-blur-sm rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-white/70 text-xs">
                              Giá ưu đãi từ
                            </div>
                            <div className="text-2xl font-bold text-orange-400">
                              {currentDestinations[2].price}
                            </div>
                          </div>
                          <div className="transform group-hover:scale-110 transition-transform duration-300">
                            <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-pink-500 rounded-full flex items-center justify-center shadow-lg">
                              <ArrowRight className="h-6 w-6 text-white" />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    {/* Location Pin - Only on Hover */}
                    <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20">
                      <div className="p-2 bg-white/20 backdrop-blur-md border border-white/30 rounded-full">
                        <MapPin className="h-4 w-4 text-white" />
                      </div>
                    </div>
                  </div>
                </Card>
              </Link>
            )}
          </div>

          {/* Right Side - 30% width */}
          <div className="w-full lg:w-[30%] space-y-6">
            {currentDestinations
              .slice(3, 5)
              .map((destination: DestinationItem) => (
                <Link key={destination.id} to="/blog" className="block group">
                  <Card className="relative overflow-hidden bg-white rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-700 border-0 transform hover:-translate-y-2 h-[262px]">
                    <div className="relative h-full">
                      <img
                        src={destination.image || "/placeholder.svg"}
                        alt={destination.title}
                        className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                      />

                      {/* Route Badge - Fixed positioning */}
                      <div className="absolute top-4 left-4 z-20">
                        <div className="bg-black/70 backdrop-blur-sm px-3 py-2 rounded-lg shadow-lg">
                          <span className="text-xs font-bold text-white uppercase tracking-wide">
                            {destination.badge}
                          </span>
                        </div>
                      </div>

                      {/* Location Pin - Only on Hover */}
                      <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20">
                        <div className="p-2 bg-white/20 backdrop-blur-md border border-white/30 rounded-full">
                          <MapPin className="h-4 w-4 text-white" />
                        </div>
                      </div>

                      {/* Gradient Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent z-10" />

                      {/* Content */}
                      <div className="absolute bottom-0 left-0 right-0 p-5 text-white z-20">
                        {/* Route Display - Always Visible */}
                        <div className="text-center mb-4">
                          <h3 className="text-lg font-bold leading-tight">
                            {parseDestination(destination.title).departure} →{" "}
                            {parseDestination(destination.title).arrival}
                          </h3>
                        </div>

                        {/* Details - Show on Hover */}
                        <div className="opacity-0 group-hover:opacity-100 transition-all duration-300 space-y-3">
                          <div className="flex items-center justify-center space-x-4 text-white/90 text-sm">
                            <div className="flex items-center space-x-1">
                              <Calendar className="h-3 w-3" />
                              <span>{destination.subtitle}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Users className="h-3 w-3" />
                              <span>2-4 người</span>
                            </div>
                          </div>

                          <div className="flex items-center justify-between">
                            <div className="text-center">
                              <div className="text-white/70 text-xs">
                                Giá từ
                              </div>
                              <div className="text-xl font-bold text-orange-400">
                                {destination.price}
                              </div>
                            </div>

                            <div className="transform translate-x-4 group-hover:translate-x-0 transition-transform duration-300">
                              <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-pink-500 rounded-full flex items-center justify-center shadow-lg">
                                <ArrowRight className="h-5 w-5 text-white" />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                </Link>
              ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <Link to="/blog">
            <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold px-12 py-6 rounded-2xl shadow-2xl hover:shadow-3xl transition-all duration-500 border-0 text-lg transform hover:scale-105">
              <span>Khám phá thêm điểm đến</span>
              <ArrowRight className="ml-3 h-6 w-6" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default PopularDestinations;
