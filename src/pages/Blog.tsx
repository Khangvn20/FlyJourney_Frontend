import React from "react";
import { Link } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import {
  MapPin,
  Clock,
  Users,
  Star,
  Plane,
  Camera,
  Coffee,
  Mountain,
} from "lucide-react";

const Blog: React.FC = () => {
  const travelItinerary = [
    {
      day: "Ngày 1",
      title: "Khám phá Hà Nội",
      activities: [
        "Tham quan Hồ Hoàn Kiếm và Đền Ngọc Sơn",
        "Thưởng thức phở Hà Nội tại phố cổ",
        "Dạo bước tại Khu phố cổ Hà Nội",
        "Xem múa rối nước truyền thống",
      ],
      image:
        "https://images.pexels.com/photos/2161467/pexels-photo-2161467.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop",
    },
    {
      day: "Ngày 2",
      title: "Di sản và Văn hóa",
      activities: [
        "Tham quan Lăng Chủ tích Hồ Chí Minh",
        "Khám phá Văn Miếu - Quốc Tử Giám",
        "Mua sắm tại chợ Đông Xuân",
        "Thưởng thức bia hơi tại phố Tạ Hiện",
      ],
      image:
        "https://images.pexels.com/photos/5207262/pexels-photo-5207262.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop",
    },
    {
      day: "Ngày 3",
      title: "Ẩm thực và Giải trí",
      activities: [
        "Tham quan chợ Hôm và Long Biên",
        "Thưởng thức bún chả Obama",
        "Tham quan Nhà hát lớn Hà Nội",
        "Shopping tại Vincom và Tràng Tiền Plaza",
      ],
      image:
        "https://images.pexels.com/photos/2161467/pexels-photo-2161467.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop",
    },
  ];

  const highlights = [
    {
      icon: MapPin,
      title: "15+ Điểm tham quan",
      description: "Các địa điểm nổi tiếng nhất",
    },
    { icon: Clock, title: "3 ngày 2 đêm", description: "Lịch trình tối ưu" },
    {
      icon: Users,
      title: "Phù hợp mọi lứa tuổi",
      description: "Gia đình và bạn bè",
    },
    {
      icon: Star,
      title: "4.8/5 đánh giá",
      description: "Từ hơn 1000 khách hàng",
    },
  ];

  const tips = [
    {
      icon: Plane,
      title: "Thời gian bay tốt nhất",
      description: "Chuyến bay sáng sớm để có thời gian khám phá nhiều hơn",
    },
    {
      icon: Camera,
      title: "Điểm chụp ảnh đẹp",
      description: "Hồ Hoàn Kiếm lúc hoàng hôn, Cầu Long Biên vào buổi sáng",
    },
    {
      icon: Coffee,
      title: "Món ăn phải thử",
      description: "Phở, bún chả, chả cá Lã Vọng, bánh mì pate",
    },
    {
      icon: Mountain,
      title: "Hoạt động thú vị",
      description: "Xe ôm tour, cyclo phố cổ, cruise trên sông Hồng",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="relative h-96 overflow-hidden">
        <img
          src="https://images.pexels.com/photos/2161467/pexels-photo-2161467.jpeg?auto=compress&cs=tinysrgb&w=1200&h=600&fit=crop"
          alt="Hà Nội - TP HCM"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/50" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-white space-y-4">
            <Badge className="bg-red-600 text-white mb-4">
              HÀNH TRÌNH KHÁM PHÁ
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold mb-4">
              Hà Nội - TP Hồ Chí Minh
            </h1>
            <p className="text-xl md:text-2xl opacity-90">
              Khám phá hai thành phố lớn nhất Việt Nam
            </p>
            <div className="flex items-center justify-center space-x-6 mt-6 text-lg">
              <div className="flex items-center">
                <Clock className="h-5 w-5 mr-2" />
                <span>3 ngày 2 đêm</span>
              </div>
              <div className="flex items-center">
                <MapPin className="h-5 w-5 mr-2" />
                <span>15+ điểm tham quan</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Content */}
      <div className="container mx-auto px-4 py-16">
        <div className="grid lg:grid-cols-3 gap-12">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-12">
            {/* Overview */}
            <div className="bg-white rounded-2xl p-8 shadow-soft">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                Tổng quan hành trình
              </h2>
              <p className="text-lg text-gray-600 leading-relaxed mb-6">
                Hành trình khám phá hai thành phố lớn nhất Việt Nam - từ Hà Nội
                cổ kính với hàng nghìn năm lịch sử đến TP Hồ Chí Minh năng động,
                hiện đại. Trải nghiệm sự đa dạng về văn hóa, ẩm thực và con
                người qua từng vùng miền đặc sắc.
              </p>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {highlights.map((item, index) => {
                  const IconComponent = item.icon;
                  return (
                    <div key={index} className="text-center">
                      <div className="flex justify-center mb-3">
                        <IconComponent className="h-8 w-8 text-blue-600" />
                      </div>
                      <h3 className="font-semibold text-gray-900 mb-1">
                        {item.title}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {item.description}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Itinerary */}
            <div className="bg-white rounded-2xl p-8 shadow-soft">
              <h2 className="text-3xl font-bold text-gray-900 mb-8">
                Lịch trình chi tiết
              </h2>

              <div className="space-y-8">
                {travelItinerary.map((day, index) => (
                  <div key={index} className="flex gap-6">
                    <div className="flex-shrink-0">
                      <div className="w-20 h-20 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full flex items-center justify-center">
                        <span className="text-white font-bold">
                          {day.day.split(" ")[1]}
                        </span>
                      </div>
                    </div>

                    <div className="flex-1">
                      <div className="bg-gray-50 rounded-xl p-6">
                        <div className="flex flex-col md:flex-row gap-6">
                          <div className="flex-1">
                            <h3 className="text-xl font-bold text-gray-900 mb-2">
                              {day.day}: {day.title}
                            </h3>
                            <ul className="space-y-2">
                              {day.activities.map((activity, actIndex) => (
                                <li key={actIndex} className="flex items-start">
                                  <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3 flex-shrink-0" />
                                  <span className="text-gray-700">
                                    {activity}
                                  </span>
                                </li>
                              ))}
                            </ul>
                          </div>
                          <div className="md:w-48">
                            <img
                              src={day.image}
                              alt={day.title}
                              className="w-full h-32 object-cover rounded-lg"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Tips */}
            <div className="bg-white rounded-2xl p-8 shadow-soft">
              <h2 className="text-3xl font-bold text-gray-900 mb-8">
                Mẹo du lịch hữu ích
              </h2>

              <div className="grid md:grid-cols-2 gap-6">
                {tips.map((tip, index) => {
                  const IconComponent = tip.icon;
                  return (
                    <div
                      key={index}
                      className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg">
                      <div className="flex-shrink-0">
                        <IconComponent className="h-6 w-6 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-1">
                          {tip.title}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {tip.description}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* Booking Card */}
            <Card className="shadow-soft sticky top-8">
              <CardContent className="p-6">
                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    Đặt chuyến bay ngay
                  </h3>
                  <p className="text-gray-600">
                    Giá tốt nhất cho hành trình của bạn
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-center p-4 bg-blue-50 rounded-lg">
                    <div>
                      <p className="font-semibold text-gray-900">HCM → HN</p>
                      <p className="text-sm text-gray-600">
                        Khởi hành hàng ngày
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-bold text-blue-600">
                        1.299.000đ
                      </p>
                      <p className="text-xs text-gray-500">một chiều</p>
                    </div>
                  </div>

                  <div className="flex justify-between items-center p-4 bg-green-50 rounded-lg">
                    <div>
                      <p className="font-semibold text-gray-900">HN → HCM</p>
                      <p className="text-sm text-gray-600">
                        Khởi hành hàng ngày
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-bold text-green-600">
                        1.449.000đ
                      </p>
                      <p className="text-xs text-gray-500">một chiều</p>
                    </div>
                  </div>
                </div>

                <Link to="/search">
                  <Button className="w-full mt-6 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
                    Tìm chuyến bay
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Contact Card */}
            <Card className="shadow-soft">
              <CardContent className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  Cần hỗ trợ?
                </h3>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center">
                    <span className="font-medium w-20">Hotline:</span>
                    <span className="text-blue-600">1900 1234</span>
                  </div>
                  <div className="flex items-center">
                    <span className="font-medium w-20">Email:</span>
                    <span className="text-blue-600">support@flyjourney.vn</span>
                  </div>
                  <div className="flex items-start">
                    <span className="font-medium w-20">Giờ làm việc:</span>
                    <span className="text-gray-600">
                      24/7 hỗ trợ khách hàng
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Blog;
