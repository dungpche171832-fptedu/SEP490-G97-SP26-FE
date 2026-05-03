"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  Phone,
  Bus,
  ChevronDown,
  Loader2,
  RefreshCcw,
} from "lucide-react";
import { getListTickets, updateTicketStatus } from "@/services/ticket.service";
import type { TicketInfo } from "@/services/ticket.service";
import { useRouter, useSearchParams } from "next/navigation";
import { message } from "antd";

type TicketStatusFilter = "ALL" | "PENDING" | "COMPLETED" | "CANCELLED" | "BOOKED";

const STATUS_FILTER_OPTIONS: { label: string; value: TicketStatusFilter }[] = [
  { label: "Tất cả", value: "ALL" },
  { label: "PENDING", value: "PENDING" },
  { label: "COMPLETED", value: "COMPLETED" },
  { label: "CANCELLED", value: "CANCELLED" },
  { label: "BOOKED", value: "BOOKED" },
];

const TicketManagementPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [tickets, setTickets] = useState<TicketInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [statusFilter, setStatusFilter] = useState<TicketStatusFilter>("ALL");

  const planIdQuery = searchParams.get("planId");

  const planIdFromUrl = useMemo(() => {
    if (!planIdQuery) {
      return undefined;
    }

    const parsedPlanId = Number(planIdQuery);

    return Number.isNaN(parsedPlanId) ? undefined : parsedPlanId;
  }, [planIdQuery]);

  const fetchTickets = useCallback(async () => {
    setLoading(true);

    try {
      const data = await getListTickets(
        planIdFromUrl !== undefined
          ? {
              planId: planIdFromUrl,
            }
          : undefined,
      );

      setTickets(data);
    } catch (error) {
      console.error("Lỗi fetch:", error);
    } finally {
      setLoading(false);
    }
  }, [planIdFromUrl]);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  const filteredTickets = useMemo(() => {
    const normalizedKeyword = searchKeyword.trim().toLowerCase();

    return tickets.filter((ticket) => {
      const ticketStatus = ticket.status?.toUpperCase() || "";
      const isMatchedStatus = statusFilter === "ALL" || ticketStatus === statusFilter;

      if (!isMatchedStatus) {
        return false;
      }

      if (!normalizedKeyword) {
        return true;
      }

      const searchableValues: string[] = [
        ticket.bookingCode || "",
        String(ticket.id),
        String(ticket.planId),
        ticket.planCode || "",
        String(ticket.carId),
        ticket.carLicensePlate || "",
        String(ticket.accountId),
        ticket.accountName || "",
        ticket.status || "",
      ];

      return searchableValues.some((value) => value.toLowerCase().includes(normalizedKeyword));
    });
  }, [tickets, searchKeyword, statusFilter]);

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
    return `${new Intl.NumberFormat("vi-VN").format(amount)}đ`;
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-8 text-[#475569]">
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold uppercase tracking-tight text-[#1E293B]">Quản lý vé</h1>
          <p className="text-sm text-slate-500">
            {planIdFromUrl !== undefined
              ? `Danh sách vé của lịch trình #${planIdFromUrl}.`
              : "Danh sách vé từ hệ thống Xe Limousine Việt Trung."}
          </p>
        </div>

        <button
          onClick={fetchTickets}
          className="rounded-lg border border-slate-200 bg-white p-2 shadow-sm transition hover:bg-slate-50"
        >
          <RefreshCcw className={`h-5 w-5 ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>

      <div className="mb-8 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Tìm kiếm
            </label>

            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={searchKeyword}
                onChange={(event) => setSearchKeyword(event.target.value)}
                placeholder="Tìm mã đặt vé, plan, xe, khách hàng..."
                className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/10"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Trạng thái lọc
            </label>

            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value as TicketStatusFilter)}
              className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:outline-none"
            >
              {STATUS_FILTER_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <p className="mt-4 text-xs font-medium text-slate-400">
          Đang hiển thị {filteredTickets.length} / {tickets.length} vé
        </p>
      </div>

      <div className="space-y-3">
        {loading ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-white p-20 text-slate-400">
            <Loader2 className="mb-4 h-10 w-10 animate-spin text-blue-500" />
            <p className="font-medium">Đang tải dữ liệu từ máy chủ...</p>
          </div>
        ) : filteredTickets.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-white p-16 text-slate-400">
            <p className="font-medium">Không tìm thấy vé phù hợp</p>
          </div>
        ) : (
          filteredTickets.map((ticket) => (
            <div
              key={ticket.id}
              className="group flex items-center rounded-xl border border-transparent bg-white p-4 shadow-sm transition-all hover:border-blue-100"
            >
              <div className="w-[15%]">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Mã đặt vé
                </p>
                <span className="block truncate text-sm font-bold text-[#0056b3]">
                  #{ticket.bookingCode || ticket.id}
                </span>
              </div>

              <div className="w-[18%]">
                <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Trạng thái
                </p>

                <div className="relative inline-block w-full max-w-[140px]">
                  <select
                    value={ticket.status}
                    onChange={(event) => handleStatusChange(ticket.id, event.target.value)}
                    className={`w-full cursor-pointer appearance-none rounded-full border py-1.5 pl-3 pr-8 text-[10px] font-extrabold uppercase tracking-wider transition-all focus:outline-none ${getStatusStyle(
                      ticket.status,
                    )}`}
                  >
                    <option value="PENDING">PENDING</option>
                    <option value="COMPLETED">COMPLETED</option>
                    <option value="CANCELLED">CANCELLED</option>
                    <option value="BOOKED">BOOKED</option>
                  </select>

                  <ChevronDown className="pointer-events-none absolute right-2 top-2 h-3.5 w-3.5 opacity-50" />
                </div>
              </div>

              <div className="flex w-[30%] items-center gap-3">
                <div className="rounded-xl bg-slate-50 p-2.5 text-slate-400 transition-colors group-hover:bg-blue-50">
                  <Bus className="h-5 w-5" />
                </div>

                <div>
                  <div className="text-[14px] font-bold text-slate-700">
                    Plan #{ticket.planId} <span className="mx-1 font-normal text-slate-300">→</span>{" "}
                    Xe #{ticket.carId}
                  </div>
                  <div className="mt-0.5 text-xs font-medium text-slate-400">
                    Khoảng cách: {ticket.distanceKm} km
                  </div>
                </div>
              </div>

              <div className="w-[12%]">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Khách hàng
                </p>
                <p className="text-sm font-bold text-slate-700">User #{ticket.accountId}</p>
              </div>

              <div className="w-[15%] pr-6 text-right text-lg font-black text-[#003d82]">
                {formatCurrency(ticket.totalAmount)}
              </div>

              <div className="flex w-[10%] items-center justify-end gap-2">
                <button
                  onClick={() => router.push(`/admin/manageTicket/${ticket.id}`)}
                  className="rounded-lg border border-slate-200 px-3 py-1.5 text-[11px] font-bold text-slate-600 transition hover:bg-slate-50"
                >
                  Chi tiết
                </button>

                <button className="rounded-lg border border-slate-200 p-2 text-slate-400 transition hover:bg-blue-50 hover:text-blue-600">
                  <Phone className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="mt-10 flex items-center justify-center gap-4">
        <button className="cursor-not-allowed border border-transparent p-2 text-slate-300">
          <ChevronLeft className="h-5 w-5" />
        </button>

        <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500">
          Trang 1 / 1
        </span>

        <button className="cursor-not-allowed border border-transparent p-2 text-slate-300">
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
};

export default TicketManagementPage;
