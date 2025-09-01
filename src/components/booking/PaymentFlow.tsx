import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import SimpleSeatMap from "./SimpleSeatMap";
import type { BookingRecord } from "../../shared/types/passenger.types";
import { Button } from "../ui/button";
import { ArrowLeft, Check, Plane, CreditCard } from "lucide-react";
import { loadBookings, saveBookings } from "../../services/bookingStorage";
import { useAuthContext } from "../../hooks/useAuthContext";
import type { PaymentMethod } from "../../shared/types/passenger.types";
import { notification } from "antd";

interface PaymentFlowProps {
  booking: BookingRecord;
  onCancel: () => void;
}

const PaymentFlow: React.FC<PaymentFlowProps> = ({ booking, onCancel }) => {
  const navigate = useNavigate();
  const { token } = useAuthContext();
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const [step, setStep] = useState<"seats" | "payment">("seats");
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] =
    useState<PaymentMethod>("vnpay");

  const totalPassengers = booking.passengers.length;



  // Kiểm tra khi component mount nếu người dùng đang quay lại từ trang thanh toán MoMo
  React.useEffect(() => {
    // Kiểm tra xem người dùng vừa quay lại từ trang thanh toán MoMo hay không
    const checkReturnFromPayment = () => {
      try {
        // Kiểm tra dữ liệu thanh toán đã lưu
        const pendingPaymentStr = sessionStorage.getItem('pendingMomoPayment');
        if (!pendingPaymentStr) {
          return; // Không có thanh toán đang chờ xử lý
        }

        const pendingPayment = JSON.parse(pendingPaymentStr);
          
        // Kiểm tra xem URL hiện tại có chứa tham số trả về từ MoMo không
        const urlParams = new URLSearchParams(window.location.search);
        const resultCode = urlParams.get('resultCode');
        const message = urlParams.get('message') || 'Không có thông tin';
        
        // Nếu có mã kết quả và đó là mã thành công (0 hoặc 9000)
        if (resultCode && (resultCode === '0' || resultCode === '9000')) {
          
          // Đóng cửa sổ thanh toán nếu vẫn còn mở
          if (pendingPayment.paymentWindowName && window.opener) {
            try {
              window.opener.close();
            } catch (closeError) {
              console.error("Could not close payment window:", closeError);
            }
          }
          
          // Hiển thị thông báo thành công
          notification.success({
            message: "Thanh Toán Thành Công",
            description: "Thanh toán của bạn qua MoMo đã hoàn tất thành công! Đơn hàng của bạn đang được xử lý.",
            placement: "top",
            duration: 5
          });
          
          // Cập nhật trạng thái booking
          const allBookings = loadBookings();
          const updatedBookings = allBookings.map((b) => {
            if (b.bookingId === booking.bookingId) {
              return {
                ...b,
                status: "CONFIRMED" as const,
                paymentMethod: "vnpay" as const, // Giữ giá trị này để tương thích với type
                selectedSeats,
                holdExpiresAt: undefined,
                paymentDate: new Date().toISOString()
              };
            }
            return b;
          });
          
          // Lưu bookings đã cập nhật
          saveBookings(updatedBookings);
          
          // Chuyển hướng đến trang đơn hàng
          navigate("/my-bookings");
          
          // Xóa dữ liệu thanh toán đã lưu
          sessionStorage.removeItem('pendingMomoPayment');
        } else if (resultCode) {
          // Thanh toán không thành công
          notification.error({
            message: "Thanh Toán Thất Bại",
            description: `Thanh toán không thành công: ${message}. Vui lòng thử lại hoặc chọn phương thức thanh toán khác.`,
            placement: "top",
            duration: 7
          });
          setIsProcessing(false);
          sessionStorage.removeItem('pendingMomoPayment');
        }
      } catch (error) {
        console.error("Error checking return from payment:", error);
      }
    };
    
    // Chạy kiểm tra ngay khi component được mount
    checkReturnFromPayment();
  }, [navigate]);

  const handleSeatSelect = (seatId: string) => {
    setSelectedSeats((prev) => {
      if (prev.includes(seatId)) {
        // Deselect seat
        return prev.filter((id) => id !== seatId);
      } else {
        // Select seat
        if (prev.length >= totalPassengers) {
          notification.warning({
            message: "Giới Hạn Chỗ Ngồi",
            description: `Bạn chỉ có thể chọn tối đa ${totalPassengers} ghế (theo số hành khách)`,
            placement: "top",
            duration: 3
          });
          return prev;
        }
        return [...prev, seatId];
      }
    });
  };

  const validateSeatSelection = () => {
    return selectedSeats.length === totalPassengers;
  };

  const proceedToPayment = () => {
    if (validateSeatSelection()) {
      setStep("payment");
    }
  };

  const handlePayment = async () => {
    setIsProcessing(true);

    try {
      if (selectedPaymentMethod === "vnpay") {
        // MoMo payment integration
        console.log("Bắt đầu thanh toán qua MoMo...");
        
        // Tạo orderId ngẫu nhiên
        const randomOrderId = `FJ${Date.now()}${Math.floor(Math.random() * 10000)}`;
        
        // Chuẩn bị payload cho MoMo
        const momoPayload = {
          booking_id: booking.bookingId,
          partnerCode: "MOMO",
          accessKey: "F8BBA842ECF85",
          requestId: `${Date.now()}`,
          amount: `${Math.round(booking.totalPrice)}`,
          orderId: randomOrderId,
          orderInfo: `Thanh toan ve may bay FlyJourney - ${booking.bookingId}`,
          redirectUrl: "http://localhost:3030/my-bookings",
          ipnUrl: "https://4d3c40525af2.ngrok-free.app/api/v1/payment/momo/callback",
          extraData: "",
          requestType: "captureWallet"
        };

        // Kiểm tra token xác thực từ context
        if (!token) {
          notification.error({
            message: "Lỗi Xác Thực",
            description: "Bạn cần đăng nhập để thực hiện thanh toán",
            placement: "top",
            duration: 5
          });
          setIsProcessing(false);
          return;
        }

        try {
          console.log("Gửi request API đến MoMo");
          
          const response = await fetch('http://localhost:3000/api/v1/payment/momo', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify(momoPayload)
          });
          
          if (!response.ok) {
            const errorText = await response.text();
            console.error(`MoMo API error (${response.status}):`, errorText);
            throw new Error(`MoMo API returned error ${response.status}: ${errorText}`);
          }
          
          const result = await response.json();
          console.log("MoMo payment response received:", result);
          
          // Tìm URL thanh toán từ response - theo cấu trúc thực tế
          let paymentUrl = null;
          
          // Kiểm tra tất cả các vị trí có thể của URL trong response
          // Ưu tiên URLs web và gateway hơn deeplinks
          if (result.data?.momoResponse?.payUrl) {
            paymentUrl = result.data.momoResponse.payUrl;
          } else if (result.payUrl) {
            paymentUrl = result.payUrl;
          } else if (result.data?.payUrl) {
            paymentUrl = result.data.payUrl;
          } else if (result.qrCodeUrl) {
            paymentUrl = result.qrCodeUrl;
          } else if (result.data?.momoResponse?.qrCodeUrl) {
            paymentUrl = result.data.momoResponse.qrCodeUrl;
          } else if (result.data?.momoResponse?.deeplink) {
            // Deeplink là lựa chọn cuối cùng vì sẽ cần chuyển đổi
            paymentUrl = result.data.momoResponse.deeplink;
          }
          
          // Ghi log URL thanh toán để debug (chỉ hiển thị trong console)
          console.log("Payment URL search results:", {
            "Official URL": result.payUrl || 'none',
            "URL from momoResponse": result.data?.momoResponse?.payUrl || 'none',
            "QR Code URL": result.qrCodeUrl || 'none',
            "MoMo deeplink": result.data?.momoResponse?.deeplink || 'none',
            "Selected URL": paymentUrl || 'NONE FOUND'
          });
          
          // Nếu không tìm thấy URL nào
          if (!paymentUrl) {
            console.error("Payment URL not found in response:", result);
            notification.error({
              message: "Lỗi Thanh Toán",
              description: "Không nhận được URL thanh toán từ MoMo. Vui lòng thử lại sau hoặc chọn phương thức thanh toán khác.",
              placement: "top",
              duration: 5
            });
            setIsProcessing(false);
            throw new Error("Không nhận được URL thanh toán từ MoMo - Vui lòng kiểm tra log response");
          }
          
          // Đảm bảo URL là hợp lệ và đầy đủ
          if (!paymentUrl.startsWith('http')) {
            // Kiểm tra nếu là tương đối hoặc không có schema
            if (paymentUrl.startsWith('/')) {
              paymentUrl = `https://test-payment.momo.vn${paymentUrl}`;
            } else {
              paymentUrl = `https://test-payment.momo.vn/${paymentUrl}`;
            }
            console.log("Fixed payment URL with proper base:", paymentUrl);
          }
          
          // Kiểm tra định dạng URL trước khi mở
          console.log("Attempting to open payment URL:", paymentUrl);
          
          // Kiểm tra xem URL có phải là deeplink MoMo không
          const isMomoDeeplink = paymentUrl.startsWith('momo://');
          
          if (isMomoDeeplink) {
            console.log("Detected MoMo deeplink, handling differently");
            // Tìm URL web thay thế cho deeplink
            let webUrl = null;
            
            // Tìm các URL web từ các vị trí khác trong response
            if (result.data?.momoResponse?.payUrl) {
              webUrl = result.data.momoResponse.payUrl;
            } else if (result.payUrl) {
              webUrl = result.payUrl;
            } else if (result.data?.payUrl) {
              webUrl = result.data.payUrl;
            } else if (result.qrCodeUrl) {
              webUrl = result.qrCodeUrl;
            }
            
            if (webUrl && webUrl.startsWith('http')) {
              paymentUrl = webUrl;
            } else {
              // Tạo một URL gateway mới từ deeplink nếu không tìm thấy URL web
              if (paymentUrl.includes("sid=")) {
                // Trích xuất sid từ deeplink
                const sidMatch = paymentUrl.match(/sid=([^&]+)/);
                if (sidMatch && sidMatch[1]) {
                  const sid = sidMatch[1];
                  // Tạo URL gateway dựa trên sid
                  paymentUrl = `https://test-payment.momo.vn/v2/gateway/pay?t=${sid}`;
                }
              }
            }
          }
          
          // Kiểm tra lại xem URL đã đúng định dạng cho web chưa
          if (!paymentUrl.startsWith('http')) {
            // Thông báo lỗi nếu vẫn không có URL web hợp lệ
            console.error("Could not convert to valid web URL:", paymentUrl);
            notification.error({
              message: "Lỗi Thanh Toán",
              description: "Không thể tạo URL thanh toán hợp lệ. Vui lòng thử lại hoặc chọn phương thức thanh toán khác.",
              placement: "top",
              duration: 5
            });
            setIsProcessing(false);
            return;
          }
          
          // Lưu thông tin thanh toán vào sessionStorage để kiểm tra khi người dùng quay lại
          try {
            const paymentData = {
              bookingId: booking.bookingId,
              timestamp: Date.now(),
              orderId: result.data?.createdPayment?.transaction_id || 
                       result.data?.momoResponse?.orderId || 
                       randomOrderId,
              returnUrl: window.location.href,
              paymentUrl: paymentUrl,
              paymentMethod: 'MOMO',
              createdAt: new Date().toISOString()
            };
            
            sessionStorage.setItem('pendingMomoPayment', JSON.stringify(paymentData));
            
            // Lưu thêm vào localStorage để theo dõi lịch sử thanh toán
            const paymentHistory = JSON.parse(localStorage.getItem('momoPaymentHistory') || '[]');
            paymentHistory.push(paymentData);
            localStorage.setItem('momoPaymentHistory', JSON.stringify(paymentHistory.slice(-5)));
          } catch (storageError) {
            console.error("Failed to save to session storage:", storageError);
          }
          

          
          // Tạo một key duy nhất cho thông báo để có thể cập nhật/xóa
          const countdownKey = `momo-redirect-${Date.now()}`;
          
          // Hiển thị thông báo ban đầu với đếm ngược 5 giây
          notification.success({
            key: countdownKey,
            message: "Đang Chuyển Hướng Thanh Toán",
            description: "Bạn sẽ được chuyển đến cổng thanh toán MoMo sau 5 giây.",
            placement: "top",
            duration: 0 // Không tự động đóng
          });
          
          let countdown = 4;
          const countdownInterval = setInterval(() => {
            notification.success({
              key: countdownKey,
              message: "Đang Chuyển Hướng Thanh Toán Đến Momo",
              placement: "top",
              duration: 0
            });
            
            countdown--;
            
            if (countdown < 0) {
              clearInterval(countdownInterval);
            }
          }, 1000);
          
          // Chuẩn bị URL thanh toán một lần nữa để đảm bảo định dạng
          if (paymentUrl.indexOf('://') === -1) {
            // Nếu không có schema, thêm https://
            paymentUrl = `https://${paymentUrl}`;
            console.log("Added https:// prefix to URL:", paymentUrl);
          }
          
          // Kiểm tra xem URL có hợp lệ không bằng cách tạo đối tượng URL
          try {
            new URL(paymentUrl);
            console.log("Payment URL is valid");
          } catch (error) {
            console.error("Invalid payment URL:", error);
            
            // Thử sửa URL nếu có thể
            if (paymentUrl.includes('test-payment.momo.vn') && !paymentUrl.startsWith('http')) {
              paymentUrl = `https://${paymentUrl}`;
              console.log("Fixed URL by adding https:// prefix:", paymentUrl);
              
              // Thử xác thực lại URL sau khi sửa
              try {
                new URL(paymentUrl);
                console.log("URL fixed successfully");
              } catch {
                notification.error({
                  message: "Lỗi Định Dạng URL",
                  description: "Không thể sửa URL thanh toán. Vui lòng thử lại sau.",
                  placement: "top",
                  duration: 5
                });
                setIsProcessing(false);
                return;
              }
            } else {
              notification.error({
                message: "Lỗi Định Dạng URL",
                description: "URL thanh toán không hợp lệ. Vui lòng thử lại sau.",
                placement: "top",
                duration: 5
              });
              setIsProcessing(false);
              return;
            }
          }
          
          // Chờ đủ 5 giây để đếm ngược hoàn tất trước khi chuyển hướng
          setTimeout(() => {
            // Đóng thông báo đếm ngược
            notification.destroy(countdownKey);
            clearInterval(countdownInterval);
            
            // Hiển thị thông báo mới về việc chuyển hướng
            notification.success({
              message: "Chuyển Hướng Thanh Toán",
              description: "Đang chuyển đến cổng thanh toán MoMo...",
              placement: "top",
              duration: 2
            });
            
            // Chuyển hướng trực tiếp đến trang thanh toán MoMo trong tab hiện tại
            window.location.href = paymentUrl;
          }, 1000);
          
          // Theo dõi việc quay lại trang sau khi thanh toán
          const checkPaymentInterval = setInterval(() => {
            // Kiểm tra xem có dữ liệu thanh toán đã lưu không
            const pendingPaymentStr = sessionStorage.getItem('pendingMomoPayment');
            if (pendingPaymentStr) {
              try {
                const pendingPayment = JSON.parse(pendingPaymentStr);
                const paymentTime = pendingPayment.timestamp;
                const currentTime = Date.now();
                
                // Nếu thời gian trôi qua ít nhất 30 giây kể từ khi bắt đầu thanh toán
                if (currentTime - paymentTime > 30000) {
                  clearInterval(checkPaymentInterval);
                  
                  // Hiển thị thông báo xác nhận kết quả thanh toán
                  notification.info({
                    message: "Xác Nhận Thanh Toán",
                    description: "Bạn đã hoàn tất quá trình thanh toán qua MoMo?",
                    placement: "top",
                    duration: 0, // Hiển thị cho đến khi người dùng tắt
                    btn: (
                      <div className="flex gap-2 mt-2">
                        <Button variant="default" onClick={() => {
                          notification.destroy(); // Đóng thông báo
                          
                          // Cập nhật trạng thái booking
                          const allBookings = loadBookings();
                          const updatedBookings = allBookings.map((b) => {
                            if (b.bookingId === booking.bookingId) {
                              return {
                                ...b,
                                status: "CONFIRMED" as const,
                                paymentMethod: "vnpay" as const,
                                selectedSeats,
                                holdExpiresAt: undefined,
                                paymentDate: new Date().toISOString()
                              };
                            }
                            return b;
                          });
                          
                          saveBookings(updatedBookings);
                          navigate("/my-bookings");
                        }}>
                          Đã Thanh Toán Thành Công
                        </Button>
                        <Button variant="outline" onClick={() => {
                          notification.destroy(); // Đóng thông báo
                          notification.warning({
                            message: "Thanh Toán Chưa Hoàn Tất",
                            description: "Bạn có thể thử lại thanh toán hoặc chọn phương thức thanh toán khác.",
                            placement: "top",
                            duration: 5
                          });
                          setIsProcessing(false);
                        }}>
                          Chưa Thanh Toán
                        </Button>
                      </div>
                    )
                  });
                  
                  // Xóa dữ liệu thanh toán đã lưu
                  sessionStorage.removeItem('pendingMomoPayment');
                }
              } catch (error) {
                console.error("Error checking payment status:", error);
              }
            }
          }, 5000); // Kiểm tra mỗi 5 giây
          
          // Sử dụng hàm processSuccessfulPayment đã khai báo ở trên
          
          return;
        } catch (error: unknown) {
          const message =
            error instanceof Error ? error.message : "Lỗi không xác định";
          console.error("Error with MoMo payment:", error);
          notification.error({
            message: "Lỗi Thanh Toán",
            description: `Lỗi thanh toán MoMo: ${message}`,
            placement: "top",
            duration: 7
          });
          setIsProcessing(false);
        }
      } else {
        // Xử lý các phương thức thanh toán khác
        await new Promise((resolve) => setTimeout(resolve, 2000));
        
        // Update booking status
        const allBookings = loadBookings();
        const updatedBookings = allBookings.map((b) => {
          if (b.bookingId === booking.bookingId) {
            return {
              ...b,
              status: "CONFIRMED" as const,
              paymentMethod: selectedPaymentMethod,
              selectedSeats,
              holdExpiresAt: undefined,
            };
          }
          return b;
        });
        
        saveBookings(updatedBookings);
        notification.success({
          message: "Thanh Toán Thành Công",
          description: `Thanh toán qua ${selectedPaymentMethod} đã hoàn tất thành công!`,
          placement: "top",
          duration: 5
        });
        navigate("/my-bookings");
      }
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Lỗi không xác định";
      console.error("Payment error:", error);
      notification.error({
        message: "Lỗi Thanh Toán",
        description: `Có lỗi xảy ra khi thanh toán: ${message}`,
        placement: "top",
        duration: 7
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Seat selection is free - price is already included in booking
  // No additional charge for seat selection
  const finalTotal = booking.totalPrice;

  if (step === "payment") {
    return (
      <div className="max-w-4xl mx-auto p-6">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => setStep("seats")}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-4">
            <ArrowLeft className="w-4 h-4" />
            Quay lại chọn ghế
          </button>

          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            Thanh toán và xác nhận
          </h1>
          <p className="text-gray-600">
            Xác nhận thông tin và hoàn tất thanh toán cho booking{" "}
            {booking.bookingId}
          </p>
        </div>

        {/* Payment Summary */}
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Selected Seats */}
            <div className="bg-white rounded-lg border p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Plane className="w-5 h-5 text-blue-600" />
                Ghế đã chọn
              </h3>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-sm text-gray-600">Chuyến bay</p>
                  <p className="font-medium">
                    {booking.selectedFlights?.outbound?.flight_number || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Tuyến bay</p>
                  <p className="font-medium">
                    {booking.selectedFlights?.outbound
                      ?.departure_airport_code || "N/A"}{" "}
                    →{" "}
                    {booking.selectedFlights?.outbound?.arrival_airport_code ||
                      "N/A"}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mb-4">
                {selectedSeats.map((seatId) => (
                  <span
                    key={seatId}
                    className="px-3 py-1 bg-blue-100 text-blue-800 rounded-lg font-medium">
                    {seatId}
                  </span>
                ))}
              </div>

              <div className="text-sm text-gray-600">
                {selectedSeats.length} ghế đã chọn (miễn phí)
              </div>
            </div>

            {/* Payment Method */}
            <div className="bg-white rounded-lg border p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-blue-600" />
                Chọn phương thức thanh toán
              </h3>

              <div className="space-y-4">
                {/* Momo Payment */}
                <label
                  className={`flex items-start gap-3 p-4 border-2 rounded-lg cursor-pointer hover:bg-pink-50 ${
                    selectedPaymentMethod === "vnpay"
                      ? "border-pink-400 bg-pink-50"
                      : "border-gray-200"
                  }`}>
                  <input
                    type="radio"
                    name="payment"
                    value="vnpay"
                    checked={selectedPaymentMethod === "vnpay"}
                    onChange={(e) => setSelectedPaymentMethod(e.target.value as PaymentMethod)}
                    className="mt-1 text-pink-600"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-8 h-8 bg-pink-600 rounded flex items-center justify-center text-white font-bold">
                        M
                      </div>
                      <div>
                        <p className="font-semibold text-pink-900">
                          Thanh toán qua MoMo
                        </p>
                        <p className="text-xs text-pink-700">
                          Ví điện tử MoMo
                        </p>
                      </div>
                    </div>
                    <p className="text-xs text-pink-600 ml-10">
                      ✓ Thanh toán nhanh chóng qua ví MoMo
                      <br />
                      ✓ Quét mã QR hoặc đăng nhập tài khoản
                      <br />✓ Xác nhận ngay, không cần chuyển khoản
                    </p>
                  </div>
                </label>

                {/* Card Payment */}
                <label
                  className={`flex items-start gap-3 p-4 border-2 rounded-lg cursor-pointer hover:bg-indigo-50 ${
                    selectedPaymentMethod === "card"
                      ? "border-indigo-400 bg-indigo-50"
                      : "border-gray-200"
                  }`}>
                  <input
                    type="radio"
                    name="payment"
                    value="card"
                    checked={selectedPaymentMethod === "card"}
                    onChange={(e) => setSelectedPaymentMethod(e.target.value as PaymentMethod)}
                    className="mt-1 text-indigo-600"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-8 h-8 bg-indigo-600 rounded flex items-center justify-center">
                        💳
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">
                          Thẻ quốc tế
                        </p>
                        <p className="text-xs text-gray-600">
                          Visa, Mastercard, JCB, American Express
                        </p>
                      </div>
                    </div>
                    <p className="text-xs text-gray-600 ml-10">
                      ✓ Thanh toán bằng thẻ tín dụng/ghi nợ
                      <br />
                      ✓ Hỗ trợ thẻ quốc tế và nội địa
                      <br />✓ Bảo mật 3D Secure
                    </p>
                  </div>
                </label>

                {/* Office Payment */}
                <label
                  className={`flex items-start gap-3 p-4 border-2 rounded-lg cursor-pointer hover:bg-purple-50 ${
                    selectedPaymentMethod === "office"
                      ? "border-purple-400 bg-purple-50"
                      : "border-gray-200"
                  }`}>
                  <input
                    type="radio"
                    name="payment"
                    value="office"
                    checked={selectedPaymentMethod === "office"}
                    onChange={(e) => setSelectedPaymentMethod(e.target.value as PaymentMethod)}
                    className="mt-1 text-purple-600"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-8 h-8 bg-purple-600 rounded flex items-center justify-center">
                        🏢
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">
                          Thanh toán tại văn phòng
                        </p>
                        <p className="text-xs text-gray-600">
                          Tiền mặt hoặc chuyển khoản trực tiếp
                        </p>
                      </div>
                    </div>
                    <div className="text-xs text-gray-600 ml-10 space-y-1">
                      <p>
                        📍 <span className="font-medium">Địa chỉ:</span> 123
                        Đường Lê Lợi, Quận 1, TP.HCM
                      </p>
                      <p>
                        🕒 <span className="font-medium">Giờ làm việc:</span>{" "}
                        8:00 - 17:30 (T2-T7)
                      </p>
                      <p>
                        📞 <span className="font-medium">Hotline:</span>{" "}
                        1900-FLYJOURNEY
                      </p>
                      <div className="mt-2 p-2 bg-purple-100 rounded text-purple-800">
                        <p className="font-medium">💰 Chuyển khoản QR:</p>
                        <p>Ngân hàng: Vietcombank</p>
                        <p>STK: 0123456789</p>
                        <p>Chủ TK: CONG TY FLY JOURNEY</p>
                      </div>
                    </div>
                  </div>
                </label>
              </div>
            </div>
          </div>

          {/* Payment Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-gray-50 rounded-lg p-6 sticky top-6">
              <h3 className="text-lg font-semibold mb-4">Tóm tắt thanh toán</h3>

              <div className="space-y-3 text-sm mb-6">
                <div className="flex justify-between">
                  <span className="text-gray-600">Giá vé gốc:</span>
                  <span className="font-medium">
                    {booking.totalPrice.toLocaleString()} {booking.currency}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Phí chọn ghế:</span>
                  <span className="font-medium text-green-600">Miễn phí</span>
                </div>
                <div className="border-t pt-3 flex justify-between text-lg font-bold">
                  <span>Tổng cộng:</span>
                  <span className="text-blue-600">
                    {finalTotal.toLocaleString()} {booking.currency}
                  </span>
                </div>
              </div>

              <div className="space-y-3">
                <Button
                  onClick={handlePayment}
                  disabled={isProcessing}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                  {isProcessing ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Đang xử lý...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4" />
                      Thanh toán {finalTotal.toLocaleString()}{" "}
                      {booking.currency}
                    </div>
                  )}
                </Button>

                <Button
                  onClick={onCancel}
                  variant="outline"
                  className="w-full"
                  disabled={isProcessing}>
                  Hủy
                </Button>
              </div>

              <div className="mt-6 p-4 bg-blue-50 rounded-lg text-xs text-blue-800">
                <p className="font-medium mb-1">💡 Lưu ý:</p>
                <p>
                  Sau khi thanh toán thành công, ghế sẽ được xác nhận và không
                  thể thay đổi.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={onCancel}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-4">
          <ArrowLeft className="w-4 h-4" />
          Quay lại danh sách booking
        </button>

        <h1 className="text-2xl font-bold text-gray-800 mb-2">Chọn ghế ngồi</h1>
        <p className="text-gray-600">
          Chọn {totalPassengers} ghế cho booking {booking.bookingId}
        </p>

        <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-center gap-2 text-sm text-blue-800">
            <span className="font-medium">💡 Lưu ý:</span>
            <span>
              Bạn cần chọn đúng {totalPassengers} ghế mới có thể tiếp tục (
              {selectedSeats.length}/{totalPassengers} ghế đã chọn)
            </span>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Seat Map */}
        <div className="lg:col-span-2">
          <SimpleSeatMap
            onSeatSelect={handleSeatSelect}
            selectedSeats={selectedSeats}
            maxSeats={totalPassengers}
          />
        </div>

        {/* Selection Summary */}
        <div className="lg:col-span-1">
          <div className="bg-gray-50 rounded-lg p-6 sticky top-6">
            <h3 className="text-lg font-semibold mb-4">Thông tin chuyến bay</h3>

            <div className="space-y-3 text-sm mb-6">
              <div className="flex justify-between">
                <span className="text-gray-600">Booking ID:</span>
                <span className="font-medium">{booking.bookingId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Chuyến bay:</span>
                <span className="font-medium">
                  {booking.selectedFlights?.outbound?.flight_number || "N/A"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Tuyến bay:</span>
                <span className="font-medium">
                  {booking.selectedFlights?.outbound?.departure_airport_code ||
                    "N/A"}{" "}
                  →{" "}
                  {booking.selectedFlights?.outbound?.arrival_airport_code ||
                    "N/A"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Số hành khách:</span>
                <span className="font-medium">{totalPassengers}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Ghế đã chọn:</span>
                <span
                  className={`font-medium ${
                    selectedSeats.length === totalPassengers
                      ? "text-green-600"
                      : "text-red-600"
                  }`}>
                  {selectedSeats.length}/{totalPassengers}
                </span>
              </div>
            </div>

            {selectedSeats.length > 0 && (
              <div className="mb-6">
                <h4 className="font-medium mb-2">Ghế đã chọn:</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedSeats.map((seatId) => (
                    <span
                      key={seatId}
                      className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm font-medium">
                      {seatId}
                    </span>
                  ))}
                </div>

                <div className="mt-3 p-3 bg-white rounded border">
                  <div className="text-xs text-gray-600 mb-1">
                    Chi phí chọn ghế:
                  </div>
                  <div className="text-sm font-medium text-green-600">
                    {selectedSeats.length} ghế đã chọn (miễn phí)
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-3">
              <button
                onClick={onCancel}
                className="w-full py-2 px-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                ← Hủy
              </button>
              <button
                onClick={proceedToPayment}
                disabled={!validateSeatSelection()}
                className={`w-full py-2 px-4 rounded-lg transition-colors font-medium ${
                  validateSeatSelection()
                    ? "bg-blue-600 text-white hover:bg-blue-700"
                    : "bg-gray-300 text-gray-500 cursor-not-allowed"
                }`}>
                {validateSeatSelection()
                  ? `Tiếp tục thanh toán (${finalTotal.toLocaleString()} ${
                      booking.currency
                    })`
                  : `Chọn thêm ${totalPassengers - selectedSeats.length} ghế`}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentFlow;
