import React from "react";
import { Link } from "react-router-dom";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { Calendar } from "lucide-react";
import { travelNews } from "../assets/mock";

const TravelNews: React.FC = () => {
  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-12">
          <div className="text-center flex-1">
            <h2 className="text-3xl md:text-4xl font-display font-bold text-gray-900 mb-4">
              Tin tức nổi bật
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Cập nhật tin tức mới nhất về các chương trình khuyến mãi và điểm
              đến
            </p>
          </div>
          <Link to="/news">
            <Button variant="outline" className="hidden md:flex">
              Xem thêm
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {travelNews.map((news) => (
            <Link key={news.id} to="/news" className="block">
              <Card className="border-0 shadow-soft hover:shadow-large transition-all duration-300 group overflow-hidden cursor-pointer">
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
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TravelNews;
