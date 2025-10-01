import React, { useState } from "react";
import { CheckinForm, BoardingPassCard } from "../features/checkin";
import { SeatSelection } from "../features/seat-selection";
import {
  submitCheckin,
  validateCheckin,
  type CheckinBooking,
  type CheckinValidatePayload,
  type CheckinOnlineResponse,
} from "../services/checkinService";
import { shouldShowDevControls } from "../shared/config/devConfig";
import { buildApiUrl } from "../shared/constants/apiConfig";
import { Plane, Clock, MapPin, Users, CheckCircle } from "lucide-react";
import { notification } from "antd";

const Checkin: React.FC = () => {
  const [booking, setBooking] = useState<CheckinBooking | null>(null);
  const [seat, setSeat] = useState<string>("");
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [bookingDetailId, setBookingDetailId] = useState<number | null>(null);
  const [bookingId, setBookingId] = useState<number | null>(null);
  const [checkInResponse, setCheckInResponse] = useState<CheckinOnlineResponse | null>(null);

  const handleLookup = async (
    pnrCode: string,
    email: string,
    fullName: string
  ) => {
    const payload: CheckinValidatePayload = {
      pnr_code: pnrCode,
      email: email,
      full_name: fullName,
    };
    try {
      setLoading(true);
      setError(null);
      
      // Call the validateCheckin service
      const bookingData = await validateCheckin(payload);
      
      // Set the booking detail ID and booking ID
      if (bookingData.bookingDetailId) {
        setBookingDetailId(bookingData.bookingDetailId);
      }
      
      if (bookingData.bookingId) {
        setBookingId(bookingData.bookingId);
        // Log the booking ID for debugging
        console.log("Booking ID from API:", bookingData.bookingId);
      }
      
      // Set the booking data
      setBooking(bookingData);
      
      // Set the seat if available
      if (bookingData.seat) {
        setSeat(bookingData.seat);
      }
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : "Xác thực thất bại";
      console.error("Lookup error:", e);
      
      // Handle specific error cases
      if (errorMessage.includes("already been checked in")) {
        notification.info({
          message: "Đã check-in",
          description: "Chuyến bay này đã được check-in trước đó.",
          placement: "top",
          duration: 8
        });
      } else if (errorMessage.includes("PNR code not found") || 
                 errorMessage.includes("not found") || 
                 errorMessage.includes("Không tìm thấy")) {
        notification.error({
          message: "Không tìm thấy chuyến bay",
          description: "Mã đặt chỗ không hợp lệ hoặc không tồn tại.",
          placement: "top",
          duration: 8
        });
      }
      
      // Set a user-friendly error message
      const friendlyError = 
        errorMessage.includes("PNR code not found") ? "Mã đặt chỗ không hợp lệ hoặc không tồn tại" : errorMessage;
      setError(friendlyError);
    } finally {
      setLoading(false);
    }
  };

  const handleSeatConfirm = async (seatIds: string[]) => {
    if (!booking || !bookingDetailId || !bookingId) {
      notification.error({
        message: "Lỗi check-in",
        description: "Không tìm thấy thông tin đặt chỗ. Vui lòng thử lại.",
        placement: "top"
      });
      return;
    }
    
    try {
      const seatId = seatIds[0];
      setSeat(seatId);
      
      // Log the parameters for debugging
      console.log("Check-in parameters:", {
        bookingDetailId,
        seatId,
        bookingId
      });
      
      // Call the online check-in API
      const response = await submitCheckin(bookingDetailId, seatId, bookingId);
      setCheckInResponse(response);
      
      // Show success notification
      notification.success({
        message: "Check-in thành công",
        description: `Đã check-in thành công cho ${response.data.checked_in_count} hành khách.`,
        placement: "top",
        duration: 8
      });
      
      setDone(true);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Không thể check-in. Vui lòng thử lại.";
      console.error("Check-in error:", error);
      
      // Special handling for already checked-in error
      if (errorMessage === "ALREADY_CHECKED_IN") {
        notification.info({
          message: "Đã check-in trước đó",
          description: "Hành khách đã được check-in trước đó, đang tải thông tin boarding pass...",
          placement: "top",
          duration: 10
        });
        
        // Try to retrieve the existing boarding pass
        try {
          if (booking && bookingDetailId && bookingId) {
            // Create a mock check-in response with the data we have
            const mockCheckInResponse = {
              data: {
                booking_id: bookingId,
                flight_number: booking.flightNumber,
                checkin_time: new Date().toISOString(),
                boarding_time: booking.departureTime,
                checked_in_count: 1,
                boarding_passes: [
                  {
                    booking_detail_id: bookingDetailId,
                    passenger_name: booking.passengerName,
                    boarding_pass_code: `BP-${booking.bookingCode}-${bookingDetailId}`,
                    seat_number: seat || booking.seat || "N/A",
                    flight_class_name: booking.flightClass,
                    checkin_time: new Date().toISOString(),
                    status: "checked_in",
                    flight_class_id: 1
                  }
                ]
              },
              status: true,
              errorCode: "",
              errorMessage: ""
            };
            
            setCheckInResponse(mockCheckInResponse);
            setDone(true);
          } else {
            // If we don't have enough information, fall back to just showing done
            setDone(true);
          }
        } catch (retrieveError) {
          console.error("Error creating boarding pass view:", retrieveError);
          setDone(true);
        }
        
        return;
      }
      
      notification.error({
        message: "Lỗi check-in",
        description: errorMessage,
        placement: "top",
        duration: 10 // Show longer for better visibility
      });
    }
  };

  const handleDevTest = async () => {
    try {
      const token = localStorage.getItem("auth_token");
      const res = await fetch(buildApiUrl("/checkin/318"), {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      await res.json(); // Don't show the data

      // Set booking data directly without alert
      const mockBookingData: CheckinBooking = {
        bookingCode: "DEV318",
        flightId: 318,
        passengerName: "Dev Tester",
        flightNumber: "VJ1206",
        departureTime: "2025-08-20T14:45:00Z",
        arrivalTime: "2025-08-20T17:00:00Z",
        departureAirport: "Sân Bay Nội Bài(HAN)",
        arrivalAirport: "Sân Bay Tân Sơn Nhất(SGN)",
        airlineName: "VietJet Air",
        flightClass: "economy",
        bookingId: 124,
        bookingDetailId: 151
      };
      
      setBooking(mockBookingData);
      setBookingDetailId(mockBookingData.bookingDetailId || null);
      setBookingId(mockBookingData.bookingId || null);
      
      // Log the test booking ID for debugging
      console.log("Test Booking ID set to:", 124);
    } catch (err) {
      console.error("DEV fetch failed:", err);
      // Still set the mock data even if API fails
      const mockBookingData: CheckinBooking = {
        bookingCode: "DEV318",
        flightId: 318,
        passengerName: "Dev Tester",
        flightNumber: "VJ1206",
        departureTime: "2025-08-20T14:45:00Z",
        arrivalTime: "2025-08-20T17:00:00Z",
        departureAirport: "Sân Bay Nội Bài(HAN)",
        arrivalAirport: "Sân Bay Tân Sơn Nhất(SGN)",
        airlineName: "VietJet Air",
        flightClass: "economy",
        bookingId: 124,
        bookingDetailId: 151
      };
      
      setBooking(mockBookingData);
      setBookingDetailId(mockBookingData.bookingDetailId || null);
      setBookingId(mockBookingData.bookingId || null);
    }
  };

  if (!booking) {
    return (
      <div className="min-h-screen">
        <CheckinForm
          onSubmit={handleLookup}
          loading={loading}
          error={error}
          onDevTest={shouldShowDevControls() ? handleDevTest : undefined}
        />
      </div>
    );
  }

  if (done) {
    if (checkInResponse && checkInResponse.data.boarding_passes && checkInResponse.data.boarding_passes.length > 0) {
      // Use boarding pass data from the check-in response
      const boardingPass = checkInResponse.data.boarding_passes[0];
      
      return (
        <BoardingPassCard
          passengerName={boardingPass.passenger_name}
          flight={booking?.flightId.toString() || ""}
          seat={boardingPass.seat_number}
          flightNumber={checkInResponse.data.flight_number || booking?.flightNumber || ""}
          departureTime={booking?.departureTime || ""}
          arrivalTime={booking?.arrivalTime || ""}
          departureAirport={booking?.departureAirport || ""}
          arrivalAirport={booking?.arrivalAirport || ""}
          airlineName={booking?.airlineName || ""}
          flightClass={boardingPass.flight_class_name || booking?.flightClass || ""}
          boardingPassCode={boardingPass.boarding_pass_code}
          checkinTime={boardingPass.checkin_time}
          boardingTime={checkInResponse.data.boarding_time}
        />
      );
    } else {
      // Fallback to original logic if check-in response is not available
      return (
        <BoardingPassCard
          passengerName={booking?.passengerName || ""}
          flight={booking?.flightId.toString() || ""}
          seat={seat || booking?.seat || ""}
          flightNumber={booking?.flightNumber || ""}
          departureTime={booking?.departureTime || ""}
          arrivalTime={booking?.arrivalTime || ""}
          departureAirport={booking?.departureAirport || ""}
          arrivalAirport={booking?.arrivalAirport || ""}
          airlineName={booking?.airlineName || ""}
          flightClass={booking?.flightClass || ""}
        />
      );
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Top Navigation Bar */}
      <div className="bg-white/95 backdrop-blur-sm shadow-sm border-b border-gray-200 sticky top-0 z-10">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg shadow-md">
                  <Plane className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">
                    Chọn ghế ngồi
                  </h1>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <span>{booking.flightNumber}</span>
                    <span>•</span>
                    <span>{booking.airlineName}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-6">
              <div className="hidden md:flex items-center gap-4 text-sm">
                <div className="flex items-center gap-2 px-3 py-1 bg-blue-50 rounded-lg">
                  <Clock className="h-4 w-4 text-blue-600" />
                  <span className="text-blue-700 font-medium">2h 15m</span>
                </div>
                <div className="flex items-center gap-2 px-3 py-1 bg-indigo-50 rounded-lg">
                  <Users className="h-4 w-4 text-indigo-600" />
                  <span className="text-indigo-700 font-medium capitalize">
                    {booking.flightClass}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="container mx-auto px-6 py-6">
        {/* Flight Route Header */}
        <div className="mb-6">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
            <div className="flex items-center justify-center">
              <div className="flex items-center justify-between w-full max-w-2xl">
                {/* Departure */}
                <div className="text-center flex-shrink-0">
                  <div className="text-3xl font-bold text-gray-900 mb-1">
                    {booking.departureAirport.includes("(")
                      ? booking.departureAirport.split("(")[1].replace(")", "")
                      : booking.departureAirport.slice(0, 3)}
                  </div>
                  <div className="text-sm text-gray-600 mb-2 max-w-24">
                    {booking.departureAirport.split("(")[0].trim()}
                  </div>
                  <div className="text-lg font-semibold text-blue-600">
                    {new Date(booking.departureTime).toLocaleTimeString(
                      "vi-VN",
                      {
                        hour: "2-digit",
                        minute: "2-digit",
                      }
                    )}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {new Date(booking.departureTime).toLocaleDateString(
                      "vi-VN"
                    )}
                  </div>
                </div>

                {/* Flight Path */}
                <div className="flex-1 px-8">
                  <div className="relative">
                    <div className="h-0.5 bg-gradient-to-r from-blue-300 via-indigo-400 to-blue-300 rounded-full"></div>
                    <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2">
                      <div className="bg-white p-3 rounded-full shadow-md border-2 border-blue-200">
                        <Plane className="h-5 w-5 text-blue-600" />
                      </div>
                    </div>
                  </div>
                  <div className="text-center mt-4">
                    <div className="text-sm font-medium text-gray-700">
                      {booking.flightNumber}
                    </div>
                    <div className="text-xs text-gray-500">
                      Hành khách: {booking.passengerName}
                    </div>
                  </div>
                </div>

                {/* Arrival */}
                <div className="text-center flex-shrink-0">
                  <div className="text-3xl font-bold text-gray-900 mb-1">
                    {booking.arrivalAirport.includes("(")
                      ? booking.arrivalAirport.split("(")[1].replace(")", "")
                      : booking.arrivalAirport.slice(0, 3)}
                  </div>
                  <div className="text-sm text-gray-600 mb-2 max-w-24">
                    {booking.arrivalAirport.split("(")[0].trim()}
                  </div>
                  <div className="text-lg font-semibold text-blue-600">
                    {new Date(booking.arrivalTime).toLocaleTimeString("vi-VN", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {new Date(booking.arrivalTime).toLocaleDateString("vi-VN")}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Seat Selection Area */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          {/* Section Header */}
          <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <MapPin className="h-6 w-6 text-white" />
                <div>
                  <h2 className="text-xl font-bold text-white">
                    Chọn ghế ngồi yêu thích
                  </h2>
                  <p className="text-blue-100 text-sm">
                    Chọn vị trí ngồi phù hợp cho chuyến bay của bạn
                  </p>
                </div>
              </div>
              <div className="hidden md:block">
                <div className="text-right text-white">
                  <div className="text-lg font-semibold">
                    {booking.flightClass.toUpperCase()}
                  </div>
                  <div className="text-sm text-blue-100">Hạng ghế</div>
                </div>
              </div>
            </div>
          </div>

          {/* Seat Selection Content */}
          <div className="p-6">
            <div className="max-w-full">
              <SeatSelection
                onComplete={handleSeatConfirm}
                flightId={booking.flightId}
              />
            </div>
          </div>
        </div>

        {/* Additional Info Footer */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200 p-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="h-4 w-4 text-green-600" />
              </div>
              <h3 className="font-semibold text-gray-800">Miễn phí chọn ghế</h3>
            </div>
            <p className="text-sm text-gray-600">
              Không mất thêm phí cho việc chọn ghế online
            </p>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200 p-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Clock className="h-4 w-4 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-800">Check-in 24h</h3>
            </div>
            <p className="text-sm text-gray-600">
              Có thể check-in từ 24 giờ trước giờ bay
            </p>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200 p-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Users className="h-4 w-4 text-purple-600" />
              </div>
              <h3 className="font-semibold text-gray-800">Hỗ trợ 24/7</h3>
            </div>
            <p className="text-sm text-gray-600">
              Đội ngũ hỗ trợ luôn sẵn sàng giúp đỡ
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkin;
