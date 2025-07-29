import React from "react";
import { Link } from "react-router-dom";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { Plane } from "lucide-react";
import { popularDestinations } from "../assets/mock";

const PopularDestinations: React.FC = () => {
  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center space-x-2 mb-2">
              <Plane className="h-6 w-6 text-orange-500" />
              <span className="text-orange-500 font-medium">
                Fly Journey cung cấp các chủ đề du lịch mà bạn sẽ thích
              </span>
            </div>
            <h2 className="text-3xl md:text-4xl font-display font-bold text-gray-900">
              Điểm đến hấp dẫn
            </h2>
          </div>
          <Link to="/blog">
            <Button variant="outline" className="hidden md:flex">
              Xem thêm
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {popularDestinations.map((destination, index) => (
            <Link key={destination.id} to="/blog" className="block">
              <Card
                className={`border-0 shadow-soft hover:shadow-large transition-all duration-300 group overflow-hidden cursor-pointer ${
                  index === 0 ? "lg:col-span-2 lg:row-span-2" : ""
                }`}>
                <div className="relative">
                  <img
                    src={destination.image}
                    alt={destination.title}
                    className={`w-full object-cover group-hover:scale-105 transition-transform duration-300 ${
                      index === 0 ? "h-80 lg:h-96" : "h-48"
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
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PopularDestinations;
