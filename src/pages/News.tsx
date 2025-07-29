import React from "react";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import {
  Calendar,
  Clock,
  User,
  Eye,
  Share2,
  Bookmark,
  TrendingUp,
} from "lucide-react";
import { getFeaturedNews, getNewsList } from "../assets/mock";

const News: React.FC = () => {
  const featuredNews = getFeaturedNews();
  const newsList = getNewsList();

  // Nếu không có featured news, không hiển thị gì
  if (!featuredNews) {
    return <div>Không có tin tức nổi bật</div>;
  }

  const categories = [
    "Tất cả",
    "Tin tức du lịch",
    "Điểm đến",
    "Hàng không",
    "Sự kiện",
    "Thống kê",
    "Công nghệ",
    "Vinh danh",
  ];

  const trendingTopics = [
    "Du lịch Tết 2025",
    "Giá vé máy bay",
    "COVID-19 và du lịch",
    "Điểm đến hot",
    "Ẩm thực địa phương",
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Page Header */}
      <section className="bg-white py-12">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Tin tức du lịch
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Cập nhật những tin tức mới nhất về du lịch, điểm đến và ngành hàng
              không Việt Nam
            </p>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-12">
        <div className="grid lg:grid-cols-4 gap-12">
          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Featured Article */}
            <Card className="shadow-soft mb-12 overflow-hidden">
              <div className="relative">
                <img
                  src={featuredNews.image}
                  alt={featuredNews.title}
                  className="w-full h-80 object-cover"
                />
                <div className="absolute top-4 left-4">
                  <Badge className="bg-red-600 text-white">TIN NỔI BẬT</Badge>
                </div>
              </div>
              <CardContent className="p-8">
                <div className="flex items-center space-x-4 text-sm text-gray-500 mb-4">
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    {featuredNews.date}
                  </div>
                  <div className="flex items-center">
                    <User className="h-4 w-4 mr-1" />
                    {featuredNews.author}
                  </div>
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-1" />
                    {featuredNews.readTime}
                  </div>
                  <div className="flex items-center">
                    <Eye className="h-4 w-4 mr-1" />
                    {featuredNews.views}
                  </div>
                </div>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                  {featuredNews.title}
                </h2>
                <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                  {featuredNews.summary}
                </p>
                <p className="text-gray-700 leading-relaxed mb-6">
                  {featuredNews.content}
                </p>
                <div className="flex items-center justify-between">
                  <Badge variant="outline">{featuredNews.category}</Badge>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm">
                      <Share2 className="h-4 w-4 mr-2" />
                      Chia sẻ
                    </Button>
                    <Button variant="outline" size="sm">
                      <Bookmark className="h-4 w-4 mr-2" />
                      Lưu
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Category Filter */}
            <div className="mb-8">
              <div className="flex flex-wrap gap-2">
                {categories.map((category, index) => (
                  <Button
                    key={index}
                    variant={index === 0 ? "default" : "outline"}
                    size="sm"
                    className={index === 0 ? "bg-blue-600 text-white" : ""}>
                    {category}
                  </Button>
                ))}
              </div>
            </div>

            {/* News Grid */}
            <div className="grid md:grid-cols-2 gap-8">
              {newsList.map((news) => (
                <Card
                  key={news.id}
                  className="shadow-soft hover:shadow-large transition-all duration-300 group overflow-hidden">
                  <div className="relative">
                    <img
                      src={news.image}
                      alt={news.title}
                      className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-3 left-3">
                      <Badge className="bg-blue-600 text-white text-xs">
                        {news.category}
                      </Badge>
                    </div>
                  </div>
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-3 text-xs text-gray-500 mb-3">
                      <div className="flex items-center">
                        <Calendar className="h-3 w-3 mr-1" />
                        {news.date}
                      </div>
                      <div className="flex items-center">
                        <Clock className="h-3 w-3 mr-1" />
                        {news.readTime}
                      </div>
                      <div className="flex items-center">
                        <Eye className="h-3 w-3 mr-1" />
                        {news.views}
                      </div>
                    </div>
                    <h3 className="font-bold text-gray-900 text-lg mb-3 line-clamp-2 group-hover:text-blue-600 transition-colors">
                      {news.title}
                    </h3>
                    <p className="text-gray-600 text-sm line-clamp-3 leading-relaxed mb-4">
                      {news.summary}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center text-xs text-gray-500">
                        <User className="h-3 w-3 mr-1" />
                        {news.author}
                      </div>
                      <Button
                        variant="link"
                        size="sm"
                        className="p-0 h-auto text-blue-600">
                        Đọc thêm →
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Load More */}
            <div className="text-center mt-12">
              <Button variant="outline" size="lg">
                Xem thêm tin tức
              </Button>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* Trending Topics */}
            <Card className="shadow-soft">
              <CardContent className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                  <TrendingUp className="h-5 w-5 mr-2 text-red-500" />
                  Chủ đề nổi bật
                </h3>
                <div className="space-y-3">
                  {trendingTopics.map((topic, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors">
                      <span className="text-gray-700 font-medium">{topic}</span>
                      <span className="text-xs text-gray-500">
                        #{index + 1}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Newsletter */}
            <Card className="shadow-soft">
              <CardContent className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  Đăng ký nhận tin
                </h3>
                <p className="text-gray-600 mb-4">
                  Nhận những tin tức du lịch mới nhất qua email
                </p>
                <div className="space-y-3">
                  <input
                    type="email"
                    placeholder="Email của bạn"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <Button className="w-full bg-blue-600 hover:bg-blue-700">
                    Đăng ký
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Contact */}
            <Card className="shadow-soft">
              <CardContent className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  Liên hệ tòa soạn
                </h3>
                <div className="space-y-3 text-sm">
                  <div>
                    <span className="font-medium">Email:</span>
                    <br />
                    <span className="text-blue-600">news@flyjourney.vn</span>
                  </div>
                  <div>
                    <span className="font-medium">Hotline:</span>
                    <br />
                    <span className="text-blue-600">1900 1234</span>
                  </div>
                  <div>
                    <span className="font-medium">Địa chỉ:</span>
                    <br />
                    <span className="text-gray-600">
                      123 Nguyễn Huệ, Q1, TP.HCM
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

export default News;
