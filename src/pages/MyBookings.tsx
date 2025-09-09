import React, { useEffect, useMemo, useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import type { BookingRecord } from "../shared/types/passenger.types";
import { bookingService } from "../services/bookingService";
import { Card, CardContent } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { DEV_CONFIG, shouldShowDevControls } from "../shared/config/devConfig";
import { Button } from "../components/ui/button";
import { testBookingAPI, testBackendHealth } from "../debug/simpleApiTest";
import { getServiceMapping } from "../shared/constants/serviceMapping";
import { formatRouteFromApiData } from "../shared/constants/airportMapping";
import {
  RefreshCcw,
  Filter,
  Plane,
  Calendar,
  CreditCard,
  Hash,
  Search as SearchIcon,
} from "lucide-react";

const MyBookings: React.FC = () => {
  const [bookings, setBookings] = useState<BookingRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isAuthenticated, user, token } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated || !user?.id || !token) {
      setLoading(false);
      return;
    }

    const fetchBookings = async () => {
      try {
        setLoading(true);
        setError(null);

        if (
          DEV_CONFIG.ENABLE_CONSOLE_LOGS &&
          !DEV_CONFIG.REDUCE_DUPLICATE_LOGS &&
          shouldShowDevControls()
        ) {
          console.log("🚀 Starting to fetch bookings for user:", user.id);
        }

        const list = await bookingService.getBookingsByUser(
          user.id!,
          token ?? undefined
        );

        // Validate the returned data
        if (!Array.isArray(list)) {
          throw new Error(
            `API returned invalid data format: expected array, got ${typeof list}`
          );
        }

        setBookings(list);

        if (DEV_CONFIG.ENABLE_CONSOLE_LOGS && shouldShowDevControls()) {
          console.log("✅ Successfully loaded bookings from API:", {
            count: list.length,
            bookings: DEV_CONFIG.REDUCE_DUPLICATE_LOGS
              ? `[${list.length} items]`
              : list,
          });

          // Debug flight data specifically
          if (list.length > 0 && list[0]?.selectedFlights?.outbound) {
            console.log("🛫 First booking flight data:", {
              departure_airport:
                list[0].selectedFlights.outbound.departure_airport,
              departure_airport_code:
                list[0].selectedFlights.outbound.departure_airport_code,
              arrival_airport: list[0].selectedFlights.outbound.arrival_airport,
              arrival_airport_code:
                list[0].selectedFlights.outbound.arrival_airport_code,
            });
          }

          if (
            list.length > 0 &&
            !DEV_CONFIG.REDUCE_DUPLICATE_LOGS &&
            DEV_CONFIG.ENABLE_CONSOLE_LOGS &&
            shouldShowDevControls()
          ) {
            console.log("🔍 First booking details:", {
              bookingId: list[0]?.bookingId,
              status: list[0]?.status,
              totalPrice: list[0]?.totalPrice,
              currency: list[0]?.currency,
              hasPassengers: Array.isArray(list[0]?.passengers),
              passengersCount: list[0]?.passengers?.length,
            });
          }
        }
      } catch (error) {
        if (DEV_CONFIG.ENABLE_CONSOLE_LOGS && shouldShowDevControls()) {
          console.error("❌ Failed to fetch bookings from API:", error);
        }

        // Enhanced error logging
        if (DEV_CONFIG.ENABLE_CONSOLE_LOGS && shouldShowDevControls()) {
          if (error instanceof Error) {
            console.error("❌ Error details:", {
              name: error.name,
              message: error.message,
              stack: error.stack,
            });
          }
        }

        // Set error message for user
        const errorMessage =
          error instanceof Error
            ? error.message
            : "Không thể tải danh sách đặt chỗ từ server";
        setError(errorMessage);

        // Try fallback to localStorage with validation
        try {
          const fallbackData = localStorage.getItem("userBookings");
          if (!fallbackData) {
            if (DEV_CONFIG.ENABLE_CONSOLE_LOGS && shouldShowDevControls()) {
              console.log("📦 No fallback data in localStorage");
            }
            setBookings([]);
            return;
          }

          const fallback = JSON.parse(fallbackData);

          // Validate fallback data
          if (!Array.isArray(fallback)) {
            if (DEV_CONFIG.ENABLE_CONSOLE_LOGS && shouldShowDevControls()) {
              console.error(
                "❌ Invalid fallback data format:",
                typeof fallback
              );
            }
            setBookings([]);
            return;
          }

          // Filter out invalid booking records
          const validBookings = fallback.filter((booking: unknown) => {
            return (
              typeof booking === "object" &&
              booking !== null &&
              "bookingId" in booking &&
              "status" in booking &&
              "totalPrice" in booking &&
              "passengers" in booking &&
              "createdAt" in booking
            );
          }) as BookingRecord[];

          if (validBookings.length > 0) {
            setBookings(validBookings);
            setError(
              `${errorMessage}. Đang hiển thị ${validBookings.length} đặt chỗ từ dữ liệu đã lưu cục bộ.`
            );

            if (DEV_CONFIG.ENABLE_CONSOLE_LOGS && shouldShowDevControls()) {
              console.log("📦 Using validated fallback bookings:", {
                original: fallback.length,
                valid: validBookings.length,
                bookings: DEV_CONFIG.REDUCE_DUPLICATE_LOGS
                  ? `[${validBookings.length} items]`
                  : validBookings,
              });
            }
          } else {
            if (DEV_CONFIG.ENABLE_CONSOLE_LOGS && shouldShowDevControls()) {
              console.log("📦 No valid bookings in fallback data");
            }
            setBookings([]);
          }
        } catch (localError) {
          if (DEV_CONFIG.ENABLE_CONSOLE_LOGS && shouldShowDevControls()) {
            console.error("❌ Failed to load fallback bookings:", localError);
          }
          setBookings([]);
        }
      } finally {
        setLoading(false);
      }
    };

    void fetchBookings();

    const id = setInterval(() => {
      setBookings((cur) =>
        cur.map((b) => {
          if (b.status === "PENDING" && b.holdExpiresAt) {
            if (new Date(b.holdExpiresAt).getTime() < Date.now()) {
              return { ...b, status: "CANCELLED" as const };
            }
          }
          return b;
        })
      );
    }, 60 * 1000);
    return () => clearInterval(id);
  }, [isAuthenticated, user?.id, token]);

  // Filters & sorting state
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [methodFilter, setMethodFilter] = useState<string>("all");
  const [tripFilter, setTripFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("bookingId-desc");
  const [searchId, setSearchId] = useState("");

  const localizedPayment = (m: string) =>
    m === "vnpay" ? "VNPay QR" : m === "card" ? "Thẻ" : "Văn phòng";

  const filtered = useMemo(() => {
    let list = [...bookings];
    if (statusFilter !== "all")
      list = list.filter((b) => b.status === statusFilter.toUpperCase());
    if (methodFilter !== "all")
      list = list.filter((b) => b.paymentMethod === methodFilter);
    if (tripFilter !== "all")
      list = list.filter((b) =>
        tripFilter === "round"
          ? b.tripType === "round-trip"
          : b.tripType === "one-way"
      );
    if (searchId.trim())
      list = list.filter((b) =>
        b.bookingId.toLowerCase().includes(searchId.toLowerCase())
      );
    const [field, dir] = sortBy.split("-");
    list.sort((a, b) => {
      if (field === "price")
        return dir === "asc"
          ? Number(a.totalPrice || 0) - Number(b.totalPrice || 0)
          : Number(b.totalPrice || 0) - Number(a.totalPrice || 0);
      if (field === "createdAt")
        return dir === "asc"
          ? a.createdAt.localeCompare(b.createdAt)
          : b.createdAt.localeCompare(a.createdAt);
      if (field === "bookingId") {
        // Extract numeric part from booking ID for proper numeric sorting
        const aNum = parseInt(a.bookingId.replace(/\D/g, "")) || 0;
        const bNum = parseInt(b.bookingId.replace(/\D/g, "")) || 0;
        return dir === "asc" ? aNum - bNum : bNum - aNum;
      }
      return 0;
    });
    return list;
  }, [bookings, statusFilter, methodFilter, tripFilter, sortBy, searchId]);

  const EmptyState = (
    <div className="py-20 flex flex-col items-center justify-center gap-5 text-center">
      <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-blue-50 to-indigo-50 flex items-center justify-center ring-1 ring-blue-100">
        <Plane className="w-10 h-10 text-blue-500" />
      </div>
      <div className="space-y-2 max-w-sm">
        <h3 className="text-base font-semibold text-gray-800">
          {bookings.length === 0
            ? "Bạn chưa có đặt chỗ nào"
            : "Không tìm thấy kết quả"}
        </h3>
        <p className="text-xs text-gray-500 leading-relaxed">
          {bookings.length === 0
            ? "Bắt đầu tìm kiếm chuyến bay và tạo đặt chỗ đầu tiên của bạn ngay bây giờ."
            : "Điều chỉnh lại bộ lọc hoặc thử tìm mã khác."}
        </p>
      </div>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <Button size="sm" onClick={() => navigate("/")}>
          Tìm chuyến bay
        </Button>
        {bookings.length !== 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setStatusFilter("all");
              setMethodFilter("all");
              setTripFilter("all");
              setSortBy("bookingId-desc");
              setSearchId("");
            }}>
            Reset bộ lọc
          </Button>
        )}
      </div>
    </div>
  );

  // Loading state
  if (loading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center gap-5 text-center">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <div className="space-y-2">
          <h3 className="text-base font-semibold text-gray-800">
            Đang tải danh sách đặt chỗ...
          </h3>
          <p className="text-xs text-gray-500">Vui lòng chờ trong giây lát</p>
        </div>
      </div>
    );
  }

  if (filtered.length === 0) return EmptyState;

  return (
    <div className="space-y-6">
      {/* Error Alert */}
      {error && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <div className="w-5 h-5 text-amber-600 mt-0.5">⚠️</div>
            <div>
              <h4 className="font-medium text-amber-800 mb-1">Thông báo</h4>
              <p className="text-sm text-amber-700">{error}</p>
            </div>
          </div>
        </div>
      )}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 text-transparent bg-clip-text">
            Đặt chỗ của tôi
          </h2>
          <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" /> {filtered.length} kết quả | Tổng
            tất cả: {bookings.length}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <div className="relative">
            <SearchIcon className="w-3.5 h-3.5 text-gray-400 absolute left-2 top-1.5" />
            <input
              value={searchId}
              onChange={(e) => setSearchId(e.target.value)}
              placeholder="Tìm mã..."
              className="pl-7 pr-3 py-1.5 text-xs rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white"
            />
          </div>
          <Button
            variant="outline"
            size="sm"
            className="text-xs inline-flex items-center gap-1"
            onClick={() => {
              setStatusFilter("all");
              setMethodFilter("all");
              setTripFilter("all");
              setSortBy("bookingId-desc");
              setSearchId("");
            }}>
            <RefreshCcw className="w-3.5 h-3.5" /> Reset
          </Button>
          {DEV_CONFIG.ENABLE_CONSOLE_LOGS && (
            <>
              <Button
                variant="outline"
                size="sm"
                className="text-xs inline-flex items-center gap-1 bg-yellow-50 border-yellow-300 text-yellow-700 hover:bg-yellow-100"
                onClick={() => {
                  if (user?.id && token) {
                    testBookingAPI(user.id, token);
                  } else {
                    if (
                      DEV_CONFIG.ENABLE_CONSOLE_LOGS &&
                      shouldShowDevControls()
                    ) {
                      console.log("❌ No user ID or token available for debug");
                    }
                  }
                }}>
                🔍 Debug API
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="text-xs inline-flex items-center gap-1 bg-blue-50 border-blue-300 text-blue-700 hover:bg-blue-100"
                onClick={() => {
                  testBackendHealth();
                }}>
                🚀 Test Backend
              </Button>
            </>
          )}
        </div>
      </div>
      {/* Filters */}
      <div className="p-4 bg-white border rounded-xl shadow-sm">
        <div className="grid md:grid-cols-4 gap-4 text-sm">
          <div className="space-y-2">
            <label className="font-medium text-gray-700 flex items-center gap-1">
              <Hash className="w-4 h-4 text-gray-500" /> Trạng thái
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
              <option value="all">Tất cả ({bookings.length})</option>
              <option value="CONFIRMED">
                Đã xác nhận (
                {bookings.filter((b) => b.status === "CONFIRMED").length})
              </option>
              <option value="PENDING">
                Chờ xử lý (
                {bookings.filter((b) => b.status === "PENDING").length})
              </option>
              <option value="CANCELLED">
                Đã hủy (
                {bookings.filter((b) => b.status === "CANCELLED").length})
              </option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="font-medium text-gray-700 flex items-center gap-1">
              <Plane className="w-4 h-4 text-gray-500" /> Loại chuyến
            </label>
            <select
              value={tripFilter}
              onChange={(e) => setTripFilter(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
              <option value="all">Tất cả ({bookings.length})</option>
              <option value="round">
                Khứ hồi (
                {bookings.filter((b) => b.tripType === "round-trip").length})
              </option>
              <option value="one">
                Một chiều (
                {bookings.filter((b) => b.tripType === "one-way").length})
              </option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="font-medium text-gray-700 flex items-center gap-1">
              <Calendar className="w-4 h-4 text-gray-500" /> Sắp xếp
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
              <option value="bookingId-desc">Mã booking giảm dần</option>
              <option value="bookingId-asc">Mã booking tăng dần</option>
              <option value="price-desc">Giá cao → thấp</option>
              <option value="price-asc">Giá thấp → cao</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="font-medium text-gray-700 flex items-center gap-1">
              <SearchIcon className="w-4 h-4 text-gray-500" /> Tìm kiếm
            </label>
            <input
              value={searchId}
              onChange={(e) => setSearchId(e.target.value)}
              placeholder="Nhập mã booking..."
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
      </div>
      {filtered.map((b) => {
        const statusColor =
          b.status === "CONFIRMED"
            ? "bg-green-100 text-green-700"
            : b.status === "PENDING"
            ? "bg-amber-100 text-amber-700"
            : "bg-red-100 text-red-700";
        const payColor =
          b.paymentMethod === "vnpay"
            ? "bg-blue-100 text-blue-700"
            : b.paymentMethod === "card"
            ? "bg-indigo-100 text-indigo-700"
            : "bg-purple-100 text-purple-700";
        // Remaining hold time
        let holdInfo: string | null = null;
        if (b.status === "PENDING" && b.holdExpiresAt) {
          const ms = new Date(b.holdExpiresAt).getTime() - Date.now();
          if (ms > 0) {
            const hours = Math.floor(ms / (1000 * 60 * 60));
            const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
            holdInfo = `Còn ${hours}h ${minutes}m để chọn ghế & thanh toán`;
          } else {
            holdInfo = "Hết hạn";
          }
        }
        return (
          <Card
            key={b.bookingId}
            className="border border-gray-200 hover:border-blue-300/70 hover:shadow-md transition overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-50/30 to-transparent opacity-0 hover:opacity-100 pointer-events-none transition" />
            <CardContent className="p-6 relative z-10">
              {/* Header Row - Booking ID và Status */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="font-bold text-lg text-gray-800 flex items-center gap-2">
                    <Hash className="w-4 h-4 text-gray-400" />
                    {b.bookingId}
                  </span>
                  <Badge
                    className={statusColor + " border-none text-xs px-2 py-1"}>
                    {b.status}
                  </Badge>
                  {b.status === "CONFIRMED" && (
                    <Badge
                      className={payColor + " border-none text-xs px-2 py-1"}>
                      {localizedPayment(b.paymentMethod)}
                    </Badge>
                  )}
                  <Badge className="bg-gray-100 text-gray-700 border-none text-xs px-2 py-1">
                    {b.tripType === "round-trip" ? "Khứ hồi" : "Một chiều"}
                  </Badge>
                  {holdInfo && (
                    <Badge className="bg-amber-100 text-amber-700 border-none text-xs px-2 py-1">
                      {holdInfo}
                    </Badge>
                  )}
                </div>
                <div className="text-right">
                  <div className="text-blue-600 font-bold text-xl tracking-tight">
                    {Number(b.totalPrice || 0).toLocaleString("vi-VN")}{" "}
                    {b.currency || "VND"}
                  </div>
                  <div className="text-xs text-gray-500">
                    {b.passengers.length} hành khách
                  </div>
                </div>
              </div>

              {/* Main Content Grid */}
              <div className="grid lg:grid-cols-3 gap-6">
                {/* Left Column - Flight Info */}
                <div className="lg:col-span-1">
                  {b.selectedFlights?.outbound ? (
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <Plane className="w-4 h-4 text-blue-600" />
                        <span className="font-semibold text-gray-800">
                          {b.selectedFlights.outbound.flight_number ||
                            `Flight #${b.outboundFlightId}`}
                        </span>
                      </div>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Tuyến bay:</span>
                          <span className="font-medium">
                            {formatRouteFromApiData(
                              b.selectedFlights.outbound.departure_airport,
                              b.selectedFlights.outbound.departure_airport_code,
                              b.selectedFlights.outbound.arrival_airport,
                              b.selectedFlights.outbound.arrival_airport_code,
                              true // showCityNames=true để hiển thị theo thành phố
                            )}
                          </span>
                        </div>
                        {b.selectedFlights.outbound.departure_time && (
                          <>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Ngày bay:</span>
                              <span className="font-medium">
                                {new Date(
                                  b.selectedFlights.outbound.departure_time
                                ).toLocaleDateString("vi-VN")}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">
                                Giờ khởi hành:
                              </span>
                              <span className="font-medium">
                                {new Date(
                                  b.selectedFlights.outbound.departure_time
                                ).toLocaleTimeString("vi-VN", {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </span>
                            </div>
                          </>
                        )}
                        {b.selectedFlights.outbound.arrival_time && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">Giờ đến:</span>
                            <span className="font-medium">
                              {new Date(
                                b.selectedFlights.outbound.arrival_time
                              ).toLocaleTimeString("vi-VN", {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                          </div>
                        )}
                        {b.selectedFlights.outbound.duration_minutes && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">
                              Thời gian bay:
                            </span>
                            <span className="font-medium">
                              {Math.floor(
                                b.selectedFlights.outbound.duration_minutes / 60
                              )}
                              h{" "}
                              {b.selectedFlights.outbound.duration_minutes % 60}
                              m
                            </span>
                          </div>
                        )}
                        <div className="flex justify-between">
                          <span className="text-gray-600">Hãng bay:</span>
                          <span className="font-medium text-xs">
                            {b.selectedFlights.outbound.airline_name ||
                              "Chưa xác định"}
                          </span>
                        </div>
                      </div>
                      {b.selectedSeats && b.selectedSeats.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-gray-200">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Ghế đã chọn:</span>
                            <span className="font-medium text-blue-600">
                              {b.selectedSeats.join(", ")}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <Plane className="w-4 h-4 text-gray-400" />
                        <span className="font-semibold text-gray-600">
                          Flight #{b.outboundFlightId}
                        </span>
                      </div>
                      <div className="text-sm text-gray-500">
                        <p>Thông tin chuyến bay đang được cập nhật...</p>
                        <p className="text-xs mt-1">
                          Booking ID: {b.bookingId}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Middle Column - Contact & Note */}
                <div className="lg:col-span-1 space-y-4">
                  {/* Contact Information */}
                  {(b.contact?.fullName ||
                    b.contact?.email ||
                    b.contact?.phone) && (
                    <div className="bg-blue-50 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                          👤
                        </div>
                        <span className="font-semibold text-blue-800 text-sm">
                          Thông tin liên hệ
                        </span>
                      </div>
                      <div className="space-y-1 text-xs">
                        {b.contact?.fullName && (
                          <div>
                            <span className="text-gray-600">Người đặt:</span>{" "}
                            <span className="font-medium">
                              {b.contact.fullName}
                            </span>
                          </div>
                        )}
                        {b.contact?.email && (
                          <div>
                            <span className="text-gray-600">Email:</span>{" "}
                            <span className="font-medium">
                              {b.contact.email}
                            </span>
                          </div>
                        )}
                        {b.contact?.phone && (
                          <div>
                            <span className="text-gray-600">SĐT:</span>{" "}
                            <span className="font-medium">
                              {b.contact.phone}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Customer Note */}
                  {b.note && (
                    <div className="bg-orange-50 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-6 h-6 bg-orange-100 rounded-full flex items-center justify-center">
                          📝
                        </div>
                        <span className="font-semibold text-orange-800 text-sm">
                          Ghi chú khách hàng
                        </span>
                      </div>
                      <div className="text-xs text-gray-700 italic">
                        "{b.note}"
                      </div>
                    </div>
                  )}

                  {/* Booking Details */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Ngày đặt:</span>
                        <span className="font-medium">
                          {new Date(b.createdAt).toLocaleDateString("vi-VN")}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Số hành khách:</span>
                        <span className="font-medium">
                          {b.passengers.length}
                        </span>
                      </div>
                      {b.status === "CONFIRMED" && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Thanh toán:</span>
                          <span className="font-medium">
                            {localizedPayment(b.paymentMethod)}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Dịch vụ thêm */}
                  {(b.addons?.extraBaggageKg ||
                    (b.addons?.services && b.addons.services.length > 0)) && (
                    <div className="bg-indigo-50 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-6 h-6 bg-indigo-100 rounded-full flex items-center justify-center">
                          🧳
                        </div>
                        <span className="font-semibold text-indigo-800 text-sm">
                          Dịch vụ thêm
                        </span>
                      </div>
                      <div className="space-y-1 text-xs">
                        {!!b.addons?.extraBaggageKg && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">
                              Hành lý mua thêm:
                            </span>
                            <span className="font-medium">
                              +{b.addons.extraBaggageKg}kg
                            </span>
                          </div>
                        )}
                        {b.addons?.services && b.addons.services.length > 0 && (
                          <div>
                            <div className="text-gray-600">Dịch vụ:</div>
                            <div className="mt-1 flex flex-wrap gap-1">
                              {b.addons.services.map((svcId) => {
                                const serviceMapping = getServiceMapping(svcId);
                                return (
                                  <span
                                    key={svcId}
                                    className="px-2 py-0.5 rounded bg-white text-indigo-700 border border-indigo-200">
                                    {serviceMapping?.label || svcId}
                                  </span>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Right Column - Actions */}
                <div className="lg:col-span-1 flex flex-col justify-between">
                  <div className="space-y-3">
                    {b.status === "PENDING" && (
                      <button
                        onClick={() => navigate(`/my-bookings/${b.bookingId}?pay=1`)}
                        className="w-full px-4 py-3 rounded-lg bg-green-600 text-white font-medium hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                        title="Xem chi tiết để chọn ghế và thanh toán">
                        <CreditCard className="w-4 h-4" />
                        Thanh toán
                      </button>
                    )}
                    <button
                      onClick={() => navigate(`/my-bookings/${b.bookingId}`)}
                      className="w-full px-4 py-2 rounded-lg bg-blue-100 text-blue-700 font-medium hover:bg-blue-200 transition-colors">
                      Xem chi tiết
                    </button>
                  </div>

                  {/* Debug info */}
                  {DEV_CONFIG.ENABLE_CONSOLE_LOGS && (
                    <div className="mt-4 text-[8px] text-gray-400 text-center">
                      Status: {b.status}
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};
export default MyBookings;
