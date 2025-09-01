import React from "react";

interface SeatData {
  id: string;
  row: number;
  seat: string;
  status: "available" | "selected" | "occupied" | "unavailable";
  price: number;
  class: "economy" | "business" | "first";
}

interface SimpleSeatMapProps {
  onSeatSelect?: (seatId: string) => void;
  selectedSeats?: string[];
  maxSeats?: number;
}

const SimpleSeatMap: React.FC<SimpleSeatMapProps> = ({
  onSeatSelect,
  selectedSeats = [],
  maxSeats = 1,
}) => {
  // Tạo dữ liệu ghế mẫu
  const generateSeats = (): SeatData[] => {
    const seats: SeatData[] = [];
    const seatLabels = ["A", "B", "C", "D", "E", "F"];

    // Danh sách ghế đã được đặt cố định (để demo)
    const occupiedSeats = [
      "1A",
      "1B",
      "2A",
      "3C",
      "3D", // First class
      "5B",
      "5E",
      "6A",
      "7F",
      "8C", // Business
      "10A",
      "10F",
      "12B",
      "12E",
      "15C",
      "15D",
      "18A",
      "18F",
      "20B",
      "20E",
      "22C",
      "22D",
      "25A",
      "25F",
      "28B",
      "28E",
      "30A",
      "30F", // Economy
    ];

    // Danh sách ghế không có sẵn (maintenance, broken, etc.)
    const unavailableSeats = ["29C", "29D"];

    for (let row = 1; row <= 30; row++) {
      for (let seatIndex = 0; seatIndex < seatLabels.length; seatIndex++) {
        const seatLabel = seatLabels[seatIndex];
        const seatId = `${row}${seatLabel}`;

        // Xác định hạng ghế
        let seatClass: "economy" | "business" | "first" = "economy";
        const price = 0; // Sẽ được cập nhật từ backend

        if (row <= 3) {
          seatClass = "first";
        } else if (row <= 8) {
          seatClass = "business";
        }

        // Xác định trạng thái ghế
        let status: "available" | "selected" | "occupied" | "unavailable" =
          "available";

        if (unavailableSeats.includes(seatId)) {
          status = "unavailable";
        } else if (occupiedSeats.includes(seatId)) {
          status = "occupied";
        } else if (selectedSeats.includes(seatId)) {
          status = "selected";
        }

        seats.push({
          id: seatId,
          row,
          seat: seatLabel,
          status,
          price,
          class: seatClass,
        });
      }
    }

    return seats;
  };

  const seats = generateSeats();

  const handleSeatClick = (seat: SeatData) => {
    if (seat.status === "occupied" || seat.status === "unavailable") {
      return;
    }

    // Kiểm tra số lượng ghế tối đa
    if (seat.status === "available" && selectedSeats.length >= maxSeats) {
      return;
    }

    if (onSeatSelect) {
      onSeatSelect(seat.id);
    }
  };

  const getSeatColor = (status: string, seatClass: string) => {
    if (status === "occupied")
      return "bg-red-500 text-white cursor-not-allowed";
    if (status === "selected") return "bg-blue-500 text-white cursor-pointer";
    if (status === "unavailable")
      return "bg-gray-400 text-white cursor-not-allowed";

    // Available seats - color by class
    if (seatClass === "first")
      return "bg-yellow-200 hover:bg-yellow-300 cursor-pointer";
    if (seatClass === "business")
      return "bg-green-200 hover:bg-green-300 cursor-pointer";
    return "bg-gray-200 hover:bg-gray-300 cursor-pointer";
  };

  const renderSeatRow = (rowNumber: number) => {
    const rowSeats = seats.filter((seat) => seat.row === rowNumber);

    return (
      <div key={rowNumber} className="flex items-center gap-1 mb-1">
        {/* Row number */}
        <div className="w-6 text-center text-sm font-medium text-gray-600">
          {rowNumber}
        </div>

        {/* Left seats (A, B, C) */}
        <div className="flex gap-1">
          {rowSeats.slice(0, 3).map((seat) => (
            <button
              key={seat.id}
              type="button"
              onClick={() => handleSeatClick(seat)}
              className={`w-8 h-8 text-xs font-semibold rounded transition-colors ${getSeatColor(
                seat.status,
                seat.class
              )}`}
              title={`${seat.id} - ${seat.class}`}
              aria-label={`Ghế ${seat.id}`}
              aria-pressed={seat.status === "selected"}
              disabled={
                seat.status === "occupied" || seat.status === "unavailable"
              }>
              {seat.seat}
            </button>
          ))}
        </div>

        {/* Aisle */}
        <div className="w-4"></div>

        {/* Right seats (D, E, F) */}
        <div className="flex gap-1">
          {rowSeats.slice(3, 6).map((seat) => (
            <button
              key={seat.id}
              type="button"
              onClick={() => handleSeatClick(seat)}
              className={`w-8 h-8 text-xs font-semibold rounded transition-colors ${getSeatColor(
                seat.status,
                seat.class
              )}`}
              title={`${seat.id} - ${seat.class}`}
              aria-label={`Ghế ${seat.id}`}
              aria-pressed={seat.status === "selected"}
              disabled={
                seat.status === "occupied" || seat.status === "unavailable"
              }>
              {seat.seat}
            </button>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-lg mx-auto">
      {/* Aircraft illustration */}
      <div className="relative mb-6">
        {/* Aircraft body */}
        <div className="bg-gradient-to-b from-gray-200 to-gray-300 rounded-t-3xl rounded-b-lg p-4 shadow-lg">
          {/* Cockpit */}
          <div className="flex justify-center mb-3">
            <div className="w-24 h-6 bg-blue-900 rounded-t-full flex items-center justify-center text-white text-xs font-bold">
              COCKPIT
            </div>
          </div>

          {/* Wing indicators */}
          <div className="absolute left-0 top-1/2 transform -translate-y-1/2">
            <div className="w-8 h-2 bg-gray-400 rounded-r-full"></div>
            <div className="text-xs text-gray-600 ml-1 mt-1">Cánh trái</div>
          </div>
          <div className="absolute right-0 top-1/2 transform -translate-y-1/2">
            <div className="w-8 h-2 bg-gray-400 rounded-l-full"></div>
            <div className="text-xs text-gray-600 mr-1 mt-1 text-right">
              Cánh phải
            </div>
          </div>

          {/* Class sections with visual separation */}
          <div className="space-y-4">
            {/* First Class Section */}
            <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-3">
              <div className="text-center text-sm font-bold text-yellow-800 mb-2">
                🥇 FIRST CLASS - Hàng 1-3
              </div>
              <div className="text-xs text-yellow-700 text-center mb-2">
                Ghế rộng rãi • Dịch vụ cao cấp • Ưu tiên lên máy bay
              </div>
            </div>

            {/* Business Class Section */}
            <div className="bg-green-50 border-2 border-green-200 rounded-lg p-3">
              <div className="text-center text-sm font-bold text-green-800 mb-2">
                💼 BUSINESS CLASS - Hàng 4-8
              </div>
              <div className="text-xs text-green-700 text-center mb-2">
                Ghế thoải mái • Suất ăn đặc biệt • Phòng chờ thương gia
              </div>
            </div>

            {/* Economy Class Section */}
            <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-3">
              <div className="text-center text-sm font-bold text-blue-800 mb-2">
                ✈️ ECONOMY CLASS - Hàng 9-30
              </div>
              <div className="text-xs text-blue-700 text-center mb-2">
                Giá tốt nhất • Dịch vụ tiêu chuẩn • Phù hợp mọi ngân sách
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Seat selection instructions */}
      <div className="mb-4 p-4 bg-blue-50 border-l-4 border-blue-400 rounded">
        <h4 className="text-sm font-semibold text-blue-800 mb-2">
          💡 Hướng dẫn chọn ghế:
        </h4>
        <ul className="text-xs text-blue-700 space-y-1">
          <li>• Ghế cửa sổ (A, F): Ngắm cảnh, tựa tường nghỉ</li>
          <li>• Ghế giữa (B, E): Giá tốt, phù hợp nhóm</li>
          <li>• Ghế lối đi (C, D): Dễ di chuyển, chân thoải mái</li>
          <li>• Hàng đầu mỗi khu: Chân rộng hơn</li>
        </ul>
      </div>

      {/* Enhanced Legend */}
      <div className="mb-4 p-3 bg-gray-50 rounded-lg border">
        <h4 className="text-sm font-semibold mb-3 text-center">
          🎨 Ý nghĩa màu sắc
        </h4>
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="flex items-center gap-2 p-2 bg-white rounded">
            <div className="w-5 h-5 bg-yellow-200 rounded border"></div>
            <div>
              <div className="font-medium">First Class</div>
              <div className="text-gray-600">Sang trọng nhất</div>
            </div>
          </div>
          <div className="flex items-center gap-2 p-2 bg-white rounded">
            <div className="w-5 h-5 bg-green-200 rounded border"></div>
            <div>
              <div className="font-medium">Business</div>
              <div className="text-gray-600">Thoải mái</div>
            </div>
          </div>
          <div className="flex items-center gap-2 p-2 bg-white rounded">
            <div className="w-5 h-5 bg-gray-200 rounded border"></div>
            <div>
              <div className="font-medium">Economy</div>
              <div className="text-gray-600">Tiết kiệm</div>
            </div>
          </div>
          <div className="flex items-center gap-2 p-2 bg-white rounded">
            <div className="w-5 h-5 bg-blue-500 rounded border"></div>
            <div>
              <div className="font-medium text-blue-600">Bạn đã chọn</div>
              <div className="text-gray-600">Click để bỏ chọn</div>
            </div>
          </div>
          <div className="flex items-center gap-2 p-2 bg-white rounded">
            <div className="w-5 h-5 bg-red-500 rounded border"></div>
            <div>
              <div className="font-medium text-red-600">Đã có người đặt</div>
              <div className="text-gray-600">Không thể chọn</div>
            </div>
          </div>
          <div className="flex items-center gap-2 p-2 bg-white rounded">
            <div className="w-5 h-5 bg-gray-400 rounded border"></div>
            <div>
              <div className="font-medium text-gray-600">Bảo trì</div>
              <div className="text-gray-600">Tạm không dùng</div>
            </div>
          </div>
        </div>
      </div>

      {/* Seat map with aircraft layout */}
      <div className="bg-gradient-to-b from-gray-100 to-gray-200 border-2 border-gray-300 rounded-lg p-4 max-h-96 overflow-y-auto shadow-inner">
        <div className="bg-white rounded-lg p-3 shadow-sm">
          {/* Column headers with position info */}
          <div className="flex items-center gap-1 mb-3 pb-2 border-b border-gray-200">
            <div className="w-8 text-center text-xs font-semibold text-gray-500">
              Hàng
            </div>
            <div className="flex gap-1">
              {["A", "B", "C"].map((letter) => (
                <div key={letter} className="w-8 text-center">
                  <div className="text-xs font-semibold text-gray-700">
                    {letter}
                  </div>
                  <div className="text-[10px] text-gray-500">
                    {letter === "A"
                      ? "Cửa sổ"
                      : letter === "C"
                      ? "Lối đi"
                      : "Giữa"}
                  </div>
                </div>
              ))}
            </div>
            <div className="w-6 text-center text-xs text-gray-400">│</div>
            <div className="flex gap-1">
              {["D", "E", "F"].map((letter) => (
                <div key={letter} className="w-8 text-center">
                  <div className="text-xs font-semibold text-gray-700">
                    {letter}
                  </div>
                  <div className="text-[10px] text-gray-500">
                    {letter === "D"
                      ? "Lối đi"
                      : letter === "F"
                      ? "Cửa sổ"
                      : "Giữa"}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Seat rows with class separators */}
          <div className="space-y-1">
            {Array.from({ length: 30 }, (_, i) => {
              const rowNumber = i + 1;
              let sectionClass = "";
              let isFirstRowOfSection = false;

              if (rowNumber <= 3) {
                sectionClass = "first-class";
                isFirstRowOfSection = rowNumber === 1;
              } else if (rowNumber <= 8) {
                sectionClass = "business-class";
                isFirstRowOfSection = rowNumber === 4;
              } else {
                sectionClass = "economy-class";
                isFirstRowOfSection = rowNumber === 9;
              }

              return (
                <div key={rowNumber}>
                  {/* Section divider */}
                  {isFirstRowOfSection && rowNumber > 1 && (
                    <div className="my-2 border-t-2 border-dashed border-gray-300 relative">
                      <div className="absolute left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white px-2 text-xs text-gray-500">
                        {sectionClass === "business-class"
                          ? "Business Class"
                          : "Economy Class"}
                      </div>
                    </div>
                  )}
                  {renderSeatRow(rowNumber)}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Selected seats summary with detailed info */}
      {selectedSeats.length > 0 && (
        <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border-2 border-blue-200">
          <h4 className="font-semibold text-sm mb-3 text-blue-800 flex items-center gap-2">
            ✅ Ghế bạn đã chọn ({selectedSeats.length}/{maxSeats})
          </h4>
          <div className="space-y-2">
            {selectedSeats.map((seatId) => {
              const seat = seats.find((s) => s.id === seatId);
              const row = parseInt(seatId);
              const seatLetter = seatId.slice(-1);

              // Xác định vị trí ghế
              let position = "";
              if (seatLetter === "A" || seatLetter === "F")
                position = "🪟 Cửa sổ";
              else if (seatLetter === "C" || seatLetter === "D")
                position = "🚶 Lối đi";
              else position = "👥 Giữa";

              // Xác định đặc điểm hàng ghế
              let rowFeature = "";
              if (row === 1 || row === 4 || row === 9)
                rowFeature = " • 🦵 Chân rộng";
              if (row <= 5) rowFeature += " • 🚀 Lên máy bay sớm";

              return (
                <div
                  key={seatId}
                  className="bg-white p-3 rounded-lg border border-blue-200 shadow-sm">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-bold text-blue-900 text-lg">
                        {seatId}
                      </div>
                      <div className="text-sm text-blue-700">
                        {seat?.class === "first"
                          ? "🥇 First Class"
                          : seat?.class === "business"
                          ? "💼 Business Class"
                          : "✈️ Economy Class"}
                      </div>
                      <div className="text-xs text-gray-600 mt-1">
                        {position}
                        {rowFeature}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-gray-500">Hàng {row}</div>
                      <button
                        type="button"
                        onClick={() => handleSeatClick(seat!)}
                        className="text-xs text-red-500 hover:text-red-700 mt-1">
                        ❌ Bỏ chọn
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {selectedSeats.length < maxSeats && (
            <div className="mt-3 p-2 bg-blue-100 rounded text-xs text-blue-700">
              💡 Bạn có thể chọn thêm {maxSeats - selectedSeats.length} ghế nữa
            </div>
          )}
        </div>
      )}

      {/* Helpful tips when no seats selected */}
      {selectedSeats.length === 0 && (
        <div className="mt-6 p-4 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <h4 className="font-semibold text-sm mb-2 text-gray-700">
            🎯 Gợi ý chọn ghế:
          </h4>
          <div className="text-xs text-gray-600 space-y-1">
            <div>
              • <strong>Cửa sổ (A, F):</strong> Ngắm cảnh, tựa nghỉ thoải mái
            </div>
            <div>
              • <strong>Lối đi (C, D):</strong> Ra vào dễ dàng, không làm phiền
              người khác
            </div>
            <div>
              • <strong>Hàng đầu:</strong> Không gian chân rộng rãi hơn
            </div>
            <div>
              • <strong>Gần cửa thoát hiểm:</strong> Chân rộng nhưng có trách
              nhiệm an toàn
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SimpleSeatMap;
