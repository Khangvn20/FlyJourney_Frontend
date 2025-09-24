import React from "react";
import {
  Plane,
  User,
  Calendar,
  MapPin,
  Ticket,
  Download,
  Share2,
  Clock,
} from "lucide-react";

interface BoardingPassCardProps {
  passengerName: string;
  flight: string;
  seat: string;
  flightNumber?: string;
  departureTime?: string;
  arrivalTime?: string;
  departureAirport?: string;
  arrivalAirport?: string;
  airlineName?: string;
  flightClass?: string;
  boardingPassCode?: string;
  checkinTime?: string;
  boardingTime?: string;
}

const BoardingPassCard: React.FC<BoardingPassCardProps> = ({
  passengerName,
  flight,
  seat,
  flightNumber,
  departureTime,
  arrivalTime,
  departureAirport,
  arrivalAirport,
  airlineName = "Flyfe Airlines",
  flightClass = "Economy",
  boardingPassCode,
  checkinTime,
  boardingTime,
}) => {
  const formatTime = (timeString?: string) => {
    if (!timeString) return "--:--";
    try {
      return new Date(timeString).toLocaleTimeString("vi-VN", {
        hour: "2-digit",
        minute: "2-digit",
        timeZone: "Asia/Ho_Chi_Minh",
      });
    } catch {
      return "--:--";
    }
  };

  const formatDate = (timeString?: string) => {
    if (!timeString) return new Date().toLocaleDateString("vi-VN");
    try {
      return new Date(timeString).toLocaleDateString("vi-VN", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        timeZone: "Asia/Ho_Chi_Minh",
      });
    } catch {
      return new Date().toLocaleDateString("vi-VN");
    }
  };

  const getAirportCode = (airport?: string) => {
    if (!airport) return "---";
    const match = airport.match(/\(([^)]+)\)/);
    return match ? match[1] : airport.substring(0, 3).toUpperCase();
  };

  const getAirportName = (airport?: string) => {
    if (!airport) return "Chưa xác định";
    return airport.replace(/\([^)]+\)/, "").trim();
  };

  const handleDownload = () => {
    // Placeholder for download functionality
    alert("Tính năng tải về sẽ được triển khai sớm!");
  };

  const handleShare = () => {
    // Placeholder for share functionality
    if (navigator.share) {
      navigator.share({
        title: "Thẻ lên máy bay",
        text: `Thẻ lên máy bay cho chuyến bay ${
          flightNumber || flight
        }, ghế ${seat}`,
      });
    } else {
      alert("Tính năng chia sẻ sẽ được triển khai sớm!");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full shadow-lg mb-4">
            <Ticket className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Check-in thành công!
          </h1>
          <p className="text-gray-600">Thẻ lên máy bay của bạn đã sẵn sàng</p>
        </div>

        {/* Boarding Pass Card */}
        <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Plane className="h-6 w-6 text-white" />
                <span className="text-white font-bold text-lg">
                  BOARDING PASS
                </span>
              </div>
              <div className="text-white text-sm font-medium">
                {airlineName}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="p-6 space-y-6">
            {/* Passenger Info */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4">
              <div className="flex items-center gap-3 mb-3">
                <User className="h-5 w-5 text-blue-600" />
                <span className="text-sm font-semibold text-blue-800">
                  HÀNH KHÁCH
                </span>
              </div>
              <div className="text-xl font-bold text-gray-900">
                {passengerName}
              </div>
              <div className="text-sm text-gray-600 mt-1">
                Hạng: {flightClass}
              </div>
            </div>

            {/* Flight Route */}
            <div className="bg-gradient-to-r from-slate-50 to-gray-100 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div className="text-center flex-1">
                  <div className="text-2xl font-bold text-gray-900">
                    {getAirportCode(departureAirport)}
                  </div>
                  <div className="text-xs text-gray-600 mt-1">
                    {getAirportName(departureAirport)}
                  </div>
                  <div className="text-sm font-semibold text-blue-600 mt-2 flex items-center justify-center gap-1">
                    <Clock className="h-3 w-3" />
                    {formatTime(departureTime)}
                  </div>
                </div>

                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center">
                    <Plane className="h-6 w-6 text-blue-500 mx-auto mb-1" />
                    <div className="text-xs text-gray-500">
                      {flightNumber || flight}
                    </div>
                  </div>
                </div>

                <div className="text-center flex-1">
                  <div className="text-2xl font-bold text-gray-900">
                    {getAirportCode(arrivalAirport)}
                  </div>
                  <div className="text-xs text-gray-600 mt-1">
                    {getAirportName(arrivalAirport)}
                  </div>
                  <div className="text-sm font-semibold text-blue-600 mt-2 flex items-center justify-center gap-1">
                    <Clock className="h-3 w-3" />
                    {formatTime(arrivalTime)}
                  </div>
                </div>
              </div>
            </div>

            {/* Flight Details Grid */}
            <div className="grid grid-cols-2 gap-4">
              {/* Flight Number */}
              <div className="bg-gray-50 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Plane className="h-4 w-4 text-gray-600" />
                  <span className="text-xs font-semibold text-gray-600 uppercase">
                    Chuyến bay
                  </span>
                </div>
                <div className="text-lg font-bold text-gray-900">
                  {flightNumber || flight}
                </div>
              </div>

              {/* Seat */}
              <div className="bg-gray-50 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <MapPin className="h-4 w-4 text-gray-600" />
                  <span className="text-xs font-semibold text-gray-600 uppercase">
                    Ghế ngồi
                  </span>
                </div>
                <div className="text-lg font-bold text-gray-900">{seat}</div>
              </div>

              {/* Date */}
              <div className="bg-gray-50 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="h-4 w-4 text-gray-600" />
                  <span className="text-xs font-semibold text-gray-600 uppercase">
                    Ngày bay
                  </span>
                </div>
                <div className="text-lg font-bold text-gray-900">
                  {formatDate(departureTime)}
                </div>
              </div>

              {/* Checkin Time */}
              <div className="bg-gray-50 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="h-4 w-4 text-gray-600" />
                  <span className="text-xs font-semibold text-gray-600 uppercase">
                    Check-in lúc
                  </span>
                </div>
                <div className="text-lg font-bold text-gray-900">
                  {checkinTime ? formatTime(checkinTime) : "--:--"}
                </div>
              </div>
            </div>
            
            {/* Boarding Time */}
            {boardingTime && (
              <div className="bg-blue-50 rounded-xl p-4 mt-4">
                <div className="flex items-center gap-3 mb-2">
                  <Clock className="h-5 w-5 text-blue-600" />
                  <span className="text-xs font-semibold text-blue-800 uppercase">
                    Giờ lên máy bay
                  </span>
                </div>
                <div className="text-lg font-bold text-blue-900 flex items-center gap-2">
                  <span>{formatTime(boardingTime)}</span>
                  <span className="text-sm font-normal text-blue-700">
                    ({formatDate(boardingTime)})
                  </span>
                </div>
              </div>
            )}

            {/* Barcode Placeholder */}
            <div className="bg-gradient-to-r from-gray-100 to-gray-200 rounded-xl p-4">
              <div className="text-center text-xs text-gray-600 mb-2 font-semibold">
                MÃ BOARDING PASS
              </div>
              <div className="flex justify-center items-center h-12 bg-white rounded-lg border-2 border-dashed border-gray-300">
                <div className="flex space-x-1">
                  {Array.from({ length: 20 }).map((_, i) => (
                    <div
                      key={i}
                      className="w-1 bg-gray-800 rounded-full"
                      style={{ height: `${Math.random() * 20 + 20}px` }}
                    />
                  ))}
                </div>
              </div>
              <div className="text-center text-sm text-gray-700 mt-2 font-mono font-semibold">
                {boardingPassCode || `FL${flightNumber || flight}X${seat.replace(/\D/g, "")}Y${new Date().getFullYear()}`}
              </div>
            </div>

            {/* Important Notes */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
              <h4 className="font-semibold text-yellow-800 mb-2 flex items-center gap-2">
                <span>⚠️</span>
                Lưu ý quan trọng
              </h4>
              <ul className="text-sm text-yellow-700 space-y-1">
                <li>• Có mặt tại cổng ít nhất 30 phút trước giờ bay</li>
                <li>• Mang theo CCCD/CMND và vé này khi lên máy bay</li>
                <li>• Liên hệ quầy dịch vụ nếu cần hỗ trợ</li>
              </ul>
            </div>
          </div>

          {/* Actions */}
          <div className="bg-gray-50 px-6 py-4 border-t border-gray-100">
            <div className="flex gap-3">
              <button
                onClick={handleDownload}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-md hover:shadow-lg">
                <Download className="h-4 w-4" />
                <span>Tải về</span>
              </button>
              <button
                onClick={handleShare}
                className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-medium py-3 px-4 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-md hover:shadow-lg">
                <Share2 className="h-4 w-4" />
                <span>Chia sẻ</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer Note */}
        <div className="text-center mt-6">
          <p className="text-sm text-gray-500">
            🎉 Chúc bạn có một chuyến bay tuyệt vời!
          </p>
        </div>
      </div>
    </div>
  );
};

export default BoardingPassCard;
