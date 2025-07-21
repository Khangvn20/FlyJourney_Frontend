import { Button } from "../components/ui/button";
import type React from "react";
import Hero from "../components/Hero";
import FlightSearchForm from "../components/FlightSearchForm";
import { Card, CardContent } from "../components/ui/card";
import { Badge } from "../components/ui/badge";

const Home: React.FC = () => {
  const destinations = [
    {
      city: "Hà Nội",
      region: "Miền Bắc",
      price: "Từ 1.200.000đ",
      image: "/placeholder.svg?height=200&width=300",
      description: "Thủ đô ngàn năm văn hiến",
    },
    {
      city: "TP. Hồ Chí Minh",
      region: "Miền Nam",
      price: "Từ 1.500.000đ",
      image: "/placeholder.svg?height=200&width=300",
      description: "Thành phố năng động nhất Việt Nam",
    },
    {
      city: "Đà Nẵng",
      region: "Miền Trung",
      price: "Từ 1.100.000đ",
      image: "/placeholder.svg?height=200&width=300",
      description: "Thành phố đáng sống bên bờ biển",
    },
    {
      city: "Phú Quốc",
      region: "Kiên Giang",
      price: "Từ 1.800.000đ",
      image: "/placeholder.svg?height=200&width=300",
      description: "Đảo ngọc với bãi biển tuyệt đẹp",
    },
    {
      city: "Nha Trang",
      region: "Khánh Hòa",
      price: "Từ 1.300.000đ",
      image: "/placeholder.svg?height=200&width=300",
      description: "Thiên đường biển xanh cát trắng",
    },
    {
      city: "Đà Lạt",
      region: "Lâm Đồng",
      price: "Từ 1.000.000đ",
      image: "/placeholder.svg?height=200&width=300",
      description: "Thành phố ngàn hoa mộng mơ",
    },
  ];

  return (
    <div className="space-y-16">
      {/* Hero Section */}
      <Hero />

      {/* Search Form */}
      <section className="relative -mt-8">
        <FlightSearchForm />
      </section>

      {/* Popular Destinations */}
      <section className="py-16">
        <div className="text-center mb-12">
          <Badge variant="secondary" className="mb-4">
            Điểm Đến Phổ Biến
          </Badge>
          <h2 className="text-3xl md:text-4xl font-display font-bold text-gray-900 mb-4">
            Khám Phá Việt Nam
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Những điểm đến được yêu thích nhất với giá vé hấp dẫn
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {destinations.map((destination, index) => (
            <Card
              key={index}
              className="border-0 shadow-soft hover:shadow-large transition-all duration-300 group overflow-hidden">
              <div className="relative">
                <img
                  src={destination.image || "/placeholder.svg"}
                  alt={destination.city}
                  className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-4 right-4">
                  <Badge className="bg-white/90 text-gray-900 hover:bg-white">
                    {destination.price}
                  </Badge>
                </div>
              </div>
              <CardContent className="p-4">
                <h3 className="font-semibold text-gray-900 text-lg">
                  {destination.city}
                </h3>
                <p className="text-sm text-gray-600 mb-2">
                  {destination.region}
                </p>
                <p className="text-sm text-gray-500">
                  {destination.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-16">
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
      </section>
    </div>
  );
};

export default Home;
