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

const News: React.FC = () => {
  const featuredNews = {
    id: 1,
    title:
      "Hà Nội mở cửa trở lại các điểm du lịch sau mùa dịch - Cơ hội vàng cho du khách",
    summary:
      "Sau thời gian tạm đóng cửa, các điểm du lịch nổi tiếng tại Hà Nội đã chính thức mở cửa đón khách trở lại với nhiều chương trình ưu đãi hấp dẫn.",
    content:
      "Thủ đô Hà Nội đã chính thức mở cửa trở lại các điểm du lịch, khu vui chơi giải trí sau thời gian dài tạm đóng cửa do ảnh hưởng của dịch bệnh. Đây được xem là cơ hội vàng cho du khách trong và ngoài nước có thể trở lại khám phá vẻ đẹp của thủ đô nghìn năm tuổi...",
    image:
      "https://images.pexels.com/photos/2161467/pexels-photo-2161467.jpeg?auto=compress&cs=tinysrgb&w=800&h=500&fit=crop",
    author: "Nguyễn Văn An",
    date: "15/01/2025",
    readTime: "5 phút đọc",
    views: "2.5K",
    category: "Tin tức du lịch",
  };

  const newsList = [
    {
      id: 2,
      title: "TP.HCM ra mắt tour du lịch đêm khám phá phố cổ Sài Gòn",
      summary:
        "Chương trình tour mới giúp du khách khám phá vẻ đẹp Sài Gòn về đêm với những trải nghiệm độc đáo.",
      image:
        "https://images.pexels.com/photos/3225531/pexels-photo-3225531.jpeg?auto=compress&cs=tinysrgb&w=400&h=250&fit=crop",
      author: "Trần Thị Bình",
      date: "14/01/2025",
      readTime: "4 phút đọc",
      views: "1.8K",
      category: "Điểm đến",
    },
    {
      id: 3,
      title: "Giá vé máy bay nội địa giảm mạnh trong tháng 2/2025",
      summary:
        "Các hãng hàng không đồng loạt giảm giá vé để kích thích nhu cầu du lịch dịp đầu năm.",
      image:
        "https://images.pexels.com/photos/358319/pexels-photo-358319.jpeg?auto=compress&cs=tinysrgb&w=400&h=250&fit=crop",
      author: "Lê Hoàng Minh",
      date: "13/01/2025",
      readTime: "3 phút đọc",
      views: "3.2K",
      category: "Hàng không",
    },
    {
      id: 4,
      title: "Đà Nẵng chuẩn bị cho mùa du lịch 2025 với nhiều sự kiện hấp dẫn",
      summary:
        "Thành phố Đà Nẵng công bố kế hoạch tổ chức nhiều lễ hội, sự kiện văn hóa phục vụ khách du lịch.",
      image:
        "https://images.pexels.com/photos/5207262/pexels-photo-5207262.jpeg?auto=compress&cs=tinysrgb&w=400&h=250&fit=crop",
      author: "Phạm Thị Cúc",
      date: "12/01/2025",
      readTime: "6 phút đọc",
      views: "1.9K",
      category: "Sự kiện",
    },
    {
      id: 5,
      title: "Phú Quốc đạt kỷ lục đón khách quốc tế trong tháng đầu năm",
      summary:
        "Đảo ngọc Phú Quốc tiếp tục khẳng định vị thế là điểm đến hàng đầu của Việt Nam.",
      image:
        "https://images.pexels.com/photos/3355788/pexels-photo-3355788.jpeg?auto=compress&cs=tinysrgb&w=400&h=250&fit=crop",
      author: "Hoàng Văn Đức",
      date: "11/01/2025",
      readTime: "4 phút đọc",
      views: "2.7K",
      category: "Thống kê",
    },
    {
      id: 6,
      title: "Nha Trang ra mắt khu du lịch sinh thái mới với công nghệ AR/VR",
      summary:
        "Công viên chủ đề mới tại Nha Trang hứa hẹn mang đến trải nghiệm du lịch hiện đại và thú vị.",
      image:
        "https://images.pexels.com/photos/23529021/pexels-photo-23529021.jpeg?auto=compress&cs=tinysrgb&w=400&h=250&fit=crop",
      author: "Vũ Thị Em",
      date: "10/01/2025",
      readTime: "5 phút đọc",
      views: "1.4K",
      category: "Công nghệ",
    },
    {
      id: 7,
      title: "Hạ Long được bình chọn là vịnh đẹp nhất thế giới năm 2025",
      summary:
        "Vịnh Hạ Long một lần nữa khẳng định vị thế trên bản đồ du lịch thế giới.",
      image:
        "https://images.pexels.com/photos/2161467/pexels-photo-2161467.jpeg?auto=compress&cs=tinysrgb&w=400&h=250&fit=crop",
      author: "Đỗ Văn Phước",
      date: "09/01/2025",
      readTime: "3 phút đọc",
      views: "4.1K",
      category: "Vinh danh",
    },
  ];

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
