import React, { useEffect, useMemo, useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { loadBookings, saveBookings } from "../services/bookingStorage";
import type { BookingRecord } from "../shared/types/passenger.types";
import { Card, CardContent } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { DEV_CONFIG } from "../shared/config/devConfig";
import { Button } from "../components/ui/button";
import {
  RefreshCcw,
  Filter,
  Plane,
  ArchiveX,
  Calendar,
  CreditCard,
  Users,
  Hash,
  Search as SearchIcon,
} from "lucide-react";

const MyBookings: React.FC = () => {
  const [bookings, setBookings] = useState<BookingRecord[]>([]);
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/register", {
        replace: true,
        state: { redirectTo: "/my-bookings", intent: "view-bookings" },
      });
      return;
    }
    setBookings(loadBookings());
  }, [isAuthenticated, navigate]);

  const handleDelete = (bookingId: string) => {
    const filtered = bookings.filter((b) => b.bookingId !== bookingId);
    saveBookings(filtered);
    setBookings(filtered);
  };

  const handleDeleteAll = () => {
    saveBookings([]);
    setBookings([]);
  };

  // Filters & sorting state
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [methodFilter, setMethodFilter] = useState<string>("all");
  const [tripFilter, setTripFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("createdAt-desc");
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
          ? a.totalPrice - b.totalPrice
          : b.totalPrice - a.totalPrice;
      if (field === "createdAt")
        return dir === "asc"
          ? a.createdAt.localeCompare(b.createdAt)
          : b.createdAt.localeCompare(a.createdAt);
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
              setSortBy("createdAt-desc");
              setSearchId("");
            }}>
            Reset bộ lọc
          </Button>
        )}
      </div>
    </div>
  );

  if (filtered.length === 0) return EmptyState;

  return (
    <div className="space-y-6">
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
          {!DEV_CONFIG.HIDE_DEV_CONTROLS && bookings.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleDeleteAll}
              className="text-xs inline-flex items-center gap-1">
              <ArchiveX className="w-3.5 h-3.5" /> Xóa tất cả
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            className="text-xs inline-flex items-center gap-1"
            onClick={() => {
              setStatusFilter("all");
              setMethodFilter("all");
              setTripFilter("all");
              setSortBy("createdAt-desc");
              setSearchId("");
            }}>
            <RefreshCcw className="w-3.5 h-3.5" /> Reset
          </Button>
        </div>
      </div>
      {/* Filters */}
      <div className="p-4 bg-white border rounded-xl shadow-sm grid md:grid-cols-5 gap-4 text-[11px] items-start">
        <div className="space-y-1">
          <label className="font-semibold text-gray-600 flex items-center gap-1">
            <Hash className="w-3.5 h-3.5 text-gray-400" /> Trạng thái
          </label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full border rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-300">
            <option value="all">Tất cả</option>
            <option value="CONFIRMED">CONFIRMED</option>
            <option value="PENDING">PENDING</option>
            <option value="CANCELLED">CANCELLED</option>
          </select>
        </div>
        <div className="space-y-1">
          <label className="font-semibold text-gray-600 flex items-center gap-1">
            <CreditCard className="w-3.5 h-3.5 text-gray-400" /> Thanh toán
          </label>
          <select
            value={methodFilter}
            onChange={(e) => setMethodFilter(e.target.value)}
            className="w-full border rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-300">
            <option value="all">Tất cả</option>
            <option value="vnpay">VNPay QR</option>
            <option value="card">Thẻ</option>
            <option value="office">Văn phòng</option>
          </select>
        </div>
        <div className="space-y-1">
          <label className="font-semibold text-gray-600 flex items-center gap-1">
            <Plane className="w-3.5 h-3.5 text-gray-400" /> Loại
          </label>
          <select
            value={tripFilter}
            onChange={(e) => setTripFilter(e.target.value)}
            className="w-full border rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-300">
            <option value="all">Tất cả</option>
            <option value="round">Khứ hồi</option>
            <option value="one">Một chiều</option>
          </select>
        </div>
        <div className="space-y-1">
          <label className="font-semibold text-gray-600 flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5 text-gray-400" /> Sắp xếp
          </label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="w-full border rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-300">
            <option value="createdAt-desc">Mới nhất</option>
            <option value="createdAt-asc">Cũ nhất</option>
            <option value="price-desc">Giá cao → thấp</option>
            <option value="price-asc">Giá thấp → cao</option>
          </select>
        </div>
        <div className="space-y-1">
          <label className="font-semibold text-gray-600 flex items-center gap-1">
            <SearchIcon className="w-3.5 h-3.5 text-gray-400" /> Tìm mã
          </label>
          <input
            value={searchId}
            onChange={(e) => setSearchId(e.target.value)}
            placeholder="Nhập mã"
            className="w-full border rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-300"
          />
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
        return (
          <Card
            key={b.bookingId}
            className="border border-gray-200 hover:border-blue-300/70 hover:shadow-md transition overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-50/30 to-transparent opacity-0 hover:opacity-100 pointer-events-none transition" />
            <CardContent className="p-5 flex flex-col gap-4 relative z-10">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                <div className="text-sm space-y-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-gray-800 flex items-center gap-1">
                      <Hash className="w-3.5 h-3.5 text-gray-400" />{" "}
                      {b.bookingId}
                    </span>
                    <Badge className={statusColor + " border-none"}>
                      {b.status}
                    </Badge>
                    <Badge className={payColor + " border-none"}>
                      {localizedPayment(b.paymentMethod)}
                    </Badge>
                    <Badge className="bg-gray-100 text-gray-700 border-none">
                      {b.tripType === "round-trip" ? "Khứ hồi" : "Một chiều"}
                    </Badge>
                  </div>
                  <div className="flex flex-wrap items-center gap-4 text-[11px] text-gray-500">
                    <span className="inline-flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-gray-400" />{" "}
                      {new Date(b.createdAt).toLocaleString("vi-VN")}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Users className="w-3.5 h-3.5 text-gray-400" />{" "}
                      {b.passengers.length} HK
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <CreditCard className="w-3.5 h-3.5 text-gray-400" />{" "}
                      {localizedPayment(b.paymentMethod)}
                    </span>
                  </div>
                </div>
                <div className="text-right flex flex-col justify-between gap-2 min-w-[140px]">
                  <div className="text-blue-600 font-bold text-lg tracking-tight">
                    {b.totalPrice.toLocaleString("vi-VN")} {b.currency}
                  </div>
                  {!DEV_CONFIG.HIDE_DEV_CONTROLS && (
                    <button
                      onClick={() => handleDelete(b.bookingId)}
                      className="text-[10px] px-2 py-1 rounded bg-red-100 text-red-600 hover:bg-red-200 self-end">
                      Xóa (test)
                    </button>
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
