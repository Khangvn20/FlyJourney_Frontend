import React, { useState } from 'react';
import { Card, Button, Tag, Divider, Select, Slider, Checkbox, Empty } from 'antd';
import { Plane, Clock, ArrowLeft, Filter, Star, Wifi, Utensils, Luggage } from 'lucide-react';
import type { Flight } from '../App';

const { Option } = Select;

interface FlightResultsProps {
  searchData: any;
  onFlightSelect: (flight: Flight) => void;
  onBackToHome: () => void;
}

const FlightResults: React.FC<FlightResultsProps> = ({ searchData, onFlightSelect, onBackToHome }) => {
  const [sortBy, setSortBy] = useState('price');
  const [priceRange, setPriceRange] = useState<[number, number]>([500000, 5000000]);
  const [selectedStops, setSelectedStops] = useState<number[]>([]);
  const [selectedAirlines, setSelectedAirlines] = useState<string[]>([]);

  // Mock flight data
  // Danh sách chuyến bay mẫu cho Việt Nam
  const mockFlights: Flight[] = [
    {
      id: '1',
      airline: 'Vietnam Airlines',
      flightNumber: 'VN 1234',
      departure: {
        city: 'Hà Nội',
        airport: 'Nội Bài International',
        code: 'HAN',
        time: '08:30',
        date: '2024-01-15'
      },
      arrival: {
        city: 'Hồ Chí Minh',
        airport: 'Tân Sơn Nhất',
        code: 'SGN',
        time: '10:45',
        date: '2024-01-15'
      },
      duration: '2h 15m',
      price: 1256000,
      stops: 0,
      aircraft: 'Airbus A321',
      amenities: ['wifi', 'meals', 'entertainment']
    },
    {
      id: '2',
      airline: 'Bamboo Airways',
      flightNumber: 'QH 5678',
      departure: {
        city: 'Đà Nẵng',
        airport: 'Đà Nẵng International',
        code: 'DAD',
        time: '14:20',
        date: '2024-01-15'
      },
      arrival: {
        city: 'Hà Nội',
        airport: 'Nội Bài International',
        code: 'HAN',
        time: '16:10',
        date: '2024-01-15'
      },
      duration: '1h 50m',
      price: 1032000,
      stops: 0,
      aircraft: 'Airbus A320',
      amenities: ['wifi', 'meals']
    },
    {
      id: '3',
      airline: 'Vietjet Air',
      flightNumber: 'VJ 9012',
      departure: {
        city: 'Hồ Chí Minh',
        airport: 'Tân Sơn Nhất',
        code: 'SGN',
        time: '11:45',
        date: '2024-01-15'
      },
      arrival: {
        city: 'Phú Quốc',
        airport: 'Phú Quốc International',
        code: 'PQC',
        time: '12:50',
        date: '2024-01-15'
      },
      duration: '1h 05m',
      price: 892000,
      stops: 0,
      aircraft: 'Airbus A320',
      amenities: ['wifi']
    },
    {
      id: '4',
      airline: 'Vietnam Airlines',
      flightNumber: 'VN 7856',
      departure: {
        city: 'Hà Nội',
        airport: 'Nội Bài International',
        code: 'HAN',
        time: '15:30',
        date: '2024-01-15'
      },
      arrival: {
        city: 'Đà Lạt',
        airport: 'Liên Khương',
        code: 'DLI',
        time: '17:45',
        date: '2024-01-15'
      },
      duration: '2h 15m',
      price: 1456000,
      stops: 0,
      aircraft: 'Airbus A321',
      amenities: ['wifi', 'meals', 'entertainment']
    },
    {
      id: '5',
      airline: 'Pacific Airlines',
      flightNumber: 'BL 6196',
      departure: {
        city: 'Đà Nẵng',
        airport: 'Đà Nẵng International',
        code: 'DAD',
        time: '12:30',
        date: '2024-01-15'
      },
      arrival: {
        city: 'Nha Trang',
        airport: 'Cam Ranh International',
        code: 'CXR',
        time: '13:45',
        date: '2024-01-15'
      },
      duration: '1h 15m',
      price: 845000,
      stops: 0,
      aircraft: 'Airbus A320',
      amenities: ['meals']
    },
    {
      id: '6',
      airline: 'Vietjet Air',
      flightNumber: 'VJ 198',
      departure: {
        city: 'Hà Nội',
        airport: 'Nội Bài International',
        code: 'HAN',
        time: '10:20',
        date: '2024-01-15'
      },
      arrival: {
        city: 'Nha Trang',
        airport: 'Cam Ranh International',
        code: 'CXR',
        time: '12:30',
        date: '2024-01-15'
      },
      duration: '2h 10m',
      price: 856000,
      stops: 0,
      aircraft: 'Airbus A320',
      amenities: ['wifi']
    },
    {
      id: '7',
      airline: 'Vietnam Airlines',
      flightNumber: 'VN 7206',
      departure: {
        city: 'Hồ Chí Minh',
        airport: 'Tân Sơn Nhất',
        code: 'SGN',
        time: '06:00',
        date: '2024-01-15'
      },
      arrival: {
        city: 'Hà Nội',
        airport: 'Nội Bài International',
        code: 'HAN',
        time: '09:30',
        date: '2024-01-15'
      },
      duration: '2h 15m',
      price: 3256000,
      stops: 1,
      aircraft: 'Boeing 787',
      amenities: ['wifi', 'meals', 'entertainment', 'extra-legroom']
    },
    {
      id: '8',
      airline: 'Vietjet Air',
      flightNumber: 'VJ 882',
      departure: {
        city: 'Đà Nẵng',
        airport: 'Đà Nẵng International',
        code: 'DAD',
        time: '17:15',
        date: '2024-01-15'
      },
      arrival: {
        city: 'Hà Nội',
        airport: 'Nội Bài International',
        code: 'HAN',
        time: '19:05',
        date: '2024-01-15'
      },
      duration: '1h 50m',
      price: 699000,
      stops: 0,
      aircraft: 'Airbus A320',
      amenities: ['wifi']
    },
    {
      id: '9',
      airline: 'Bamboo Airways',
      flightNumber: 'QH 4521',
      departure: {
        city: 'Hải Phòng',
        airport: 'Cát Bi International',
        code: 'HPH',
        time: '08:00',
        date: '2024-01-15'
      },
      arrival: {
        city: 'Quy Nhơn',
        airport: 'Phù Cát',
        code: 'UIH',
        time: '09:45',
        date: '2024-01-15'
      },
      duration: '1h 45m',
      price: 986000,
      stops: 0,
      aircraft: 'Airbus A320',
      amenities: ['wifi', 'meals', 'extra-legroom']
    },
    {
      id: '10',
      airline: 'Vietjet Air',
      flightNumber: 'VJ 8754',
      departure: {
        city: 'Hà Nội',
        airport: 'Nội Bài International',
        code: 'HAN',
        time: '13:20',
        date: '2024-01-15'
      },
      arrival: {
        city: 'Vinh',
        airport: 'Vinh International',
        code: 'VII',
        time: '14:20',
        date: '2024-01-15'
      },
      duration: '1h',
      price: 658000,
      stops: 0,
      aircraft: 'Airbus A320',
      amenities: ['wifi']
    },
    {
      id: '11',
      airline: 'Vietnam Airlines',
      flightNumber: 'VN 2468',
      departure: {
        city: 'Hồ Chí Minh',
        airport: 'Tân Sơn Nhất',
        code: 'SGN',
        time: '10:15',
        date: '2024-01-15'
      },
      arrival: {
        city: 'Pleiku',
        airport: 'Pleiku Airport',
        code: 'PXU',
        time: '11:45',
        date: '2024-01-15'
      },
      duration: '1h 30m',
      price: 876000,
      stops: 0,
      aircraft: 'Airbus A321',
      amenities: ['wifi', 'meals', 'entertainment']
    },
    {
      id: '12',
      airline: 'Bamboo Airways',
      flightNumber: 'QH 7896',
      departure: {
        city: 'Đà Nẵng',
        airport: 'Đà Nẵng International',
        code: 'DAD',
        time: '16:30',
        date: '2024-01-15'
      },
      arrival: {
        city: 'Côn Đảo',
        airport: 'Côn Đảo Airport',
        code: 'VCS',
        time: '18:15',
        date: '2024-01-15'
      },
      duration: '1h 45m',
      price: 1450000,
      stops: 1,
      aircraft: 'Embraer E190',
      amenities: ['wifi', 'meals', 'entertainment', 'extra-legroom']
    }
  ];

  const airlines = [...new Set(mockFlights.map(flight => flight.airline))];
  
  const filteredFlights = mockFlights.filter(flight => {
    const priceFilter = flight.price >= priceRange[0] && flight.price <= priceRange[1];
    const stopsFilter = selectedStops.length === 0 || selectedStops.includes(flight.stops);
    const airlineFilter = selectedAirlines.length === 0 || selectedAirlines.includes(flight.airline);
    
    return priceFilter && stopsFilter && airlineFilter;
  });

  const sortedFlights = [...filteredFlights].sort((a, b) => {
    switch (sortBy) {
      case 'price':
        return a.price - b.price;
      case 'duration':
        return a.duration.localeCompare(b.duration);
      case 'departure':
        return a.departure.time.localeCompare(b.departure.time);
      default:
        return 0;
    }
  });

  const getAmenityIcon = (amenity: string) => {
    switch (amenity) {
      case 'wifi':
        return <Wifi size={14} />;
      case 'meals':
        return <Utensils size={14} />;
      case 'entertainment':
        return <Star size={14} />;
      case 'extra-legroom':
        return <Luggage size={14} />;
      default:
        return null;
    }
  };

  const getAmenityLabel = (amenity: string) => {
    switch (amenity) {
      case 'wifi':
        return 'WiFi';
      case 'meals':
        return 'Bữa ăn';
      case 'entertainment':
        return 'Giải trí';
      case 'extra-legroom':
        return 'Ghế rộng';
      default:
        return amenity;
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Button
              type="text"
              icon={<ArrowLeft size={20} />}
              onClick={onBackToHome}
              className="text-slate-300 hover:text-white"
            >
              Quay lại tìm kiếm
            </Button>
            <div className="text-white">
              <h1 className="text-2xl font-bold">
                {searchData?.from} → {searchData?.to}
              </h1>
              <p className="text-slate-400">
                {sortedFlights.length} chuyến bay • {searchData?.passengers} hành khách
              </p>
            </div>
          </div>
          
          <Select
            value={sortBy}
            onChange={setSortBy}
            className="w-48"
            size="large"
          >
            <Option value="price">Sắp xếp theo Giá</Option>
            <Option value="duration">Sắp xếp theo Thời gian bay</Option>
            <Option value="departure">Sắp xếp theo Giờ khởi hành</Option>
          </Select>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <Card className="bg-slate-800/90 border-slate-700 sticky top-24">
              <div className="flex items-center space-x-2 mb-6">
                <Filter size={20} className="text-blue-400" />
                <h3 className="text-lg font-semibold text-white">Bộ lọc</h3>
              </div>

              {/* Price Range */}
              <div className="mb-6">
                <h4 className="text-slate-300 mb-3 font-medium">Khoảng giá</h4>
                <Slider
                  range
                  value={priceRange}
                  onChange={(value) => setPriceRange(value as [number, number])}
                  min={500000}
                  max={5000000}
                  step={100000}
                  marks={{
                    500000: '500K',
                    2000000: '2M',
                    3500000: '3.5M',
                    5000000: '5M'
                  }}
                />
                <div className="flex justify-between text-sm text-slate-400 mt-2">
                  <span>{priceRange[0].toLocaleString('vi-VN')}₫</span>
                  <span>{priceRange[1].toLocaleString('vi-VN')}₫</span>
                </div>
              </div>

              {/* Stops */}
              <div className="mb-6">
                <h4 className="text-slate-300 mb-3 font-medium">Điểm dừng</h4>
                <Checkbox.Group
                  value={selectedStops}
                  onChange={setSelectedStops}
                  className="flex flex-col space-y-2"
                >
                  <Checkbox value={0}>Bay thẳng</Checkbox>
                  <Checkbox value={1}>1 điểm dừng</Checkbox>
                  <Checkbox value={2}>2+ điểm dừng</Checkbox>
                </Checkbox.Group>
              </div>

              {/* Airlines */}
              <div className="mb-6">
                <h4 className="text-slate-300 mb-3 font-medium">Hãng hàng không</h4>
                <Checkbox.Group
                  value={selectedAirlines}
                  onChange={setSelectedAirlines}
                  className="flex flex-col space-y-2"
                >
                  {airlines.map(airline => (
                    <Checkbox key={airline} value={airline}>
                      {airline}
                    </Checkbox>
                  ))}
                </Checkbox.Group>
              </div>
            </Card>
          </div>

          {/* Flight Results */}
          <div className="lg:col-span-3">
            <div className="space-y-4">
              {sortedFlights.length > 0 ? (
                sortedFlights.map((flight) => (
                  <Card
                    key={flight.id}
                    className="bg-slate-800/90 border-slate-700 hover:border-blue-500 transition-all duration-300 cursor-pointer"
                    onClick={() => onFlightSelect(flight)}
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-4 mb-4">
                          <div className="bg-blue-600 p-2 rounded-lg">
                            <Plane className="h-5 w-5 text-white" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-white">{flight.airline}</h3>
                            <p className="text-slate-400 text-sm">{flight.flightNumber} • {flight.aircraft}</p>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                          <div>
                            <div className="text-2xl font-bold text-white">{flight.departure.time}</div>
                            <div className="text-slate-300">{flight.departure.code}</div>
                            <div className="text-sm text-slate-400">{flight.departure.airport}</div>
                          </div>
                          
                          <div className="text-center">
                            <div className="flex items-center justify-center space-x-2 text-slate-400 mb-1">
                              <Clock size={14} />
                              <span className="text-sm">{flight.duration}</span>
                            </div>
                            <div className="border-t border-slate-600 relative">
                              <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-blue-500 rounded-full"></div>
                            </div>
                            <div className="text-sm text-slate-400 mt-1">
                              {flight.stops === 0 ? 'Bay thẳng' : `${flight.stops} điểm dừng`}
                            </div>
                          </div>
                          
                          <div className="text-right md:text-left">
                            <div className="text-2xl font-bold text-white">{flight.arrival.time}</div>
                            <div className="text-slate-300">{flight.arrival.code}</div>
                            <div className="text-sm text-slate-400">{flight.arrival.airport}</div>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          {flight.amenities.map((amenity) => (
                            <Tag
                              key={amenity}
                              icon={getAmenityIcon(amenity)}
                              className="bg-blue-600/20 border-blue-500/30 text-blue-300"
                            >
                              {getAmenityLabel(amenity)}
                            </Tag>
                          ))}
                        </div>
                      </div>

                      <Divider type="vertical" className="hidden lg:block h-32 bg-slate-600" />

                      <div className="lg:w-48 text-right mt-4 lg:mt-0">
                        <div className="text-3xl font-bold text-white mb-2">
                          {flight.price.toLocaleString('vi-VN')}₫
                        </div>
                        <div className="text-sm text-slate-400 mb-4">mỗi hành khách</div>
                        <Button
                          type="primary"
                          size="large"
                          className="w-full bg-blue-600 hover:bg-blue-700 border-blue-600"
                        >
                          Chọn chuyến bay
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))
              ) : (
                <Card className="bg-slate-800/90 border-slate-700">
                  <Empty
                    description={
                      <span className="text-slate-400">
                        Không tìm thấy chuyến bay phù hợp với điều kiện của bạn
                      </span>
                    }
                  />
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FlightResults;