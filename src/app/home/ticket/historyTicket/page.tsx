// src/app/home/ticket/historyTicket/page.tsx
"use client";

import React, { useEffect, useState } from "react";
import { SearchOutlined } from "@ant-design/icons";
import { Spin } from "antd";
import { getMyTickets, type TicketInfo } from "@/services/ticket.service";

interface TicketHistoryItem extends TicketInfo {
  code?: string;
  startStationName?: string;
  endStationName?: string;
  seats?: string | string[] | number[];
  seatNumber?: string | number;
  seatName?: string;
  seatCode?: string;
  seatNo?: string | number;
  createdAt?: string;
}

const TABS = [
  { key: "ALL", label: "Tất cả" },
  { key: "PENDING", label: "Chờ thanh toán" },
  { key: "BOOKED", label: "Đã đặt" },
  { key: "CANCELLED", label: "Đã hủy" },
];

const isRecord = (value: unknown): value is Record<string, unknown> => {
  return typeof value === "object" && value !== null;
};

const isTicketHistoryItem = (value: unknown): value is TicketHistoryItem => {
  if (!isRecord(value)) return false;

  return typeof value.id === "number" || typeof value.id === "string";
};

const normalizeTicketList = (value: unknown): TicketHistoryItem[] => {
  if (Array.isArray(value)) {
    return value.filter(isTicketHistoryItem);
  }

  if (!isRecord(value)) {
    return [];
  }

  const possibleTicketLists = [value.tickets, value.result, value.data];

  for (const ticketList of possibleTicketLists) {
    if (Array.isArray(ticketList)) {
      return ticketList.filter(isTicketHistoryItem);
    }
  }

  return [];
};

const formatDateTime = (value?: string) => {
  if (!value) return "Chưa cập nhật";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Chưa cập nhật";
  }

  const hour = String(date.getHours()).padStart(2, "0");
  const minute = String(date.getMinutes()).padStart(2, "0");
  const second = String(date.getSeconds()).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();

  return `${hour}:${minute}:${second} ${day}/${month}/${year}`;
};

const formatDate = (value?: string) => {
  if (!value) return "Chưa cập nhật";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Chưa cập nhật";
  }

  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();

  return `${day}/${month}/${year}`;
};

const formatMoney = (value?: number) => {
  if (value === undefined || value === null) {
    return "0đ";
  }

  return `${value.toLocaleString("vi-VN")}đ`;
};

const getBookingCode = (ticket: TicketHistoryItem) => {
  return ticket.bookingCode || ticket.code || "Chưa cập nhật";
};

const getStartStation = (ticket: TicketHistoryItem) => {
  return ticket.startStation || ticket.startStationName || "Chưa cập nhật";
};

const getEndStation = (ticket: TicketHistoryItem) => {
  return ticket.endStation || ticket.endStationName || "Chưa cập nhật";
};

const getSeatText = (ticket: TicketHistoryItem) => {
  const seatNumbers = ticket.seatNumbers as unknown;
  const seats = ticket.seats as unknown;

  if (Array.isArray(seatNumbers) && seatNumbers.length > 0) {
    return seatNumbers.map(String).join(", ");
  }

  if (typeof seatNumbers === "string" && seatNumbers.trim() !== "") {
    return seatNumbers;
  }

  if (Array.isArray(seats) && seats.length > 0) {
    return seats.map(String).join(", ");
  }

  if (typeof seats === "string" && seats.trim() !== "") {
    return seats;
  }

  if (ticket.seatNumber !== undefined && ticket.seatNumber !== null) {
    return String(ticket.seatNumber);
  }

  if (ticket.seatName) {
    return ticket.seatName;
  }

  if (ticket.seatCode) {
    return ticket.seatCode;
  }

  return "-";
};

const getBookingDate = (ticket: TicketHistoryItem) => {
  return ticket.bookingDate || ticket.createdAt;
};

export default function HistoryTicketPage() {
  const [activeTab, setActiveTab] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [tickets, setTickets] = useState<TicketHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTickets = async () => {
      setLoading(true);

      try {
        const data = (await getMyTickets()) as unknown;
        const ticketList = normalizeTicketList(data);

        setTickets(ticketList);
      } catch (error) {
        console.error("Lỗi lấy lịch sử vé:", error);
        setTickets([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTickets();
  }, []);

  const filteredTickets = tickets.filter((ticket) => {
    const status = ticket.status ? ticket.status.toUpperCase() : "";
    const bookingCode = getBookingCode(ticket);

    const matchTab = activeTab === "ALL" || status === activeTab;
    const matchSearch = bookingCode.toLowerCase().includes(searchQuery.toLowerCase());

    return matchTab && matchSearch;
  });

  const getStatusConfig = (status: string) => {
    switch (status) {
      case "BOOKED":
        return {
          badge: (
            <span className="bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider">
              ĐÃ ĐẶT
            </span>
          ),
          priceColor: "text-blue-600",
          button: (
            <button className="bg-[#1677FF] hover:bg-blue-700 text-white px-6 py-2 rounded-lg text-xs font-bold transition-all shadow-sm shadow-blue-500/30">
              Xem chi tiết
            </button>
          ),
        };

      case "PENDING":
        return {
          badge: (
            <span className="bg-orange-500 text-white px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider shadow-sm">
              CHỜ THANH TOÁN
            </span>
          ),
          priceColor: "text-orange-500",
          button: (
            <button className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-lg text-xs font-bold transition-all shadow-sm shadow-orange-500/30">
              Thanh toán ngay
            </button>
          ),
        };

      case "CANCELLED":
        return {
          badge: (
            <span className="bg-slate-100 text-slate-500 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider">
              ĐÃ HỦY
            </span>
          ),
          priceColor: "text-slate-400",
          button: (
            <button className="bg-slate-100 hover:bg-slate-200 text-slate-500 px-6 py-2 rounded-lg text-xs font-bold transition-all">
              Chi tiết hủy
            </button>
          ),
        };

      default:
        return {
          badge: null,
          priceColor: "text-slate-800",
          button: null,
        };
    }
  };

  return (
    <div className="min-h-screen bg-[#f0f2f5] font-sans text-slate-900 pb-20">
      <div className="bg-white border-b border-slate-200 px-6 py-8 md:px-20 mb-8 shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-black text-slate-800 tracking-tight">VÉ CỦA TÔI</h1>
            <p className="text-sm text-slate-500 font-medium mt-1">
              Quản lý các hành trình thượng lưu của bạn cùng Việt Trung Limousine.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-20">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8">
          <div className="flex bg-white p-1 rounded-xl shadow-sm border border-slate-100 w-full md:w-auto overflow-x-auto">
            {TABS.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                style={activeTab === tab.key ? { color: "#ffffff" } : undefined}
                className={`whitespace-nowrap px-6 py-2.5 rounded-lg text-[13px] font-bold transition-all ${
                  activeTab === tab.key
                    ? "bg-[#1677FF] !text-white shadow-md shadow-blue-500/30"
                    : "text-slate-500 hover:text-[#1677FF] hover:bg-blue-50"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="relative w-full md:w-[350px]">
            <SearchOutlined className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Tìm kiếm theo mã đơn hàng..."
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-bold outline-none focus:border-blue-500 transition-all shadow-sm placeholder:text-slate-400 placeholder:font-medium"
            />
          </div>
        </div>

        {loading ? (
          <div className="bg-white rounded-2xl p-20 text-center border border-slate-100 shadow-sm flex flex-col items-center">
            <Spin size="large" />
            <p className="text-sm text-slate-500 mt-4 font-bold">
              Đang tải danh sách vé của bạn...
            </p>
          </div>
        ) : filteredTickets.length === 0 ? (
          <div className="bg-white rounded-2xl p-20 text-center border border-slate-100 shadow-sm">
            <div className="text-6xl mb-4">📭</div>
            <h3 className="text-lg font-black text-slate-700">Chưa có vé nào</h3>
            <p className="text-sm text-slate-500 mt-2">
              Không tìm thấy đơn hàng nào phù hợp với yêu cầu của bạn.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredTickets.map((ticket) => {
              const status = ticket.status ? ticket.status.toUpperCase() : "PENDING";
              const config = getStatusConfig(status);
              const bookingCode = getBookingCode(ticket);
              const startStation = getStartStation(ticket);
              const endStation = getEndStation(ticket);
              const seatText = getSeatText(ticket);
              const bookingDate = getBookingDate(ticket);

              return (
                <div
                  key={ticket.id}
                  className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-md transition-shadow flex flex-col"
                >
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
                        MÃ ĐƠN HÀNG
                      </p>
                      <h3 className="text-lg font-black text-slate-800">#{bookingCode}</h3>
                    </div>

                    <div>{config.badge}</div>
                  </div>

                  <div className="flex items-center justify-between mb-6">
                    <div className="flex-1 w-1/3">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 truncate">
                        ĐIỂM KHỞI HÀNH
                      </p>
                      <p
                        className="text-base font-bold text-slate-800 truncate"
                        title={startStation}
                      >
                        {startStation}
                      </p>
                    </div>

                    <div className="flex flex-col items-center justify-center px-4 flex-1">
                      <div className="bg-blue-50 text-blue-500 p-2 rounded-full mb-1">🚌</div>
                      <div className="w-full border-t-2 border-dashed border-slate-200" />
                    </div>

                    <div className="flex-1 text-right w-1/3">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 truncate">
                        ĐIỂM ĐẾN
                      </p>
                      <p className="text-base font-bold text-slate-800 truncate" title={endStation}>
                        {endStation}
                      </p>
                    </div>
                  </div>

                  <div className="flex justify-between items-center bg-slate-50 p-4 rounded-xl border border-slate-100 mb-6">
                    <div className="flex-1">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
                        THỜI GIAN KHỞI HÀNH
                      </p>
                      <p
                        className="text-[12px] font-bold text-slate-800 truncate"
                        title={ticket.startTime}
                      >
                        {formatDateTime(ticket.startTime)}
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
                        VỊ TRÍ GHẾ
                      </p>
                      <p className="text-[13px] font-bold text-slate-800">{seatText}</p>
                    </div>
                  </div>

                  <div className="flex justify-between items-end border-t border-slate-100 pt-5 mt-auto">
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 mb-1">
                        Ngày đặt: {formatDate(bookingDate)}
                      </p>
                      <p className={`text-2xl font-black ${config.priceColor}`}>
                        {formatMoney(ticket.totalAmount)}
                      </p>
                    </div>

                    <div>{config.button}</div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
