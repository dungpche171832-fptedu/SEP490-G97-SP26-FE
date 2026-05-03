"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getTicketById, TicketInfo } from "@/services/ticket.service";
import { Loader2, Calendar, MapPin, User, Tag, BusFront, RotateCcw } from "lucide-react";
import { planService } from "@/services/planService";
import { Plan } from "@/model/plan";
import ExchangeTicketModal from "./ExchangeTicketModal";
import { getRole } from "@/lib/auth/auth.service";

const normalizeRole = (role?: string | null): string => {
  return role?.replace("ROLE_", "").toLowerCase() || "";
};

const TicketDetailPage = () => {
  const params = useParams();
  const router = useRouter();

  const [ticket, setTicket] = useState<TicketInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [openExchangeModal, setOpenExchangeModal] = useState(false);
  const [availablePlans, setAvailablePlans] = useState<Plan[]>([]);
  const [loadingPlans, setLoadingPlans] = useState(false);

  const currentRole = normalizeRole(getRole());
  const canExchangeTicket = currentRole === "admin" || currentRole === "manager";

  useEffect(() => {
    const fetchDetail = async () => {
      if (params?.id) {
        const data = await getTicketById(params.id as string);
        setTicket(data);
        setLoading(false);
      }
    };

    void fetchDetail();
  }, [params?.id]);

  const handleOpenExchange = async () => {
    if (!canExchangeTicket) {
      alert("Chỉ admin hoặc manager mới được đổi chuyến.");
      return;
    }

    if (!ticket) return;

    try {
      setLoadingPlans(true);

      const exchangeParams = {
        totalSeat: Number(ticket.totalSeat || 0),
        departureStationId: Number(ticket.startStationId),
        destinationStationId: Number(ticket.endStationId),
        startTime: String(ticket.startTime),
        branchId: Number(ticket.branchId),
        carType: String(ticket.carType || ""),
      };

      if (
        !exchangeParams.departureStationId ||
        !exchangeParams.destinationStationId ||
        !exchangeParams.startTime
      ) {
        alert("Thông tin vé hiện tại không đủ để tìm chuyến mới.");
        return;
      }

      const response = await planService.getPlansForExchange(exchangeParams);

      const plans = response?.plans || [];

      if (plans.length === 0) {
        alert("Hiện tại không có chuyến nào khả dụng để đổi lịch trình.");
        return;
      }

      const otherPlans = plans.filter((plan) => plan.id !== ticket.planId);

      if (otherPlans.length === 0) {
        alert("Hiện tại chỉ có duy nhất chuyến bạn đang đi.");
        return;
      }

      setAvailablePlans(otherPlans);
      setOpenExchangeModal(true);
    } catch (error: unknown) {
      console.error("Lỗi khi tìm chuyến mới:", error);

      const errorMessage =
        error instanceof Error ? error.message : "Có lỗi xảy ra khi lấy danh sách chuyến.";

      alert(errorMessage);
    } finally {
      setLoadingPlans(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return `${new Intl.NumberFormat("vi-VN").format(amount)} VND`;
  };

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50">
        <Loader2 className="mb-4 h-10 w-10 animate-spin text-blue-600" />
        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
          Đang tải dữ liệu vé...
        </p>
      </div>
    );
  }

  if (!ticket) {
    return <div className="p-10 text-center font-bold italic text-red-500">Không tìm thấy vé!</div>;
  }

  return (
    <>
      <div className="flex min-h-screen justify-center bg-[#F8FAFC] p-4 md:p-8">
        <div className="w-full max-w-2xl overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-2xl">
          <div className="p-8 pb-0">
            <div className="mb-8 flex flex-col items-start justify-between gap-4 md:flex-row">
              <div>
                <h1 className="text-3xl font-black uppercase italic tracking-tighter text-slate-900">
                  #{ticket.bookingCode}
                </h1>

                <p className="mt-1 text-[11px] font-bold uppercase tracking-widest text-slate-400">
                  Hệ thống xe Limousine Việt Trung
                </p>
              </div>

              <div
                className={`rounded-xl border px-6 py-2 text-sm font-black shadow-sm ${
                  ticket.status === "PENDING"
                    ? "border-orange-100 bg-orange-50 text-orange-600"
                    : "border-blue-100 bg-blue-50 text-blue-600"
                }`}
              >
                {ticket.status}
              </div>
            </div>

            <div className="relative mb-12 pl-10">
              <div className="absolute bottom-2 left-[5px] top-2 w-0.5 bg-gradient-to-b from-blue-600 to-slate-200" />

              <div className="relative mb-10">
                <div className="absolute -left-[41px] top-1 h-5 w-5 rounded-full border-4 border-white bg-blue-600 shadow-md" />

                <p className="mb-1 text-xs font-black uppercase tracking-widest text-blue-600">
                  Điểm đón
                </p>

                <h3 className="text-xl font-bold text-slate-800">{ticket.startStation}</h3>

                <div className="mt-1 flex items-center text-xs font-medium text-slate-400">
                  <Calendar className="mr-1.5 h-3.5 w-3.5" />
                  {ticket.startTime
                    ? new Date(ticket.startTime).toLocaleString("vi-VN")
                    : "Chưa có thời gian"}
                </div>
              </div>

              <div className="relative">
                <div className="absolute -left-[41px] top-1 h-5 w-5 rounded-full border-4 border-white bg-slate-300 shadow-sm" />

                <p className="mb-1 text-xs font-black uppercase tracking-widest text-slate-400">
                  Điểm trả
                </p>

                <h3 className="text-xl font-bold text-slate-800">{ticket.endStation}</h3>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-8 border-t border-dashed border-slate-200 pb-8 pt-10 md:grid-cols-2">
              <DetailItem
                icon={<User className="h-4 w-4" />}
                label="Hành khách"
                value={ticket.accountName || "N/A"}
              />

              <div className="relative">
                <DetailItem
                  icon={<Tag className="h-4 w-4" />}
                  label="Mã chuyến"
                  value={ticket.planCode || `#PLN-${ticket.planId}`}
                />

                {canExchangeTicket && (
                  <button
                    type="button"
                    onClick={handleOpenExchange}
                    disabled={loadingPlans}
                    className="absolute right-0 top-1/2 flex -translate-y-1/2 items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-[10px] font-bold uppercase !text-white shadow-md transition-all hover:bg-blue-700 disabled:bg-slate-300 [&_*]:!text-white"
                  >
                    {loadingPlans ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      <RotateCcw className="h-3 w-3" />
                    )}
                    Đổi chuyến
                  </button>
                )}
              </div>

              <DetailItem
                icon={<BusFront className="h-4 w-4" />}
                label="Biển số"
                value={ticket.carLicensePlate || "Chưa xếp xe"}
              />

              <DetailItem
                icon={<MapPin className="h-4 w-4" />}
                label="Chi nhánh"
                value={ticket.branchName || "Chưa có thông tin"}
              />

              <div className="md:col-span-1">
                <p className="mb-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
                  Số ghế
                </p>

                <div className="flex flex-wrap gap-2">
                  {ticket.seatNumbers?.map((seatNumber, index) => (
                    <span
                      key={`${seatNumber}-${index}`}
                      className="rounded bg-blue-600 px-3 py-1 text-xs font-bold text-white"
                    >
                      {seatNumber}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-slate-900 p-8 text-white">
            <div className="mb-8 flex items-end justify-between">
              <div>
                <p className="mb-2 text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">
                  Tổng thanh toán
                </p>

                <h2 className="text-4xl font-black text-blue-400">
                  {formatCurrency(ticket.totalAmount)}
                </h2>
              </div>
            </div>

            <button
              type="button"
              onClick={() => router.back()}
              className="w-full rounded-2xl bg-slate-800 py-5 font-black uppercase tracking-widest text-white transition-all hover:bg-slate-700"
            >
              Quay lại danh sách
            </button>
          </div>
        </div>
      </div>

      <ExchangeTicketModal
        isOpen={openExchangeModal}
        onClose={() => setOpenExchangeModal(false)}
        ticket={ticket}
        availablePlans={availablePlans}
      />
    </>
  );
};

const DetailItem = ({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
}) => (
  <div>
    <p className="mb-1.5 flex items-center text-[10px] font-black uppercase tracking-widest text-slate-400">
      <span className="mr-1.5 opacity-50">{icon}</span>
      {label}
    </p>

    <p className="text-sm font-bold text-slate-800">{value}</p>
  </div>
);

export default TicketDetailPage;
