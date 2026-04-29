"use client";

import React, { useEffect, useState } from "react";
import {
  Search,
  Filter,
  Download,
  ChevronLeft,
  ChevronRight,
  Phone,
  Bus,
  ChevronDown,
  Loader2,
  RefreshCcw,
} from "lucide-react";
import { getMyTickets, updateTicketStatus, TicketInfo } from "@/services/ticket.service";
import { useRouter } from "next/navigation";
import { message } from "antd";

const TicketManagementPage = () => {
  const router = useRouter();

  const [tickets, setTickets] = useState<TicketInfo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const data = await getMyTickets();
      setTickets(data);
    } catch (error) {
      console.error("Lỗi fetch:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (ticketId: number, newStatus: string) => {
    const originalTickets = [...tickets];

    setTickets((prev) => prev.map((t) => (t.id === ticketId ? { ...t, status: newStatus } : t)));

    try {
      await updateTicketStatus(ticketId, newStatus);
      message.success(`Đã chuyển trạng thái vé #${ticketId} sang ${newStatus}`);
    } catch (error) {
      console.error("Lỗi khi gọi API:", error);
      message.error("Không thể cập nhật trạng thái. Vui lòng thử lại!");
      setTickets(originalTickets);
    }
  };

  const getStatusStyle = (status: string) => {
    switch (status?.toUpperCase()) {
      case "COMPLETED":
        return "bg-emerald-50 text-emerald-600 border-emerald-100";
      case "PENDING":
        return "bg-slate-100 text-slate-500 border-slate-200";
      case "CANCELLED":
        return "bg-red-50 text-red-600 border-red-100";
      case "BOOKED":
        return "bg-blue-50 text-blue-600 border-blue-100";
      default:
        return "bg-slate-50 text-slate-400 border-slate-100";
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN").format(amount) + "đ";
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-8 text-[#475569]">
      {/* Header */}
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-2xl font-bold text-[#1E293B] uppercase tracking-tight">Quản lý vé</h1>
          <p className="text-sm text-slate-500">
            Danh sách vé từ hệ thống Xe Limousine Việt Trung.
          </p>
        </div>
        <button
          onClick={fetchTickets}
          className="p-2 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition shadow-sm"
        >
          <RefreshCcw className={`w-5 h-5 ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="space-y-2">
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Tìm kiếm
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-2.5 text-slate-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Tìm mã đặt vé..."
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/10"
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Trạng thái lọc
            </label>
            <select className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none">
              <option>Tất cả</option>
              <option value="PENDING">PENDING</option>
              <option value="COMPLETED">COMPLETED</option>
              <option value="CANCELLED">CANCELLED</option>
              <option value="CANCELLED">BOOKED</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Từ ngày
            </label>
            <input
              type="date"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Đến ngày
            </label>
            <input
              type="date"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none"
            />
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <button className="flex items-center gap-2 bg-[#0056b3] text-white px-5 py-2 rounded-lg text-sm font-semibold hover:bg-blue-800 transition">
            <Filter className="w-4 h-4" /> Lọc kết quả
          </button>
          <button className="flex items-center gap-2 bg-[#10a345] text-white px-5 py-2 rounded-lg text-sm font-semibold hover:bg-emerald-700 transition">
            <Download className="w-4 h-4" /> Xuất Excel
          </button>
        </div>
      </div>

      {/* Ticket List */}
      <div className="space-y-3">
        {loading ? (
          <div className="bg-white rounded-xl p-20 flex flex-col items-center justify-center text-slate-400 border border-dashed border-slate-200">
            <Loader2 className="w-10 h-10 animate-spin mb-4 text-blue-500" />
            <p className="font-medium">Đang tải dữ liệu từ máy chủ...</p>
          </div>
        ) : (
          tickets.map((ticket) => (
            <div
              key={ticket.id}
              className="bg-white p-4 rounded-xl shadow-sm border border-transparent hover:border-blue-100 flex items-center transition-all group"
            >
              <div className="w-[15%]">
                <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                  Mã đặt vé
                </p>
                <span className="font-bold text-[#0056b3] text-sm truncate block">
                  #{ticket.bookingCode || ticket.id}
                </span>
              </div>

              <div className="w-[18%]">
                <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1">
                  Trạng thái
                </p>
                <div className="relative inline-block w-full max-w-[140px]">
                  <select
                    value={ticket.status}
                    onChange={(e) => handleStatusChange(ticket.id, e.target.value)}
                    className={`w-full pl-3 pr-8 py-1.5 rounded-full text-[10px] font-extrabold border uppercase tracking-wider appearance-none cursor-pointer focus:outline-none transition-all ${getStatusStyle(ticket.status)}`}
                  >
                    <option value="PENDING">PENDING</option>
                    <option value="COMPLETED">COMPLETED</option>
                    <option value="CANCELLED">CANCELLED</option>
                    <option value="BOOKED">BOOKED</option>
                  </select>
                  <ChevronDown className="absolute right-2 top-2 w-3.5 h-3.5 pointer-events-none opacity-50" />
                </div>
              </div>

              <div className="w-[30%] flex items-center gap-3">
                <div className="p-2.5 bg-slate-50 rounded-xl text-slate-400 group-hover:bg-blue-50 transition-colors">
                  <Bus className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-[14px] font-bold text-slate-700">
                    Plan #{ticket.planId} <span className="text-slate-300 font-normal mx-1">→</span>{" "}
                    Xe #{ticket.carId}
                  </div>
                  <div className="text-xs text-slate-400 mt-0.5 font-medium">
                    Khoảng cách: {ticket.distanceKm} km
                  </div>
                </div>
              </div>

              <div className="w-[12%]">
                <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                  Khách hàng
                </p>
                <p className="text-sm font-bold text-slate-700">User #{ticket.accountId}</p>
              </div>

              <div className="w-[15%] text-right pr-6 font-black text-[#003d82] text-lg">
                {formatCurrency(ticket.totalAmount)}
              </div>

              <div className="w-[10%] flex justify-end items-center gap-2">
                <button
                  onClick={() => router.push(`/admin/manageTicket/${ticket.id}`)}
                  className="px-3 py-1.5 border border-slate-200 rounded-lg text-[11px] font-bold text-slate-600 hover:bg-slate-50 transition"
                >
                  Chi tiết
                </button>
                <button className="p-2 border border-slate-200 rounded-lg text-slate-400 hover:bg-blue-50 hover:text-blue-600 transition">
                  <Phone className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-center mt-10 gap-4">
        <button className="p-2 text-slate-300 cursor-not-allowed border border-transparent">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <span className="text-[11px] font-bold text-slate-500 tracking-[0.2em] uppercase">
          Trang 1 / 1
        </span>
        <button className="p-2 text-slate-300 cursor-not-allowed border border-transparent">
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default TicketManagementPage;
